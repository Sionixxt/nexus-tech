// ============================================================================
// NexusTech — Database Seed Script
// Populates development database with sample data
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NexusTech database...\n');

  // ── 1. Create Admin & Customer Users ────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const customerPassword = await bcrypt.hash('Customer@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexustech.com' },
    update: {},
    create: {
      email: 'admin@nexustech.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'NexusTech',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'demo@nexustech.com' },
    update: {},
    create: {
      email: 'demo@nexustech.com',
      passwordHash: customerPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'CUSTOMER',
      addresses: {
        create: {
          label: 'Home',
          street: '123 Tech Avenue',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'US',
          isDefault: true,
        },
      },
    },
  });

  console.log('✅ Users created:', { admin: admin.email, customer: customer.email });

  // ── 2. Create Categories ────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Premium laptops for professionals and creators',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Flagship smartphones with cutting-edge technology',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'audio' },
      update: {},
      create: {
        name: 'Audio',
        slug: 'audio',
        description: 'High-fidelity headphones, earbuds and speakers',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'wearables' },
      update: {},
      create: {
        name: 'Wearables',
        slug: 'wearables',
        description: 'Smartwatches and fitness trackers',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Premium tech accessories and peripherals',
        imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400',
      },
    }),
  ]);

  console.log('✅ Categories created:', categories.map(c => c.name).join(', '));

  // ── 3. Create Products ──────────────────────────────────────────────────
  const products = [
    {
      sku: 'NXT-LP-001',
      name: 'MacBook Pro 16" M3 Max',
      slug: 'macbook-pro-16-m3-max',
      description: 'The most powerful MacBook Pro ever. With the blazing-fast M3 Max chip, up to 128GB of unified memory, and a stunning Liquid Retina XDR display, this laptop redefines professional performance.',
      shortDesc: 'M3 Max chip, 36GB RAM, 1TB SSD, 16" Liquid Retina XDR',
      price: 3499.00,
      compareAt: 3699.00,
      costPrice: 2800.00,
      stock: 25,
      brand: 'Apple',
      categoryId: categories[0].id,
      isFeatured: true,
      weight: 2140,
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', altText: 'MacBook Pro 16 front view', isPrimary: true, position: 0 },
        { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', altText: 'MacBook Pro 16 side view', position: 1 },
      ],
      specs: [
        { key: 'Processor', value: 'Apple M3 Max (14-core CPU)', position: 0 },
        { key: 'Memory', value: '36GB Unified Memory', position: 1 },
        { key: 'Storage', value: '1TB SSD', position: 2 },
        { key: 'Display', value: '16.2" Liquid Retina XDR (3456x2234)', position: 3 },
        { key: 'Battery', value: 'Up to 22 hours', position: 4 },
      ],
    },
    {
      sku: 'NXT-SP-001',
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'Forged in titanium. iPhone 15 Pro Max features a strong and light aerospace-grade titanium design with a textured matte-glass back. The A17 Pro chip delivers extraordinary performance for advanced gaming and intensive tasks.',
      shortDesc: 'A17 Pro chip, 256GB, 6.7" Super Retina XDR, Titanium',
      price: 1199.00,
      compareAt: null,
      costPrice: 850.00,
      stock: 50,
      brand: 'Apple',
      categoryId: categories[1].id,
      isFeatured: true,
      weight: 221,
      images: [
        { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', altText: 'iPhone 15 Pro Max', isPrimary: true, position: 0 },
      ],
      specs: [
        { key: 'Processor', value: 'A17 Pro (3nm)', position: 0 },
        { key: 'Storage', value: '256GB', position: 1 },
        { key: 'Display', value: '6.7" Super Retina XDR OLED (2796x1290)', position: 2 },
        { key: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto', position: 3 },
      ],
    },
    {
      sku: 'NXT-AU-001',
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Industry-leading noise cancellation with Auto NC Optimizer. Exceptionally natural sound quality with a newly developed 30mm driver unit. Crystal clear hands-free calling with 4 beamforming microphones.',
      shortDesc: 'Wireless ANC, 30-hour battery, Hi-Res Audio',
      price: 349.99,
      compareAt: 399.99,
      costPrice: 220.00,
      stock: 80,
      brand: 'Sony',
      categoryId: categories[2].id,
      isFeatured: true,
      weight: 250,
      images: [
        { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', altText: 'Sony WH-1000XM5', isPrimary: true, position: 0 },
      ],
      specs: [
        { key: 'Type', value: 'Over-ear, Closed-back', position: 0 },
        { key: 'Driver', value: '30mm', position: 1 },
        { key: 'Battery', value: '30 hours (ANC on)', position: 2 },
        { key: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm', position: 3 },
      ],
    },
    {
      sku: 'NXT-WR-001',
      name: 'Apple Watch Ultra 2',
      slug: 'apple-watch-ultra-2',
      description: 'The most rugged and capable Apple Watch pushes the limits of performance with the S9 SiP chip. A brighter always-on Retina display and precision dual-frequency GPS.',
      shortDesc: 'S9 chip, 49mm Titanium, GPS + Cellular',
      price: 799.00,
      compareAt: null,
      costPrice: 550.00,
      stock: 35,
      brand: 'Apple',
      categoryId: categories[3].id,
      isFeatured: false,
      weight: 61,
      images: [
        { url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800', altText: 'Apple Watch Ultra 2', isPrimary: true, position: 0 },
      ],
      specs: [
        { key: 'Chip', value: 'S9 SiP', position: 0 },
        { key: 'Case', value: '49mm Titanium', position: 1 },
        { key: 'Display', value: 'Always-On Retina LTPO2 OLED (3000 nits)', position: 2 },
        { key: 'Battery', value: 'Up to 36 hours', position: 3 },
      ],
    },
    {
      sku: 'NXT-LP-002',
      name: 'Dell XPS 15 (2024)',
      slug: 'dell-xps-15-2024',
      description: 'An iconic InfinityEdge display meets cutting-edge Intel performance. The Dell XPS 15 combines a stunning 3.5K OLED display with an Intel Core Ultra 7 processor.',
      shortDesc: 'Intel Core Ultra 7, 32GB, 1TB, 15.6" 3.5K OLED',
      price: 2199.00,
      compareAt: 2499.00,
      costPrice: 1650.00,
      stock: 18,
      brand: 'Dell',
      categoryId: categories[0].id,
      isFeatured: false,
      weight: 1860,
      images: [
        { url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800', altText: 'Dell XPS 15', isPrimary: true, position: 0 },
      ],
      specs: [
        { key: 'Processor', value: 'Intel Core Ultra 7 155H', position: 0 },
        { key: 'Memory', value: '32GB LPDDR5x', position: 1 },
        { key: 'Storage', value: '1TB PCIe Gen 4 SSD', position: 2 },
        { key: 'Display', value: '15.6" 3.5K OLED (3456x2160)', position: 3 },
        { key: 'GPU', value: 'NVIDIA GeForce RTX 4060', position: 4 },
      ],
    },
    {
      sku: 'NXT-AC-001',
      name: 'Logitech MX Master 3S',
      slug: 'logitech-mx-master-3s',
      description: 'Master any creative workflow with an icon built for performance. Precision sensor, quiet clicks, and MagSpeed electromagnetic scrolling.',
      shortDesc: 'Wireless, 8K DPI, USB-C, Multi-device',
      price: 99.99,
      compareAt: null,
      costPrice: 55.00,
      stock: 120,
      brand: 'Logitech',
      categoryId: categories[4].id,
      isFeatured: false,
      weight: 141,
      images: [
        { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', altText: 'Logitech MX Master 3S', isPrimary: true, position: 0 },
      ],
      specs: [
        { key: 'Sensor', value: 'Darkfield 8000 DPI', position: 0 },
        { key: 'Battery', value: 'Up to 70 days (full charge)', position: 1 },
        { key: 'Connectivity', value: 'Bluetooth, USB-C, Logi Bolt', position: 2 },
        { key: 'Compatibility', value: 'Windows, macOS, Linux, iPadOS', position: 3 },
      ],
    },
  ];

  for (const p of products) {
    const { images, specs, ...productData } = p;
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        ...productData,
        images: { create: images },
        specs: { create: specs },
      },
    });
  }

  console.log('✅ Products created:', products.length);

  // ── 4. Create a sample review ───────────────────────────────────────────
  const firstProduct = await prisma.product.findFirst({ where: { sku: 'NXT-LP-001' } });
  if (firstProduct) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: customer.id, productId: firstProduct.id } },
      update: {},
      create: {
        userId: customer.id,
        productId: firstProduct.id,
        rating: 5,
        title: 'Absolute beast of a machine',
        comment: 'The M3 Max is incredibly powerful. Compiles my projects in seconds and the battery life is outstanding. Worth every penny for professional work.',
        isVerified: true,
      },
    });
    console.log('✅ Sample review created');
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('───────────────────────────────────────────');
  console.log('Admin login:    admin@nexustech.com / Admin@123');
  console.log('Customer login: demo@nexustech.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
