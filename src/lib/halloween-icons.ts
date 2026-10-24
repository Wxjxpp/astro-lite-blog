/**
 * Halloween easter-egg icons (hand drawn, 120×120 viewBox).
 *
 * Colours: `.hw-ink` follows the theme text colour, `.hw-cut` punches holes in
 * it using the page background, so the monochrome ones read in dark and light
 * mode. Pumpkin, zombie and witch hat bring their own colours.
 */
export interface HalloweenIcon {
  name: string;
  label: string;
  svg: string;
}

const wrap = (body: string) =>
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">${body}</svg>`;

export const HALLOWEEN_ICONS: HalloweenIcon[] = [
  {
    name: 'pumpkin',
    label: '南瓜',
    svg: wrap(`
      <path d="M58 24c0-9 4-15 12-17l3 6c-5 1-7 5-7 11z" fill="#4f8a2b"/>
      <ellipse cx="38" cy="70" rx="25" ry="35" fill="#f07a12"/>
      <ellipse cx="82" cy="70" rx="25" ry="35" fill="#f07a12"/>
      <ellipse cx="50" cy="69" rx="24" ry="38" fill="#ff8f1f"/>
      <ellipse cx="70" cy="69" rx="24" ry="38" fill="#ff8f1f"/>
      <ellipse cx="60" cy="69" rx="18" ry="40" fill="#ffa23a"/>
      <path d="M60 30v78M42 34c-8 10-11 24-11 36s4 26 12 34M78 34c8 10 11 24 11 36s-4 26-12 34" fill="none" stroke="#c85f08" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
      <path d="M38 55l11 7-13 4z M82 55l-11 7 13 4z" fill="#3a1a06"/>
      <path d="M60 68l-6 9h12z" fill="#3a1a06"/>
      <path d="M36 82c6 10 14 14 24 14s18-4 24-14l-7-2-5 7-6-8-6 8-6-8-5 7z" fill="#3a1a06"/>
    `),
  },
  {
    name: 'skull',
    label: '骷髅',
    svg: wrap(`
      <path class="hw-ink" d="M60 12C34 12 19 30 19 53c0 14 7 23 17 29v14c0 5 4 8 8 8h32c4 0 8-3 8-8V82c10-6 17-15 17-29 0-23-15-41-41-41z"/>
      <circle class="hw-cut" cx="43" cy="55" r="11"/>
      <circle class="hw-cut" cx="77" cy="55" r="11"/>
      <path class="hw-cut" d="M60 66l-7 13h14z"/>
      <path class="hw-cut" d="M47 90v14M60 90v14M73 90v14" stroke="var(--bg)" stroke-width="3.4" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    name: 'bat',
    label: '蝙蝠',
    svg: wrap(`
      <g class="hw-ink">
        <path d="M52 54C44 40 28 34 6 42c7 4 9 10 9 17 6-4 12-3 15 4 5-5 12-4 16 4 3-6 4-10 6-13z"/>
        <path d="M68 54c8-14 24-20 46-12-7 4-9 10-9 17-6-4-12-3-15 4-5-5-12-4-16 4-3-6-4-10-6-13z"/>
        <ellipse cx="60" cy="68" rx="10" ry="19"/>
        <circle cx="60" cy="46" r="12"/>
        <path d="M49 40l-3-17 13 8z M71 40l3-17-13 8z"/>
      </g>
      <circle class="hw-cut" cx="55.5" cy="46" r="2.8"/>
      <circle class="hw-cut" cx="64.5" cy="46" r="2.8"/>
      <path class="hw-cut" d="M56.5 52.5l1.8 4.5 1.7-3.6 1.7 3.6 1.8-4.5z"/>
    `),
  },
  {
    name: 'zombie',
    label: '僵尸头',
    svg: wrap(`
      <path d="M60 12c-22 0-38 15-38 38 0 12 3 20 8 27v13c0 6 5 10 11 10h38c6 0 11-4 11-10V77c5-7 8-15 8-27 0-23-16-38-38-38z" fill="#9cc96b"/>
      <path d="M22 44c2-20 16-32 38-32s36 12 38 32c-8-8-14-11-22-10-6 0-9 3-16 3s-12-3-18-3c-9-1-14 3-20 10z" fill="#4a5d34"/>
      <path d="M26 50l12 3M44 48l1 9M62 48v9" stroke="#2e3a20" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="43" cy="64" r="13" fill="#fff"/>
      <circle cx="80" cy="66" r="9" fill="#fff"/>
      <circle cx="46" cy="66" r="6" fill="#2a1a12"/>
      <circle cx="77" cy="68" r="4.6" fill="#2a1a12"/>
      <path d="M30 56c5-6 18-6 26 0M71 59c4-3 12-3 16 1" stroke="#4a5d34" stroke-width="3.4" stroke-linecap="round" fill="none"/>
      <path d="M40 88c8 5 24 5 36-2l-1 11c-10 5-24 5-34 0z" fill="#3a1a1a"/>
      <path d="M46 91v6M54 92v7M62 92v7M70 90v7" stroke="#f1ead6" stroke-width="3.4" stroke-linecap="round"/>
    `),
  },
  {
    name: 'ghost',
    label: '幽灵',
    svg: wrap(`
      <path class="hw-ink" d="M21 104V54C21 30 38 14 60 14s39 16 39 40v50l-13-10-13 10-13-10-13 10-13-10z"/>
      <ellipse class="hw-cut" cx="45" cy="52" rx="6.5" ry="10"/>
      <ellipse class="hw-cut" cx="75" cy="52" rx="6.5" ry="10"/>
      <ellipse class="hw-cut" cx="60" cy="76" rx="8" ry="10"/>
    `),
  },
  {
    name: 'spider',
    label: '蜘蛛',
    svg: wrap(`
      <path d="M60 0v38" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <g stroke="currentColor" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path id="hw-legs" d="M52 52Q34 32 14 40L9 58M50 61Q27 52 11 67L9 86M50 71Q28 70 15 89L15 106M54 82Q38 90 31 110"/>
        <use href="#hw-legs" transform="translate(120 0) scale(-1 1)"/>
      </g>
      <ellipse class="hw-ink" cx="60" cy="76" rx="21" ry="25"/>
      <circle class="hw-ink" cx="60" cy="50" r="13"/>
      <circle class="hw-cut" cx="55" cy="48" r="3.4"/>
      <circle class="hw-cut" cx="65" cy="48" r="3.4"/>
      <path d="M60 64l5 9-5 9-5-9z" fill="#e5483b"/>
    `),
  },
  {
    name: 'witch-hat',
    label: '女巫帽',
    svg: wrap(`
      <path d="M68 8c-9 7-11 28-19 54L40 94h46L77 62C74 44 74 22 68 8z" fill="#6a3fb0"/>
      <path d="M68 8c8 4 14 12 12 20-5-5-9-7-14-6z" fill="#6a3fb0"/>
      <path d="M41 82h45l3 12H38z" fill="#ffb020"/>
      <rect x="55" y="80" width="17" height="16" rx="3" fill="none" stroke="#3a1a06" stroke-width="4"/>
      <ellipse cx="63" cy="98" rx="52" ry="12" fill="#52308c"/>
      <ellipse cx="63" cy="95" rx="44" ry="8" fill="#6a3fb0"/>
      <circle cx="40" cy="38" r="2.2" fill="#ffd34d"/><circle cx="92" cy="26" r="2.6" fill="#ffd34d"/><circle cx="26" cy="64" r="2" fill="#ffd34d"/>
    `),
  },
];
