import React from 'react';
import { Player, Item } from 'dotagsi';
import { getAssetURL } from '../../api/getAssetURL';

// Important trackable items — name as it appears in GSI (without "item_" prefix stripped by getAssetURL)
const KEY_ITEMS = [
    'item_gem',
    'item_black_king_bar',
    'item_refresher',
    // item_aegis не показываем: дота сама рисует аегис под портретом (см. underMark)
    'item_cheese',
    'item_manta',
    'item_sphere',         // linkens
    'item_sheepstick',     // hex
    'item_revenants_brooch',
    'item_ethereal_blade',
    'item_bloodthorn',
    'item_shivas_guard',
    'item_aeon_disk',
    'item_wind_waker',
    'item_overwhelming_blink',
    'item_swift_blink',
    'item_arcane_blink',
];

interface KeyItem {
    name: string;
    cooldown: number;
    charges: number | null;
}

function findKeyItems(player: Player): KeyItem[] {
    const items = (player.items ?? []) as Item[];
    const found: KeyItem[] = [];
    for (const item of items) {
        if (!item?.name) continue;
        if (KEY_ITEMS.includes(item.name)) {
            found.push({
                name: item.name,
                cooldown: item.cooldown ?? 0,
                charges: item.charges ?? null,
            });
        }
    }
    return found;
}

// SVG circle progress — clockwise, 0 = full ring, 1 = empty ring
const CircleProgress = ({ progress, ready }: { progress: number; ready: boolean }) => {
    const r = 8;
    const circ = 2 * Math.PI * r;
    const offset = circ * progress; // progress: 0=full, 1=empty
    const color = ready ? '#FFEB00' : '#95FF00';

    return (
        <svg
            className="key_item_ring"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* background circle */}
            <circle cx="9" cy="9" r={r} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
            {/* progress arc */}
            <circle
                cx="9" cy="9" r={r}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray={`${circ}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 9 9)"
            />
        </svg>
    );
};

const formatCD = (cd: number) => {
    if (cd <= 0) return null;
    return cd >= 60
        ? `${Math.floor(cd / 60)}:${String(Math.ceil(cd % 60)).padStart(2, '0')}`
        : `${Math.ceil(cd)}`;
};

const KeyItemSlot = ({ item, maxCooldown }: { item: KeyItem; maxCooldown: number }) => {
    const onCd = item.cooldown > 0;
    const progress = onCd ? item.cooldown / maxCooldown : 0;
    const ready = !onCd;
    const imgSrc = getAssetURL(item.name.replace('item_', ''), 'items');
    const cdText = formatCD(item.cooldown);

    return (
        <div className={`key_item_slot ${onCd ? 'on_cd' : 'ready'}`}>
            <img
                className="key_item_icon"
                src={imgSrc}
                alt=""
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
            />
            <CircleProgress progress={progress} ready={ready} />
            {onCd && (
                <div className="key_item_overlay">
                    {cdText && <span className="key_item_cd">{cdText}</span>}
                </div>
            )}
        </div>
    );
};

// Max cooldowns for ring progress calculation
const MAX_COOLDOWNS: Record<string, number> = {
    item_black_king_bar: 75,
    item_refresher: 160,
    item_manta: 25,
    item_sphere: 14,
    item_sheepstick: 20,
    item_shivas_guard: 30,
    item_aeon_disk: 105,
    item_wind_waker: 23,
    item_ethereal_blade: 22,
    item_bloodthorn: 15,
    item_revenants_brooch: 60,
    item_overwhelming_blink: 30,
    item_swift_blink: 30,
    item_arcane_blink: 30,
};

// Дота сама рисует под портретом топбара значок смока или аегиса — наши кружки
// его перекрывали. В это время съезжаем ниже значка.
const underMark = (player: Player) =>
    !!player.hero?.smoked || (player.items ?? []).some(i => i?.name === 'item_aegis');

const PlayerKeyItems = ({ player }: { player?: Player }) => {
    if (!player) return <div className="key_items_player empty" />;
    // Мёртв → показывается выкуп над ним → сдвигаем предметы вниз (с анимацией)
    const dead = player.hero?.alive === false;
    const shift = dead ? 'shifted' : underMark(player) ? 'shifted_mark' : '';
    const items = findKeyItems(player);
    if (items.length === 0) return <div className={`key_items_player empty ${shift}`} />;

    return (
        <div className={`key_items_player ${shift}`}>
            {items.map((item, i) => (
                <KeyItemSlot
                    key={i}
                    item={item}
                    maxCooldown={MAX_COOLDOWNS[item.name] ?? 60}
                />
            ))}
        </div>
    );
};

// Перерисовка только при смене смерти/набора предметов/кулдаунов, а не на каждый тик GSI
const keyItemsSig = (p?: Player) =>
    p ? `${p.hero?.alive === false}|${underMark(p)}|${findKeyItems(p).map(i => `${i.name}:${i.cooldown}`).join(',')}` : '-';
const PlayerKeyItemsMemo = React.memo(PlayerKeyItems, (a, b) => keyItemsSig(a.player) === keyItemsSig(b.player));

interface Props {
    players: Player[];
    show: boolean;
}

const KeyItemsBar = ({ players, show }: Props) => {
    const radiant = players.filter(p => p.team_name === 'radiant').slice(0, 5);
    const dire    = players.filter(p => p.team_name === 'dire').slice(0, 5);

    return (
        <div className={`key_items_bar ${!show ? 'hide' : ''}`}>
            <div className="key_items_team radiant">
                {Array.from({ length: 5 }).map((_, i) => (
                    <PlayerKeyItemsMemo key={i} player={radiant[i]} />
                ))}
            </div>
            <div className="key_items_team dire">
                {Array.from({ length: 5 }).map((_, i) => (
                    <PlayerKeyItemsMemo key={i} player={dire[i]} />
                ))}
            </div>
        </div>
    );
};

export default KeyItemsBar;
