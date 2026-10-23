import React from 'react';
import { Team, Player, Ability } from 'dotagsi';
import { apiUrl, getAssetURL } from '../../api/api';
import { Match } from '../../api/interfaces';

// Heroes whose ultimates are mana-based / instant / always available — skip showing CD
const INSTANT_ULT_HEROES = new Set([
    'npc_dota_hero_storm_spirit',       // Ball Lightning
    'npc_dota_hero_invoker',            // Invoke
]);

const formatUltCD = (cd: number) => {
    if (cd <= 0) return null;
    return cd >= 60
        ? `${Math.floor(cd / 60)}:${String(Math.ceil(cd % 60)).padStart(2, '0')}`
        : `${Math.ceil(cd)}`;
};

const UltIndicator = ({ player }: { player?: Player }) => {
    if (!player) return <div className="topbar_ult_cd empty" />;
    const heroName = player.hero?.name ?? '';
    if (INSTANT_ULT_HEROES.has(heroName)) return <div className="topbar_ult_cd instant" />;

    const abilities = (player.abilities as Ability[]) ?? [];
    // Find ultimate: flag first, fallback to last non-passive leveled ability
    const ult = abilities.find(a => a.ultimate && !a.passive && a.level > 0)
        ?? abilities.filter(a => !a.passive && a.level > 0).slice(-1)[0];

    if (!ult) return <div className="topbar_ult_cd empty" />;

    const onCd = (ult.cooldown ?? 0) > 0;
    const cdText = formatUltCD(ult.cooldown ?? 0);

    return (
        <div className={`topbar_ult_cd ${onCd ? 'on_cd' : 'ready'}`}>
            {onCd && cdText ? <span>{cdText}</span> : <span className="ready_dot" />}
        </div>
    );
};

interface TopBarProps {
    show: boolean;
    radiantTeam: Team;
    direTeam: Team;
    map: { clock_time: number; [key: string]: any };
    players: Player[];
    radiantTeamId: string | null;
    direTeamId: string | null;
    match: Match | null;
}

const formatClock = (seconds: number) => {
    const abs = Math.abs(Math.floor(seconds));
    const neg = seconds < 0 ? '-' : '';
    return `${neg}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
};

const HeroIcon = ({ player }: { player?: Player }) => {
    const heroName = player?.hero?.name;
    if (!heroName) {
        return <div className="topbar_hero_wrap empty" />;
    }
    return (
        <div className="topbar_hero_wrap">
            <div className="topbar_hero">
                <img
                    src={getAssetURL(heroName, 'heroes_icons')}
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
                {(player as any)?.level != null && (
                    <span className="topbar_hero_level">{(player as any).level}</span>
                )}
            </div>
            <UltIndicator player={player} />
        </div>
    );
};

const TopBar = ({ show, radiantTeam, direTeam, map, players, radiantTeamId, direTeamId, match }: TopBarProps) => {
    const radiantPlayers = players.filter(p => p.team_name === 'radiant').slice(0, 5);
    const direPlayers    = players.filter(p => p.team_name === 'dire').slice(0, 5);

    const radiantScore = (radiantTeam as any).score ?? 0;
    const direScore    = (direTeam as any).score ?? 0;
    const radiantName  = (radiantTeam as any).team_name ?? 'RADIANT';
    const direName     = (direTeam as any).team_name ?? 'DIRE';

    const radiantWins  = match?.left?.wins  ?? 0;
    const direWins     = match?.right?.wins ?? 0;
    const winsNeeded   = match?.matchType === 'bo1' ? 1 : match?.matchType === 'bo5' ? 3 : 2;

    return (
        <div className={`topbar ${!show ? 'hide' : ''}`}>

            {/* ── Radiant (left) ── */}
            <div className="topbar_team radiant">
                <div className="topbar_team_label">
                    <span className="topbar_team_name">{radiantName}</span>
                    {match && (
                        <div className="topbar_series">
                            {Array.from({ length: winsNeeded }).map((_, i) => (
                                <div key={i} className={`topbar_dot ${i < radiantWins ? 'won' : ''}`} />
                            ))}
                        </div>
                    )}
                    {radiantTeamId && (
                        <img
                            className="topbar_logo"
                            src={`${apiUrl}api/teams/logo/${radiantTeamId}`}
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                </div>
            </div>

            {/* ── Radiant heroes ── */}
            <div className="topbar_heroes radiant">
                {Array.from({ length: 5 }).map((_, i) => (
                    <HeroIcon key={i} player={radiantPlayers[i]} />
                ))}
            </div>

            {/* ── Center ── */}
            <div className="topbar_center">
                <span className="topbar_score">{radiantScore}</span>
                <div className="topbar_clock_wrap">
                    <span className="topbar_clock">{formatClock(map.clock_time)}</span>
                </div>
                <span className="topbar_score">{direScore}</span>
            </div>

            {/* ── Dire heroes ── */}
            <div className="topbar_heroes dire">
                {Array.from({ length: 5 }).map((_, i) => (
                    <HeroIcon key={i} player={direPlayers[i]} />
                ))}
            </div>

            {/* ── Dire (right) ── */}
            <div className="topbar_team dire">
                <div className="topbar_team_label right">
                    {direTeamId && (
                        <img
                            className="topbar_logo"
                            src={`${apiUrl}api/teams/logo/${direTeamId}`}
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                    {match && (
                        <div className="topbar_series">
                            {Array.from({ length: winsNeeded }).map((_, i) => (
                                <div key={i} className={`topbar_dot ${i < direWins ? 'won' : ''}`} />
                            ))}
                        </div>
                    )}
                    <span className="topbar_team_name">{direName}</span>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
