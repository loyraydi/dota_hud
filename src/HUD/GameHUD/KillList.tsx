import React from 'react';
import { Player } from 'dotagsi';
import { DOTA2 } from '../../api/services';
import { getAssetURL } from '../../api/getAssetURL';
import './killlist.scss';

// Дорисовка к нативному блоку доты «У / С / П» (левый верх): кого убил наблюдаемый
// игрок — мини-иконки героев как на радаре, ×N за повторные убийства.

// Порядок убийств: GSI даёт только счётчики по жертвам (kill_list), поэтому порядок
// ведём сами по событию kill (dotagsi сравнивает kill_list с прошлым тиком).
// killer steamid → id жертв, последняя убитая — в конце.
const killOrder = new Map<string, number[]>();
DOTA2.on('kill', ({ killer, victim }: { killer: Player; victim: Player }) => {
    const list = (killOrder.get(killer.steamid) ?? []).filter(id => id !== victim.id);
    list.push(victim.id);
    killOrder.set(killer.steamid, list);
});

interface Props {
    player: Player | null;
    players: Player[];
    show: boolean;
}

const KillList = ({ player, players, show }: Props) => {
    const kills = (player?.kill_list ?? []).filter(k => k.amount > 0);
    const order = (player && killOrder.get(player.steamid)) ?? [];
    // Жертвы без события (худ перезапущен посреди матча) — в начало, по слоту
    const rank = (id: number) => { const i = order.indexOf(id); return i === -1 ? -100 + id : i; };
    const sorted = [...kills].sort((a, b) => rank(a.victimid) - rank(b.victimid));
    const latest = order.length ? order[order.length - 1] : null;

    return (
        <div className={`kill_list ${show && sorted.length ? '' : 'hide'}`}>
            {sorted.map(k => {
                const victim = players.find(p => p.id === k.victimid);
                const hero = victim?.hero?.name;
                if (!hero) return null;
                return (
                    // key с amount: новое убийство той же жертвы перемонтирует иконку → вспышка
                    <div
                        key={`${k.victimid}-${k.amount}`}
                        className={`kill_list_hero ${victim?.team_name ?? ''} ${k.victimid === latest ? 'latest' : ''}`}
                    >
                        <img
                            src={getAssetURL(hero, 'heroes_icons')}
                            alt=""
                            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                        />
                        {k.amount > 1 && <span className="kill_list_count">{k.amount}</span>}
                    </div>
                );
            })}
        </div>
    );
};

// player/players — новые объекты на каждом тике GSI; перерисовка только при новом убийстве
// или смене наблюдаемого
const sig = (p: Player | null) =>
    p ? `${p.steamid}|${(p.kill_list ?? []).map(k => `${k.victimid}:${k.amount}`).join(',')}` : '-';

export default React.memo(KillList, (a, b) => a.show === b.show && sig(a.player) === sig(b.player));
