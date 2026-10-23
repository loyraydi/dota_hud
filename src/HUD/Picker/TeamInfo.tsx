import React, { useEffect, useState } from 'react';
import { Draft, Team, Faction, Player } from 'dotagsi';
import api from '../../api/api.ts';
import { Match } from '../../api/interfaces.ts';
import TeamRow from './Picker';

// Базовый URL для логотипов команд
const LOGO_BASE = 'http://localhost:1349/api/teams/logo';

const TeamInfo = ({
                      draft, type, players, team, match, teamId, active, timeRemaining, bonusTime, firstPickTeam,
                  }: {
    draft: Draft; type: Faction; players: Player[];
    team: Team; match: Match | null;
    /** Команда матча на этой стороне — с учётом свапа сторон (считает Layout) */
    teamId: string | null;
    active: boolean;
    timeRemaining?: number; bonusTime?: number;
    firstPickTeam: 'radiant' | 'dire' | '';
}) => {
    const [teamName, setTeamName] = useState(team?.name || '');
    // Версия логотипа: меняется только при смене команды/обновлении матча. Раньше
    // ?t=Date.now() считался на каждом рендере — лого перекачивалось каждый тик GSI.
    const [logoVer, setLogoVer] = useState(() => Date.now());

    useEffect(() => {
        if (!teamId) return;
        setLogoVer(Date.now());
        api.teams.getOne(teamId).then(t => {
            if (t?.name) setTeamName(t.name);
        }).catch(console.error);
    }, [teamId, match]);

    const bo = Number(String(match?.matchType || '').replace(/\D/g, '')) || 0;
    const winsNeeded = bo > 0 ? Math.floor(bo / 2) + 1 : 0;
    const side = match && teamId
        ? (match.left?.id === teamId ? match.left : match.right?.id === teamId ? match.right : null)
        : null;
    const wins = side?.wins ?? 0;

    if (!team) return null;

    const teamLogoUrl = teamId ? `${LOGO_BASE}/${teamId}?t=${logoVer}` : null;

    return (
        <TeamRow
            draft={draft[type]}
            type={type}
            active={active}
            teamName={teamName}
            teamLogoUrl={teamLogoUrl}
            teamScore={team.map_score}
            wins={wins}
            winsNeeded={winsNeeded}
            timeRemaining={timeRemaining}
            bonusTime={bonusTime}
            firstPickTeam={firstPickTeam}
            players={players}
            showPlayersTop={type === 'radiant'}
        />
    );
};

export default TeamInfo;
