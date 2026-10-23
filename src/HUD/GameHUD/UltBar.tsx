import React from 'react';
import { Player, Ability } from 'dotagsi';

const INSTANT_ULT_HEROES = new Set([
    'npc_dota_hero_storm_spirit',
    'npc_dota_hero_invoker',
]);

const formatCD = (cd: number) => {
    if (cd <= 0) return null;
    return cd >= 60
        ? `${Math.floor(cd / 60)}:${String(Math.ceil(cd % 60)).padStart(2, '0')}`
        : `${Math.ceil(cd)}`;
};

const UltSlot = ({ player }: { player?: Player }) => {
    if (!player) return <div className="ult_slot empty" />;

    const heroName = player.hero?.name ?? '';
    const isInstant = INSTANT_ULT_HEROES.has(heroName);

    const abilities = (player.abilities as Ability[]) ?? [];
    const ult = isInstant
        ? null
        : abilities.find(a => a.ultimate && !a.passive && a.level > 0)
            ?? abilities.filter(a => !a.passive && a.level > 0).slice(-1)[0] ?? null;

    if (!ult) return <div className="ult_slot empty" />;

    const onCd = (ult.cooldown ?? 0) > 0;
    const cdText = formatCD(ult.cooldown ?? 0);

    return (
        <div className={`ult_slot ${onCd ? 'on_cd' : 'ready'}`}>
            {onCd && cdText
                ? <span className="ult_cd_text">{cdText}</span>
                : <span className="ult_ready_dot" />
            }
        </div>
    );
};

interface Props {
    players: Player[];
    show: boolean;
}

const UltBar = ({ players, show }: Props) => {
    const radiant = players.filter(p => p.team_name === 'radiant').slice(0, 5);
    const dire    = players.filter(p => p.team_name === 'dire').slice(0, 5);

    return (
        <div className={`ult_bar ${!show ? 'hide' : ''}`}>
            <div className="ult_team radiant">
                {Array.from({ length: 5 }).map((_, i) => (
                    <UltSlot key={i} player={radiant[i]} />
                ))}
            </div>
            <div className="ult_team dire">
                {Array.from({ length: 5 }).map((_, i) => (
                    <UltSlot key={i} player={dire[i]} />
                ))}
            </div>
        </div>
    );
};

export default UltBar;
