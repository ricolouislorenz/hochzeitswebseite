import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

// ─── Logical canvas (scaled up via CSS image-rendering: pixelated) ────────────
const LW = 480;
const LH = 155;
const GY = 120; // ground surface y

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  sky0: '#060c18', sky1: '#0f1a30', sky2: '#162444', skyH: '#1e3050',
  moon: '#fff0b0', moonS: '#c8c060',
  star: '#e0d888',
  ground: '#18100a', grass1: '#3a6028', grass2: '#4a7832', grassT: '#5a9040',
  skin: '#f0a060', skinD: '#c07030', hair: '#2c1008',
  white: '#ffffff', cream: '#f8ecd8', creamD: '#c8a880', veil: '#eee8ff',
  gold: '#c09028', goldL: '#deb840', red: '#c01028',
  cakeW: '#fff4f8', cakePk: '#f0b8c8', cakePkD: '#b07888',
  flPk: '#e83870', flPkL: '#f878a8', flYl: '#f8d030',
  flGr: '#388028', flGrD: '#205018',
  glss: '#b8d8f0', glssD: '#6888a8', chpL: '#ddc848', chpD: '#907818', bbl: '#e0f0ff',
  uiGold: '#c8a030', uiDim: '#806820', uiPk: '#e8a0b0',
};

type ObsType = 'cake' | 'flower' | 'champ';
interface Obs { x: number; y: number; w: number; h: number; type: ObsType; }

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function f(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x | 0, y | 0, w, h);
}

// ─── Sprites ──────────────────────────────────────────────────────────────────
function drawBride(ctx: CanvasRenderingContext2D, px: number, py: number, frame: number, inAir: boolean) {
  const fr = inAir ? 2 : frame % 2;

  // Veil streamer (left)
  f(ctx, px,   py+1,  2, 14, C.veil);
  f(ctx, px,   py+10, 1,  6, C.creamD);

  // Hair
  f(ctx, px+3, py,    7,  3, C.hair);
  f(ctx, px+2, py+1,  8,  2, C.hair);

  // Head
  f(ctx, px+3, py+2,  7,  7, C.skin);
  f(ctx, px+4, py+4,  1,  2, C.hair);   // left eye
  f(ctx, px+7, py+4,  1,  2, C.hair);   // right eye
  f(ctx, px+4, py+5,  1,  1, C.skinD);  // left cheek blush
  f(ctx, px+7, py+5,  1,  1, C.skinD);  // right cheek blush
  f(ctx, px+5, py+7,  3,  1, C.skinD);  // mouth

  // Neck
  f(ctx, px+5, py+9,  3,  2, C.skin);

  // Dress body (torso)
  f(ctx, px+2, py+11, 9,  6, C.white);
  f(ctx, px+3, py+11, 7,  1, C.goldL);  // gold neckline
  // Heart detail
  f(ctx, px+4, py+13, 2,  1, C.red);
  f(ctx, px+6, py+13, 2,  1, C.red);
  f(ctx, px+4, py+14, 4,  1, C.red);
  f(ctx, px+5, py+15, 2,  1, C.red);
  // Gold belt
  f(ctx, px+2, py+17, 9,  1, C.gold);

  // Skirt (A-line)
  f(ctx, px+1, py+18, 11, 3, C.white);
  f(ctx, px+0, py+21, 13, 3, C.white);
  f(ctx, px+1, py+18, 2,  1, C.cream);  // highlight

  // Legs
  if (fr === 2) {
    f(ctx, px+2, py+24, 3, 2, C.skin);
    f(ctx, px+8, py+24, 3, 2, C.skin);
  } else if (fr === 0) {
    f(ctx, px+2, py+24, 3, 4, C.skin);
    f(ctx, px+8, py+24, 3, 3, C.skin);
    f(ctx, px+1, py+28, 4, 1, C.cream);
  } else {
    f(ctx, px+2, py+24, 3, 3, C.skin);
    f(ctx, px+8, py+24, 3, 4, C.skin);
    f(ctx, px+8, py+28, 4, 1, C.cream);
  }
}

function drawCake(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const b = y + h;
  // Bottom tier
  f(ctx, x,      b-9,  w,    9, C.cakeW);
  f(ctx, x,      b-10, w,    1, C.cakePk);
  f(ctx, x+w-2,  b-9,  2,    9, C.cakePkD);
  f(ctx, x+1,    b-9,  2,    3, C.cakePk);
  f(ctx, x+6,    b-9,  2,    3, C.cakePk);
  f(ctx, x+11,   b-9,  2,    3, C.cakePk);
  // Middle tier
  f(ctx, x+2,    b-17, w-4,  7, C.cakeW);
  f(ctx, x+2,    b-18, w-4,  1, C.cakePk);
  f(ctx, x+w-4,  b-17, 2,    7, C.cakePkD);
  f(ctx, x+3,    b-17, 2,    3, C.cakePk);
  f(ctx, x+8,    b-17, 2,    3, C.cakePk);
  // Top tier
  f(ctx, x+4,    b-24, w-8,  6, C.cakeW);
  f(ctx, x+4,    b-25, w-8,  1, C.cakePk);
  f(ctx, x+w-6,  b-24, 2,    6, C.cakePkD);
  // Heart topper
  const cx = (x + w / 2) | 0;
  f(ctx, cx-1,   b-28, 1,    1, C.red);
  f(ctx, cx+1,   b-28, 1,    1, C.red);
  f(ctx, cx-1,   b-27, 3,    1, C.red);
  f(ctx, cx,     b-26, 1,    1, C.red);
}

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = (x + w / 2) | 0;
  // Stem
  f(ctx, cx-1,  y+10, 2, h-10, C.flGr);
  f(ctx, cx-1,  y+10, 1, h-10, C.flGrD);
  // Leaves
  f(ctx, cx-5,  y+14, 5,  2,   C.flGr);
  f(ctx, cx+1,  y+20, 5,  2,   C.flGr);
  // Petals
  f(ctx, cx-2,  y,    5,  4,   C.flPk);
  f(ctx, cx+4,  y+3,  4,  5,   C.flPk);
  f(ctx, cx-7,  y+3,  4,  5,   C.flPk);
  f(ctx, cx-2,  y+8,  5,  3,   C.flPk);
  f(ctx, cx-1,  y,    2,  1,   C.flPkL);
  f(ctx, cx+4,  y+3,  1,  2,   C.flPkL);
  f(ctx, cx-6,  y+3,  1,  2,   C.flPkL);
  // Center
  f(ctx, cx-2,  y+3,  5,  5,   C.flYl);
  f(ctx, cx-1,  y+4,  3,  3,   C.chpD);
  f(ctx, cx,    y+5,  1,  1,   C.flYl);
}

function drawChamp(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = (x + w / 2) | 0;
  const b  = y + h;
  // Base
  f(ctx, cx-4, b-2,  8, 2, C.chpL);
  f(ctx, cx-3, b-4,  6, 2, C.chpD);
  // Stem
  f(ctx, cx-1, b-14, 2, 10, C.chpD);
  // Flute walls
  f(ctx, cx-4, y,    1, 13, C.glssD);
  f(ctx, cx+3, y,    1, 13, C.glssD);
  // Rim
  f(ctx, cx-3, y,    6,  2, C.glss);
  // Body
  f(ctx, cx-3, y+2,  6, 10, C.glss);
  // Taper
  f(ctx, cx-2, y+10, 4,  2, C.glss);
  f(ctx, cx-1, y+12, 2,  2, C.glssD);
  // Liquid fill
  f(ctx, cx-2, y+3,  5,  8, C.chpL);
  f(ctx, cx-1, y+4,  3,  6, C.chpD);
  // Bubbles
  f(ctx, cx-1, y+5,  1,  1, C.bbl);
  f(ctx, cx+1, y+8,  1,  1, C.bbl);
  f(ctx, cx,   y+3,  1,  1, C.bbl);
}

// ─── Scene ────────────────────────────────────────────────────────────────────
const STARS: [number, number][] = [
  [15,6],[40,14],[70,4],[100,10],[135,17],[165,5],[200,12],[230,8],
  [260,16],[290,5],[320,11],[355,4],[390,15],[425,8],[460,3],
  [25,22],[65,28],[110,24],[155,20],[205,27],[255,23],[305,19],[350,26],[420,22],[455,18],
  [80,32],[145,35],[210,30],[310,33],[390,28],[445,35],
];

function drawBG(ctx: CanvasRenderingContext2D, scroll: number, frame: number) {
  f(ctx, 0, 0,   LW, 35,     C.sky0);
  f(ctx, 0, 35,  LW, 35,     C.sky1);
  f(ctx, 0, 70,  LW, 30,     C.sky2);
  f(ctx, 0, 100, LW, GY-100, C.skyH);
  // Moon
  f(ctx, LW-44, 6, 16, 16, C.moon);
  f(ctx, LW-40, 11, 7,  5, C.moonS);
  f(ctx, LW-39, 13, 3,  2, C.moon);
  // Stars
  for (const [sx, sy] of STARS) {
    const ex = ((sx - (scroll * 0.25) | 0) % LW + LW) % LW | 0;
    const tw = (frame + sx * 7) % 60;
    ctx.fillStyle = tw < 6 ? C.moon : C.star;
    ctx.fillRect(ex, sy | 0, 1, 1);
  }
}

function drawGround(ctx: CanvasRenderingContext2D, scroll: number) {
  f(ctx, 0, GY,   LW, LH - GY, C.ground);
  f(ctx, 0, GY,   LW, 4,       C.grass2);
  f(ctx, 0, GY,   LW, 1,       C.grassT);
  f(ctx, 0, GY+4, LW, 1,       C.grass1);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, GY + 5, LW, 1);
  // Scrolling grass tufts
  for (let i = 0; i < LW + 8; i += 8) {
    const gx = ((i - (scroll | 0) % 8) + LW) % LW | 0;
    f(ctx, gx, GY - 2, 1, 3, C.grassT);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WeddingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate  = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = LW;
    canvas.height = LH;
    ctx.imageSmoothingEnabled = false;

    type State = 'start' | 'play' | 'dead';
    let animId: number;
    let frame  = 0;
    let state: State = 'start';
    let score  = 0;
    let hi     = parseInt(localStorage.getItem('wg-hi') || '0');
    let speed  = 2.8;
    let scroll = 0;
    let flash  = 0;
    let obstacles: Obs[] = [];
    let spawnIn = 90;

    const PLAYER_W = 13, PLAYER_H = 29;
    const p = { x: 36, y: GY - PLAYER_H, w: PLAYER_W, h: PLAYER_H, vy: 0, grounded: true };

    function jump() {
      if (state === 'start') { state = 'play'; return; }
      if (state === 'dead')  { restart(); return; }
      if (p.grounded) { p.vy = -5.0; p.grounded = false; }
    }

    function restart() {
      score = 0; speed = 2.8; scroll = 0; flash = 0;
      obstacles = []; spawnIn = 90;
      p.y = GY - p.h; p.vy = 0; p.grounded = true;
      state = 'play';
    }

    function update() {
      if (state !== 'play') return;
      score  += 0.09;
      scroll += speed;
      speed   = Math.min(2.8 + score * 0.009, 7.5);

      // Gravity
      if (!p.grounded) {
        p.vy += 0.33;
        p.y  += p.vy;
        if (p.y >= GY - p.h) { p.y = GY - p.h; p.vy = 0; p.grounded = true; }
      }

      // Spawn obstacles
      if (--spawnIn <= 0) {
        const types: ObsType[] = ['cake', 'flower', 'champ'];
        const t  = types[Math.floor(Math.random() * 3)];
        const dims: Record<ObsType, [number, number]> = { cake: [16, 30], flower: [14, 28], champ: [12, 26] };
        const [w, h] = dims[t];
        obstacles.push({ x: LW + 2, y: GY - h, w, h, type: t });
        spawnIn = (55 + Math.random() * 55 - Math.min(score * 0.02, 22)) | 0;
      }

      // Move + collide
      obstacles = obstacles.filter(o => o.x + o.w > -4);
      for (const o of obstacles) {
        o.x -= speed;
        if (
          p.x + 3   < o.x + o.w &&
          p.x + p.w - 3 > o.x   &&
          p.y + 3   < o.y + o.h &&
          p.y + p.h > o.y + 3
        ) {
          state = 'dead';
          flash = 16;
          if (score > hi) { hi = Math.floor(score); localStorage.setItem('wg-hi', String(hi)); }
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, LW, LH);
      drawBG(ctx, scroll, frame);
      drawGround(ctx, scroll);

      for (const o of obstacles) {
        if (o.type === 'cake')   drawCake(ctx,  o.x, o.y, o.w, o.h);
        if (o.type === 'flower') drawFlower(ctx, o.x, o.y, o.w, o.h);
        if (o.type === 'champ')  drawChamp(ctx,  o.x, o.y, o.w, o.h);
      }

      if (flash > 0) {
        flash--;
        if (flash % 3 !== 0) drawBride(ctx, p.x, p.y, Math.floor(frame / 8), !p.grounded);
      } else {
        drawBride(ctx, p.x, p.y, Math.floor(frame / 8), !p.grounded);
      }

      // HUD — score panel top-right
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(LW - 82, 4, 78, 14);
      ctx.fillStyle = C.uiGold;
      ctx.font = 'bold 9px "Courier New",monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.floor(score).toString().padStart(5, '0'), LW - 7, 15);
      if (hi > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(LW - 82, 19, 78, 12);
        ctx.fillStyle = C.uiDim;
        ctx.font = '8px "Courier New",monospace';
        ctx.fillText('HI ' + hi.toString().padStart(4, '0'), LW - 7, 29);
      }
      ctx.textAlign = 'left';

      // Start overlay
      if (state === 'start') {
        ctx.fillStyle = 'rgba(6,12,24,0.90)';
        ctx.fillRect(0, 0, LW, LH);
        ctx.textAlign = 'center';

        ctx.fillStyle = C.uiGold;
        ctx.font = 'bold 15px "Courier New",monospace';
        ctx.fillText('♥ HOCHZEITS-RUNNER ♥', LW / 2, 38);

        ctx.fillStyle = C.uiPk;
        ctx.font = '7px "Courier New",monospace';
        ctx.fillText('"Die Ehe: mehr Hindernisse als gedacht!"', LW / 2, 52);

        // Controls hint
        ctx.fillStyle = C.uiDim;
        ctx.font = '7px "Courier New",monospace';
        ctx.fillText('SPACE  /  ↑  /  TIPPEN', LW / 2, 76);

        if (Math.floor(frame / 28) % 2 === 0) {
          ctx.fillStyle = C.white;
          ctx.font = 'bold 9px "Courier New",monospace';
          ctx.fillText('[ START ]', LW / 2, 96);
        }
        ctx.textAlign = 'left';
      }

      // Game-over overlay
      if (state === 'dead') {
        ctx.fillStyle = 'rgba(6,12,24,0.87)';
        ctx.fillRect(0, 0, LW, LH);
        ctx.textAlign = 'center';

        ctx.fillStyle = C.uiPk;
        ctx.font = 'bold 13px "Courier New",monospace';
        ctx.fillText('GAME OVER', LW / 2, 38);

        ctx.fillStyle = C.uiGold;
        ctx.font = '9px "Courier New",monospace';
        ctx.fillText('SCORE  ' + Math.floor(score).toString().padStart(5, '0'), LW / 2, 56);
        ctx.fillText('BEST   ' + hi.toString().padStart(5, '0'), LW / 2, 70);

        if (Math.floor(frame / 25) % 2 === 0) {
          ctx.fillStyle = C.white;
          ctx.font = 'bold 8px "Courier New",monospace';
          ctx.fillText('[ SPACE / TAP ] NEU STARTEN', LW / 2, 100);
        }
        ctx.textAlign = 'left';
      }
    }

    function tick() {
      frame++;
      update();
      render();
      animId = requestAnimationFrame(tick);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    const onTouch = (e: TouchEvent) => { e.preventDefault(); jump(); };

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('click', jump);
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('click', jump);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060c18] flex flex-col items-center justify-center p-4 gap-4">
      <div className="text-center">
        <h1 className="text-lg font-serif text-[#c8a030] tracking-[0.2em] uppercase">
          ♥ Hochzeits-Runner ♥
        </h1>
        <p className="text-[#806820] text-[11px] mt-0.5 font-mono">Easter Egg gefunden! 🎉</p>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full max-w-[800px] rounded border border-[#c8a030]/25"
        style={{ imageRendering: 'pixelated', cursor: 'pointer', touchAction: 'none' }}
      />

      <p className="text-[#706018] text-[10px] font-mono text-center">
        SPACE · ↑ · TIPPEN — Ausweichen: Hochzeitstorten, Blumen & Champagner
      </p>

      <button
        onClick={() => navigate('/')}
        className="text-[#706018] hover:text-[#c8a030] text-xs font-mono underline transition-colors"
      >
        ← Zurück zur Anmeldung
      </button>
    </div>
  );
}
