import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ── Admin ──
  const email = 'admin@example.com'
  const plainPassword = 'Admin@123'

  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('✅ Admin already exists.')
  } else {
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    const admin = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email,
        password: hashedPassword,
        phone: '01000000000',
      },
    })
    console.log('✅ Admin created successfully!')
    console.log({ email: admin.email, password: plainPassword })
  }

  // ── Trader ──
  const traderEmail = 'trader@example.com'
  let trader = await prisma.trader.findUnique({ where: { email: traderEmail } })
  if (!trader) {
    const hashedPassword = await bcrypt.hash('Trader@123', 10)
    trader = await prisma.trader.create({
      data: {
        name: 'Demo Trader',
        email: traderEmail,
        password: hashedPassword,
        phone: '01111111111',
      },
    })
    console.log('✅ Trader created:', { email: traderEmail, password: 'Trader@123' })
  } else {
    console.log('✅ Trader already exists.')
  }

  // ── Categories ──
  const categoryNames = ['Men', 'Women', 'Kids']
  const categories = {}
  for (const name of categoryNames) {
    let cat = await prisma.category.findUnique({ where: { name } })
    if (!cat) {
      cat = await prisma.category.create({ data: { name } })
    }
    categories[name] = cat
  }
  console.log('✅ Categories ready.')

  // ── Wholesale Products ──
  const existingWholesales = await prisma.wholesale.count()
  if (existingWholesales > 0) {
    console.log('✅ Wholesale products already exist.')
  } else {

  const wholesaleProducts = [
    // Men
    {
      name: 'Classic White Tee',
      description: 'Premium cotton crew-neck t-shirt, perfect for bulk retail orders.',
      price: 8.99,
      minOrder: 50,
      isBestDeal: true,
      isMostPopular: false,
      isPremiumCollection: false,
      brand: 'UrbanBasics',
      rating: 4.5,
      categoryId: categories['Men'].id,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Black', 'Gray'],
    },
    {
      name: 'Slim Fit Chinos',
      description: 'Comfortable stretch chinos available in multiple colors for wholesale.',
      price: 18.50,
      minOrder: 30,
      isBestDeal: true,
      isMostPopular: true,
      isPremiumCollection: false,
      brand: 'UrbanBasics',
      rating: 4.2,
      categoryId: categories['Men'].id,
      images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'],
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Khaki', 'Navy', 'Olive', 'Black'],
    },
    {
      name: 'Hooded Sweatshirt',
      description: 'Fleece-lined hoodie with front pocket, great for winter wholesale.',
      price: 22.00,
      minOrder: 25,
      isBestDeal: false,
      isMostPopular: true,
      isPremiumCollection: false,
      brand: 'ComfortWear',
      rating: 4.7,
      categoryId: categories['Men'].id,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Gray', 'Black', 'Navy', 'Burgundy'],
    },
    {
      name: 'Bomber Jacket',
      description: 'Lightweight bomber jacket with ribbed cuffs.',
      price: 25.00,
      minOrder: 20,
      isBestDeal: false,
      isMostPopular: false,
      isPremiumCollection: true,
      brand: 'StreetEdge',
      rating: 4.3,
      categoryId: categories['Men'].id,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Olive'],
    },
    // Women
    {
      name: 'Floral Summer Dress',
      description: 'Lightweight floral print dress, ideal for summer retail collections.',
      price: 14.99,
      minOrder: 40,
      isBestDeal: true,
      isMostPopular: false,
      isPremiumCollection: false,
      brand: 'BlossomStyle',
      rating: 4.6,
      categoryId: categories['Women'].id,
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Pink', 'Blue', 'Yellow'],
    },
    {
      name: 'High-Waist Leggings',
      description: 'Squat-proof high-waist leggings with moisture-wicking fabric.',
      price: 12.00,
      minOrder: 60,
      isBestDeal: false,
      isMostPopular: true,
      isPremiumCollection: false,
      brand: 'ActiveFlex',
      rating: 4.8,
      categoryId: categories['Women'].id,
      images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'Gray', 'Navy', 'Wine'],
    },
    {
      name: 'Denim Jacket',
      description: 'Classic denim jacket with button closure, a wardrobe essential.',
      price: 28.00,
      minOrder: 20,
      isBestDeal: false,
      isMostPopular: false,
      isPremiumCollection: true,
      brand: 'StreetEdge',
      rating: 4.4,
      categoryId: categories['Women'].id,
      images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Light Blue', 'Dark Blue', 'Black'],
    },
    // Kids
    {
      name: 'Kids Graphic Tee Pack',
      description: 'Fun graphic print t-shirts for kids, sold in packs of 3.',
      price: 15.00,
      minOrder: 50,
      isBestDeal: false,
      isMostPopular: false,
      isPremiumCollection: true,
      brand: 'LittleStars',
      rating: 4.3,
      categoryId: categories['Kids'].id,
      images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500'],
      sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
      colors: ['Multi'],
    },
    {
      name: 'Kids Jogger Pants',
      description: 'Soft cotton joggers with elastic waistband for active kids.',
      price: 10.50,
      minOrder: 40,
      isBestDeal: true,
      isMostPopular: true,
      isPremiumCollection: false,
      brand: 'LittleStars',
      rating: 4.1,
      categoryId: categories['Kids'].id,
      images: ['https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=500'],
      sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
      colors: ['Gray', 'Navy', 'Black'],
    },
    {
      name: 'Kids Hoodie Set',
      description: 'Matching hoodie and pants set for kids, cozy fleece material.',
      price: 19.99,
      minOrder: 30,
      isBestDeal: false,
      isMostPopular: true,
      isPremiumCollection: true,
      brand: 'LittleStars',
      rating: 4.5,
      categoryId: categories['Kids'].id,
      images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500'],
      sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
      colors: ['Pink', 'Blue', 'Gray'],
    },
  ]

  for (const product of wholesaleProducts) {
    await prisma.wholesale.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        minOrder: product.minOrder,
        isBestDeal: product.isBestDeal,
        isMostPopular: product.isMostPopular,
        isPremiumCollection: product.isPremiumCollection,
        brand: product.brand,
        rating: product.rating,
        trader: { connect: { id: trader.id } },
        category: { connect: { id: product.categoryId } },
        images: { create: product.images.map((url) => ({ url })) },
        sizes: { create: product.sizes.map((size) => ({ size })) },
        colors: { create: product.colors.map((color) => ({ color })) },
      },
    })
  }
  console.log(`✅ ${wholesaleProducts.length} wholesale products seeded!`)
  }

  // ── Brands ──
  const brandNames = ['Nike', 'Adidas', 'Zara', 'H&M', 'Puma']
  const brands = {}
  for (const name of brandNames) {
    let brand = await prisma.brand.findUnique({ where: { name } })
    if (!brand) {
      brand = await prisma.brand.create({ data: { name } })
    }
    brands[name] = brand
  }
  console.log('✅ Brands ready.')

  // ── Retail Products ──
  const existingProducts = await prisma.product.count()
  if (existingProducts > 0) {
    console.log('✅ Retail products already exist.')
  } else {
    const retailProducts = [
      {
        name: 'Nike Air Max Sneaker',
        description: 'Iconic sneaker with maximum cushioning and comfort for daily wear.',
        price: 129.99,
        sizeguide: 'Standard sneaker sizing',
        rating: 4.8,
        brandId: brands['Nike'].id,
        categoryId: categories['Men'].id,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        sizes: ['8', '9', '10', '11'],
        colors: ['Red', 'Black'],
      },
      {
        name: 'Adidas Trefoil Hoodie',
        description: 'Classic hoodie featuring the iconic Trefoil logo on the chest.',
        price: 65.00,
        sizeguide: 'Regular fit',
        rating: 4.6,
        brandId: brands['Adidas'].id,
        categoryId: categories['Men'].id,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Black'],
      },
      {
        name: 'Zara Summer Dress',
        description: 'Flowy patterned midi dress with puff sleeves and adjustable belt.',
        price: 59.90,
        sizeguide: 'Loose fit',
        rating: 4.5,
        brandId: brands['Zara'].id,
        categoryId: categories['Women'].id,
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Floral', 'White'],
      },
      {
        name: 'H&M Knit Sweater',
        description: 'Soft knit sweater in a wool blend with raglan sleeves.',
        price: 34.99,
        sizeguide: 'Relaxed fit',
        rating: 4.2,
        brandId: brands['H&M'].id,
        categoryId: categories['Women'].id,
        images: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500'],
        sizes: ['S', 'M', 'L'],
        colors: ['Beige', 'Gray'],
      },
      {
        name: 'Kids Puma Active Shorts',
        description: 'Breathable training shorts with dryCELL technology for active kids.',
        price: 24.99,
        sizeguide: 'Fits true to size',
        rating: 4.4,
        brandId: brands['Puma'].id,
        categoryId: categories['Kids'].id,
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500'],
        sizes: ['S (6-7)', 'M (8-9)', 'L (10-12)'],
        colors: ['Navy', 'Black'],
      }
    ]

    for (const product of retailProducts) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          sizeguide: product.sizeguide,
          rating: product.rating,
          trader: { connect: { id: trader.id } },
          category: { connect: { id: product.categoryId } },
          brand: { connect: { id: product.brandId } },
          images: { create: product.images.map((url) => ({ url, color: product.colors[0] })) },
          sizes: { create: product.sizes.map((size) => ({ size })) },
          colors: { create: product.colors.map((color) => ({ color })) },
        },
      })
    }
    console.log(`✅ ${retailProducts.length} retail products seeded!`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
