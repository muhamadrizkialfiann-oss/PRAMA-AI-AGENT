import { FocusConfig } from "./types";

export const FOCUS_AREAS: FocusConfig[] = [
  {
    id: "MACRO",
    title: "Macro Assistant",
    description: "Fokus menyeluruh untuk mengevaluasi seluruh aspek bisnis & integrasi sistem secara utuh.",
    concept: "Menyelaraskan seluruh pilar strategi mulai dari visi, finansial, operasional, hingga strategi peluncuran pasar secara simultan.",
    badge: "Sistem Utuh",
    iconName: "LayoutDashboard",
    placeholderQuestion: "Berikan rancangan helikopter-view dari proyek ini secara komprehensif..."
  },
  {
    id: "GLOBAL_NAT",
    title: "Global / National Overview",
    description: "Visi nasional & global proyek, pengaruh regulasi, dan skalabilitas lintas kawasan.",
    concept: "Menyelaraskan ide dengan arah pembangunan regional, insentif regulasi pemerintah, serta strategi ekspansi global.",
    badge: "Visi Strategis",
    iconName: "Globe",
    placeholderQuestion: "Bagaimana regulasi nasional saat ini mempengaruhi proyek kami dan apa potensi ekspor/ekspansi globalnya?"
  },
  {
    id: "MARKET_OPPORTUNITY",
    title: "Market Opportunity",
    description: "Ukuran pasar, target konsumen, tren makro industri, dan celah pasar yang belum terisi.",
    concept: "Mengidentifikasi kesenjangan pasar yang signifikan (market gap) untuk diposisikan sebagai solusi utama.",
    badge: "Analisis Pasar",
    iconName: "TrendingUp",
    placeholderQuestion: "Siapa target audiens utama yang paling membutuhkan solusi ini, dan tren industri apa yang mendukung?"
  },
  {
    id: "SUPPLY_DEMAND",
    title: "Supply & Demand",
    description: "Analisis rantai pasok rill, ketersediaan material/talenta, kapasitas produksi, dan dinamika harga pasaran.",
    concept: "Memitigasi resiko operasional hulu-hilir serta memastikan ketersediaan pasokan sebanding dengan permintaan pelanggan.",
    badge: "Rantai Pasok",
    iconName: "PackageCheck",
    placeholderQuestion: "Bagaimana cara mengamankan rantai pasokan bahan baku atau talenta krusial di tengah fluktuasi ekonomi?"
  },
  {
    id: "GTM_STRATEGY",
    title: "Go-To-Market Strategy",
    description: "Strategi peluncuran perdana, pricing tiers, rencana akuisisi konsumen, serta profil target audiens utama.",
    concept: "Merancang roadmap taktis dari fase pra-peluncuran, peluncuran, hingga penetrasi pasar pertama agar hemat biaya.",
    badge: "Peluncuran",
    iconName: "Rocket",
    placeholderQuestion: "Buatkan strategi peluncuran hemat biaya (growth hacking) untuk 100 pelanggan pertama kami..."
  },
  {
    id: "STRUCTURE",
    title: "Internal Structure",
    description: "Tata kelola internal lembaga, struktur departemen, pembagian wewenang, dan matriks pertanggungjawaban.",
    concept: "Membangun landasan operasional organisasi yang ramping, lincah, serta memiliki akuntabilitas yang jelas.",
    badge: "Tata Kelola",
    iconName: "GitMerge",
    placeholderQuestion: "Bagaimana struktur organisasi terbaik untuk tim startup yang memfokuskan kegesitan (agile development)?"
  },
  {
    id: "TRANSITION_MODEL",
    title: "Transition Model",
    description: "Fase implementasi sistem baru, timeline transisi bertahap, dan peta jalan migrasi operasional.",
    concept: "Menjamin kelancaran migrasi dari operasional tradisional menuju teknologi modern tanpa mengganggu jalannya bisnis harian.",
    badge: "Manajemen Perubahan",
    iconName: "Milestone",
    placeholderQuestion: "Buatkan peta jalan (milestone) transisi 3 fase selama 1 tahun untuk implementasi sistem baru ini..."
  },
  {
    id: "OPS_MODEL",
    title: "Operating Model",
    description: "Aliran pendapatan (revenue streams), model operasional harian, pemicu efisiensi, dan struktur biaya.",
    concept: "Merancang mekanisme penciptaan nilai, pengiriman nilai, dan penangkapan profitabilitas secara berkelanjutan.",
    badge: "Pendapatan & Biaya",
    iconName: "Cpu",
    placeholderQuestion: "Apa saja model revenue stream yang paling cocok serta struktur biaya terbesar apa yang wajib kami waspadai?"
  },
  {
    id: "DIGITAL_COVERAGE",
    title: "Digital Coverage",
    description: "Teknologi & otomasi bisnis, arsitektur AI stack, sistem pelaporan digital, dan integrasi perangkat lunak.",
    concept: "Memaksimalkan adopsi teknologi cerdas untuk mengurangi biaya operasional manual melalui otomasi tingkat tinggi.",
    badge: "Otomasi Teknologi",
    iconName: "Laptop",
    placeholderQuestion: "Teknologi digital dan otomasi AI apa yang bisa mempercepat bisnis kami 10 kali lipat secara efisien?"
  },
  {
    id: "COMPETITOR",
    title: "Competitor Analysis",
    description: "Analisis kelemahan/kelebihan pesaing langsung & tidak langsung, serta Unique Selling Proposition (USP).",
    concept: "Mengamankan parit pertahanan bisnis (moat) dengan mendefinisikan fitur pembeda yang tidak dapat ditiru dengan mudah.",
    badge: "Diferensiasi",
    iconName: "ShieldAlert",
    placeholderQuestion: "Bagaimana cara memposisikan brand kami agar terlihat mencolok dan jauh lebih unggul di mata calon pembeli dibanding kompetitor?"
  },
  {
    id: "TAM_SAM_SOM",
    title: "TAM, SAM, SOM",
    description: "Estimasi Total Addressable Market, Serviceable Addressable Market, dan Serviceable Obtainable Market dengan angka.",
    concept: "Menghitung secara kuantitatif potensi ukuran pasar nyata yang dapat diraih demi meyakinkan calon investor.",
    badge: "Ukuran Pasar Kuantitatif",
    iconName: "Sigma",
    placeholderQuestion: "Tolong bantu estimasikan formula angka rill TAM, SAM, SOM untuk target market kami..."
  },
  {
    id: "CAC_LTV",
    title: "CAC / LTV Analysis",
    description: "Customer Acquisition Cost, Customer Lifetime Value, unit economics, payback period, dan tingkat retensi.",
    concept: "Memastikan biaya untuk mendapatkan satu pengguna selalu jauh lebih rendah dibandingkan nilai rupiah jangka panjangnya.",
    badge: "Kesehatan Finansial",
    iconName: "Wallet",
    placeholderQuestion: "Berapa rasio ideal LTV dibanding CAC untuk model bisnis ini agar profitabel jangka panjang?"
  }
];
