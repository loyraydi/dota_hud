// ─── Все API запросы идут на meowhud сервер (порт 1349) ──────────────────────
export const port = 1349;
export const isDev = import.meta.env.DEV;
export const apiUrl = `http://localhost:${port}/`;

// ─── Ассеты берутся локально из src/assets/ ──────────────────────────────────
export { getAssetURL } from './getAssetURL';

export async function apiV2(url: string, method = "GET", body?: any) {
    const options: RequestInit = {
        method,
        headers: { Accept: "application/json", "Content-Type": "application/json" },
    };
    if (body) options.body = JSON.stringify(body);
    return fetch(`${apiUrl}api/${url}`, options).then((res) =>
        res.json().catch(() => res.status < 300)
    );
}

const api = {
    match: {
        getCurrent: async () => apiV2("match/current"),
    },
    teams: {
        getOne: async (id: string) => apiV2(`/dota2/match/teams/${id}`),
        get: () => apiV2("teams"),
    },
    players: {
        get: async () => apiV2("players"),
        getAvatarURLs: async (steamid: string) =>
            apiV2(`api/players/avatar/steamid/${steamid}`),
    },
};

export default api;