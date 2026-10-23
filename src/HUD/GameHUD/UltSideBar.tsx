import React from 'react';
import { Player, Ability } from 'dotagsi';
import { getAssetURL } from '../../api/getAssetURL';

// Ульта без смыслового кулдауна (Шторм — только мана, Инвокер — Invoke 6 с).
// Earth Spirit / Arc Warden / Morphling тут были зря: у Magnetize, Tempest Double и
// Replicate обычный кулдаун — их ульта не показывалась.
const INSTANT_ULT_HEROES = new Set([
    'npc_dota_hero_storm_spirit',
    'npc_dota_hero_invoker',
]);

// Max cooldowns for ring progress — approximate base values
const ULT_MAX_CD: Record<string, number> = {
    'npc_dota_hero_antimage':          70,
    'npc_dota_hero_axe':               75,
    'npc_dota_hero_crystal_maiden':   110,
    'npc_dota_hero_drow_ranger':       60,
    'npc_dota_hero_earthshaker':       90,
    'npc_dota_hero_juggernaut':        60,
    'npc_dota_hero_mirana':           130,
    'npc_dota_hero_nevermore':        120,
    'npc_dota_hero_phantom_lancer':    90,
    'npc_dota_hero_puck':              80,
    'npc_dota_hero_pudge':             30,
    'npc_dota_hero_razor':             55,
    'npc_dota_hero_sand_king':         90,
    'npc_dota_hero_skeleton_king':    200,
    'npc_dota_hero_sven':              80,
    'npc_dota_hero_tidehunter':       150,
    'npc_dota_hero_tiny':              60,
    'npc_dota_hero_vengefulspirit':   100,
    'npc_dota_hero_windranger':        60,
    'npc_dota_hero_witch_doctor':      80,
    'npc_dota_hero_lich':              90,
    'npc_dota_hero_lion':              80,
    'npc_dota_hero_shadow_shaman':     80,
    'npc_dota_hero_slardar':           70,
    'npc_dota_hero_zuus':             130,
    'npc_dota_hero_kunkka':           100,
    'npc_dota_hero_lina':              75,
    'npc_dota_hero_magnataur':         85,
    'npc_dota_hero_night_stalker':    175,
    'npc_dota_hero_doom_bringer':     150,
    'npc_dota_hero_faceless_void':     130,
    'npc_dota_hero_enigma':            180,
    'npc_dota_hero_disruptor':         80,
    'npc_dota_hero_ancient_apparition':90,
};
const DEFAULT_MAX_CD = 120;

// Полный кулдаун берём из игры: в тик каста кд скачком растёт — это и есть максимум
// (с уровнем ульты, талантами, Октариной). Таблица выше — только пока каста не видели.
const castCd = new Map<string, { last: number; max: number }>();
const maxCooldown = (key: string, cd: number, fallback: number) => {
    const s = castCd.get(key) ?? { last: 0, max: 0 };
    if (cd > s.last + 0.5) s.max = cd;
    s.last = cd;
    castCd.set(key, s);
    return s.max > 0 ? Math.max(s.max, cd) : Math.max(fallback, cd);
};

const formatCD = (cd: number) => {
    if (cd <= 0) return null;
    return cd >= 60
        ? `${Math.floor(cd / 60)}:${String(Math.ceil(cd % 60)).padStart(2, '0')}`
        : `${Math.ceil(cd)}`;
};


// Пассивные ульты с кулдауном (обычные пассивки без кд — Drow, PA, PL, Meepo — не показываем)
const PASSIVE_CD_ULTS = new Set(['skeleton_king_reincarnation']);

// Какая способность — ульта. Только изученные (level > 0). Раньше бралась первая с флагом
// ultimate — у Ember Spirit / Templar Assassin это служебные Activate Fire Remnant / Trap,
// а пассивные с кулдауном (Reincarnation) выкидывались вовсе.
const pickUlt = (player: Player): Ability | null => {
    const ults = ((player.abilities as Ability[]) ?? []).filter(a =>
        a.ultimate && (a.level ?? 0) > 0 &&
        (!a.passive || PASSIVE_CD_ULTS.has(a.name) || (a.cooldown ?? 0) > 0 ||
            castCd.has(`${player.steamid}|${a.name}`)));
    if (!ults.length) return null;
    const onCd = ults.filter(a => (a.cooldown ?? 0) > 0);
    if (onCd.length) return onCd.reduce((m, a) => ((a.cooldown ?? 0) > (m.cooldown ?? 0) ? a : m));
    // R-слот идёт после служебных D/F-подспособностей
    return ults[ults.length - 1];
};

const UltIcon = ({ player }: { player?: Player }) => {
    if (!player?.hero?.name) return <div className="ult_icon_slot empty" />;

    const heroName = player.hero.name;
    if (INSTANT_ULT_HEROES.has(heroName)) return <div className="ult_icon_slot instant" />;

    // Только настоящий ультимейт (см. pickUlt), без фоллбеков на обычные спеллы
    const ult = pickUlt(player);

    if (!ult) return <div className="ult_icon_slot empty" />;

    const cd = ult.cooldown ?? 0;
    const onCd = cd > 0;
    const maxCd = maxCooldown(`${player.steamid}|${ult.name}`, cd, ULT_MAX_CD[heroName] ?? DEFAULT_MAX_CD);
    const sweepDeg = onCd ? `${Math.round((cd / maxCd) * 360)}deg` : '0deg';
    const cdText = formatCD(cd);
    const imgSrc = getAssetURL(ult.name, 'abilities');

    return (
        <div className={`ult_icon_slot ${onCd ? 'on_cd' : 'ready'}`}>
            <img
                className="ult_icon_img"
                src={imgSrc}
                alt=""
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
            />
            {onCd && (
                <>
                    <div className="ult_cd_sweep" style={{ '--sweep': sweepDeg } as React.CSSProperties} />
                    <div className="ult_icon_overlay">
                        {cdText && <span className="ult_icon_cd">{cdText}</span>}
                    </div>
                </>
            )}
        </div>
    );
};

// Иконка перерисовывается только при смене героя/ульты/кулдауна, а не на каждый тик GSI
const ultSig = (p?: Player) => {
    if (!p?.hero?.name) return '';
    const u = pickUlt(p);
    return `${p.hero.name}|${u?.name}|${u?.level}|${u?.cooldown}`;
};
const UltIconMemo = React.memo(UltIcon, (a, b) => ultSig(a.player) === ultSig(b.player));

interface Props {
    players: Player[];
    show: boolean;
}

const UltSideBar = ({ players, show }: Props) => {
    const radiant = players.filter(p => p.team_name === 'radiant').slice(0, 5);
    const dire    = players.filter(p => p.team_name === 'dire').slice(0, 5);

    return (
        <>
            <div className={`ult_side_bar radiant ${!show ? 'hide' : ''}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <UltIconMemo key={i} player={radiant[i]} />
                ))}
            </div>
            <div className={`ult_side_bar dire ${!show ? 'hide' : ''}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <UltIconMemo key={i} player={dire[i]} />
                ))}
            </div>
        </>
    );
};

export default UltSideBar;
