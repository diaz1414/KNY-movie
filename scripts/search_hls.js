import fs from 'fs';

const content = fs.readFileSync('scripts/decoded_custom_logic.js', 'utf-8');

const term = 'hls';
let pos = 0;
while (true) {
    const idx = content.indexOf(term, pos);
    if (idx === -1) break;
    const start = Math.max(0, idx - 150);
    const snippet = content.substring(start, idx + 400);
    console.log(`Match at index ${idx}:\n...${snippet}...`);
    console.log('-'.repeat(40));
    pos = idx + term.length;
}
