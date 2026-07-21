import { PrismaClient, ProductType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.info('🌱 Starting retail seed...')

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

  console.info('✅ Seeded default test users (user@example.com / user2@example.com)')

  let trader = await prisma.trader.findFirst()
  if (!trader) {
    trader = await prisma.trader.create({
      data: {
        id: 1,
        email: 'trader@example.com',
        name: 'Test Trader',
        password: hashedPassword,
        phone: '01000000002',
        role: 'trader'
      }
    })
  }

  await prisma.productImage.deleteMany()
  await prisma.productColor.deleteMany()
  await prisma.productSize.deleteMany()
  await prisma.product.deleteMany({
    where: {
      productTypes: {
        some: { type: ProductType.RETAIL }
      }
    }
  })

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      isRetail: true,
    }
  })

  const shoes = await prisma.category.create({
    data: {
      name: 'Shoes',
      isRetail: true,
    }
  })

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      isRetail: true,
    }
  })

  await prisma.product.create({
    data: {
      name: 'Black Hoodie',
      description: 'Premium black hoodie for everyday comfort',
      retailPrice: 850,
      stock: 10,
      sku: 'BH-001',
      isFeatured: true,
      categories: {
        connect: [{ id: clothing.id }]
      },
      trader: {
        connect: { id: trader.id }
      },
      productTypes: {
        create: [{ type: ProductType.RETAIL }]
      },
      depositAmount: 0,
      securityDeposit: 0,
      images: {
        createMany: {
          data: [
            {
              url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      },
      colors: {
        createMany: {
          data: [
            {
              color: 'Black'
            }
          ]
        }
      },
      sizes: {
        createMany: {
          data: [
            { size: 'M', quantity: 5 },
            { size: 'L', quantity: 5 }
          ]
        }
      }
    }
  })

  await prisma.product.create({
    data: {
      name: 'White Sneakers',
      description: 'Comfortable white sneakers with modern design',
      retailPrice: 1200,
      stock: 15,
      sku: 'WS-001',
      isFeatured: true,
      categories: {
        connect: [{ id: shoes.id }]
      },
      trader: {
        connect: { id: trader.id }
      },
      productTypes: {
        create: [{ type: ProductType.RETAIL }]
      },
      depositAmount: 0,
      securityDeposit: 0,
      images: {
        createMany: {
          data: [
            {
              url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      },
      colors: {
        createMany: {
          data: [
            {
              color: 'White'
            }
          ]
        }
      },
      sizes: {
        createMany: {
          data: [
            { size: '42', quantity: 8 },
            { size: '43', quantity: 7 }
          ]
        }
      }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Retail Cap',
      description: 'Stylish cap for everyday wear',
      retailPrice: 350,
      stock: 20,
      sku: 'RC-001',
      isFeatured: false,
      categories: {
        connect: [{ id: accessories.id }]
      },
      trader: {
        connect: { id: trader.id }
      },
      productTypes: {
        create: [{ type: ProductType.RETAIL }]
      },
      depositAmount: 0,
      securityDeposit: 0,
      images: {
        createMany: {
          data: [
            {
              url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      },
      colors: {
        createMany: {
          data: [
            {
              color: 'Gray'
            }
          ]
        }
      },
      sizes: {
        createMany: {
          data: [
            { size: 'One Size', quantity: 20 }
          ]
        }
      }
    }
  })

  console.info('✅ Retail seed completed successfully!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
