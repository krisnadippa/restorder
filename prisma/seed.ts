import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dummyItems = [
    {
      id: '1',
      name: 'Nasi Goreng Spesial Glorious',
      description: 'Nasi goreng istimewa dengan bumbu rahasia Glorious, ayam suwir, sate ayam, telur mata sapi setengah matang, dan kerupuk udang renyah.',
      price: 38000,
      category: 'Mains',
      image: '/images/menu/nasi_goreng.jpg',
      isAvailable: true
    },
    {
      id: '2',
      name: 'Sate Ayam Madura',
      description: '10 tusuk sate daging ayam pilihan dengan siraman bumbu kacang legit, kecap manis gurih, irisan bawang merah, cabai rawit, dan lontong pulen.',
      price: 45000,
      category: 'Mains',
      image: '/images/menu/sate_ayam.jpg',
      isAvailable: true
    },
    {
      id: '3',
      name: 'Truffle French Fries',
      description: 'Kentang goreng impor keemasan renyah berpadu aroma minyak truffle mewah, taburan keju parmesan gurih, dan saus garlic aioli.',
      price: 28000,
      category: 'Sides',
      image: '/images/menu/truffle_fries.jpg',
      isAvailable: true
    },
    {
      id: '4',
      name: 'Ayam Bakar Madu',
      description: 'Ayam panggang beraroma bakar asap khas dengan karamelisasi madu murni gurih, disajikan lengkap dengan lalapan segar dan sambal bajak terasi.',
      price: 42000,
      category: 'Mains',
      image: '/images/menu/ayam_bakar.jpg',
      isAvailable: true
    },
    {
      id: '5',
      name: 'Es Teh Lemon & Jasmine',
      description: 'Seduhan daun teh melati wangi dipadukan dengan kesegaran perasan jeruk lemon asli, daun mint segar, dan es batu kristal.',
      price: 14000,
      category: 'Beverages',
      image: '/images/menu/es_teh_manis.jpg',
      isAvailable: true
    },
    {
      id: '6',
      name: 'Es Kopi Susu Gula Aren',
      description: 'Perpaduan espresso arabika berkualitas, susu segar creamy, dan pemanis alami sirup gula aren murni dengan sensasi dingin menyegarkan.',
      price: 22000,
      category: 'Beverages',
      image: '/images/menu/kopi_susu.jpg',
      isAvailable: true
    },
    {
      id: '7',
      name: 'Pizza Margherita Artisanal',
      description: 'Pizza renyah lembut khas Italia bertabur saus tomat San Marzano, lelehan keju mozzarella segar, daun basil harum, dan minyak zaitun extra virgin.',
      price: 68000,
      category: 'Mains',
      image: '/images/menu/pizza_margherita.jpg',
      isAvailable: true
    },
    {
      id: '8',
      name: 'Rendang Daging Sapi Minang',
      description: 'Potongan daging sapi empuk dimasak perlahan berjam-jam dengan rempah autentik Minangkabau dan santan pekat yang gurih meresap sempurna.',
      price: 55000,
      category: 'Mains',
      image: '/images/menu/rendang_sapi.jpg',
      isAvailable: true
    },
    {
      id: '9',
      name: 'Mie Goreng Seafood Spesial',
      description: 'Mie kuning kenyal dimasak wok-hei dengan udang windu segar, cumi kenyal, sayuran hijau, telur mata sapi, dan acar renyah.',
      price: 42000,
      category: 'Mains',
      image: '/images/menu/mie_goreng.jpg',
      isAvailable: true
    },
    {
      id: '10',
      name: 'Pisang Bakar Keju Cokelat',
      description: 'Pisang manis karamel bakar dipadukan dengan parutan keju cheddar melimpah, siraman cokelat lumer, dan taburan meses meises warna-warni.',
      price: 26000,
      category: 'Desserts',
      image: '/images/menu/pisang_bakar.jpg',
      isAvailable: true
    }
  ];

  console.log("Seeding database with updated culinary items and photos...");
  
  // Clean up old items with broken URLs or duplicates if needed
  await prisma.menuItem.deleteMany({});

  for (const item of dummyItems) {
    await prisma.menuItem.create({
      data: item
    });
  }
  
  console.log("Database seeded successfully with 10 high-quality products!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
