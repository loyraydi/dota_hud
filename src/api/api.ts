import * as Types from './interfaces';

export const port = 1349;
// Хост страницы, а не localhost: худ открыт с другого ПК по IP этой машины (OBS режиссёра
// в локальной сети) — API и сокет там же. В OBS, оверлее и dev-сервере это localhost.
export const HOST = `http://${window.location.hostname || 'localhost'}`;
export const apiUrl = `${HOST}:${port}/`;

export { getAssetURL } from './getAssetURL';

const buildUrl = (url: string) => `${apiUrl}api/${url}`;

export const apiRequest = async <T>(
    url: string,
    method = 'GET',
    body?: unknown
): Promise<T> => {
    const options: RequestInit = {
        method,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(buildUrl(url), options);

    try {
        const parsed = (await response.json()) as T;
        return parsed;
    } catch (_error) {
        return (response.status < 300 ? true : null) as unknown as T;
    }
};

const api = {
    match: {
        getCurrent: (): Promise<Types.Match> =>
            apiRequest<Types.Match>('match/current'),
    },
    teams: {
        get: (): Promise<Types.Team[]> =>
            apiRequest<Types.Team[]>('teams'),
        getOne: (id: string): Promise<Types.Team> =>
            apiRequest<Types.Team>(`teams/${id}`),
    },
    players: {
        get: (): Promise<Types.Player[]> =>
            apiRequest<Types.Player[]>('players'),
        getAvatarURLs: (steamid: string): Promise<{ custom: string; steam: string }> =>
            apiRequest<{ custom: string; steam: string }>(`players/avatar/steamid/${steamid}`),
    },
};

export default api;