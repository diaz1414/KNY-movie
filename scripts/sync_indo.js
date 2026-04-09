import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ymdaacydpsznzbobppvk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZGFhY3lkcHN6bnpib2JwcHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzcwNzcsImV4cCI6MjA5MTMxMzA3N30.DAvImMrafbZiPp-GDDMwvxyL8qKXRzrpMHaCG58Q-ic';
const TMDB_API_KEY = 'f76f5f908dd164d45ec92431b0517a3a';
const TARGET_URL = 'http://139.59.44.214/country/indonesia/';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncMovies(pages = 3) { // Default scrape 3 pages
    console.log(`🚀 Starting Indonesian Movie Sync (${pages} pages)...`);

    try {
        const allMovieLinks = [];

        for (let p = 1; p <= pages; p++) {
            console.log(`PAGE ${p}: Fetching movies...`);
            const pageUrl = p === 1 ? TARGET_URL : `${TARGET_URL}page/${p}/`;
            
            try {
                const { data } = await axios.get(pageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    timeout: 10000
                });

                const $ = cheerio.load(data);
                let pageCount = 0;

                $('article').each((i, el) => {
                    const titleElement = $(el).find('.entry-title a, h2 a, .gmr-entry-title a');
                    const title = titleElement.text().trim();
                    const link = titleElement.attr('href');
                    if (title && link) {
                        allMovieLinks.push({ title, link });
                        pageCount++;
                    }
                });
                console.log(`  -> Found ${pageCount} movies.`);
            } catch (pageErr) {
                console.log(`  -> ⚠️ End of content or page error at PAGE ${p}`);
                break;
            }
        }

        console.log(`✅ Total movies to process: ${allMovieLinks.length}`);

        for (const movie of allMovieLinks) {
            try {
                // 1. Get Minochinos Iframe
                const moviePage = await axios.get(`${movie.link}?player=2`, { timeout: 10000 });
                const $movie = cheerio.load(moviePage.data);
                const iframeSrc = $movie('#player-2 iframe').attr('src') || 
                                 $movie('.gmr-embed-responsive iframe').attr('src') ||
                                 $movie('iframe[src*="minochinos"]').attr('src');

                if (!iframeSrc) {
                    console.log(`⚠️ No iframe for: ${movie.title}`);
                    continue;
                }

                // 2. Search TMDB ID by Title
                // Cleaning title: remove (2025), etc.
                const cleanTitle = movie.title.replace(/\(\d{4}\)/g, '').trim();
                const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        query: cleanTitle,
                        language: 'id-ID'
                    }
                });

                const tmdbMovie = tmdbRes.data.results[0];
                if (!tmdbMovie) {
                    console.log(`❓ No TMDB match: ${cleanTitle}`);
                    continue;
                }

                // 3. Upsert to Supabase
                const { error } = await supabase
                    .from('indo_movies')
                    .upsert({
                        tmdb_id: tmdbMovie.id.toString(),
                        title: tmdbMovie.title,
                        iframe_url: iframeSrc,
                        updated_at: new Date()
                    }, { onConflict: 'tmdb_id' });

                if (error) console.error("❌ Supabase Error:", error.message);
                else console.log(`⭐ Synced: ${tmdbMovie.title} (ID: ${tmdbMovie.id})`);

            } catch (err) {
                console.log(`❌ Skipped: ${movie.title}`);
            }
        }

        console.log("\n✅ ALL DONE!");

    } catch (error) {
        console.error("❌ Global Error:", error.message);
    }
}

syncMovies(10); // Ubah angka ini (misal 10) untuk ambil 10 halaman (sekitar 150 film)

