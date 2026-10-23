import React from 'react';

/**
 * Держит панель в DOM только пока она видна (+ время на fade-out).
 *
 * Раньше скрытые панели (драфт с 24 видео героев, скорборд, сравнение, 7 стат-панелей)
 * оставались смонтированными с opacity: 0 весь матч: видео продолжали декодироваться,
 * бары анимировали height на каждый тик GSI — оверлей рисовал кадры без остановки
 * и отъедал FPS у игры. opacity: 0 в Chromium ничего не останавливает.
 *
 * children — функция от visible: при показе монтируем со visible=false и на следующем
 * кадре включаем, чтобы CSS-переход opacity отыграл; при скрытии — visible=false и
 * размонтирование через hideMs.
 */
export default function Presence({ show, hideMs = 1000, children }: {
    show: boolean;
    hideMs?: number;
    children: (visible: boolean) => React.ReactNode;
}) {
    const [mounted, setMounted] = React.useState(show);
    const [visible, setVisible] = React.useState(show);

    React.useEffect(() => {
        if (show) {
            setMounted(true);
            // Двойной rAF: первый кадр рисуется со скрытым классом, иначе fade-in не сработает
            let raf2 = 0;
            const raf1 = requestAnimationFrame(() => {
                raf2 = requestAnimationFrame(() => setVisible(true));
            });
            return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
        }
        setVisible(false);
        const t = setTimeout(() => setMounted(false), hideMs);
        return () => clearTimeout(t);
    }, [show, hideMs]);

    return mounted ? <>{children(visible)}</> : null;
}
