// ── Math utilities ────────────────────────────────────────────

export function fmtNum(x) {
    if (x === undefined || x === null || isNaN(x)) return 'NaN';
    if (!isFinite(x)) return x > 0 ? '∞' : '-∞';
    const s = parseFloat(x.toPrecision(10)).toString();
    return s;
  }
  
  // Matrix operations
  export function matDet(m) {
    const n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    let d = 0;
    for (let c = 0; c < n; c++) {
      const sub = m.slice(1).map(r => r.filter((_, j) => j !== c));
      d += (c % 2 === 0 ? 1 : -1) * m[0][c] * matDet(sub);
    }
    return d;
  }
  
  export function matTranspose(m) {
    return m[0].map((_, c) => m.map(r => r[c]));
  }
  
  export function matMul(a, b) {
    return a.map(r =>
      b[0].map((_, c) => r.reduce((s, _, k) => s + r[k] * b[k][c], 0))
    );
  }
  
  export function matInverse(m) {
    const n = m.length;
    const d = matDet(m);
    if (Math.abs(d) < 1e-10) return null;
    const aug = m.map((r, i) => [
      ...r,
      ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)),
    ]);
    for (let c = 0; c < n; c++) {
      let mx = c;
      for (let r = c + 1; r < n; r++)
        if (Math.abs(aug[r][c]) > Math.abs(aug[mx][c])) mx = r;
      [aug[c], aug[mx]] = [aug[mx], aug[c]];
      const piv = aug[c][c];
      for (let j = c; j < 2 * n; j++) aug[c][j] /= piv;
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = aug[r][c];
        for (let j = c; j < 2 * n; j++) aug[r][j] -= f * aug[c][j];
      }
    }
    return aug.map(r => r.slice(n));
  }
  
  export function fmtMat(m) {
    return m
      .map(r => '[ ' + r.map(v => fmtNum(v).padStart(8)).join('  ') + ' ]')
      .join('\n');
  }
  
  // Statistics
  export function statMean(d) {
    return d.reduce((a, b) => a + b, 0) / d.length;
  }
  
  export function statMedian(d) {
    const s = [...d].sort((a, b) => a - b);
    const n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  
  export function statVariance(d, pop = true) {
    const m = statMean(d);
    return d.reduce((a, x) => a + (x - m) ** 2, 0) / (pop ? d.length : d.length - 1);
  }
  
  export function nCr(n, r) {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    r = Math.min(r, n - r);
    let res = 1;
    for (let i = 0; i < r; i++) res = (res * (n - i)) / (i + 1);
    return Math.round(res);
  }
  
  export function nPr(n, r) {
    if (r < 0 || r > n) return 0;
    let res = 1;
    for (let i = n - r + 1; i <= n; i++) res *= i;
    return res;
  }