import React from 'react';
import Layout from './HUD/Layout/Layout';
import { DOTA2GSI } from 'dotagsi';
import { io } from 'socket.io-client';
import type { Dota2RawPayload } from './types/dota2.types';
import { Dota2 } from 'dotagsi';
import { Match } from './api/interfaces';
import api from './api/api';
import "./HUD/GameHUD/gamehud.scss";

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

// ─── Подключаемся к meowhud серверу ──────────────────────────────────────────
const MEOWHUD_PORT = 1349;
export const socket = io(`http://localhost:${MEOWHUD_PORT}`, {
    transports: ['websocket', 'polling'],
});

// ─── DOTA2GSI — парсер GSI данных от dotagsi ─────────────────────────────────
const DOTA2 = new DOTA2GSI();

socket.on('dota2_update', (data: Dota2RawPayload) => {
    DOTA2.digest(data as any);
});

// ─── ActionManager / ConfigManager ───────────────────────────────────────────
class ActionManager {
    listeners: Map<string, Function[]> = new Map();

    execute(event: string, arg?: any) {
        const fns = this.listeners.get(event) || [];
        fns.forEach(fn => arg !== undefined ? fn(arg) : fn());
    }

    on(event: string, fn: Function) {
        const list = this.listeners.get(event) || [];
        list.push(fn);
        this.listeners.set(event, list);
        return true;
    }
}

class ConfigManager {
    listeners: Function[] = [];
    data: any = {};

    save(data: any) {
        this.data = data;
        this.listeners.forEach(fn => fn(data));
    }

    onChange(fn: Function) {
        this.listeners.push(fn);
        return true;
    }
}

export const actions = new ActionManager();
export const configs = new ConfigManager();

socket.on('hud_action', (data: { action: string; data?: any }) => {
    actions.execute(data.action, data.data);
});

// ─── App ──────────────────────────────────────────────────────────────────────
interface State {
    game: Dota2 | null;
    match: Match | null;
}

class App extends React.Component<{}, State> {
    state: State = { game: null, match: null };

    componentDidMount() {
        // HTTP запрос при старте — всегда получим текущий матч
        this.loadMatch();

        // Сервер эмитит "match" (не "match:updated")
        socket.on('match', () => {
            console.log('🔥 socket match event received');
            this.loadMatch();
        });

        DOTA2.on('data', (data: Dota2) => {
            this.setState({ game: data });
        });
    }

    loadMatch = async () => {
        try {
            console.log('📡 loading match...');
            const match = await api.match.getCurrent();
            console.log('📦 match result:', match);
            this.setState({ match });
        } catch (e) {
            console.error('Failed to load match:', e);
        }
    }

    render() {
        const { game, match } = this.state;
        if (!game) return null;
        return <Layout game={game} match={match} />;
    }
}

export default App;