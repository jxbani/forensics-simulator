import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Get username from command line argument
    const username = process.argv[2];

    if (!username) {
      console.error('Usage: node make-admin.js <username>');
      console.error('Example: node make-admin.js myusername');
      process.exit(1);
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.error(`User "${username}" not found.`);
      process.exit(1);
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    console.log('✓ User updated successfully!');
    console.log('========================================');
    console.log(`Username: ${updatedUser.username}`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Role: ${updatedUser.role}`);
    console.log('========================================');
    console.log('\nPlease log out and log back in to access the admin panel.');
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
