import React from 'react';
import Layout from './HUD/Layout/Layout';
import HudStage from './HUD/HudStage';
import Advertising from './HUD/Advertising/Advertising';
import Watermark from './HUD/Watermark/Watermark';
import { Dota2 } from 'dotagsi';
import { Match } from './api/interfaces';
import api from './api/api';
import "./HUD/GameHUD/gamehud.scss";
import "./HUD/Advertising/sponsor.scss";
import { socket, DOTA2, configs } from './api/services';

type ParentWindow = Window & {
    ipcApi?: {
        receive: (channel: string, handler: (...args: any[]) => void) => void;
    };
};

let isInWindow = false;
let parentWindow: ParentWindow | null = null

if (typeof window !== "undefined" && window.parent && window.parent !== window) {
    parentWindow = window.parent as ParentWindow;
    isInWindow = !!parentWindow.ipcApi;
}

// ─── App ────────────────────────────────────────────────────────────────────
/** Минимальный интервал между рендерами по данным GSI (обычный поток доты — 10/с) */
const MIN_RENDER_MS = 40;

interface State {
    game: Dota2 | null;
    match: Match | null;
}

class App extends React.Component<{}, State> {
    state: State = { game: null, match: null };

    componentDidMount() {
        this.loadMatch();
        socket.on('match:updated', () => this.loadMatch());
        socket.on('match:current', (match: Match) => this.setState({ match }));
        DOTA2.on('data', this.onGameData);

        // Подтягиваем сохранённый конфиг рекламы при старте (если API есть)
        this.loadAdvertising();
    }

    componentWillUnmount() {
        DOTA2.off('data', this.onGameData);
        if (this.flushTimer !== null) clearTimeout(this.flushTimer);
    }

    // Пачки GSI (клиент иногда шлёт несколько пакетов подряд) сводим в один рендер:
    // не чаще раза в MIN_RENDER_MS, всегда с последними данными. setTimeout, а не rAF —
    // rAF стоит в фоновой вкладке/скрытом окне, и худ «замерзал» бы.
    private pendingGame: Dota2 | null = null;
    private flushTimer: ReturnType<typeof setTimeout> | null = null;
    private lastFlush = 0;

    onGameData = (data: Dota2) => {
        this.pendingGame = data;
        if (this.flushTimer !== null) return;
        const wait = Math.max(0, this.lastFlush + MIN_RENDER_MS - performance.now());
        this.flushTimer = setTimeout(this.flushGameData, wait);
    }

    flushGameData = () => {
        this.flushTimer = null;
        this.lastFlush = performance.now();
        const game = this.pendingGame;
        this.pendingGame = null;
        if (game) this.setState({ game });
    }

    loadMatch = async () => {
        try {
            const match = await api.match.getCurrent();
            if (match && match.id) this.setState({ match });
        } catch (e) {
            console.error('Failed to load match:', e);
        }
    }

    loadAdvertising = async () => {
        try {
            // Если в api есть метод получения текущего конфига рекламы — используем
            const adv = await (api as any).hud?.getAdvertisingConfig?.();
            if (adv) configs.save({ advertising: adv });
        } catch { /* метода может не быть — игнорируем */ }
    }

    render() {
        const { game, match } = this.state;
        return (
            <HudStage>
                {game && <Layout game={game} match={match} />}
                {/* Спонсор рендерится всегда — поверх любого вида HUD */}
                <Advertising />
                {/* Водяной знак бесплатного доступа (сервер гасит для платных) */}
                <Watermark />
            </HudStage>
        );
    }
}

export default App;