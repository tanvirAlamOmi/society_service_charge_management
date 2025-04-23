import { PrismaClient, UserStatus, SocietyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Seed Roles
    const roleData = [
      {
        name: 'admin',
        description: null,
      },
      
      {
        name: 'owner',
        description: null,
      },
      {
        name: 'resident',
        description: null,
      },
    ];

    await prisma.role.createMany({
      data: roleData,
      skipDuplicates: true,
    });
    console.log('Roles seeded successfully');

    // Seed Society
    const societyData = {
      name: 'Sunrise Apartments 2',
      address: '123 Main St',
      postal_code: '12345',
      city: 'Dhaka',
      country: 'Bangladesh',
      total_flats: 2,
      status: SocietyStatus.ACTIVE,
    };

    const society = await prisma.society.create({
      data: societyData,
    });
    console.log('Society seeded successfully');

    // Seed Admin User
    const hashedPassword = await bcrypt.hash('12345678', 10);
    const userData = {
      username: 'gg2115',
      fullname: 'gsaaag',
      alias: 'ggaa25',
      email: 'gg25@gg.com',
      phone: '01718541649',
      password: hashedPassword,
      role_id: 1,  
      society_id: society.id,
      status: UserStatus.ACTIVE,
    };

    await prisma.user.create({
      data: userData,
    });
    console.log('Admin user seeded successfully');

    // Seed Predefined Service Charges
    const predefinedServiceChargeData = [
      {
        name: 'Guard',
        description: null,
      },
      {
        name: 'Lift',
        description: null,
      },
      {
        name: 'Garbage',
        description: null,
      },
      {
        name: 'Cleaning',
        description: null,
      },
      {
        name: 'Water',
        description: null,
      },
      {
        name: 'Electricity',
        description: null,
      },
      {
        name: 'Garden',
        description: null,
      },
      {
        name: 'Parking',
        description: null,
      },
    ];

    await prisma.predefinedServiceCharge.createMany({
      data: predefinedServiceChargeData,
      skipDuplicates: true,
    });
    console.log('Predefined service charges seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });