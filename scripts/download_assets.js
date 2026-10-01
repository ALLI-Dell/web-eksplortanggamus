const fs = require('fs');
const path = require('path');
const https = require('https');

const assets = [
  { url: 'https://eksplor-tanggamus.vercel.app/favicon.svg', dest: 'public/favicon.svg' },
  { url: 'https://eksplor-tanggamus.vercel.app/manifest.json', dest: 'public/manifest.json' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/gigi-hiu.jpg', dest: 'public/Gambar/gigi-hiu.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/kiluan.jpg', dest: 'public/Gambar/kiluan.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/way-lalaan.jpg', dest: 'public/Gambar/way-lalaan.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/batutegi.jpg', dest: 'public/Gambar/batutegi.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/muara-indah.jpg', dest: 'public/Gambar/muara-indah.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/gunung-tanggamus.jpg', dest: 'public/Gambar/gunung-tanggamus.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/danau-hijau-ulubelu.jpg', dest: 'public/Gambar/danau-hijau-ulubelu.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/gulai-taboh.jpg', dest: 'public/Gambar/gulai-taboh.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/seruit-lampung.jpg', dest: 'public/Gambar/seruit-lampung.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/kopi-ulubelu.jpg', dest: 'public/Gambar/kopi-ulubelu.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/otak-otak.jpg', dest: 'public/Gambar/otak-otak.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/dodol-durian.jpg', dest: 'public/Gambar/dodol-durian.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/lapis-legit.jpg', dest: 'public/Gambar/lapis-legit.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/kemplang-panggang.jpg', dest: 'public/Gambar/kemplang-panggang.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/sambal-tempoyak.jpg', dest: 'public/Gambar/sambal-tempoyak.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/ikan-bakar-dabu.jpg', dest: 'public/Gambar/ikan-bakar-dabu.jpg' },
  { url: 'https://eksplor-tanggamus.vercel.app/Gambar/kue-semprong.jpg', dest: 'public/Gambar/kue-semprong.jpg' }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const fullDest = path.join(__dirname, '..', dest);
    const dir = path.dirname(fullDest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const file = fs.createWriteStream(fullDest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(fullDest, () => {});
        return resolve(`Failed ${url}: HTTP ${response.statusCode}`);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(`Downloaded: ${dest}`));
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(fullDest, () => {});
      resolve(`Error ${url}: ${err.message}`);
    });
  });
}

async function main() {
  console.log('Downloading assets...');
  for (const item of assets) {
    const res = await download(item.url, item.dest);
    console.log(res);
  }
  console.log('Asset downloads complete!');
}

main();
