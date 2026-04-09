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
                         }: {
    observedSteamid: string | null;
    showCam: boolean;
}) => {
    const [players, setPlayers] = useState<PlayerWithCam[]>([]);
    const [portalTarget, setPortalTarget] = useState<Element | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    // Загружаем игроков с камерами каждые 5 сек
    useEffect(() => {
        const load = async () => {
            try {
                const result = await api.players.get();
                console.log('all players:', result);
                if (!result) return;
                const withCams = result
                    .filter((p: any) => p.steamid && p.vdoNinjaUrl)
                    .map((p: any) => ({ steamid: p.steamid, streamName: p.vdoNinjaUrl }));
                console.log('players with cams:', withCams);
                playersCache = withCams;
                cacheListeners.forEach(fn => fn([...withCams]));
                setPlayers(withCams);
            } catch {
                // ignore
            }
        };
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    // Следим за .obs_cam_video в DOM через MutationObserver
    useEffect(() => {
        const find = () => {
            const el = document.querySelector(".obs_cam_video");
            console.log('🎥 obs_cam_video found:', el);
            if (el) setPortalTarget(el);
        };
        find();
        observerRef.current = new MutationObserver(find);
        observerRef.current.observe(document.body, { childList: true, subtree: true });
        return () => observerRef.current?.disconnect();
    }, []);

    if (!players.length || !portalTarget) return null;
    console.log('🎥 portalTarget:', portalTarget);
    console.log('🎥 players:', players);

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
        portalTarget
    );
};

export default CameraContainer;