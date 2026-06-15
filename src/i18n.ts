import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "YKN Movies",
      "home": "Home",
      "movies": "Movies",
      "series": "Series",
      "popular": "Popular",
      "live_sports": "Live Sports",
      "match_schedule": "Match Schedule",
      "kick_off": "Kick-off",
      "live_now": "Live",
      "description": "Description",
      "live_sports_tv": "Live TV & Sports",
      "live_sports_subtitle": "Feel the pulse of the FIFA World Cup 2026! Watch live matches and your favorite premium TV channels in high definition, absolutely free.",
      "no_matches": "No Matches Today",
      "no_matches_desc": "No live matches are active at the moment. Check the TV Channels tab for other streams.",
      "play_now": "Watch Now",
      "play_channel": "Play Channel",
      "server_selector": "Select Server",
      "tips_title": "Viewing Tips",
      "tips_desc": "If the player feels locked or won't play, click once inside the player area to clear invisible ad-buffers, then click play again.",
      "live_tv_subtitle": "Entertainment & Local Channels",
      "sports_tv_subtitle": "Premium Sports Channels",
      "back_to_menu": "Back to Menu",
      "live_stream_error": "Failed to load live streaming data. Please try again later.",
      "no_channels": "No Channels Available",
      "no_channels_desc": "Channels in this category are currently unavailable.",
      "match_ended": "Ended",
      "starts_in_mins": "Starts in {{count}}m",
      "starts_in_hours": "Not Started",
      "share": "Share",
      "copied": "Copied!",
      "copy_link": "Copy Link",
      "stats_standings": "Stats & Standings",
      "search": "Search movies...",
      "watch_now": "Watch Now",
      "more_info": "More Info",
      "light_mode": "Light",
      "dark_mode": "Dark",
      "recommended": "Recommended for You",
      "top_rated": "Top Rated",
      "search_results": "Search Results",
      "no_results": "No results found",
      "footer_desc": "Your ultimate destination for movies and series. Stream the latest hits in high quality anywhere, anytime with Yuk Kita Nonton.",
      "quick_links": "Quick Links",
      "follow_us": "Follow Us",
      "copyright": "© 2026 Yuk Kita Nonton. All rights reserved.",
      "about": "About",
      "contact": "Contact",
      "privacy": "Privacy Policy",
      "terms": "Terms of Service",
      "back_to_home": "Back to Home",
      "results": "results",
      "new_releases": "New Releases",
      "popular_series": "Popular Series",
      "loading": "Loading...",
      "synopsis": "Synopsis",
      "director": "Director",
      "cast": "Key Cast",
      "changelog": "Changelog",
      "explore_more": "Explore Top Rated",
      "latest_explore": "Explore Latest Hits",
      "loading_more": "Discovering more hits...",
      "end_of_list": "You've reached the end of our current spotlight.",
      "support_dev": "Support Developer",
      "support_desc": "Love this platform? Support the developer to keep bringing new features and updates!",
      "news": "News",
      "article_hero": "Featured Story",
      "explore_news": "Discover Latest Movie News",
      "upcoming": "Coming Soon",
      "trending": "Trending Now",
      "trending_news": "Hot News",
      "read_article": "Read Article",
      "app_promo_badge": "Official Mobile App",
      "app_promo_title_1": "Android App",
      "app_promo_title_2": "Now Available.",
      "app_promo_desc": "Enjoy premium access via the official YKN Android app. More stable performance, distraction-free fullscreen, and automatic sync with the website.",
      "app_promo_btn_apk": "Download APK (Android)",
      "app_promo_btn_iphone": "Install on iPhone",
      "app_promo_ios_title": "For iPhone Users (iOS)",
      "app_promo_ios_step1": "Click the Share button in Safari.",
      "app_promo_ios_step2": "Select 'Add to Home Screen' from the menu.",
      "app_promo_footer": "Optimized for Android Official Global Version",
      "random_pick_title": "Pick for Me!",
      "random_pick_desc": "Let us choose something for you 🍿",
      "random_content_type": "Content Type",
      "random_genre": "Genre",
      "random_genre_all": "Any Genre",
      "random_type_all": "All",
      "random_spin_1": "🎲 Shuffling options...",
      "random_spin_2": "🎬 Picking from thousands of movies...",
      "random_spin_3": "✨ Finding the absolute best...",
      "random_spin_4": "🍿 Almost done...",
      "random_result_title": "✨ Picked for You!",
      "random_watch_detail": "See Movie Details",
      "random_reshuffle": "Shuffle Again",
      "random_no_match": "Hmm, didn't find anything. Try again!",
      "random_error": "An error occurred. Try again!",
      "random_spinning": "Picking...",
      "genre_action": "Action",
      "genre_comedy": "Comedy",
      "genre_horror": "Horror",
      "genre_romance": "Romance",
      "genre_scifi": "Sci-Fi",
      "genre_thriller": "Thriller",
      "genre_drama": "Drama",
      "genre_fantasy": "Fantasy",
      "genre_animation": "Animation",
      "genre_crime": "Crime",
      "genre_adventure": "Adventure",
      "report_title": "Report Issue",
      "report_subtitle": "Help us improve by reporting streaming issues or site bugs.",
      "report_category": "Category",
      "report_cat_broken": "Broken Video / Server Error",
      "report_cat_sub": "Subtitle Issue",
      "report_cat_info": "Wrong Movie Info",
      "report_cat_other": "Other Bug / Feedback",
      "report_movie_title": "Movie/Series Title (Optional)",
      "report_placeholder_movie": "e.g. Toy Story 5",
      "report_desc": "Detailed Description",
      "report_placeholder_desc": "Please describe the problem in detail (e.g. Server 1 keeps buffering, no sound)...",
      "report_submit": "Send Report",
      "report_submitting": "Sending...",
      "report_success": "Report submitted successfully! Thank you.",
      "report_success_desc": "Our team will look into it shortly.",
      "report_error": "Failed to send report. Please try again.",
      "playback_error": "Playback Error",
      "retry_button": "Retry",
      "refresh_player": "Refresh Player",
      "remind_me": "Remind Me",
      "reminded": "Reminded",
      "watch_highlights": "Watch Highlights",
      "highlights": "Highlights",
      "notif_granted": "Reminders active! You will be notified 30 and 10 minutes before kickoff.",
      "notif_blocked": "Notification permission is blocked. Please enable it in browser settings.",
      "live_chat": "Live Chat",
      "quick_channels": "Channels",
      "choose_nickname": "Choose Nickname",
      "nickname_placeholder": "Enter your nickname...",
      "chat_placeholder": "Say something...",
      "join_chat": "Join Chat",
      "randomize": "Randomize"
    }
  },
  id: {
    translation: {
      "app_name": "YKN Movies",
      "home": "Beranda",
      "movies": "Film",
      "series": "Serial",
      "popular": "Populer",
      "live_sports": "Live Bola",
      "match_schedule": "Jadwal Pertandingan",
      "kick_off": "Kick-off",
      "live_now": "Live",
      "description": "Deskripsi",
      "live_sports_tv": "Live TV & Sports",
      "live_sports_subtitle": "Rayakan semarak Piala Dunia FIFA 2026! Saksikan siaran langsung pertandingan bersejarah antar negara terbaik dan saluran TV favorit Anda gratis tanpa buffering.",
      "no_matches": "Tidak Ada Pertandingan Hari Ini",
      "no_matches_desc": "Saat ini belum ada siaran langsung pertandingan yang aktif. Silakan lihat tab TV Saluran untuk tontonan lainnya.",
      "play_now": "Tonton Sekarang",
      "play_channel": "Putar Channel",
      "server_selector": "Pilih Server",
      "tips_title": "Tips Menonton",
      "tips_desc": "Jika pemutar video terasa terkunci atau tidak mau diputar, klik sekali di dalam area pemutar untuk membersihkan ad-buffer (iklan tidak terlihat), lalu klik tombol mainkan/play kembali.",
      "live_tv_subtitle": "Saluran Hiburan & Lokal",
      "sports_tv_subtitle": "Saluran Sports Premium",
      "back_to_menu": "Kembali ke Menu",
      "live_stream_error": "Gagal memuat data live streaming. Silakan coba lagi nanti.",
      "no_channels": "Tidak Ada Saluran",
      "no_channels_desc": "Saluran untuk kategori ini sedang tidak tersedia.",
      "match_ended": "Selesai",
      "starts_in_mins": "Mulai {{count}} Menit Lagi",
      "starts_in_hours": "Belum Mulai",
      "share": "Bagikan",
      "copied": "Tersalin!",
      "copy_link": "Salin Tautan",
      "stats_standings": "Klasemen & Skor",
      "search": "Cari film...",
      "watch_now": "Tonton Sekarang",
      "more_info": "Info Lebih Lanjut",
      "light_mode": "Terang",
      "dark_mode": "Gelap",
      "recommended": "Direkomendasikan Untuk Anda",
      "top_rated": "Rating Tertinggi",
      "search_results": "Hasil Pencarian",
      "no_results": "Tidak ada hasil ditemukan",
      "footer_desc": "Destinasi utama Anda untuk film dan serial. Streaming hits terbaru dalam kualitas tinggi di mana saja, kapan saja bersama Yuk Kita Nonton.",
      "quick_links": "Tautan Cepat",
      "follow_us": "Ikuti Kami",
      "copyright": "© 2026 Yuk Kita Nonton. Hak cipta dilindungi undang-undang.",
      "about": "Tentang",
      "contact": "Kontak",
      "privacy": "Kebijakan Privasi",
      "terms": "Syarat & Ketentuan",
      "back_to_home": "Kembali ke Beranda",
      "results": "hasil",
      "new_releases": "Rilisan Terbaru",
      "popular_series": "Serial Populer",
      "loading": "Memuat...",
      "synopsis": "Sinopsis",
      "director": "Sutradara",
      "cast": "Pemeran Utama",
      "changelog": "Catatan Perubahan",
      "explore_more": "Eksplorasi Rating Tertinggi",
      "latest_explore": "Eksplorasi Hits Terbaru",
      "loading_more": "Menemukan lebih banyak hits...",
      "end_of_list": "Anda telah mencapai akhir dari sorotan kami.",
      "support_dev": "Dukung Pengembang",
      "support_desc": "Suka dengan platform ini? Dukung pengembang agar terus bisa update fitur terbaru!",
      "news": "Berita",
      "article_hero": "Berita Utama",
      "explore_news": "Eksplorasi Berita Film Terbaru",
      "upcoming": "Akan Datang",
      "trending": "Sedang Tren",
      "trending_news": "Berita Hangat",
      "read_article": "Baca Artikel",
      "app_promo_badge": "Aplikasi Mobile Resmi",
      "app_promo_title_1": "Aplikasi Android",
      "app_promo_title_2": "Kini Tersedia.",
      "app_promo_desc": "Nikmati akses premium melalui Aplikasi Android resmi YKN. Performa lebih stabil, layar penuh tanpa gangguan, dan sinkronisasi otomatis dengan website utama.",
      "app_promo_btn_apk": "Unduh APK (Android)",
      "app_promo_btn_iphone": "Instal di iPhone",
      "app_promo_ios_title": "Khusus Pengguna iPhone (iOS)",
      "app_promo_ios_step1": "Klik tombol Share di bar bawah Safari.",
      "app_promo_ios_step2": "Cari dan pilih menu 'Add to Home Screen'.",
      "app_promo_footer": "Dioptimalkan untuk Aplikasi Android Resmi",
      "random_pick_title": "Pilihkan Aku!",
      "random_pick_desc": "Biar kami yang pilihkan untukmu 🍿",
      "random_content_type": "Tipe Konten",
      "random_genre": "Genre",
      "random_genre_all": "Bebas (Semua Genre)",
      "random_type_all": "Semua",
      "random_spin_1": "🎲 Mengocok pilihan...",
      "random_spin_2": "🎬 Memilih dari ribuan film...",
      "random_spin_3": "✨ Menemukan yang terbaik...",
      "random_spin_4": "🍿 Hampir selesai...",
      "random_result_title": "✨ Pilihan Untukmu!",
      "random_watch_detail": "Lihat Detail Film",
      "random_reshuffle": "Acak Lagi",
      "random_no_match": "Hmm, tidak ketemu. Coba lagi!",
      "random_error": "Terjadi kesalahan. Coba lagi!",
      "random_spinning": "Memilih...",
      "genre_action": "Action",
      "genre_comedy": "Komedi",
      "genre_horror": "Horor",
      "genre_romance": "Romantis",
      "genre_scifi": "Fiksi Ilmiah",
      "genre_thriller": "Mencekam",
      "genre_drama": "Drama",
      "genre_fantasy": "Fantasi",
      "genre_animation": "Animasi",
      "genre_crime": "Kriminal",
      "genre_adventure": "Petualangan",
      "report_title": "Laporkan Masalah",
      "report_subtitle": "Bantu kami meningkatkan kualitas dengan melaporkan masalah streaming atau bug website.",
      "report_category": "Kategori",
      "report_cat_broken": "Video Rusak / Error Server",
      "report_cat_sub": "Masalah Subtitle",
      "report_cat_info": "Informasi Film Salah",
      "report_cat_other": "Bug Lain / Masukan",
      "report_movie_title": "Judul Film/Series (Opsional)",
      "report_placeholder_movie": "contoh: Toy Story 5",
      "report_desc": "Deskripsi Masalah",
      "report_placeholder_desc": "Jelaskan masalah secara detail (contoh: Server 1 macet, suara tidak keluar)...",
      "report_submit": "Kirim Laporan",
      "report_submitting": "Mengirim...",
      "report_success": "Laporan berhasil dikirim! Terima kasih.",
      "report_success_desc": "Tim kami akan segera memeriksa masalah ini.",
      "report_error": "Gagal mengirim laporan. Silakan coba lagi.",
      "playback_error": "Kesalahan Pemutaran",
      "retry_button": "Coba Lagi",
      "refresh_player": "Muat Ulang Player",
      "remind_me": "Ingatkan Saya",
      "reminded": "Sudah Diingatkan",
      "watch_highlights": "Tonton Cuplikan",
      "highlights": "Highlights",
      "notif_granted": "Pengingat aktif! Kami akan memberi notifikasi 30 menit dan 10 menit sebelum kickoff.",
      "notif_blocked": "Izin notifikasi diblokir. Silakan aktifkan di pengaturan browser.",
      "live_chat": "Live Chat",
      "quick_channels": "Saluran",
      "choose_nickname": "Pilih Nickname",
      "nickname_placeholder": "Masukkan nickname Anda...",
      "chat_placeholder": "Tulis pesan...",
      "join_chat": "Gabung Chat",
      "randomize": "Acak"
    }
  },
  ja: {
    translation: {
      "home": "ホーム", "movies": "映画", "series": "シリーズ", "popular": "人気", "search": "映画を検索...", "watch_now": "今すぐ観る", "trending": "今トレンド",
      "news": "ニュース", "live_sports": "ライブスポーツ"
    }
  },
  ko: {
    translation: {
      "home": "홈", "movies": "영화", "series": "시리즈", "popular": "인기", "search": "영화 검색...", "watch_now": "지금 시청하기", "trending": "지금 뜨는 콘텐츠",
      "news": "뉴스", "live_sports": "라이브 스포츠"
    }
  },
  es: {
    translation: {
      "home": "Inicio", "movies": "Películas", "series": "Series", "popular": "Popular", "search": "Buscar películas...", "watch_now": "Ver ahora", "trending": "Tendencias",
      "news": "Noticias", "live_sports": "Deportes en vivo"
    }
  },
  fr: {
    translation: {
      "home": "Accueil", "movies": "Films", "series": "Séries", "popular": "Populaire", "search": "Rechercher...", "watch_now": "Regarder maintenant", "trending": "Tendances",
      "news": "Actualités", "live_sports": "Sports en direct"
    }
  },
  de: {
    translation: {
      "home": "Home", "movies": "Filme", "series": "Serien", "popular": "Beliebt", "search": "Suche...", "watch_now": "Jetzt ansehen", "trending": "Angesagt",
      "news": "News", "live_sports": "Live-Sport"
    }
  },
  zh: {
    translation: {
      "home": "首页", "movies": "电影", "series": "剧集", "popular": "热门", "search": "搜索...", "watch_now": "立即观看", "trending": "正在流行",
      "news": "新闻", "live_sports": "体育直播"
    }
  },
  ar: {
    translation: {
      "home": "الرئيسية", "movies": "أفلام", "series": "مسلسلات", "popular": "شائع", "search": "بحث...", "watch_now": "شاهد الآن", "trending": "الأكثر رواجاً",
      "news": "أخبار", "live_sports": "رياضة مباشرة"
    }
  },
  ru: {
    translation: {
      "home": "Главная", "movies": "Фильмы", "series": "Сериалы", "popular": "Популярное", "search": "Поиск...", "watch_now": "Смотреть", "trending": "В тренде",
      "news": "Новости", "live_sports": "Спорт LIVE"
    }
  }
};

// Helper to get cookie value
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
};

// Detect language from region cookie or subdomain
const getDetectedLanguage = () => {
  // 1. Cek Hostname (Subdomain)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.startsWith('id.')) return 'id';
    if (hostname.startsWith('sg.')) return 'en';
  }

  // 2. Cek Cookie (Geo Data dari Middleware)
  const rawData = getCookie('user-region-data');
  if (rawData) {
    try {
      const { country } = JSON.parse(rawData);
      const mapping: Record<string, string> = {
        'ID': 'id',
        'JP': 'ja',
        'KR': 'ko',
        'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
        'FR': 'fr',
        'DE': 'de', 'CH': 'de', 'AT': 'de',
        'RU': 'ru', 'BY': 'ru', 'KZ': 'ru',
        'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'JO': 'ar',
        'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es'
      };
      return mapping[country] || 'en';
    } catch (e) {
      return 'en';
    }
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDetectedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
