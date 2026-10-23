import React from 'react';
import { Player } from 'dotagsi';
import './comparison.scss';
import { getAssetURL } from '../../api/getAssetURL';
import { apiUrl } from '../../api/api';
import { getNeutralCharm } from '../../api/neutralCharms';

const StatRow = ({ label, left, right }: { label: string; left: number; right: number }) => (
    <div className="cmp_stat_row">
        <span className={`cmp_stat_val left ${left > right ? 'winner' : ''}`}>{left.toLocaleString()}</span>
        <span className="cmp_stat_label">{label}</span>
        <span className={`cmp_stat_val right ${right > left ? 'winner' : ''}`}>{right.toLocaleString()}</span>
    </div>
);

interface Props {
    players: Player[];
    show: boolean;
    observedPlayer: Player | null;
    leftTeamId: string | number | null;
    rightTeamId: string | number | null;
}

const Comparison = ({ players, show, observedPlayer, leftTeamId, rightTeamId }: Props) => {
    // Сравниваем наблюдаемого игрока с оппонентом на той же позиции.
    const observed = observedPlayer ?? players.find(p => p.team_name === 'radiant');
    const opponent = observed
        ? players.find(p => p.team_name !== observed.team_name && p.team_slot === observed.team_slot)
          ?? players.find(p => p.team_name !== observed.team_name)
        : players.find(p => p.team_name === 'dire');

    if (!observed || !opponent) return null;

    // Radiant всегда слева, Dire справа (как в топбаре)
    const [left, right] = observed.team_name === 'radiant'
        ? [observed, opponent]
        : [opponent, observed];

    const leftTeam  = left.team_name  === 'dire' ? leftTeamId  : rightTeamId;
    const rightTeam = right.team_name === 'dire' ? leftTeamId  : rightTeamId;

    const allItems = (p: Player) => (p.items ?? []).map(i => i.name);
    const hasAghs  = (p: Player) => !!p.hero?.aghanims_scepter || allItems(p).some(n => n === 'item_ultimate_scepter' || n === 'item_ultimate_scepter_2');
    const hasShard = (p: Player) => !!p.hero?.aghanims_shard    || allItems(p).some(n => n === 'item_aghanims_shard');

    const renderPortrait = (p: Player, side: 'left' | 'right') => {
        const heroName = p.hero?.name ?? '';
        return (
            <div className={`cmp_portrait ${side}`}>
                {heroName && (
                    <>
                        <video key={heroName} src={`./assets/dota2/heroes/animated/${heroName}.webm`}
                            autoPlay loop muted playsInline
                            onError={e => {
                                const v = e.target as HTMLVideoElement;
                                v.style.display = 'none';
                                const img = v.nextElementSibling as HTMLImageElement | null;
                                if (img) img.style.display = 'block';
                            }}
                        />
                        <img src={getAssetURL(heroName, 'heroes')} alt="" style={{ display: 'none' }}
                            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    </>
                )}
                <div className="cmp_portrait_name">{p.name}</div>
            </div>
        );
    };

    const renderItems = (p: Player, side: 'left' | 'right') => {
        const slots = (p.items ?? []).filter(i => i.type === 'slot').slice(0, 6);
        return (
            <div className={`cmp_items_grid ${side}`}>
                {Array.from({ length: 6 }).map((_, i) => {
                    const item = slots[i];
                    if (!item || item.name === 'empty') return <div key={i} className="cmp_item_slot empty" />;
                    const isRecipe = item.name.startsWith('item_recipe');
                    return (
                        <div key={i} className="cmp_item_slot">
                            <img src={isRecipe ? './assets/dota2/items/recipe.webp' : getAssetURL(item.name, 'items')} alt="" />
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderNeutral = (p: Player, side: 'left' | 'right') => {
        const neutral    = (p.items ?? []).find(i => i.type === 'neutral');
        const empty      = !neutral || neutral.name === 'empty';
        const charmLevel = neutral?.item_level ?? 0;
        const charm      = (!empty && charmLevel > 0) ? getNeutralCharm(neutral!.name, charmLevel) : null;
        return (
            <div className={`cmp_neutral_wrap ${side}`}>
                <div className={`cmp_neutral_slot ${empty ? 'empty' : ''}`}>
                    {!empty && <img src={getAssetURL(neutral!.name, 'items')} alt="" />}
                </div>
                {charm && (
                    <div className="cmp_charm_info">
                        <img className="cmp_charm_icon" src={getAssetURL(charm.icon, 'items')} alt=""
                            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    </div>
                )}
            </div>
        );
    };

    const renderAghs = (p: Player, side: 'left' | 'right') => (
        <div className={`cmp_aghs_col ${side}`}>
            <div className={`cmp_aghs_icon ${hasAghs(p) ? 'active' : 'inactive'}`}>
                <img src="./assets/dota2/facets/aghs.png" alt="" />
            </div>
            <div className={`cmp_aghs_icon ${hasShard(p) ? 'active' : 'inactive'}`}>
                <img src="./assets/dota2/items/aghanims_shard-removebg-preview.png" alt="" />
            </div>
        </div>
    );

    const renderKda = (p: Player, side: 'left' | 'right') => (
        <div className={`cmp_player_info ${side}`}>
            <span className="cmp_kda_label">K/D/A</span>
            <div className="cmp_kda">
                <span className="k">{p.kills}</span><span className="sep">/</span>
                <span className="d">{p.deaths}</span><span className="sep">/</span>
                <span className="a">{p.assists}</span>
            </div>
        </div>
    );

    const renderLogo = (teamId: string | number | null, side: 'left' | 'right') =>
        teamId ? (
            <div className={`cmp_team_logo_wrap ${side}`}>
                <img src={`${apiUrl}/api/teams/${teamId}/logo`} alt=""
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            </div>
        ) : null;

    return (
        <div className={`cmp_overlay ${show ? '' : 'hide'}`}>
            <div className="cmp_frame">
                <div className="cmp_bg" />
                <div className="cmp_dots left" />
                <div className="cmp_dots right" />

                <div className="cmp_title">COMPARISON</div>

                {/* Портреты */}
                {renderPortrait(left,  'left')}
                {renderPortrait(right, 'right')}

                {/* Уровни */}
                <div className="cmp_level_badge left">{left.hero?.level  ?? 0}</div>
                <div className="cmp_level_badge right">{right.hero?.level ?? 0}</div>

                {/* Логотип команды */}
                {renderLogo(leftTeam,  'left')}
                {renderLogo(rightTeam, 'right')}

                {/* K/D/A */}
                {renderKda(left,  'left')}
                {renderKda(right, 'right')}

                {/* Агс + шард */}
                {renderAghs(left,  'left')}
                {renderAghs(right, 'right')}

                {/* Items 2×3 */}
                {renderItems(left,  'left')}
                {renderItems(right, 'right')}

                {/* Нейтралка */}
                {renderNeutral(left,  'left')}
                {renderNeutral(right, 'right')}

                {/* Стат строки */}
                <div className="cmp_stats">
                    <StatRow label="XPM"              left={left.xpm}          right={right.xpm}          />
                    <StatRow label="GPM"              left={left.gpm}          right={right.gpm}          />
                    <StatRow label="NET WORTH"        left={left.net_worth}    right={right.net_worth}    />
                    <StatRow label="HERO DAMAGE"      left={left.hero_damage}  right={right.hero_damage}  />
                    <StatRow label="DMG TO BUILDINGS" left={left.tower_damage} right={right.tower_damage} />
                    <StatRow label="LAST HITS"        left={left.last_hits}    right={right.last_hits}    />
                </div>
            </div>
        </div>
    );
};

export default Comparison;
