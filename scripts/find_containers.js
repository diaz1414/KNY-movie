import fs from 'fs';

const content = fs.readFileSync('scripts/extracted_custom_logic.js', 'utf-8');

const containers = ['events_container', 'sports_tv_container', 'live_tv_container', 'sports-event', 'sports-tv', 'live-tv'];

for (const container of containers) {
    console.log(`\n--- SEARCHING FOR: ${container} ---`);
    let pos = 0;
    while (true) {
        const idx = content.indexOf(container, pos);
        if (idx === -1) break;
        const start = Math.max(0, idx - 100);
        const snippet = content.substring(start, idx + 400);
        console.log(`[Pos ${idx}] Snippet:\n${snippet}`);
        console.log('-'.repeat(40));
        pos = idx + container.length;
    }
}
