import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const hashedPassword = await bcrypt.hash('test123', 10)

  const testUser = await prisma.user.upsert({
    where: { email: 'test@flipbookly.com' },
    update: {},
    create: {
      email: 'test@flipbookly.com',
      password: hashedPassword,
      name: 'Test User',
    },
  })

  console.log('✅ Created test user:', {
    email: testUser.email,
    name: testUser.name,
    id: testUser.id,
  })
  console.log('📧 Email: test@flipbookly.com')
  console.log('🔑 Password: test123')
  console.log('')
  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

