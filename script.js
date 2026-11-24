(() => {
  const $ = id => document.getElementById(id);
  const main = $('main'), preview = $('preview'), hist = $('history'), hlist = $('hlist');
  const OPS = '+-×÷';
  let expr = '', justEvaluated = false, history = [];
  try { history = JSON.parse(localStorage.getItem('calc-history')) || []; } catch {}

  // Evaluator aman (tanpa eval) dengan prioritas operator
  function evaluate(s) {
    const t = s.replace(/\.(?!\d)/g, '').match(/\d*\.?\d+%?|[+\-×÷]/g) || [];
    let i = 0;
    const num = () => {
      let sign = 1;
      while (t[i] === '-' || t[i] === '+') { if (t[i++] === '-') sign = -sign; }
      const v = t[i++];
      if (v === undefined) throw new Error('x');
      return sign * parseFloat(v) / (v.endsWith('%') ? 100 : 1);
    };
    const term = () => { let v = num(); while (t[i] === '×' || t[i] === '÷') { const o = t[i++], r = num(); v = o === '×' ? v * r : v / r; } return v; };
    const sum = () => { let v = term(); while (t[i] === '+' || t[i] === '-') { const o = t[i++], r = term(); v = o === '+' ? v + r : v - r; } return v; };
    const r = sum();
    if (i < t.length) throw new Error('x');
    return r;
  }
  const fmt = n => String(parseFloat(n.toPrecision(12))).replace('.', ',').replace('-', '−');
  const show = s => s.replace(/-/g, '−').replace(/\./g, ',');

  function render(err) {
    const text = err || show(expr) || '0';
    main.textContent = text;
    main.className = 'main' + (err ? ' err' : text.length > 14 ? ' s' : text.length > 8 ? ' m' : '');
    preview.textContent = '';
    if (!err && expr && /[\d%]/.test(expr) && OPS.split('').some(o => expr.slice(1).includes(o)) && !justEvaluated) {
      try { const r = evaluate(expr); if (isFinite(r)) preview.textContent = '= ' + fmt(r); } catch {}
    }
  }

  function press(k) {
    if (/\d/.test(k)) {
      if (justEvaluated) expr = '';
      if (/%$/.test(expr)) return;
      expr += k; justEvaluated = false;
    } else if (k === '.') {
      if (justEvaluated) { expr = ''; justEvaluated = false; }
      const last = expr.split(/[+\-×÷]/).pop();
      if (last.includes('.') || last.endsWith('%')) return;
      expr += last === '' ? '0.' : '.';
    } else if (OPS.includes(k)) {
      justEvaluated = false;
      if (!expr) { if (k === '-') expr = '-'; return render(); }
      if (expr === '-') return;
      if (OPS.includes(expr.slice(-1))) expr = expr.slice(0, -1);
      expr += k;
    } else if (k === '%') {
      if (/\d$/.test(expr)) { expr += '%'; justEvaluated = false; }
    } else if (k === '±') {
      const m = expr.match(/\d*\.?\d+%?$/);
      if (!m) return;
      const idx = expr.length - m[0].length;
      const neg = expr[idx - 1] === '-' && (idx === 1 || OPS.includes(expr[idx - 2]));
      expr = neg ? expr.slice(0, idx - 1) + expr.slice(idx) : expr.slice(0, idx) + '-' + expr.slice(idx);
    } else if (k === 'DEL') {
      expr = justEvaluated ? '' : expr.slice(0, -1); justEvaluated = false;
    } else if (k === 'AC') {
      expr = ''; justEvaluated = false;
    } else if (k === '=') {
      if (!expr || justEvaluated) return;
      try {
        const r = evaluate(expr);
        if (!isFinite(r)) return render('Tidak bisa dibagi nol'), (expr = '');
        history.unshift({ e: show(expr), r: fmt(r) });
        history = history.slice(0, 30);
        try { localStorage.setItem('calc-history', JSON.stringify(history)); } catch {}
        preview.textContent = show(expr) + ' =';
        expr = String(parseFloat(r.toPrecision(12)));
        justEvaluated = true;
        main.textContent = fmt(r);
        main.className = 'main' + (main.textContent.length > 14 ? ' s' : main.textContent.length > 8 ? ' m' : '');
        return;
      } catch { expr = ''; return render('Format tidak valid'); }
    }
    render();
  }

  // Klik tombol
  $('keys').addEventListener('click', e => { const b = e.target.closest('.k'); if (b) press(b.dataset.k); });

  // Keyboard
  const map = { '*': '×', '/': '÷', 'x': '×', ',': '.', Enter: '=', '=': '=', Backspace: 'DEL', Escape: 'AC', Delete: 'AC' };
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = map[e.key] || e.key;
    if (!/^(\d|\.|\+|-|×|÷|%|=|DEL|AC)$/.test(k)) return;
    e.preventDefault();
    press(k);
    const btn = document.querySelector(`.k[data-k="${CSS.escape(k)}"]`);
    if (btn) { btn.classList.add('hit'); setTimeout(() => btn.classList.remove('hit'), 90); }
  });

  // Riwayat
  function renderHistory() {
    hlist.innerHTML = '';
    if (!history.length) { hlist.innerHTML = '<li class="empty">Belum ada perhitungan.</li>'; return; }
    history.forEach(h => {
      const li = document.createElement('li');
      li.innerHTML = `<small></small><b></b>`;
      li.firstChild.textContent = h.e + ' ='; li.lastChild.textContent = h.r;
      li.onclick = () => { expr = h.r.replace(',', '.').replace('−', '-'); justEvaluated = true; toggleHist(false); render(); main.textContent = h.r; };
      hlist.appendChild(li);
    });
  }
  function toggleHist(open) {
    hist.hidden = !open; $('histBtn').setAttribute('aria-expanded', open);
    if (open) renderHistory();
  }
  $('histBtn').onclick = () => toggleHist(hist.hidden);
  $('clearHist').onclick = () => { history = []; try { localStorage.removeItem('calc-history'); } catch {} renderHistory(); };

  // Tema
  const root = document.documentElement;
  try { const t = localStorage.getItem('calc-theme'); if (t) root.dataset.theme = t; } catch {}
  $('themeBtn').onclick = () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t; try { localStorage.setItem('calc-theme', t); } catch {}
  };

  render();
})();
