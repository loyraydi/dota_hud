import React, { useEffect, useState, useCallback } from 'react';
import { Faction, Team } from 'dotagsi';
import { apiUrl } from '../../api/api';
import api from '../../api/api';
import { Team as ApiTeam } from '../../api/interfaces';
import { socket } from '../../api/services';

interface Props {
    children?: React.ReactNode;
    /** Текст инфобокса (строкой, а не children — чтобы React.memo мог сравнить) */
    info?: string;
    type: Faction;
    /** В рендере не используется (объект новый на каждом тике GSI — memo его не сравнивает) */
    team: Team;
    teamId: string | null;
    show: boolean;
}

const TopSideBar = ({
    children,
    info,
    type,
    teamId,
    show,
}: Props) => {
    const [apiTeam, setApiTeam] = useState<ApiTeam | null>(null);
    const [cacheKey, setCacheKey] = useState(() => Date.now());

    const fetchTeam = useCallback(() => {
        if (!teamId) return;
        api.teams.getOne(teamId).then(data => {
            setApiTeam(data);
            setCacheKey(Date.now());
        }).catch(() => {});
    }, [teamId]);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    useEffect(() => {
        socket.on('match:updated', fetchTeam);
        return () => { socket.off('match:updated', fetchTeam); };
    }, [fetchTeam]);

    const teamName = apiTeam?.name || '';
    const logoUrl = teamId ? `${apiUrl}api/teams/logo/${teamId}?v=${cacheKey}` : null;

    const logo = logoUrl ? (
        <img
            className="tsb_logo"
            src={logoUrl}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
    ) : null;

    const name = teamName ? <span className="tsb_name">{teamName}</span> : null;

    return (
        <div className={`top_side_bar ${type} ${type === 'radiant' ? 'left' : 'right'} ${!show ? 'hide' : ''}`}>
            {type === 'radiant' ? <>{name}{logo}</> : <>{logo}{name}</>}
            {info !== undefined && <span>{info}</span>}
            {children}
        </div>
    );
};

export default React.memo(TopSideBar, (a, b) =>
    a.type === b.type && a.teamId === b.teamId && a.show === b.show &&
    a.info === b.info && a.children === b.children
);
