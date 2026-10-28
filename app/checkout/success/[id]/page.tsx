import OrderTrackerClient from './OrderTrackerClient';

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  // Next 15 requires awaiting params
  const { id } = await params;
  
  return <OrderTrackerClient orderId={id} />;
}
