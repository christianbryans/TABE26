import fs from 'fs';
import path from 'path';
import prisma from '../config/db.js';

async function runImport() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/water_usage.sql');

    const sql = fs.readFileSync(filePath, 'utf8');

    await prisma.$executeRawUnsafe(sql);

    console.log('Water usage berhasil diimport');
  } catch (err) {
    console.error('Import gagal:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runImport();