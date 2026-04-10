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
      "search": "Search movies...",
      "watch_now": "Watch Now",
      "more_info": "More Info",
      "light_mode": "Light",
      "dark_mode": "Dark",
      "trending": "Trending Now",
      "recommended": "Recommended for You",
      "top_rated": "Top Rated",
      "search_results": "Search Results",
      "no_results": "No results found",
      "footer_desc": "Your ultimate destination for movies and series. Stream the latest hits in high quality anywhere, anytime with Yuk Kita Nonton.",
      "quick_links": "Quick Links",
      "follow_us": "Follow Us",
      "copyright": "© 2026 YKN Movie. All rights reserved.",
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
      "cast": "Key Cast"
    }
  },
  id: {
    translation: {
      "app_name": "YKN",
      "home": "Beranda",
      "movies": "Film",
      "series": "Serial",
      "popular": "Populer",
      "search": "Cari film...",
      "watch_now": "Tonton Sekarang",
      "more_info": "Info Lebih Lanjut",
      "light_mode": "Terang",
      "dark_mode": "Gelap",
      "trending": "Sedang Tren",
      "recommended": "Direkomendasikan Untuk Anda",
      "top_rated": "Rating Tertinggi",
      "search_results": "Hasil Pencarian",
      "no_results": "Tidak ada hasil ditemukan",
      "footer_desc": "Destinasi utama Anda untuk film dan serial. Streaming hits terbaru dalam kualitas tinggi di mana saja, kapan saja bersama Yuk Kita Nonton.",
      "quick_links": "Tautan Cepat",
      "follow_us": "Ikuti Kami",
      "copyright": "© 2026 YKN Movie. Hak cipta dilindungi undang-undang.",
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
      "cast": "Pemeran Utama"
    }
  },
  ja: {
    translation: {
      "home": "ホーム", "movies": "映画", "series": "シリーズ", "popular": "人気", "search": "映画を検索...", "watch_now": "今すぐ観る", "trending": "今トレンド"
    }
  },
  ko: {
    translation: {
      "home": "홈", "movies": "영화", "series": "시리즈", "popular": "인기", "search": "영화 검색...", "watch_now": "지금 시청하기", "trending": "지금 뜨는 콘텐츠"
    }
  },
  es: {
    translation: {
      "home": "Inicio", "movies": "Películas", "series": "Series", "popular": "Popular", "search": "Buscar películas...", "watch_now": "Ver ahora", "trending": "Tendencias"
    }
  },
  fr: {
    translation: {
      "home": "Accueil", "movies": "Films", "series": "Séries", "popular": "Populaire", "search": "Rechercher...", "watch_now": "Regarder maintenant", "trending": "Tendances"
    }
  },
  de: {
    translation: {
      "home": "Home", "movies": "Filme", "series": "Serien", "popular": "Beliebt", "search": "Suche...", "watch_now": "Jetzt ansehen", "trending": "Angesagt"
    }
  },
  zh: {
    translation: {
      "home": "首页", "movies": "电影", "series": "剧集", "popular": "热门", "search": "搜索...", "watch_now": "立即观看", "trending": "正在流行"
    }
  },
  ar: {
    translation: {
      "home": "الرئيسية", "movies": "أفلام", "series": "مسلسلات", "popular": "شائع", "search": "بحث...", "watch_now": "شاهد الآن", "trending": "الأكثر رواجاً"
    }
  },
  ru: {
    translation: {
      "home": "Главная", "movies": "Фильмы", "series": "Сериалы", "popular": "Популярное", "search": "Поиск...", "watch_now": "Смотреть", "trending": "В тренде"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
