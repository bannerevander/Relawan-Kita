// Semua efek gerak (motion) aplikasi. app.js memakai window.FX untuk elemen yang dibuat dinamis.
const FX = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // Loader: hilang setelah halaman siap, lalu animasi hero dimulai.
  window.addEventListener('load', () => {
    setTimeout(() => document.body.classList.add('is-ready'), reduce ? 0 : 700);
  });

  // Judul hero dipecah per kata supaya muncul bergantian.
  document.querySelectorAll('[data-split]').forEach((el) => {
    let i = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part.trim()) return frag.append(part);
            const s = document.createElement('span');
            s.className = 'word';
            s.style.setProperty('--i', i++);
            s.innerHTML = `<span>${part}</span>`;
            frag.append(s);
          });
          child.replaceWith(frag);
        } else wrap(child);
      });
    };
    wrap(el);
  });

  // Angka berjalan dari 0 ke target.
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduce) return (el.textContent = target.toLocaleString('id-ID'));
    const t0 = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Elemen muncul saat masuk layar.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  const observe = (root = document) => root.querySelectorAll('.reveal, [data-count]').forEach((el) => io.observe(el));
  observe();

  // Navbar, progress bar, dan parallax mengikuti scroll.
  const nav = document.getElementById('nav');
  const bar = document.getElementById('scrollProgress');
  const parallax = [...document.querySelectorAll('.parallax')];
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('nav--scrolled', y > 12);
    bar.style.transform = `scaleX(${y / (document.documentElement.scrollHeight - innerHeight || 1)})`;
    if (!reduce) parallax.forEach((el) => (el.style.translate = `0 ${y * el.dataset.speed * -1}px`));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Cahaya lembut mengikuti kursor.
  const glow = document.getElementById('cursorGlow');
  if (fine && !reduce) {
    addEventListener('pointermove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      glow.classList.add('on');
    }, { passive: true });
  }

  // Kartu sedikit miring 3D + sorotan mengikuti kursor.
  const tilt = (el) => {
    if (!fine || reduce) return;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-6px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  };

  // Tombol "magnetik" tertarik ke arah kursor.
  const magnetic = (el) => {
    if (!fine || reduce) return;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  };
  document.querySelectorAll('.magnetic').forEach(magnetic);

  // Konfeti saat berhasil mendaftar.
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#10B981', '#34D399', '#F59E0B', '#F43F5E', '#6366F1', '#0EA5E9'];
  const confetti = () => {
    if (reduce) return;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const parts = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 4,
      s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0],
    }));
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - frame / 140);
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (++frame < 140) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    draw();
  };

  return { observe, tilt, magnetic, confetti, reduce };
})();
