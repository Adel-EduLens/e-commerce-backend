import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting retail seed...')

  // Clean up and seed default test users
  await prisma.user.deleteMany()

  const bcrypt = await import('bcrypt')
  const hashedPassword = await bcrypt.default.hash('User@123', 10)

  await prisma.user.create({
    data: {
      id: 1,
      email: 'user@example.com',
      name: 'Test User 1',
      password: hashedPassword,
      phone: '01000000000',
      role: 'user',
      status: 'active'
    }
  })

  await prisma.user.create({
    data: {
      id: 2,
      email: 'user2@example.com',
      name: 'Test User 2',
      password: hashedPassword,
      phone: '01000000001',
      role: 'user',
      status: 'active'
    }
  })

  console.log('✅ Seeded default test users (user@example.com / user2@example.com)')

  await prisma.retailProductImage.deleteMany()
  await prisma.retailProductColor.deleteMany()
  await prisma.retailProductSize.deleteMany()
  await prisma.retailProduct.deleteMany()
  await prisma.retailCategory.deleteMany()

  const clothing = await prisma.retailCategory.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and clothing items',
      isActive: true
    }
  })

  const shoes = await prisma.retailCategory.create({
    data: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear and shoes',
      isActive: true
    }
  })

  const accessories = await prisma.retailCategory.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories',
      isActive: true
    }
  })

  await prisma.retailProduct.create({
    data: {
      name: 'Black Hoodie',
      slug: 'black-hoodie',
      description: 'Premium black hoodie for everyday comfort',
      shortDescription: 'Premium hoodie',
      price: 850,
      discountPrice: 699,
      stock: 10,
      sku: 'BH-001',
      brand: 'Nasu',
      isFeatured: true,
      isActive: true,
      categoryId: clothing.id,
      depositAmount: 0,
      securityDeposit: 0,
      images: {
        createMany: {
          data: [
            {
              url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
              alt: 'Black Hoodie',
              isMain: true
            }
          ]
        }
      },
      colors: {
        createMany: {
          data: [
            {
              name: 'Black',
              hexCode: '#000000'
            }
          ]
        }
      },
      sizes: {
        createMany: {
          data: [
            { name: 'M', stock: 5 },
            { name: 'L', stock: 5 }
          ]
        }
      }
    }
  })

  await prisma.retailProduct.create({
    data: {
      name: 'White Sneakers',
      slug: 'white-sneakers',
      description: 'Comfortable white sneakers with modern design',
      shortDescription: 'Casual sneakers',
      price: 1200,
      discountPrice: 999,
      stock: 15,
      sku: 'WS-001',
      brand: 'Nasu',
      isFeatured: true,
      isActive: true,
      categoryId: shoes.id,
      depositAmount: 0,
      securityDeposit: 0,
      images: {
        createMany: {
          data: [
            {
              url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
              alt: 'White Sneakers',
              isMain: true
            }
          ]
        }
      },
      colors: {
        createMany: {
          data: [
            {
              name: 'White',
              hexCode: '#FFFFFF'
            }
          ]
        }
      },
      sizes: {
        createMany: {
          data: [
            { name: '42', stock: 8 },
            { name: '43', stock: 7 }
          ]
        }
      }
    }
  })

  await prisma.retailProduct.create({
    data: {
      name: 'Retail Cap',
      slug: 'retail-cap',
      description: 'Stylish cap for everyday wear',
      shortDescription: 'Fashion cap',
      price: 350,
      discountPrice: 249,
      stock: 20,
      sku: 'RC-001',
      brand: 'Nasu',
      isFeatured: false,
      isActive: true,
      categoryId: accessories.id,
      depositAmount: 0,
      securityDeposit: 0,
      images: {
        createMany: {
          data: [
            {
              url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
              alt: 'Retail Cap',
              isMain: true
            }
          ]
        }
      },
      colors: {
        createMany: {
          data: [
            {
              name: 'Gray',
              hexCode: '#808080'
            }
          ]
        }
      },
      sizes: {
        createMany: {
          data: [
            { name: 'One Size', stock: 20 }
          ]
        }
      }
    }
  })

  console.log('✅ Retail seed completed successfully!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
