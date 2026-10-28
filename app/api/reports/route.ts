import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  try {
    // 1. Set up Date Range Filters
    let dateFilter = {};
    if (startDateStr && endDateStr) {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          gte: start,
          lte: end,
        }
      };
    }

    // 2. Fetch all completed/paid orders within range
    const orders = await prisma.order.findMany({
      where: {
        ...dateFilter,
        OR: [
          { status: 'Completed' },
          { paymentStatus: 'PAID' }
        ]
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // 3. Aggregate Total Revenue and Orders
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // 4. Aggregate Sales by Category for Recharts
    const categorySales: Record<string, number> = {};
    const itemSales: Record<string, number> = {};

    orders.forEach((order: any) => {
      order.orderItems.forEach((item: any) => {
        // By Category
        const cat = item.menuItem.category || 'Lainnya';
        categorySales[cat] = (categorySales[cat] || 0) + item.quantity;
        
        // By Specific Item
        const itemName = item.menuItem.name || 'Unknown';
        itemSales[itemName] = (itemSales[itemName] || 0) + item.quantity;
      });
    });

    // Format for Recharts 
    // e.g [{ name: 'Main Course', value: 25 }, { name: 'Beverage', value: 10 }]
    const categoryChartData = Object.entries(categorySales).map(([name, value]) => ({
      name,
      value
    }));

    // Top 5 best selling items
    const topItemsChartData = Object.entries(itemSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // 5. Aggregate Sales by Date (for timeline chart)
    const timelineSales: Record<string, number> = {};
    orders.forEach(order => {
        const dateKey = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        timelineSales[dateKey] = (timelineSales[dateKey] || 0) + order.totalAmount;
    });

    const timelineChartData = Object.entries(timelineSales)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, amount]) => ({
          date,
          amount
      }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders
      },
      charts: {
        categoryData: categoryChartData,
        topItemsData: topItemsChartData,
        timelineData: timelineChartData
      }
    });

  } catch (error) {
    console.error("Failed to generate report data", error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
