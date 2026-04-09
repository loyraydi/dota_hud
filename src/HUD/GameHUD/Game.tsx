import React from 'react';
import { Team, Player } from 'dotagsi';
import { apiUrl, getAssetURL } from '../../api/api';
import { Avatar } from '../Players/Avatar';
import { useStreamName } from '../Camera/Container';

// ─── Блок камеры наблюдаемого игрока ─────────────────────────────────────────
const ObservedCam = ({
                         steamid,
                         player,
                         teamId,
                         showCam,
                     }: {
    steamid: string;
    player: Player;
    teamId: string | null;
    showCam: boolean;
}) => {
    const streamName = useStreamName(steamid);
    const camActive = showCam && !!streamName;

    return (
        <div className="obs_cam_wrap">
            {/* Аватар игрока — скрывается когда камера активна */}
            <div style={{ opacity: camActive ? 0 : 1, transition: "none", width: "100%", height: "100%" }}>
                <Avatar player={player} teamId={teamId} />
            </div>
            {/* Портал из Container рендерит сюда видео стрим */}
            <div className="obs_cam_video" />
        </div>
    );
};

// ─── Основной компонент ───────────────────────────────────────────────────────
const ObservedPlayer = ({
                            players,
                            player,
                            team,
                            teamId,
                            show,
                            showCam = true,
                        }: {
    show: boolean;
    player: Player | null;
    players: Player[];
    team: Team | null;
    teamId: string | null;
    showCam?: boolean;
}) => {
    const getPlayerById = (id: number) => {
        return players.find((p) => p.id === id);
    };

    if (!player) return null;

    return (
        <div className={`player_container ${player.team_name} ${!show ? 'hide' : ''}`}>
            <div className="player_info">
                <div className="team_box">
                    <div className={`${player.team_name} team_bar`}></div>
                    <div className="team_logo">
                        {teamId ? (
                            <img
                                src={`${apiUrl}api/teams/logo/${teamId}`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : null}
                    </div>
                </div>
                <div className="username shadowed-text">
                    {player.name}
                    {player.kills ? (
                        <div className="player_kills">
                            {player.kill_list.map((killEntry) => {
                                const victim = getPlayerById(killEntry.victimid);
                                if (!victim?.hero?.name) return null;
                                return (
                                    <div
                                        key={killEntry.victimid}
                                        className="player_kill"
                                        style={{
                                            backgroundImage: `url('${getAssetURL(victim.hero.name, 'heroes_icons')}')`,
                                        }}
                                    >
                                        X{killEntry.amount}
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Камера + аватар игрока */}
            <div className="player_picture">
                <ObservedCam
                    steamid={player.steamid}
                    player={player}
                    teamId={teamId}
                    showCam={showCam}
                />
            </div>
        </div>
    );
};

export default ObservedPlayer;