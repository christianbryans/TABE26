import fs from 'fs';
import readline from 'readline';
import prisma from '../config/db.js';

async function runImport() {

  try {

    // Ambil device pertama
    const device = await prisma.device.findFirst();

    if (!device) {
      console.log('Device tidak ditemukan');
      return;
    }

    console.log('Device ditemukan:', device.name);

    // Baca file dataset SQL
    const fileStream = fs.createReadStream(
      'src/data/water_usage_column.sql'
    );

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let startCopy = false;
    let totalImported = 0;

    for await (const line of rl) {

      // Mulai baca setelah COPY
      if (line.includes('COPY public.water_usage')) {
        startCopy = true;
        continue;
      }

      // Selesai import
      if (line === '\\.') {
        break;
      }

      if (startCopy) {

        const cols = line.split('\t');

        // Validasi jumlah kolom
        if (cols.length < 9) continue;

        await prisma.waterUsage.create({
          data: {

            flowRate: parseFloat(cols[2]) || 0,

            volume: parseFloat(cols[3]) || 0,

            forward: parseFloat(cols[4]) || 0,

            backward: parseFloat(cols[5]) || 0,

            cumulative: parseFloat(cols[6]) || 0,

            timestamp: new Date(cols[7]),

            deviceId: device.id,
          },
        });

        totalImported++;

      }

    }

    console.log(`Berhasil import ${totalImported} data water usage`);

  } catch (err) {

    console.error('Import gagal:', err);

  } finally {

    await prisma.$disconnect();

  }

}

runImport();