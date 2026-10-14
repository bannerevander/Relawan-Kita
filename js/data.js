// Data pendukung aplikasi. Data divisi (nama, tugas, kuota) ada langsung di tabel HTML.

// Kata kunci jurusan kesehatan untuk syarat Divisi Medis (dicocokkan tanpa membedakan huruf besar/kecil).
const HEALTH_KEYWORDS = ['kedokteran', 'keperawatan', 'farmasi', 'kesehatan masyarakat', 'kebidanan', 'gizi', 'ilmu kesehatan'];

// Kegiatan relawan yang bisa dipilih. Setiap kegiatan memakai kuota divisi dari tabel.
const KEGIATAN = [
  { id: 'banjir', title: 'Tanggap Darurat Banjir', jenis: 'Banjir', status: 'Darurat', lokasi: 'Semarang Utara, Jawa Tengah', posko: 'Posko Banjir Kelurahan Tanjung Mas', mulai: '2026-10-20', durasi: '3 hari · shift 8 jam', desc: 'Evakuasi warga, dapur umum, dan distribusi bantuan untuk 1.200 warga yang mengungsi akibat banjir rob.' },
  { id: 'gempa', title: 'Pemulihan Pascagempa', jenis: 'Gempa Bumi', status: 'Pemulihan', lokasi: 'Cianjur, Jawa Barat', posko: 'Posko Induk Lapangan Prawatasari', mulai: '2026-10-27', durasi: '7 hari · shift 8 jam', desc: 'Membersihkan puing, mendirikan tenda keluarga, dan membantu layanan kesehatan bagi warga terdampak gempa.' },
  { id: 'erupsi', title: 'Posko Erupsi Gunung Semeru', jenis: 'Erupsi Gunung', status: 'Darurat', lokasi: 'Lumajang, Jawa Timur', posko: 'Posko Pengungsian Candipuro', mulai: '2026-10-22', durasi: '5 hari · shift 8 jam', desc: 'Mendampingi pengungsi, membagikan masker, dan mengelola logistik di jalur evakuasi erupsi.' },
  { id: 'longsor', title: 'Evakuasi Tanah Longsor', jenis: 'Tanah Longsor', status: 'Darurat', lokasi: 'Banjarnegara, Jawa Tengah', posko: 'Posko Desa Sijeruk', mulai: '2026-10-24', durasi: '4 hari · shift 8 jam', desc: 'Mendukung tim SAR dengan dapur umum, pendataan korban, dan pengangkutan logistik ke desa terisolasi.' },
  { id: 'karhutla', title: 'Siaga Kebakaran Hutan', jenis: 'Karhutla', status: 'Siaga', lokasi: 'Pekanbaru, Riau', posko: 'Posko Siaga Karhutla Rumbai', mulai: '2026-11-02', durasi: '5 hari · shift 6 jam', desc: 'Membagikan masker, memeriksa warga terdampak kabut asap, dan mendata kelompok rentan.' },
  { id: 'trauma', title: 'Trauma Healing Anak Pengungsi', jenis: 'Sosial', status: 'Pemulihan', lokasi: 'Palu, Sulawesi Tengah', posko: 'Huntara Balaroa', mulai: '2026-11-09', durasi: '3 hari · shift 6 jam', desc: 'Bermain, bercerita, dan menyediakan dapur sehat bagi anak-anak di hunian sementara pascabencana.' },
];

const TESTIMONIALS = [
  { name: 'Salsa Amelia', role: 'Keperawatan · Divisi Medis', text: 'Tiga hari di posko banjir Semarang mengajarkan saya lebih banyak dari satu semester praktik klinik.', color: '#F43F5E' },
  { name: 'Raka Pratama', role: 'Teknik Informatika · Pendataan', text: 'Data pengungsi yang rapi bikin bantuan sampai ke orang yang tepat. Ternyata skill ngoding saya berguna di lapangan.', color: '#0EA5E9' },
  { name: 'Dimas Arya', role: 'Manajemen · Logistik', text: 'Bongkar muat 12 truk dalam semalam, capek tapi puas. Tim logistiknya solid banget!', color: '#6366F1' },
];
