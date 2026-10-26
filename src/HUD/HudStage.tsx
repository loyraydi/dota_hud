import React, { useEffect, useState } from 'react';

/** Базовая высота сцены: вся вёрстка худа — в «пикселях 1080p», как у Panorama доты. */
const BASE_H = 1080;
/** Ширина, под которую нарисован худ (16:9). */
const BASE_W = 1920;
/**
 * Минимальная ширина сцены. Ниже (портретные/почти квадратные экраны) сцена
 * масштабируется уже по ширине, иначе центральные блоки налезут друг на друга.
 * 5:4 (1280×1024 → 1350) и 4:3 (→1440) ещё масштабируются по высоте, как дота.
 */
const MIN_W = 1280;
/** Внутренний край боковых плашек топбара (название команды) от центра экрана. */
const TOP_SIDE_INNER = 409;
/** Ширина группы «название команды + ульты» у каждого края топбара (при 1920 — от 67 до 551). */
const TOP_SIDE_SPAN = 484;
const TOP_SIDE_MARGIN = 8;

interface StageGeometry {
    scale: number;
    width: number;
    height: number;
}

/** CSS zoom на <html> — им клиент задаёт «Масштаб» оверлея. innerWidth/innerHeight он не меняет. */
const rootZoom = (): number => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

const measure = (): StageGeometry => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Окно ещё не получило размер (OBS/скрытый iframe) — рисуем как 1920×1080
    if (!vw || !vh) return { scale: 1, width: BASE_W, height: BASE_H };
    let scale = vh / BASE_H;
    if (vw / scale < MIN_W) scale = vw / MIN_W;
    // Сцена делится на zoom, чтобы занять весь экран: «Масштаб 80%» уменьшает элементы,
    // а они остаются у своих краёв. Без этого вся сцена сжималась в левый верхний угол.
    const z = rootZoom();
    return { scale, width: vw / (scale * z), height: vh / (scale * z) };
};

/**
 * Сцена худа. Масштаб — по ВЫСОТЕ (1080 = 1.0), как у нативного Panorama-худа доты:
 * высота сцены всегда 1080 «худ-пикселей», ширина = ширина экрана / масштаб
 * (1920 на 16:9, 1728 на 16:10, ~2560 на 21:9, 1350 на 5:4). Элементы привязаны к краям
 * или к центру сцены (left/right/bottom, left: 50%), поэтому совпадают с нативным
 * худом на любом разрешении и в OBS, и в оверлей-окне клиента. На 16:9 всё как раньше.
 *
 * CSS-переменные для привязки (все — в худ-пикселях, на 1920×1080 нейтральны):
 *  --stage-w    ширина сцены
 *  --wide-x     отступ центрированного 1920-блока на широких экранах (0 на ≤16:9)
 *  --narrow-k   ≤1: сжатие 1920-блока на узких экранах (16:10, 4:3)
 *  --side-k     ≤1: сжатие боковых групп топбара, чтобы не уходили за край экрана
 *
 * Благодаря transform на сцене все `position: fixed` потомки отсчитываются от неё.
 */
const HudStage = ({ children }: { children: React.ReactNode }) => {
    const [g, setG] = useState<StageGeometry>(measure);

    useEffect(() => {
        const onResize = () => setG(prev => {
            const next = measure();
            return next.scale === prev.scale && next.width === prev.width ? prev : next;
        });
        onResize();
        window.addEventListener('resize', onResize);
        // Масштаб оверлея клиент ставит после загрузки (style.zoom на <html>) — resize при этом нет
        const zoomWatch = new MutationObserver(onResize);
        zoomWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
        return () => {
            window.removeEventListener('resize', onResize);
            zoomWatch.disconnect();
        };
    }, []);

    const { scale, width, height } = g;
    const sideK = Math.max(0.5, Math.min(1, (width / 2 - TOP_SIDE_INNER - TOP_SIDE_MARGIN) / TOP_SIDE_SPAN));

    return (
        <div
            className="hud_stage"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: `${width}px`,
                height: `${height}px`,
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
                ['--stage-w' as any]: `${width}px`,
                ['--wide-x' as any]: `${Math.max(0, (width - BASE_W) / 2)}px`,
                ['--narrow-k' as any]: Math.min(1, width / BASE_W),
                ['--side-k' as any]: sideK,
            }}
        >
            {children}
        </div>
    );
};

export default HudStage;
