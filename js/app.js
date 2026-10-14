// Logika utama: pilih kegiatan, tabel divisi, cek jurusan, validasi form, dan daftar pendaftaran.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- Penyimpanan (localStorage) ----------
const store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { toast('Gagal menyimpan data di perangkat ini', 'error'); }
  },
};
let registrations = store.get('rk_bencana_v2');
let selected = null; // id kegiatan yang sedang dipilih

// ---------- Utilitas ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const isHealthMajor = (j) => HEALTH_KEYWORDS.some((k) => j.toLowerCase().includes(k));
const fmtDate = (d) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d + 'T00:00:00'));
const smooth = () => (FX.reduce ? 'auto' : 'smooth');

// Data divisi dibaca langsung dari baris tabel HTML (satu sumber data).
const DIVISI = $$('#divisiTable tbody tr').map((tr) => ({
  row: tr, name: tr.dataset.divisi, kuota: +tr.dataset.kuota, icon: tr.dataset.icon, medis: tr.hasAttribute('data-medis'),
}));
const TOTAL_KUOTA = DIVISI.reduce((n, d) => n + d.kuota, 0);
const divisiOf = (name) => DIVISI.find((d) => d.name === name);
const kegiatanOf = (id) => KEGIATAN.find((k) => k.id === id);
const terisi = (kegiatanId, divisi) => registrations.filter((r) => r.kegiatanId === kegiatanId && (!divisi || r.divisi === divisi)).length;

// ---------- Toast ----------
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast__icon">${type === 'success' ? '✓' : '!'}</span><p>${esc(msg)}</p>`;
  $('#toasts').append(el);
  setTimeout(() => { el.classList.add('out'); el.addEventListener('animationend', () => el.remove()); }, 3200);
}

// ---------- Dialog dengan animasi tutup ----------
function openDialog(d) { d.showModal(); document.body.classList.add('no-scroll'); }
function closeDialog(d) {
  if (!d.open) return;
  if (FX.reduce) { d.close(); return; }
  d.classList.add('closing');
  d.addEventListener('animationend', () => { d.classList.remove('closing'); d.close(); }, { once: true });
}
$$('dialog').forEach((d) => {
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) closeDialog(d); });
  d.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(d); });
  d.addEventListener('close', () => { if (!$$('dialog[open]').length) document.body.classList.remove('no-scroll'); });
});

// ---------- Langkah 1: daftar kegiatan ----------
function renderKegiatan() {
  $('#kegiatanGrid').innerHTML = KEGIATAN.map((k, i) => {
    const isi = terisi(k.id);
    const full = isi >= TOTAL_KUOTA;
    const on = k.id === selected;
    return `
    <article class="keg tilt${on ? ' is-selected' : ''}" style="--i:${i}" data-id="${k.id}">
      <div class="keg__cover">
        <img src="assets/images/kegiatan-${k.id}.svg" alt="" loading="lazy" />
        <span class="tag tag--${k.status.toLowerCase()}">${k.status}</span>
        <span class="keg__check" aria-hidden="true">✓</span>
      </div>
      <div class="keg__body">
        <small class="keg__jenis">${esc(k.jenis)}</small>
        <h3>${esc(k.title)}</h3>
        <ul class="meta">
          <li><img src="assets/icons/pin.svg" alt="" width="16" height="16" />${esc(k.lokasi)}</li>
          <li><img src="assets/icons/calendar.svg" alt="" width="16" height="16" />Mulai ${fmtDate(k.mulai)}</li>
        </ul>
        <p class="keg__desc">${esc(k.desc)}</p>
        <div class="progress"><span style="--w:${Math.round((isi / TOTAL_KUOTA) * 100)}%"></span></div>
        <div class="keg__foot">
          <small><b>${TOTAL_KUOTA - isi}</b> dari ${TOTAL_KUOTA} kursi tersisa</small>
          <button class="btn ${on ? 'btn--ghost' : 'btn--primary'} btn--sm" type="button" data-pick="${k.id}"${full ? ' disabled' : ''}>
            ${full ? 'Kuota penuh' : on ? 'Terpilih ✓' : 'Pilih Kegiatan →'}
          </button>
        </div>
      </div>
    </article>`;
  }).join('');
  $$('#kegiatanGrid .tilt').forEach(FX.tilt);
}

// Memilih kegiatan lalu mengarahkan pengguna ke tabel divisi (langkah 2).
function selectKegiatan(id) {
  const k = kegiatanOf(id);
  if (!k) return;
  selected = id;
  $('#formFields').disabled = false;
  refresh();
  $('#divisi').scrollIntoView({ behavior: smooth() });
  const table = $('#divisi .table-wrap');
  table.classList.remove('glow'); void table.offsetWidth; table.classList.add('glow');
  toast(`Kegiatan "${k.title}" dipilih. Sekarang pilih divisinya`);
}

function renderPicked() {
  const k = kegiatanOf(selected);
  const box = $('#picked');
  box.classList.toggle('picked--empty', !k);
  box.innerHTML = k ? `
    <img src="assets/images/kegiatan-${k.id}.svg" alt="" />
    <div><small>Kegiatan terpilih</small><b>${esc(k.title)}</b><span>${esc(k.lokasi)}</span></div>
    <a href="#kegiatan" class="btn btn--ghost btn--sm">Ganti</a>`
    : `<div><b>Belum memilih kegiatan</b><span>Pilih kegiatan dulu untuk membuka formulir.</span></div>
    <a href="#kegiatan" class="btn btn--primary btn--sm">Pilih Kegiatan</a>`;
  box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');

  $('#infoPosko').textContent = k ? k.posko : '–';
  $('#infoMulai').textContent = k ? fmtDate(k.mulai) : '–';
  $('#infoDurasi').textContent = k ? k.durasi : '–';
  $('#totalSisa').textContent = k ? `${TOTAL_KUOTA - terisi(k.id)} dari ${TOTAL_KUOTA} kursi tersisa` : `${TOTAL_KUOTA} kursi per kegiatan`;
}

// ---------- Tabel & pilihan divisi ----------
function renderDivisi() {
  const k = kegiatanOf(selected);
  $('#tableNote').innerHTML = k
    ? `Kuota untuk <span class="note-chip">${esc(k.title)}</span> · klik baris untuk memilih divisi`
    : 'Kuota berlaku untuk setiap kegiatan. <a href="#kegiatan">Pilih kegiatan</a> untuk melihat sisa kursi.';
  $('#divisiTable').classList.toggle('is-active', !!k);
  DIVISI.forEach((d) => {
    const sisa = k ? Math.max(0, d.kuota - terisi(k.id, d.name)) : null;
    $('.sisa', d.row).textContent = sisa === null ? '' : sisa ? `sisa ${sisa}` : 'penuh';
    d.row.classList.toggle('is-full', sisa === 0);
    d.row.tabIndex = k && sisa ? 0 : -1;
  });

  const select = $('#j-divisi');
  const current = select.value;
  select.innerHTML = '<option value="">Pilih divisi…</option>' + DIVISI.map((d) => {
    const full = k && terisi(k.id, d.name) >= d.kuota;
    return `<option value="${d.name}"${full ? ' disabled' : ''}>${d.name}${full ? ' (penuh)' : ''}</option>`;
  }).join('');
  if (current && !select.selectedOptions[0]?.disabled) select.value = current;
}

// Pesan error di bawah pilihan divisi (tanpa alert) saat jurusan/divisi diubah.
function checkDivisi() {
  const d = divisiOf($('#j-divisi').value);
  const jurusan = $('#j-jurusan').value.trim();
  const bad = d?.medis && jurusan && !isHealthMajor(jurusan);
  setError('divisi', bad ? 'Jurusan tidak terkait kesehatan' : '');
}

// ---------- Langkah 2: validasi & submit ----------
function setError(name, msg) {
  const input = $(`#joinForm [name="${name}"]`);
  const field = input.closest('.field');
  field.classList.toggle('invalid', !!msg);
  input.setAttribute('aria-invalid', !!msg);
  $('.err', field).textContent = msg;
}

function shake(form) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }

$('#joinForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const k = kegiatanOf(selected);
  if (!k) {
    toast('Pilih kegiatan terlebih dahulu', 'error');
    $('#kegiatan').scrollIntoView({ behavior: smooth() });
    return;
  }
  const name = form.elements.name.value.trim();
  const jurusan = form.elements.jurusan.value.trim();
  const d = divisiOf(form.elements.divisi.value);

  setError('name', name.length < 3 ? 'Nama minimal 3 karakter' : '');
  setError('jurusan', jurusan.length < 3 ? 'Isi jurusan kamu, contoh: Keperawatan' : '');
  setError('divisi', d ? '' : 'Pilih salah satu divisi');
  if (name.length < 3 || jurusan.length < 3 || !d) { shake(form); $('.invalid input, .invalid select', form)?.focus(); return; }

  // Aturan utama: Divisi Medis + jurusan non-kesehatan → tolak submit + alert.
  if (d.medis && !isHealthMajor(jurusan)) {
    setError('divisi', 'Jurusan tidak terkait kesehatan');
    shake(form);
    alert('Divisi Medis khusus jurusan kesehatan!');
    return;
  }

  if (terisi(k.id, d.name) >= d.kuota) { toast(`Kuota Divisi ${d.name} sudah penuh`, 'error'); refresh(); return; }
  if (registrations.some((r) => r.kegiatanId === k.id && r.name.toLowerCase() === name.toLowerCase())) {
    toast(`${name} sudah terdaftar di kegiatan ini`, 'error');
    return;
  }

  registrations.push({ id: 'r' + Date.now(), kegiatanId: k.id, name, jurusan, divisi: d.name, at: new Date().toISOString() });
  store.set('rk_bencana_v2', registrations);
  form.reset();
  refresh();
  showSuccess(name, jurusan, d, k);
});

function showSuccess(name, jurusan, d, k) {
  $('#successBody').innerHTML = `
    <div class="success modal__pad">
      <img src="assets/images/success.svg" alt="" width="140" height="140" />
      <h2 id="successTitle">Pendaftaran berhasil!</h2>
      <p>Terima kasih, <b>${esc(name)}</b> (${esc(jurusan)}). Kamu tercatat di <b>Divisi ${esc(d.name)}</b> untuk kegiatan <b>${esc(k.title)}</b>, mulai ${fmtDate(k.mulai)} di ${esc(k.posko)}.</p>
      <div class="success__actions"><button class="btn btn--ghost" data-close type="button">Tutup</button><button class="btn btn--primary" type="button" id="goMine">Lihat Pendaftaranku</button></div>
    </div>`;
  $('#goMine').addEventListener('click', () => { closeDialog($('#successModal')); openMine(); });
  openDialog($('#successModal'));
  FX.confetti();
}

// ---------- Pendaftaranku ----------
function renderMine() {
  const mine = registrations.filter((r) => kegiatanOf(r.kegiatanId));
  $('#mineCount').textContent = mine.length;
  $('#mineCount').classList.toggle('show', mine.length > 0);
  $('#mineList').innerHTML = mine.length ? mine.map((r, i) => `
    <div class="mine" style="--i:${i}">
      <img class="mine__thumb" src="assets/images/kegiatan-${r.kegiatanId}.svg" alt="" />
      <div class="mine__info">
        <b>${esc(kegiatanOf(r.kegiatanId).title)}</b>
        <small>${esc(r.name)} · ${esc(r.jurusan)}</small>
        <small class="mine__div"><img src="assets/icons/${divisiOf(r.divisi)?.icon || 'bencana'}.svg" alt="" width="14" height="14" />Divisi ${esc(r.divisi)}</small>
      </div>
      <button class="btn btn--danger btn--sm" type="button" data-cancel="${r.id}">Batalkan</button>
    </div>`).join('')
    : `<div class="empty empty--sm"><img src="assets/images/empty.svg" alt="" width="140" /><h3>Belum ada pendaftaran</h3><p>Yuk, pilih kegiatan relawan pertamamu!</p><button class="btn btn--primary" type="button" data-close data-go-kegiatan>Pilih Kegiatan</button></div>`;
}
function openMine() { renderMine(); openDialog($('#mineDrawer')); }

$('#mineList').addEventListener('click', (e) => {
  const id = e.target.closest('[data-cancel]')?.dataset.cancel;
  if (id) {
    if (!confirm('Batalkan pendaftaran ini?')) return;
    registrations = registrations.filter((r) => r.id !== id);
    store.set('rk_bencana_v2', registrations);
    toast('Pendaftaran dibatalkan');
    refresh();
  }
  if (e.target.closest('[data-go-kegiatan]')) $('#kegiatan').scrollIntoView({ behavior: smooth() });
});

// ---------- Elemen statis ----------
function renderStatic() {
  const words = KEGIATAN.map((k) => k.jenis).concat('Tim Medis', 'Dapur Umum', 'Logistik', 'Pendataan Pengungsi');
  const row = words.map((w) => `<span>${esc(w)}</span><i>✦</i>`).join('');
  $('#marquee').innerHTML = row + row;

  $('#trustAvatars').innerHTML = TESTIMONIALS.concat({ name: 'Nadia Putri', color: '#10B981' })
    .map((t) => `<span style="background:${t.color}">${initials(t.name)}</span>`).join('');

  $('#testi').innerHTML = TESTIMONIALS.map((t, i) => `
    <figure class="testi__card reveal tilt" style="--d:${i * 0.12}s">
      <div class="stars" aria-label="5 bintang">★★★★★</div>
      <blockquote>“${esc(t.text)}”</blockquote>
      <figcaption><span class="avatar" style="background:${t.color}">${initials(t.name)}</span><div><b>${esc(t.name)}</b><small>${esc(t.role)}</small></div></figcaption>
    </figure>`).join('');

  $('#year').textContent = new Date().getFullYear();
}

function refresh() { renderKegiatan(); renderPicked(); renderDivisi(); renderMine(); }

// ---------- Event ----------
$('#kegiatanGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-pick]');
  const card = e.target.closest('.keg');
  if (btn && !btn.disabled) selectKegiatan(btn.dataset.pick);
  else if (card && !btn && !$('[data-pick]', card).disabled) selectKegiatan(card.dataset.id);
});
// Klik baris tabel → divisi langsung terpilih di formulir.
function pickRow(tr) {
  if (!selected || !tr || tr.classList.contains('is-full')) return;
  $('#j-divisi').value = tr.dataset.divisi;
  checkDivisi();
  $('#daftar').scrollIntoView({ behavior: smooth() });
  setTimeout(() => $('#j-name').focus({ preventScroll: true }), FX.reduce ? 0 : 700);
  toast(`Divisi ${tr.dataset.divisi} dipilih`);
}
$('#divisiTable tbody').addEventListener('click', (e) => pickRow(e.target.closest('tr')));
$('#divisiTable tbody').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickRow(e.target.closest('tr')); } });
$('#j-divisi').addEventListener('change', checkDivisi);
$('#j-name').addEventListener('input', () => setError('name', ''));
$('#j-jurusan').addEventListener('input', () => { setError('jurusan', ''); checkDivisi(); });
$('#openMine').addEventListener('click', openMine);

const burger = $('#burger');
burger.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  burger.setAttribute('aria-expanded', open);
});
$('#navLinks').addEventListener('click', (e) => {
  if (e.target.closest('a')) { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }
});

renderStatic();
refresh();
FX.observe($('#testi'));
$$('#testi .tilt').forEach(FX.tilt);
