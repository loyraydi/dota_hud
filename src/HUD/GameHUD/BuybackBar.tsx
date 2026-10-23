import React from 'react';
import { Player } from 'dotagsi';

interface Props {
    players: Player[];
    show: boolean;
    clockTime: number;
}

const formatTime = (seconds: number) => {
    const s = Math.ceil(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const BuybackSlot = ({ player }: { player?: Player }) => {
    if (!player) return <div className="buyback_slot empty" />;

    const hero = player.hero;
    // Выкуп актуален только для МЁРТВЫХ героев — живые слот не показывают
    const alive = hero?.alive ?? true;
    if (alive) return <div className="buyback_slot empty" />;

    const cooldown = hero?.buyback_cooldown ?? 0;   // остаток секунд (напрямую)
    const cost = hero?.buyback_cost ?? 0;
    const gold = player.gold ?? 0;

    let content: React.ReactNode;

    if (cooldown > 0) {
        content = <span className="buyback_cd">{formatTime(cooldown)}</span>;
    } else if (cost > 0 && gold < cost) {
        content = <span className="buyback_missing"><img className="gold_icon" src="./assets/dota2/facets/gold.png" alt="" /> {cost - gold}</span>;
    } else {
        content = <span className="buyback_available">ВЫКУП</span>;
    }

    return <div className="buyback_slot">{content}</div>;
};

// Что реально видно в слоте — перерисовка только при его смене (золото меняется каждый тик)
const buybackSig = (p?: Player) => {
    if (!p) return '-';
    const h = p.hero;
    if (h?.alive ?? true) return 'alive';
    const cd = h?.buyback_cooldown ?? 0;
    const cost = h?.buyback_cost ?? 0;
    const gold = p.gold ?? 0;
    if (cd > 0) return `cd${Math.ceil(cd)}`;
    if (cost > 0 && gold < cost) return `need${cost - gold}`;
    return 'ok';
};
const BuybackSlotMemo = React.memo(BuybackSlot, (a, b) => buybackSig(a.player) === buybackSig(b.player));

const BuybackBar = ({ players, show }: Props) => {
    const radiant = players.filter(p => p.team_name === 'radiant').slice(0, 5);
    const dire = players.filter(p => p.team_name === 'dire').slice(0, 5);

    return (
        <div className={`buyback_bar ${!show ? 'hide' : ''}`}>
            <div className="buyback_team radiant">
                {Array.from({ length: 5 }).map((_, i) => (
                    <BuybackSlotMemo key={i} player={radiant[i]} />
                ))}
            </div>
            <div className="buyback_team dire">
                {Array.from({ length: 5 }).map((_, i) => (
                    <BuybackSlotMemo key={i} player={dire[i]} />
                ))}
            </div>
        </div>
    );
};

export default BuybackBar;
