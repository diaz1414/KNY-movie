# Yuk Kita Nonton (YKN) - Master Documentation 🎬

[![English](https://img.shields.io/badge/lang-English-blue.svg)](#-english-version)
[![Bahasa Indonesia](https://img.shields.io/badge/bahasa-Indonesia-red.svg)](#-versi-bahasa-indonesia)

---

## 🇺🇸 English Version

**Yuk Kita Nonton (YKN)** is a state-of-the-art, cinematic movie and series streaming dashboard. Built with a "Cinema-First" philosophy, it combines the latest web technologies (**React 19**, **Vite**, **Tailwind 4**) to deliver a premium user experience that rivals major streaming platforms.

### 🚀 Key Features Breakdown

#### 1. Cinematic Intro Engine (Smart-Phase)
- **Phase 1 (First-Timer):** A majestic 29-second cinematic experience using localized audio (`Tabir_Terbuka.mp3`) and advanced motion graphics. Uses `localStorage` to ensure it only plays once.
- **Phase 2 (Returning User):** A snappy 3.5-second Netflix-style "zoom forward" intro with high-impact visuals for users starting a new session.

#### 2. Intelligence & Edge Cases
- **Smart Maintenance Mode:** Enables a global "Down for Maintenance" screen via Vercel Environment Variables (`VITE_MAINTENANCE_MODE`). It intelligently bypasses local development so you can keep working while users see the maintenance screen.
- **Real-time Offline Detection:** A sophisticated overlay that appears the moment internet connection is lost, featuring cinematic glitch effects and a backdrop blur.
- **Custom 404 Experience:** A dedicated cinematic "Not Found" page that replaces default browser errors with high-end animations and easy "Back to Home" navigation.

#### 3. Content & Navigation
- **Hero Carousel:** An interactive, motion-rich slider featuring featured titles with smooth transitions.
- **Infinite Browsing Rows:** Categorized rows (Trending, Top Rated, New Releases) with horizontal overflow and hover-zoom effects.
- **Advanced Genre Filtering:** Dynamic routing for both Movies (`/genre/:id`) and Series (`/series/genre/:id`).
- **Real-time Search:** Integrated global search engine with instant feedback and clean UI.

#### 4. User Experience (UX)
- **Multi-Language Support (i18n):** Fully integrated internationalization system supporting English, Indonesian, and many others.
- **Theme Engine:** Persistent Dark/Light mode toggle with smooth transitions using React Context.
- **Changelog Modal:** Built-in version tracking to keep users updated on new features.
- **SEO & Legal:** Integrated meta tags, semantic HTML, and dedicated Privacy Policy / Terms of Service pages.

### 🛠️ Technical Stack
- **Core:** React 19 (Modern Hooks, AnimatePresence)
- **Build Tool:** Vite 6+
- **Styling:** Tailwind CSS 4.0 (Performance-first utility classes)
- **Animations:** Framer Motion (Complex physics-based transitions)
- **Backend/API:** Supabase (Auth/Database) & Axios (REST API calls)
- **Icons:** Lucide React & React Icons (Fa6 collection)

### 📂 Folder Structure Walkthrough
- `src/components/`: Atomic and macro UI components (Navbar, MovieCards, Intros, Overlays).
- `src/pages/`: Main route components including legal pages and edge-case screens (Maintenance, 404).
- `src/context/`: Global state management for themes and session logic.
- `src/services/`: API abstractions and database configurations (Supabase/Axios).
- `src/assets/`: Static media assets including cinematic audio and branding.
- `public/`: Publicly accessible static assets like FAVICONs and MP3 files.

---

## 🇮🇩 Versi Bahasa Indonesia

**Yuk Kita Nonton (YKN)** adalah platform dashboard streaming film dan serial yang sangat modern dan sinematik. Dibangun dengan filosofi "Cinema-First", aplikasi ini menggabungkan teknologi web terbaru untuk menghadirkan pengalaman pengguna kelas dunia.

### 🚀 Detail Fitur Utama

#### 1. Mesin Intro Sinematik (Smart-Phase)
- **Intro Pengunjung Baru:** Pengalaman sinematik 29 detik yang megah dengan audio lokal dan grafis tingkat tinggi. Disimpan di `localStorage` agar hanya muncul sekali.
- **Intro Pengunjung Lama:** Animasi "zoom forward" ala Netflix 3,5 detik yang cepat namun berdampak tinggi bagi pengguna yang kembali di sesi baru.

#### 2. Kecerdasan Sistem & Edge Cases
- **Mode Maintenance Pintar:** Layar pemeliharaan global yang bisa dinyalakan lewat Vercel (`VITE_MAINTENANCE_MODE`). Sistem ini membiarkan akses tetap terbuka di lokal koding agar perbaikan tetap bisa dilakukan.
- **Deteksi Offline Real-time:** Overlay canggih yang muncul seketika saat koneksi internet terputus, lengkap dengan efek glitch dan blur latar belakang.
- **Halaman 404 Kustom:** Halaman error sinematik yang menggantikan error browser standar dengan animasi pita merah dan navigasi yang mudah.

#### 3. Konten & Navigasi
- **Hero Carousel:** Slider interaktif yang menampilkan judul-judul unggulan dengan transisi halus.
- **Baris Konten Tak Terbatas:** Baris kategori (Sedang Tren, Rating Tertinggi, Rilisan Baru) dengan efek hover-zoom yang interaktif.
- **Filter Genre Lanjut:** Sistem routing dinamis untuk Film dan Serial berdasarkan genre.
- **Pencarian Real-time:** Mesin pencari global yang responsif dengan hasil instan.

#### 4. Pengalaman Pengguna (UX)
- **Dukungan Multi-Bahasa:** Sistem i18n yang mendukung Bahasa Indonesia, Inggris, dan banyak bahasa lainnya.
- **Mesin Tema:** Toggle Mode Gelap/Terang yang persisten menggunakan React Context.
- **Modal Catatan Perubahan:** Sistem pelacakan versi internal untuk memperbarui pengguna tentang fitur baru.
- **SEO & Legal:** Optimasi meta tag, HTML semantik, serta halaman Kebijakan Privasi dan Ketentuan Layanan yang sudah terintegrasi.

### 🚀 Cara Menjalankan

1. Clone repositori ini.
2. Jalankan `npm install` untuk memasang semua library.
3. Jalankan `npm run dev` untuk memulai pengembangan lokal.

### 📄 Lisensi
© 2026 Yuk Kita Nonton. Hak cipta dilindungi undang-undang.
