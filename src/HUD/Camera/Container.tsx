import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import CameraView from "./Camera";
import api from "../../api/api";

interface PlayerWithCam {
    steamid: string;
    streamName: string;
}

// ─── Глобальный кеш стримов ───────────────────────────────────────────────────
let playersCache: PlayerWithCam[] = [];
const cacheListeners: ((players: PlayerWithCam[]) => void)[] = [];

// ─── Хук для получения streamName по steamid ─────────────────────────────────
export const useStreamName = (steamid: string): string | null => {
    const [streamName, setStreamName] = useState<string | null>(
        () => playersCache.find(p => p.steamid === steamid)?.streamName ?? null
    );

    useEffect(() => {
        const listener = (players: PlayerWithCam[]) => {
            setStreamName(players.find(p => p.steamid === steamid)?.streamName ?? null);
        };
        cacheListeners.push(listener);
        listener(playersCache);
        return () => {
            const idx = cacheListeners.indexOf(listener);
            if (idx !== -1) cacheListeners.splice(idx, 1);
        };
    }, [steamid]);

    return streamName;
};

// ─── Глобальный контейнер камер — рендерится один раз в App ──────────────────
const CameraContainer = ({
                             observedSteamid,
                             showCam,
                             target,
                         }: {
    observedSteamid: string | null;
    showCam: boolean;
    /** Узел для портала. Если передан — без поиска по DOM (см. ниже). */
    target?: Element | null;
}) => {
    const [players, setPlayers] = useState<PlayerWithCam[]>([]);
    const [portalTarget, setPortalTarget] = useState<Element | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    // Загружаем игроков с камерами каждые 5 сек
    useEffect(() => {
        const load = async () => {
            try {
                const result = await api.players.get();
                if (!result) return;
                const withCams = result
                    .filter((p: any) => p.steamid && p.vdoNinjaUrl)
                    .map((p: any) => ({ steamid: p.steamid, streamName: p.vdoNinjaUrl }));
                // Опрос каждые 5 с: не перерисовываем камеры, если список не менялся
                const key = JSON.stringify(withCams);
                if (key !== JSON.stringify(playersCache)) {
                    playersCache = withCams;
                    cacheListeners.forEach(fn => fn([...withCams]));
                }
                setPlayers(prev => (JSON.stringify(prev) === key ? prev : withCams));
            } catch {
                // ignore
            }
        };
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    // Фолбэк для вызовов без target: ищем .obs_cam_video через MutationObserver.
    // Дорого (срабатывает на каждую мутацию DOM, т.е. на каждый тик GSI) — поэтому
    // только если узел не передали явно.
    useEffect(() => {
        if (target !== undefined) return;
        const find = () => {
            const el = document.querySelector(".obs_cam_video");
            if (el) setPortalTarget(el);
        };
        find();
        observerRef.current = new MutationObserver(find);
        observerRef.current.observe(document.body, { childList: true, subtree: true });
        return () => observerRef.current?.disconnect();
    }, [target]);

    const mountNode = target !== undefined ? target : portalTarget;
    if (!players.length || !mountNode) return null;

    // Все стримы рендерятся через портал в .obs_cam_video
    // Видимость — только opacity, без mount/unmount
    return createPortal(
        <>
            {players.map((player) => (
                <CameraView
                    key={player.steamid}
                    streamName={player.streamName}
                    visible={showCam && observedSteamid === player.steamid}
                />
            ))}
        </>,
        mountNode
    );
};

export default CameraContainer;