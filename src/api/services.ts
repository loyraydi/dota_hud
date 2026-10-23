import { DOTA2GSI } from 'dotagsi';
import { io } from 'socket.io-client';
import type { Dota2RawPayload } from '../types/dota2.types';
import { applyHudColors } from '../HUD/hudColors';

// Единственное подключение худа к серверу MeowHUD. Раньше App.tsx открывал второй
// сокет со своим парсером GSI — каждый тик парсился дважды, а hud_config не доходил
// до Layout (текст инфобокса не обновлялся).

const MEOWHUD_PORT = 1349;

export const socket = io(`http://localhost:${MEOWHUD_PORT}`, {
    transports: ['websocket', 'polling'],
});

// ─── DOTA2GSI ─────────────────────────────────────────────────────────────────
export const DOTA2 = new DOTA2GSI();

socket.on('dota2_update', (data: Dota2RawPayload) => {
    DOTA2.digest(data as any);
});

// ─── ActionManager ────────────────────────────────────────────────────────────
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

// ─── ConfigManager ────────────────────────────────────────────────────────────
class ConfigManager {
    listeners: Function[] = [];
    data: any = {};

    save(data: any) {
        // Сливаем с существующими данными чтобы не затирать другие ключи (напр. advertising)
        this.data = { ...this.data, ...data };
        this.listeners.forEach(fn => fn(this.data));
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

// ─── HUD config (реклама/спонсоры, цвета сторон) ──────────────────────────────
// Сервер шлёт 'hud_config' объектом (иногда массивом: [{ advertising: {...}, ... }])
socket.on('hud_config', (payload: any) => {
    const data = Array.isArray(payload) ? payload[0] : payload;
    if (!data) return;
    configs.save(data);
    if (data.colors) applyHudColors(data.colors);
});
