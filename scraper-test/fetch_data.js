import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory is the public/data folder of the React app
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Target raw dat URLs
const SOURCES = [
  {
    url: 'https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-events.dat',
    outputName: 'tv-events.json'
  },
  {
    url: 'https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-sports.dat',
    outputName: 'tv-sports.json'
  },
  {
    url: 'https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-hiburan.dat',
    outputName: 'tv-hiburan.json'
  }
];

async function runFetcher() {
  console.log('=== [SCRAPER] Memulai Proses Unduh Data Sumber ===');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Membuat folder output: ${OUTPUT_DIR}`);
  }

  for (const source of SOURCES) {
    try {
      console.log(`Mengunduh dari: ${source.url}`);
      
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Save content into public/data folder
      const outputPath = path.join(OUTPUT_DIR, source.outputName);
      fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
      
      console.log(`✅ Sukses disimpan ke -> ${outputPath}`);
      console.log(`   Jumlah data: ${Array.isArray(response.data) ? response.data.length : '1'} item\n`);
    } catch (err) {
      console.error(`❌ Gagal mengunduh ${source.outputName}:`, err.message);
    }
  }
  
  console.log('=== [SCRAPER] Selesai Mem-backup Seluruh Data ===');
}

runFetcher();
