import React, { useEffect, useMemo, useRef, useState } from 'react';
import { actions, configs } from '../../api/services';

// ─── Определение типа картинки по base64 ──────────────────────────────────────
const mimeFor = (t: string) =>
    t === 'SVG' ? 'image/svg+xml' : t === 'JPG' ? 'image/jpeg' : 'image/png';

function detectType(b64: string): 'PNG' | 'JPG' | 'SVG' | 'Unknown' {
    try {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return 'PNG';
        if (bytes[0] === 255 && bytes[1] === 216) return 'JPG';
        const txt = new TextDecoder().decode(bytes);
        if (txt.startsWith('<svg') || txt.startsWith('<?xml')) return 'SVG';
    } catch { /* ignore */ }
    return 'Unknown';
}

const toImage = (raw: string) => {
    // Если уже data-url — используем как есть
    if (raw.startsWith('data:')) {
        const m = raw.match(/^data:image\/(\w+)/);
        const t = m ? m[1].toUpperCase() : 'PNG';
        return { type: t === 'JPEG' ? 'JPG' : t === 'SVG+XML' ? 'SVG' : t, source: raw };
    }
    // Иначе — чистый base64, определяем тип и строим data-url
    const type = detectType(raw);
    return { type, source: `data:${mimeFor(type)};base64,${raw}` };
};

// Нормализуем список картинок (массив | JSON-строка | одиночная строка)
const normalizeList = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [raw];
        } catch {
            return [raw];
        }
    }
    return [];
};

interface AdvertisingProps {
    durationMs?: number;
    fadeMs?: number;
    randomize?: boolean;
}

const Advertising = ({ durationMs = 5000, fadeMs = 300, randomize = false }: AdvertisingProps) => {
    const [enabled, setEnabled] = useState(false);
    const [images, setImages] = useState<Array<{ type: string; source: string }>>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [prevIdx, setPrevIdx] = useState<number | null>(null);
    const [cfg, setCfg] = useState<any>(null);

    // ─── Слушаем toggle через actions (аналог ia("advertising_state")) ──────────
    useEffect(() => {
        actions.on('advertising_state', (e: string) => {
            if (e === 'advertising_toggle') setEnabled(v => !v);
        });
    }, []);

    // ─── Получаем конфиг из configs ─────────────────────────────────────────────
    useEffect(() => {
        const handler = (data: any) => {
            const adv = data?.advertising ?? data;
            if (adv && (adv.advertising_image !== undefined || adv.enabled !== undefined)) {
                setCfg(adv);
            }
        };
        if (configs.data) handler(configs.data);
        configs.onChange(handler);
    }, []);

    // Применяем настройки из конфига
    const effDuration = typeof cfg?.durationMs === 'number' ? cfg.durationMs : durationMs;
    const effFade     = typeof cfg?.fadeMs === 'number' ? cfg.fadeMs : fadeMs;
    const effRandom   = typeof cfg?.randomize === 'boolean' ? cfg.randomize : randomize;

    // ─── Обновляем список картинок при изменении конфига ────────────────────────
    useEffect(() => {
        if (!cfg) {
            setImages([]); setCurrentIdx(0); setPrevIdx(null);
            return;
        }
        const list = normalizeList(cfg.advertising_image).map(toImage);
        if (typeof cfg.enabled === 'boolean') {
            setEnabled(cfg.enabled);
        } else if (list.length > 0 && !enabled) {
            setEnabled(true);
        }
        setImages(list);
        setCurrentIdx(0);
        setPrevIdx(null);
    }, [cfg]);

    // Предзагрузка картинок
    useEffect(() => {
        images.forEach(img => {
            if (img.type !== 'SVG') {
                const i = new Image();
                i.src = img.source;
            }
        });
    }, [images]);

    // ─── Ротация ────────────────────────────────────────────────────────────────
    const timerRef = useRef<number | null>(null);
    useEffect(() => {
        if (!enabled || images.length <= 1) {
            if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
            return;
        }
        timerRef.current = window.setInterval(() => {
            setCurrentIdx(prev => {
                const next = effRandom && images.length > 1
                    ? (() => { let c = prev; while (c === prev) c = Math.floor(Math.random() * images.length); return c; })()
                    : (prev + 1) % images.length;
                setPrevIdx(prev);
                return next;
            });
        }, Math.max(500, effDuration));
        return () => {
            if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
        };
    }, [enabled, images, effDuration, effRandom]);

    // Сброс prev после фейда
    useEffect(() => {
        if (prevIdx === null) return;
        const t = window.setTimeout(() => setPrevIdx(null), Math.max(50, effFade));
        return () => window.clearTimeout(t);
    }, [prevIdx, effFade]);

    // Сброс при выключении
    useEffect(() => {
        if (!enabled) { setPrevIdx(null); setCurrentIdx(0); }
    }, [enabled]);

    const current = useMemo(() => images[currentIdx], [images, currentIdx]);
    const previous = useMemo(() => (prevIdx !== null ? images[prevIdx] : null), [images, prevIdx]);

    return (
        <div
            className={`sponsor ${!enabled || images.length === 0 ? '' : 'show_sponsor'}`}
            style={{ '--fadeMs': `${effFade}ms` } as React.CSSProperties}
        >
            {current && (
                <img
                    key={`curr-${currentIdx}`}
                    className="sponsor_image imgLayer is-current"
                    src={current.source}
                    alt={`Sponsor ${currentIdx + 1}`}
                    draggable={false}
                />
            )}
            {previous && (
                <img
                    key={`prev-${prevIdx}-${currentIdx}`}
                    className="sponsor_image imgLayer is-exiting"
                    src={previous.source}
                    alt={`Sponsor prev ${prevIdx + 1}`}
                    draggable={false}
                />
            )}
        </div>
    );
};

// Пропсов нет — без memo перерисовывался вместе с App на каждом тике GSI
export default React.memo(Advertising);