import React, { useEffect, useState } from "react";
import { Player } from "dotagsi";
import { avatars, loadAvatarURL } from "../../api/avatars";

export const Avatar = ({
                           player,
                           teamId,
                           fallback,
                       }: {
    player: Player;
    teamId?: string | null;
    fallback?: string;
}) => {
    const [src, setSrc] = useState<string>(() => {
        // Сразу берём из кеша если уже загружен
        return avatars[player.steamid]?.url || "";
    });

    useEffect(() => {
        const steamid = player?.steamid;
        if (!steamid) {
            setSrc(fallback || "");
            return;
        }

        // Уже есть в кеше
        if (avatars[steamid]?.url) {
            setSrc(avatars[steamid].url);
            return;
        }

        // Запускаем загрузку и ждём
        loadAvatarURL(steamid);
        const entry = avatars[steamid];
        if (!entry) return;

        entry.loader.then((url) => {
            if (url) setSrc(url);
            else if (fallback) setSrc(fallback);
        });
    }, [player?.steamid]);

    const imgSrc = src || fallback;
    if (!imgSrc) return null;

    return (
        <img
            src={imgSrc}
            alt={player.name}
            onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (fallback && img.src !== fallback) {
                    img.src = fallback;
                } else {
                    img.style.display = 'none';
                }
            }}
        />
    );
};