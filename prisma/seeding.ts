import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({accelerateUrl: '',});

async function main() {

  const rolesData = [
    { name: 'ADMIN', description: 'Administrator role' },
    { name: 'USER', description: 'Regular user role' },
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
    const passwordHash = await argon2.hash('nasthaadmin');
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
