import prisma from './src/config/db.js';

async function deleteUser() {
  try {
    await prisma.user.deleteMany();

    console.log('Semua user berhasil dihapus');
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();