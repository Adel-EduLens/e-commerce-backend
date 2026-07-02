import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@example.com'
  const plainPassword = 'Admin@123'

  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('✅ Admin already exists.')
    return
  }

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
  console.log({
    email: admin.email,
    password: plainPassword,
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
