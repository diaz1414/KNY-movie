import axios from 'axios';

const XOR_KEY = '90_NiwmsdfhgjQw';

const decryptLicense = (ciphertext) => {
  try {
    const binary = atob(ciphertext);
    let result = '';
    for (let i = 0; i < binary.length; i++) {
      result += String.fromCharCode(binary.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return result;
  } catch (e) {
    console.error('Decryption failed', e);
    return '';
  }
};

async function run() {
    try {
        const { data } = await axios.get('https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-sports.dat');
        console.log("=== First 6 Channels in tv-sports.dat ===");
        data.slice(0, 7).forEach((ch, i) => {
            const dec = ch.url_license ? decryptLicense(ch.url_license) : 'none';
            console.log(`${i+1}. Name: "${ch.nama_channel}" (id_iptv: ${ch.id_iptv}) -> stream: ${ch.url_iptv} (license: ${dec})`);
        });
    } catch (e) {
        console.error(e);
    }
}
run();
