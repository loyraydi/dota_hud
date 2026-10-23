import React, { useState, useEffect, useCallback } from 'react';
import { Player, Map } from 'dotagsi';
import "./scoreboard.scss";
import { Match } from '../../api/interfaces';
import { apiUrl, getAssetURL } from '../../api/api';
import { heroFacets } from '../../api/heroFacets';
import api from '../../api/api';
import { socket } from '../../api/services';
import { getNeutralCharm } from '../../api/neutralCharms';

export function stringToClock(time: string | number) {
    if (typeof time === 'string') time = parseFloat(time);
    const abs = Math.abs(Math.ceil(time as number));
    return `${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
}

const ItemSlot = ({ name }: { name?: string }) => {
    if (!name || name === 'empty') return <div className="sb_item_slot empty" />;
    const isRecipe = name.startsWith('item_recipe');
    const src = isRecipe ? './assets/dota2/items/recipe.webp' : getAssetURL(name, 'items');
    return (
        <div className="sb_item_slot">
            <img src={src} alt="" />
        </div>
    );
};

const NeutralSlot = ({ name, charmLevel = 0 }: { name?: string; charmLevel?: number }) => {
    const empty = !name || name === 'empty';
    const charm = (!empty && charmLevel > 0) ? getNeutralCharm(name!, charmLevel) : null;
    return (
        <div className={`sb_neutral_wrap`}>
            <div className={`sb_neutral_slot ${empty ? 'empty' : ''}`}>
                {!empty && <img src={getAssetURL(name!, 'items')} alt="" />}
            </div>
            {charm && (
                <div className="sb_charm_info">
                    <img
                        className="sb_charm_icon"
                        src={getAssetURL(charm.icon, 'items')}
                        alt={charm.title}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                </div>
            )}
        </div>
    );
};

const PlayerRow = ({ player, team, align }: { player: Player; team: 'radiant' | 'dire'; align: 'left' | 'right' }) => {
    const slots = player.items.filter(i => i.type === 'slot').slice(0, 6);
    const neutral = player.items.find(i => i.type === 'neutral');
    const heroName = player.hero?.name ?? '';

    // Facet (aspect) chosen by this player
    const facetIndex = player.hero?.facetIndex ?? null;
    const facets = heroFacets[heroName] ?? [];
    const facet = facetIndex !== null ? facets[facetIndex] : null;
    const facetIcon = facet ? getAssetURL(facet.icon, 'facets') : null;

    // Neutral item charm (item_level > 0 means a charm is active)
    const neutralCharmLevel = neutral?.item_level ?? 0;

    // Aghanim's — hero flags cover consumed scepter/shard; item check covers unabsorbed ones
    const allItems = player.items.map(i => i.name);
    const hasAghs  = !!player.hero?.aghanims_scepter || allItems.some(n => n === 'item_ultimate_scepter' || n === 'item_ultimate_scepter_2');
    const hasShard = !!player.hero?.aghanims_shard    || allItems.some(n => n === 'item_aghanims_shard');

    const heroImg = heroName ? (
        <div className="sb_hero_portrait">
            <img src={getAssetURL(heroName, 'heroes')} alt=""
                onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            <span className="sb_level">{player.hero?.level ?? 0}</span>
        </div>
    ) : <div className="sb_hero_portrait empty" />;

    const info = (
        <div className="sb_player_info">
            <div className="sb_player_name">{player.name}</div>
            <div className="sb_player_kda">
                <span className="k">{player.kills}</span>
                <span className="sep">/</span>
                <span className="d">{player.deaths}</span>
                <span className="sep">/</span>
                <span className="a">{player.assists}</span>
            </div>
            <div className="sb_player_stats">
                <span><em>{player.xpm}</em> XPM</span>
                <span><em>{player.gpm}</em> GPM</span>
                <span><em>{player.net_worth}</em> NW</span>
            </div>
        </div>
    );

    // агс+шард — вертикально между инфой и слотами
    const aghsBlock = (
        <div className="sb_aghs_col">
            <div className={`sb_aghs_icon ${hasAghs ? 'active' : 'inactive'}`} title="Aghanim's Scepter">
                <img src="./assets/dota2/facets/aghs.png" alt="" />
            </div>
            <div className={`sb_aghs_icon ${hasShard ? 'active' : 'inactive'}`} title="Aghanim's Shard">
                <img src="./assets/dota2/items/aghanims_shard-removebg-preview.png" alt="" />
            </div>
        </div>
    );

    // 6 слотов
    const slotsBlock = (
        <div className="sb_items_grid">
            {Array.from({ length: 6 }).map((_, i) => (
                <ItemSlot key={i} name={slots[i]?.name} />
            ))}
        </div>
    );

    // нейтралка + фасет
    const neutralBlock = (
        <div className="sb_neutral_col">
            <NeutralSlot name={neutral?.name} charmLevel={neutralCharmLevel} />
            {facetIcon && (
                <div className="sb_facet_slot">
                    <img src={facetIcon} alt={facet?.title ?? ''}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                </div>
            )}
        </div>
    );

    // align=left:  [герой] [инфо] [агс] [слоты] [нейтралка]
    // align=right: [нейтралка] [слоты] [агс] [инфо] [герой]  (зеркально)
    return (
        <div className={`sb_player_row ${team} align_${align}`}>
            {align === 'left' ? (
                <>{heroImg}{info}{aghsBlock}{slotsBlock}{neutralBlock}</>
            ) : (
                <>{neutralBlock}{slotsBlock}{aghsBlock}{info}{heroImg}</>
            )}
        </div>
    );
};

const Scoreboard = ({ map, players, match, show, reverseSide }: {
    players: Player[];
    match: Match | null;
    map: Map;
    show: boolean;
    reverseSide?: boolean;
}) => {
    const bySlot = (a: Player, b: Player) =>
        (a.team_slot ?? a.player_slot ?? 0) - (b.team_slot ?? b.player_slot ?? 0);
    const radiant = players.filter(p => p.team_name === 'radiant').sort(bySlot);
    const dire    = players.filter(p => p.team_name === 'dire').sort(bySlot);

    const radiantKills = dire.reduce((s, p) => s + p.deaths, 0);
    const direKills    = radiant.reduce((s, p) => s + p.deaths, 0);

    // свитч сторон: какая настроенная команда = radiant/dire
    const radiantId = (reverseSide ? match?.right?.id : match?.left?.id)  ?? null;
    const direId    = (reverseSide ? match?.left?.id  : match?.right?.id) ?? null;

    const [radiantName, setRadiantName] = useState('RADIANT');
    const [direName,    setDireName]    = useState('DIRE');

    const fetchTeams = useCallback(() => {
        if (radiantId) api.teams.getOne(radiantId).then(t => t?.name && setRadiantName(t.name)).catch(() => {});
        if (direId)    api.teams.getOne(direId).then(t => t?.name && setDireName(t.name)).catch(() => {});
    }, [radiantId, direId]);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);
    useEffect(() => {
        socket.on('match:updated', fetchTeams);
        return () => { socket.off('match:updated', fetchTeams); };
    }, [fetchTeams]);

    const radiantScore = map.radiant.map_score ?? 0;
    const direScore    = map.dire.map_score    ?? 0;

    return (
        <div className={`sb_overlay ${!show ? 'hide' : ''}`}>
        <div className="sb_inner">
            {/* ── HEADER ── */}
            <div className="sb_header">
                <div className="sb_header_team radiant">
                    {radiantId && (
                        <img className="sb_team_logo" src={`${apiUrl}api/teams/logo/${radiantId}`} alt=""
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="sb_team_label">
                        <span className="sb_team_faction">RADIANT</span>
                        <span className="sb_team_name">{radiantName}</span>
                    </div>
                </div>

                <div className="sb_header_center">
                    <div className="sb_score_block">
                        <span className="sb_score radiant">{radiantScore}</span>
                        <div className="sb_center_info">
                            <span className="sb_clock">{stringToClock(map.clock_time)}</span>
                            <span className="sb_kills">{radiantKills} — {direKills}</span>
                            {match && <span className="sb_bo">{match.matchType?.toUpperCase()}</span>}
                        </div>
                        <span className="sb_score dire">{direScore}</span>
                    </div>
                </div>

                <div className="sb_header_team dire">
                    <div className="sb_team_label right">
                        <span className="sb_team_faction">DIRE</span>
                        <span className="sb_team_name">{direName}</span>
                    </div>
                    {direId && (
                        <img className="sb_team_logo" src={`${apiUrl}api/teams/logo/${direId}`} alt=""
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                </div>
            </div>

            {/* ── PLAYERS ── */}
            <div className="sb_players">
                <div className="sb_team_col radiant">
                    {radiant.map((p, i) => <PlayerRow key={i} player={p} team="radiant" align="left" />)}
                </div>
                <div className="sb_divider" />
                <div className="sb_team_col dire">
                    {dire.map((p, i) => <PlayerRow key={i} player={p} team="dire" align="right" />)}
                </div>
            </div>
        </div>
        </div>
    );
};

export { Scoreboard as ScoreboardPlayer };
export default Scoreboard;
