import axios from 'axios';
import * as cheerio from 'cheerio';

const channels = [
    {
        name: '2 Sport Premium',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-537-2-sport-premium.html'
    },
    {
        name: 'Bahrain Sports 1',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-1129-bahrain-sports-1.html'
    },
    {
        name: 'Bahrain Sports 2',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-1130-bahrain-sports-2.html'
    },
    {
        name: 'beIN Sports AU 1 A+',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-2972-bein-sports-au-1-a.html'
    },
    {
        name: 'beIN Sports AU 2 A+',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-2939-bein-sports-au-2-a.html'
    },
    {
        name: 'beIN Sports AU 3 A+',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-2940-bein-sports-au-3-a.html'
    },
    {
        name: 'Caze TV HD',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-4189-caze-tv-hd.html'
    },
    {
        name: 'DAZN Fast',
        url: 'https://world-cup-2026-streaming.blogspot.com/live-tv-4224-dazn-fast.html'
    }
];

function decodeV(v) {
    try {
        const step1 = atob(v);
        const step2 = atob(step1);
        const parts = step2.split(':');
        if (parts.length >= 3) {
            return {
                streamUrl: atob(parts[0]),
                keyId: atob(parts[1]),
                key: atob(parts[2])
            };
        } else if (parts.length === 1) {
            return {
                streamUrl: atob(parts[0])
            };
        }
    } catch (e) {
        return { error: e.message };
    }
    return null;
}

async function scrapeAll() {
    console.log("Starting scraping...");
    const results = [];
    for (const channel of channels) {
        try {
            const { data } = await axios.get(channel.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                validateStatus: () => true // Allow 404s since page still returns HTML
            });
            const $ = cheerio.load(data);
            const iframeSrc = $('#shaka_player_iframe').attr('src');
            if (!iframeSrc) {
                console.log(`❌ No iframe found for: ${channel.name}`);
                continue;
            }

            const urlObj = new URL(iframeSrc);
            const type = urlObj.searchParams.get('type') || 'dash-clearkey';
            const v = urlObj.searchParams.get('v');
            
            const decoded = v ? decodeV(v) : null;
            
            results.push({
                name: channel.name,
                url: channel.url,
                iframeSrc,
                type,
                v,
                decoded
            });
            console.log(`✅ Scraped and decoded: ${channel.name}`);
        } catch (err) {
            console.error(`❌ Error scraping ${channel.name}:`, err.message);
        }
    }

    console.log("\n=== RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
}

scrapeAll();
