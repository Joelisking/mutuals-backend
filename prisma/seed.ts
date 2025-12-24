import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.cartItem.deleteMany();
  await prisma.shoppingCart.deleteMany();
  await prisma.productRecommendation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.eventMedia.deleteMany();
  await prisma.event.deleteMany();
  await prisma.dJMix.deleteMany();
  await prisma.dJProfile.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.articleRelation.deleteMany();
  await prisma.article.deleteMany();
  await prisma.homepageHeroSlide.deleteMany();
  await prisma.mediaFile.deleteMany();
  await prisma.artistSubmission.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  await prisma.user.create({
    data: {
      email: 'superadmin@mutuals.plus',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@mutuals.plus',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@mutuals.plus',
      password: hashedPassword,
      firstName: 'Editor',
      lastName: 'User',
      role: 'EDITOR',
    },
  });

  console.log('✅ Created 3 users');

  // Create Articles
  console.log('📝 Creating articles...');
  await prisma.article.create({
    data: {
      title: 'The Rise of Underground Electronic Music in 2024',
      slug: 'rise-of-underground-electronic-music-2024',
      content: 'A deep dive into the underground electronic music scene and its evolution in 2024...',
      excerpt: 'Exploring the vibrant underground electronic music scene',
      category: 'Music',
      tags: ['Music', 'Electronic', 'Underground'],
      status: 'PUBLISHED',
      featured: true,
      publishDate: new Date(),
      authorId: editor.id,
      viewCount: 1250,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Street Art Revolution: How Urban Artists Are Changing the Game',
      slug: 'street-art-revolution-urban-artists',
      content: 'An exploration of modern street art and its impact on contemporary culture...',
      excerpt: 'The evolution of street art in modern cities',
      category: 'Art',
      tags: ['Art', 'Street Art', 'Culture'],
      status: 'PUBLISHED',
      featured: true,
      publishDate: new Date(),
      authorId: editor.id,
      viewCount: 980,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Fashion Forward: Emerging Designers to Watch',
      slug: 'fashion-forward-emerging-designers',
      content: 'Meet the innovative fashion designers reshaping the industry...',
      excerpt: 'Discovering the next generation of fashion innovators',
      category: 'Fashion',
      tags: ['Fashion', 'Design', 'Emerging'],
      status: 'PUBLISHED',
      featured: false,
      publishDate: new Date(),
      authorId: editor.id,
      viewCount: 560,
    },
  });

  console.log('✅ Created 3 articles');

  // Create Playlists
  console.log('🎵 Creating playlists...');
  await prisma.playlist.createMany({
    data: [
      {
        title: 'Late Night Vibes',
        description: 'Perfect tracks for those 3 AM sessions',
        platform: 'SPOTIFY',
        embedUrl: 'https://open.spotify.com/embed/playlist/example1',
        curatorName: 'DJ Nova',
        featured: true,
        playCount: 5420,
      },
      {
        title: 'Underground Gems Vol. 1',
        description: 'Hidden treasures from the underground scene',
        platform: 'SOUNDCLOUD',
        embedUrl: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/example/sets/underground-gems',
        curatorName: 'Mutuals Team',
        featured: true,
        playCount: 3210,
      },
      {
        title: 'Workout Energy',
        description: 'High-energy tracks to power your workout',
        platform: 'APPLE_MUSIC',
        embedUrl: 'https://embed.music.apple.com/us/playlist/example2',
        curatorName: 'DJ Pulse',
        featured: false,
        playCount: 1890,
      },
    ],
  });

  console.log('✅ Created 3 playlists');

  // Create DJ Profiles
  console.log('🎧 Creating DJ profiles and mixes...');
  const dj1 = await prisma.dJProfile.create({
    data: {
      name: 'DJ Nova',
      slug: 'dj-nova',
      bio: 'Pioneering the underground techno scene since 2015. Based in Brooklyn, NY.',
      featured: true,
      socialLinks: JSON.stringify({
        instagram: '@djnova',
        soundcloud: 'djnova',
        spotify: 'dj-nova',
      }),
    },
  });

  const dj2 = await prisma.dJProfile.create({
    data: {
      name: 'Luna Beats',
      slug: 'luna-beats',
      bio: 'Bringing ethereal sounds to the dance floor. Based in Los Angeles, CA.',
      featured: true,
      socialLinks: JSON.stringify({
        instagram: '@lunabeats',
        soundcloud: 'luna-beats',
      }),
    },
  });

  // Create DJ Mixes
  await prisma.dJMix.createMany({
    data: [
      {
        djProfileId: dj1.id,
        title: 'Midnight Sessions #001',
        embedUrl: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/djnova/midnight-sessions-001',
        platform: 'SOUNDCLOUD',
        duration: 7200, // 2 hours
        releaseDate: new Date('2024-01-15'),
        playCount: 8500,
      },
      {
        djProfileId: dj1.id,
        title: 'Warehouse Vibes',
        embedUrl: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/djnova/warehouse-vibes',
        platform: 'SOUNDCLOUD',
        duration: 5400, // 90 minutes
        releaseDate: new Date('2024-02-20'),
        playCount: 6200,
      },
      {
        djProfileId: dj2.id,
        title: 'Dreamscape Mix',
        embedUrl: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/lunabeats/dreamscape',
        platform: 'SOUNDCLOUD',
        duration: 4800, // 80 minutes
        releaseDate: new Date('2024-03-10'),
        playCount: 4100,
      },
    ],
  });

  console.log('✅ Created 2 DJ profiles and 3 mixes');

  // Create Events
  console.log('🎪 Creating events...');
  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 14);

  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 30);

  await prisma.event.createMany({
    data: [
      {
        title: 'Underground Sessions: Spring Edition',
        description: 'Join us for an unforgettable night of underground techno',
        eventDate: futureDate1,
        venue: 'The Warehouse',
        location: 'Brooklyn, NY',
        city: 'Brooklyn',
        country: 'USA',
        ticketLink: 'https://tickets.example.com/underground-spring',
        status: 'UPCOMING',
        featured: true,
      },
      {
        title: 'Art & Music Festival',
        description: 'A celebration of art, music, and culture',
        eventDate: futureDate2,
        venue: 'Central Park',
        location: 'New York, NY',
        city: 'New York',
        country: 'USA',
        ticketLink: 'https://tickets.example.com/art-music-fest',
        status: 'UPCOMING',
        featured: true,
      },
    ],
  });

  console.log('✅ Created 2 events');

  // Create Products
  console.log('🛍️ Creating products...');
  const product1 = await prisma.product.create({
    data: {
      name: 'Mutuals+ T-Shirt - Black',
      slug: 'mutuals-plus-tshirt-black',
      description: 'Premium quality cotton t-shirt with Mutuals+ logo',
      category: 'Apparel',
      basePrice: 35.00,
      currency: 'USD',
      featured: true,
      status: 'ACTIVE',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Limited Edition Poster Set',
      slug: 'limited-edition-poster-set',
      description: 'Exclusive artist collaboration poster collection',
      category: 'Art',
      basePrice: 50.00,
      currency: 'USD',
      featured: true,
      status: 'ACTIVE',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Mutuals+ Tote Bag',
      slug: 'mutuals-plus-tote-bag',
      description: 'Eco-friendly canvas tote bag',
      category: 'Accessories',
      basePrice: 25.00,
      currency: 'USD',
      featured: false,
      status: 'ACTIVE',
    },
  });

  // Create Product Variants
  console.log('📦 Creating product variants...');
  await prisma.productVariant.createMany({
    data: [
      // T-Shirt variants
      { productId: product1.id, sku: 'MUT-TS-BLK-S', size: 'S', color: 'Black', price: 35.00, stockQuantity: 50 },
      { productId: product1.id, sku: 'MUT-TS-BLK-M', size: 'M', color: 'Black', price: 35.00, stockQuantity: 75 },
      { productId: product1.id, sku: 'MUT-TS-BLK-L', size: 'L', color: 'Black', price: 35.00, stockQuantity: 60 },
      { productId: product1.id, sku: 'MUT-TS-BLK-XL', size: 'XL', color: 'Black', price: 35.00, stockQuantity: 40 },

      // Poster variants
      { productId: product2.id, sku: 'MUT-POST-SET', size: 'Standard', price: 50.00, stockQuantity: 100 },

      // Tote bag variants
      { productId: product3.id, sku: 'MUT-TOTE-001', size: 'One Size', price: 25.00, stockQuantity: 150 },
    ],
  });

  console.log('✅ Created product variants');

  // Create Homepage Hero Slides
  console.log('🎨 Creating homepage hero slides...');
  await prisma.homepageHeroSlide.createMany({
    data: [
      {
        title: 'Discover Underground Culture',
        subtitle: 'Music, Art & Events',
        mediaUrl: 'https://images.unsplash.com/photo-1470229538611-16a7c00c0be5',
        mediaType: 'IMAGE',
        ctaText: 'Explore Now',
        ctaLink: '/articles',
        order: 0,
        active: true,
      },
      {
        title: 'Upcoming Events',
        subtitle: 'Join the Movement',
        mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
        mediaType: 'IMAGE',
        ctaText: 'View Events',
        ctaLink: '/events',
        order: 1,
        active: true,
      },
      {
        title: 'Limited Edition Merch',
        subtitle: 'Shop the Collection',
        mediaUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
        mediaType: 'IMAGE',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        order: 2,
        active: true,
      },
    ],
  });

  console.log('✅ Created 3 homepage hero slides');

  // Create Newsletter Subscribers
  console.log('📧 Creating newsletter subscribers...');
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: 'subscriber1@example.com', source: 'HOMEPAGE', status: 'ACTIVE' },
      { email: 'subscriber2@example.com', source: 'FOOTER', status: 'ACTIVE' },
      { email: 'subscriber3@example.com', source: 'POPUP', status: 'ACTIVE' },
    ],
  });

  console.log('✅ Created 3 newsletter subscribers');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Users: 3 (1 Super Admin, 1 Admin, 1 Editor)');
  console.log('- Articles: 3');
  console.log('- Playlists: 3');
  console.log('- DJ Profiles: 2');
  console.log('- DJ Mixes: 3');
  console.log('- Events: 2');
  console.log('- Products: 3');
  console.log('- Product Variants: 6');
  console.log('- Homepage Slides: 3');
  console.log('- Newsletter Subscribers: 3');
  console.log('\n🔑 Test Credentials:');
  console.log('Email: superadmin@mutuals.plus | Password: password123');
  console.log('Email: admin@mutuals.plus | Password: password123');
  console.log('Email: editor@mutuals.plus | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
