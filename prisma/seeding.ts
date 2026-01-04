import { Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'src/common/utils/password.util';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});


const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const rolesData = [
    { name: 'ADMIN', description: 'Administrator role' },
    { name: 'EMPLOYEE', description: 'Employee role' },
  ];

const roles: Role[] = []
  for (const roleData of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });
     roles.push(role);
  }

  const adminRole = roles.find(r => r.name === 'ADMIN')!;
  for (let i = 0; i < 3; i++) {
    const fullName = faker.person.fullName();
    const email = `admin${i + 1}@email.com`;
    const passwordHash = await hashPassword('nasthaadmin');
    const avatarUrl = faker.image.avatar();

    await prisma.user.upsert({
      where: { email },
      update: {}, 
      create: {
        fullName,
        email,
        passwordHash,
        avatarUrl,
        roleId: adminRole.id,
      },
    });
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
