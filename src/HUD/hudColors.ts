// ============================================================================
//  Кастомные цвета сторон (Radiant/Dire) — рантайм-оверрайд через hud_config.
//  Цвета НЕ входят в подписанный бандл худа: приходят по сокету и выставляются
//  как CSS-переменные на :root. Пустое/невалидное значение → откат к дефолту.
//  Дефолтов на :root нет: в стилях у каждого var() свой фолбэк с исходным
//  оттенком, поэтому без кастомного цвета худ выглядит ровно как раньше.
// ============================================================================

export interface HudColors {
  radiant?: string | null;
  dire?: string | null;
}

type Side = "radiant" | "dire";

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Валиден ли цвет: строгий hex либо то, что браузер признаёт цветом. */
export function isValidColor(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (HEX_RE.test(v)) return true;
  try {
    return typeof CSS !== "undefined" && CSS.supports?.("color", v);
  } catch {
    return false;
  }
}

/** #rgb/#rrggbb/#rrggbbaa → [r,g,b] 0..255. null для не-hex. */
function hexToRgb(hex: string): [number, number, number] | null {
  const v = hex.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return [parseInt(v[1] + v[1], 16), parseInt(v[2] + v[2], 16), parseInt(v[3] + v[3], 16)];
  }
  if (/^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{8}$/.test(v)) {
    return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
  }
  return null;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const triplet = ([r, g, b]: [number, number, number]) => `${r}, ${g}, ${b}`;
const toHex = ([r, g, b]: [number, number, number]) =>
  "#" + [r, g, b].map((n) => clamp(n, 0, 255).toString(16).padStart(2, "0")).join("");

/** Затемнение: умножаем каналы на f (<1). Сохраняет тон лучше, чем HSL-L. */
const scaleRgb = (rgb: [number, number, number], f: number): [number, number, number] =>
  [0, 1, 2].map((i) => clamp(Math.round(rgb[i] * f), 0, 255)) as [number, number, number];

/** Осветление: тянем каждый канал к 255 на долю f. Сохраняет тон. */
const lightenRgb = (rgb: [number, number, number], f: number): [number, number, number] =>
  [0, 1, 2].map((i) => clamp(Math.round(rgb[i] + (255 - rgb[i]) * f), 0, 255)) as [number, number, number];

/** Текст поверх цвета: чёрный на светлом (жёлтый Radiant), белый на тёмном. */
const contrastFor = ([r, g, b]: [number, number, number]) =>
  0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#000" : "#fff";

function applyOne(side: Side, value: string | null | undefined) {
  const root = document.documentElement;
  const p = `--color-${side}`;
  const vars = [p, `${p}-rgb`, `${p}-light`, `${p}-light-rgb`, `${p}-dark`, `${p}-dark-rgb`, `${p}-contrast`];

  // Сброс: пусто/невалидно → снимаем все оверрайды, работают фолбэки из SCSS.
  if (value == null || value === "" || !isValidColor(value)) {
    vars.forEach((v) => root.style.removeProperty(v));
    return;
  }

  const color = value.trim();
  root.style.setProperty(p, color);

  const base = hexToRgb(color);
  if (!base) {
    // Не-hex (rgb()/named) — ставим только базу, оттенки оставляем дефолтными.
    vars.slice(1).forEach((v) => root.style.removeProperty(v));
    return;
  }
  const light = lightenRgb(base, 0.34);
  const dark = scaleRgb(base, 0.62);
  root.style.setProperty(`${p}-rgb`, triplet(base));
  root.style.setProperty(`${p}-light`, toHex(light));
  root.style.setProperty(`${p}-light-rgb`, triplet(light));
  root.style.setProperty(`${p}-dark`, toHex(dark));
  root.style.setProperty(`${p}-dark-rgb`, triplet(dark));
  root.style.setProperty(`${p}-contrast`, contrastFor(base));
}

/**
 * Применяет цвета из hud_config. Сервер шлёт и CS-цвета (ct/t) — их игнорируем.
 * Частичный объект допустим: сторона без ключа не трогается.
 */
export function applyHudColors(colors: HudColors | null | undefined) {
  if (!colors || typeof colors !== "object") return;
  if ("radiant" in colors) applyOne("radiant", colors.radiant);
  if ("dire" in colors) applyOne("dire", colors.dire);
}
