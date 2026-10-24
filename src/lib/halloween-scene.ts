/**
 * Halloween night scene — triggered by the orb easter egg.
 * Dims the page, grows cobwebs in the corners, lowers spiders from the top edge
 * and sets candy + pumpkins in the footer (pumpkin faces tilt to the upper-left,
 * as if photographed from above). Nothing persists: a hard reload clears it.
 */
const SPIDER = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g stroke="currentColor" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path id="hw-sl" d="M52 52Q34 32 14 40L9 58M50 61Q27 52 11 67L9 86M50 71Q28 70 15 89L15 106M54 82Q38 90 31 110"/>
    <use href="#hw-sl" transform="translate(120 0) scale(-1 1)"/>
  </g>
  <ellipse cx="60" cy="76" rx="21" ry="25" fill="currentColor"/>
  <circle cx="60" cy="50" r="13" fill="currentColor"/>
  <circle cx="55" cy="48" r="3.2" fill="#ff5a3c"/><circle cx="65" cy="48" r="3.2" fill="#ff5a3c"/>
</svg>`;

/** Pumpkin seen from above: body offset to the lower-right, face pushed to the upper-left. */
const PUMPKIN = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="66" cy="76" rx="46" ry="34" fill="#d86a0c"/>
  <ellipse cx="52" cy="72" rx="26" ry="32" fill="#f07a12"/>
  <ellipse cx="72" cy="72" rx="26" ry="32" fill="#f07a12"/>
  <ellipse cx="62" cy="70" rx="20" ry="34" fill="#ff8f1f"/>
  <ellipse cx="50" cy="52" rx="30" ry="16" fill="#ffa23a" transform="rotate(-16 50 52)"/>
  <path d="M42 30c-1-9 3-15 11-17l3 6c-5 1-7 5-7 11z" fill="#4f8a2b" transform="rotate(-14 48 24)"/>
  <g transform="rotate(-20 48 56) skewX(-8)" fill="#2e1204">
    <path d="M26 48l12 6-14 5z"/><path d="M52 44l12 4-10 7z"/>
    <path d="M44 60l-5 8h10z"/>
    <path d="M22 66c6 11 15 15 26 14s17-6 20-13l-8-2-4 6-5-7-6 7-5-6-5 6z"/>
  </g>
</svg>`;

const CANDY = `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M2 6l14 8v12L2 34z" fill="#ff5fa2"/><path d="M62 6L48 14v12l14 8z" fill="#ff5fa2"/>
  <rect x="14" y="8" width="36" height="24" rx="12" fill="#ffd23f"/>
  <path d="M24 8l-6 24M34 8l-6 24M44 8l-6 24" stroke="#ff7a1a" stroke-width="4" stroke-linecap="round"/>
</svg>`;
const LOLLI = `<svg viewBox="0 0 48 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="22" y="30" width="4" height="40" rx="2" fill="#e8e2d0"/>
  <circle cx="24" cy="22" r="19" fill="#8a4fff"/><circle cx="24" cy="22" r="13" fill="none" stroke="#ffd23f" stroke-width="4"/>
  <circle cx="24" cy="22" r="6" fill="none" stroke="#ff5fa2" stroke-width="4"/>
</svg>`;
const CORN = `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 3L36 44H4z" fill="#fff4d6"/><path d="M20 3L28 24H12z" fill="#ffd23f" transform="translate(0 0)"/>
  <path d="M12 24h16l8 20H4z" fill="#ff8f1f" opacity=".92"/><path d="M20 3l8 21H12z" fill="#ffd23f"/>
</svg>`;

/** Cobweb for the top-left corner (mirrored via CSS for the others). */
const web = () => {
  const R = 190;
  const spokes = [0, 18, 36, 54, 72, 90].map(a => {
    const r = (a * Math.PI) / 180;
    return `M0 0L${(Math.cos(r) * R).toFixed(1)} ${(Math.sin(r) * R).toFixed(1)}`;
  });
  const rings = [38, 74, 112, 150, 186].map(rad => {
    const pts = [0, 18, 36, 54, 72, 90].map(a => {
      const r = (a * Math.PI) / 180;
      return [Math.cos(r) * rad, Math.sin(r) * rad];
    });
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2 * 0.86, my = (y0 + y1) / 2 * 0.86; // sag toward the corner
      d += `Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  });
  const paths = [...spokes, ...rings]
    .map((d, i) => `<path d="${d}" pathLength="1" style="--i:${i}"/>`)
    .join('');
  return `<svg viewBox="-4 -4 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">${paths}</g></svg>`;
};

const SPIDERS = [
  { x: '9%', drop: '24vh', size: 54, delay: 0.3, dur: 2.6 },
  { x: '47%', drop: '15vh', size: 44, delay: 1.1, dur: 2.2 },
  { x: '86%', drop: '31vh', size: 62, delay: 0.7, dur: 3.0 },
];

const PROPS: Array<[string, string, number, number, number]> = [
  // [markup, left %, size px, rotation deg, bottom offset px]
  [PUMPKIN, 5, 84, 0, 6],
  [CANDY, 20, 44, -18, 10],
  [LOLLI, 29, 40, 14, 8],
  [PUMPKIN, 44, 64, 0, 4],
  [CORN, 58, 30, 18, 12],
  [CANDY, 67, 40, 12, 8],
  [PUMPKIN, 80, 92, 0, 6],
  [LOLLI, 92, 38, -12, 10],
];

let active = false;

const mount = () => {
  if (!active || document.getElementById('hwScene')) return;
  const root = document.createElement('div');
  root.id = 'hwScene';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="hw-dim"></div>
    ${['tl', 'tr', 'bl', 'br'].map(c => `<div class="hw-web hw-web-${c}">${web()}</div>`).join('')}
    ${SPIDERS.map(s => `<div class="hw-spider" style="--x:${s.x};--drop:${s.drop};--size:${s.size}px;--delay:${s.delay}s;--dur:${s.dur}s"><i class="hw-thread"></i><span>${SPIDER}</span></div>`).join('')}`;
  document.body.appendChild(root);

  const footer = document.querySelector<HTMLElement>('.site-footer');
  if (footer && !footer.querySelector('.hw-props')) {
    const props = document.createElement('div');
    props.className = 'hw-props';
    props.innerHTML = PROPS.map(
      ([svg, left, size, rot, bottom], i) =>
        `<span class="hw-prop ${svg === PUMPKIN ? 'is-pumpkin' : ''}" style="--l:${left}%;--s:${size}px;--r:${rot}deg;--b:${bottom}px;--d:${(i * 0.12).toFixed(2)}s">${svg}</span>`,
    ).join('');
    footer.appendChild(props);
  }
};

export function startHalloweenNight() {
  if (active) return;
  active = true;
  document.documentElement.classList.add('hw-night');
  mount();
}

// A client-side navigation swaps <body>; rebuild the scene on the new page.
document.addEventListener('astro:page-load', mount);
document.addEventListener('astro:after-swap', () => {
  if (active) document.documentElement.classList.add('hw-night');
});
