export const SCENE_WIDTH = 384;
export const SCENE_HEIGHT = 176;

// Low-resolution game scenery. Every mark is a solid, integer-aligned pixel.
export function drawRevolverScene(ctx, { round, animation = '', cylinderAngle = -round.attempts * Math.PI / 3, reducedMotion = false }) {
  const p = {
    sky: '#17261f', horizon: '#21392b', grass: '#425d3c', grassLight: '#718154',
    earth: '#6e6040', earthDark: '#4a4630', ink: '#101d16', cream: '#e5ead6',
    sage: '#b5c79d', sageDark: '#637a54', gold: '#e2bd6c', red: '#cf6550',
    redDark: '#883e35', bark: '#75543a', barkLight: '#a47d50', leaf: '#3e643d',
    leafLight: '#68814b', skin: '#e7bf91', coat: '#8ba39a', coatDark: '#526e65',
  };
  const rect = (x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  };
  const disk = (cx, cy, radius, color) => {
    for (let y = -radius; y <= radius; y++) {
      const half = Math.floor(Math.sqrt(radius * radius - y * y));
      rect(cx - half, cy + y, 2 * half + 1, 1, color);
    }
  };
  const star = (x, y, color, size = 2) => {
    rect(x, y - size, 1, size * 2 + 1, color);
    rect(x - size, y, size * 2 + 1, 1, color);
  };
  const hit = round.attempts > 0 && round.attempts === round.hitAt;
  const firing = animation === 'fire' && !reducedMotion;
  const kick = firing ? -1 : 0;

  ctx.imageSmoothingEnabled = false;
  rect(0, 0, SCENE_WIDTH, SCENE_HEIGHT, p.sky);

  // The upper-left sky stays quiet for the HTML theory copy.
  rect(0, 143, 42, 9, p.horizon); rect(25, 137, 55, 15, p.horizon);
  rect(143, 139, 61, 13, p.horizon); rect(177, 133, 71, 19, p.horizon);
  rect(220, 141, 56, 11, p.horizon); rect(328, 135, 56, 17, p.horizon);
  rect(0, 153, 384, 4, p.grass);
  rect(0, 157, 384, 19, p.earthDark);
  rect(0, 157, 384, 3, p.earth);
  for (const [x, y, width] of [[12,166,8],[46,162,4],[130,169,7],[171,164,3],[210,171,9],[259,164,5],[337,168,6],[365,162,3]]) {
    rect(x, y, width, 2, p.earth);
  }
  for (const x of [19, 44, 126, 160, 237, 326, 359]) {
    rect(x, 149, 2, 5, p.grassLight); rect(x + 3, 151, 2, 3, p.grassLight);
  }

  // Apple tree, with a clear silhouette rather than a detailed background.
  rect(299, 108, 12, 45, p.bark);
  rect(299, 114, 4, 39, p.barkLight);
  rect(291, 151, 28, 3, p.bark);
  rect(287, 105, 16, 5, p.bark); rect(282, 98, 6, 12, p.bark);
  rect(307, 97, 18, 5, p.bark); rect(320, 88, 5, 12, p.bark);
  rect(267, 67, 53, 14, p.leaf);
  rect(255, 79, 79, 19, p.leaf);
  rect(263, 96, 64, 15, p.leaf);
  rect(278, 60, 27, 10, p.leaf);
  rect(252, 86, 5, 13, p.leaf);
  rect(330, 81, 8, 19, p.leaf);
  rect(275, 68, 18, 5, p.leafLight);
  rect(262, 81, 12, 4, p.leafLight);
  rect(304, 78, 19, 5, p.leafLight);
  rect(312, 99, 10, 4, p.leafLight);
  rect(277, 91, 16, 4, '#4d7143');
  rect(317, 88, 4, 4, p.redDark);
  rect(295, 77, 4, 4, p.redDark);

  // Newton's white curls, a cowboy hat, and a very small revolver.
  rect(74 + kick, 86, 17, 8, p.barkLight);
  rect(72 + kick, 91, 21, 5, p.barkLight);
  rect(67 + kick, 95, 33, 4, p.gold);
  rect(76 + kick, 92, 16, 3, p.bark);
  rect(76 + kick, 99, 8, 13, p.cream);
  rect(73 + kick, 101, 5, 5, p.cream);
  rect(73 + kick, 108, 7, 6, p.cream);
  rect(77 + kick, 113, 6, 4, p.cream);
  rect(80 + kick, 100, 14, 11, p.skin);
  rect(92 + kick, 105, 5, 4, p.skin);
  rect(91 + kick, 102, 2, 2, p.ink);
  rect(84 + kick, 110, 6, 5, p.skin);
  rect(79 + kick, 113, 16, 20, p.coat);
  rect(77 + kick, 119, 5, 17, p.coatDark);
  rect(81 + kick, 113, 10, 4, p.red);
  rect(88 + kick, 117, 3, 5, p.red);
  rect(84 + kick, 122, 2, 2, p.cream);
  rect(84 + kick, 128, 2, 2, p.cream);
  rect(91 + kick, 116, 13, 6, p.coat);
  rect(102 + kick, 117, 7, 5, p.skin);
  rect(108 + kick, 115, 13, 4, p.sage);
  rect(109 + kick, 114, 4, 2, p.cream);
  rect(109 + kick, 119, 4, 5, p.bark);
  rect(80 + kick, 133, 15, 4, p.bark);
  rect(86 + kick, 133, 3, 3, p.gold);
  rect(81 + kick, 137, 5, 12, p.coatDark);
  rect(90 + kick, 137, 5, 12, p.coatDark);
  rect(79 + kick, 148, 8, 5, p.bark);
  rect(90 + kick, 148, 10, 5, p.bark);

  // The target apple hangs below the leaves, separate from the other fruit.
  const appleX = hit ? 281 : 277;
  const appleY = hit ? 141 : 113;
  if (!hit) rect(281, 105, 2, 7, p.barkLight);
  rect(appleX + 3, appleY - 3, 2, 4, p.bark);
  rect(appleX + 5, appleY - 2, 4, 2, p.leafLight);
  rect(appleX, appleY, 4, 3, p.red);
  rect(appleX + 5, appleY, 4, 3, p.red);
  rect(appleX - 1, appleY + 2, 11, 6, p.red);
  rect(appleX + 1, appleY + 8, 7, 2, p.redDark);
  rect(appleX + 1, appleY + 2, 2, 3, '#f29b6e');

  if (firing) {
    star(126, 117, p.gold, 4);
    for (const [x, y] of [[147,117],[177,116],[207,116],[237,115],[264,115]]) rect(x, y, 7, 1, p.gold);
  }
  if (hit) {
    star(270, 135, p.gold, 3);
    star(296, 129, p.cream, 2);
    star(302, 145, p.gold, 2);
  }

  // A tiny cylinder HUD: unspent chambers never expose the random outcome.
  const cx = 352, cy = 29;
  disk(cx, cy, 20, p.ink);
  disk(cx, cy, 18, p.sage);
  disk(cx, cy, 16, p.sageDark);
  for (let chamber = 0; chamber < 6; chamber++) {
    const angle = cylinderAngle - Math.PI / 2 + chamber * Math.PI / 3;
    const dx = Math.cos(angle) * 10;
    const dy = Math.sin(angle) * 10;
    const taken = chamber < round.attempts;
    const success = hit && chamber + 1 === round.attempts;
    disk(cx + dx, cy + dy, 4, success ? p.gold : taken ? '#a7b58f' : p.ink);
  }
  // A fixed index and moving rim marker make even six identical holes visibly turn.
  rect(cx - 2, cy - 24, 5, 2, p.cream);
  rect(cx - 1, cy - 22, 3, 2, p.cream);
  const markerAngle = cylinderAngle - Math.PI / 3;
  rect(cx + Math.cos(markerAngle) * 17 - 1, cy + Math.sin(markerAngle) * 17 - 1, 3, 3, p.cream);
  rect(cx - 1, cy - 1, 3, 3, p.cream);
}
