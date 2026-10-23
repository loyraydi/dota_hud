import React from 'react';
import { Player } from 'dotagsi';
import './statbars.scss';
import { getAssetURL } from '../../api/getAssetURL';

export interface StatConfig {
    key: string;                       // bind action name
    label: string[];                   // строки заголовка (1-2)
    color: string;                     // тема столбцов
    get: (p: Player) => number;        // основное значение
    fmt?: 'raw' | 'k';                 // формат числа
    // dual (например deward/ward): второе значение + цвета
    dual?: boolean;
    get2?: (p: Player) => number;
    color2?: string;                   // цвет основного значения в dual
}

export const STAT_CONFIGS: StatConfig[] = [
    { key: 'stat_healing',  label: ['HERO', 'HEALING'], color: '#2ecc5a', get: p => p.hero_healing, fmt: 'k'  },
    { key: 'stat_camps',    label: ['CAMPS', 'STACKED'],color: '#37c89c', get: p => p.camps_stacked, fmt: 'raw'},
    { key: 'stat_gpm',      label: ['GPM'],             color: '#FFC107', get: p => p.gpm,           fmt: 'raw'},
    { key: 'stat_damage',   label: ['HERO', 'DAMAGE'],  color: '#e74c3c', get: p => p.hero_damage,   fmt: 'k'  },
    { key: 'stat_networth', label: ['NET', 'WORTH'],    color: '#FFC107', get: p => p.net_worth,     fmt: 'k'  },
    { key: 'stat_lasthits', label: ['LAST', 'HITS'],    color: '#3da6e0', get: p => p.last_hits,     fmt: 'raw'},
    {
        key: 'stat_wards', label: ['DEWARD', 'WARD'], color: '#2ecc5a',
        get: p => p.wards_destroyed, fmt: 'raw',
        dual: true, get2: p => p.wards_placed, color2: '#e74c3c',
    },
];

const fmtVal = (v: number, fmt?: 'raw' | 'k') => {
    if (fmt === 'k' && v >= 1000) {
        const k = v / 1000;
        return `${k >= 10 ? Math.round(k) : k.toFixed(1)}k`;
    }
    return `${v}`;
};

const GOLD = '#FFD000';

interface BarColProps {
    player?: Player;
    cfg: StatConfig;
    globalMax: number;
    globalMax2: number;
    isMax: boolean;
}

const BarCol = ({ player, cfg, globalMax, globalMax2, isMax }: BarColProps) => {
    if (!player?.hero?.name) return <div className="sbar_col empty" />;

    const heroName = player.hero.name;
    const val  = cfg.get(player) || 0;
    const val2 = cfg.dual && cfg.get2 ? (cfg.get2(player) || 0) : 0;

    // Целые проценты (1% ≈ 1.7px): иначе значения (net worth, GPM) меняются на каждом тике
    // GSI на доли процента и transition: height перезапускается 10 раз в секунду —
    // непрерывный layout+paint, пока панель на экране.
    const h  = globalMax  > 0 ? Math.max(2, Math.round((val  / globalMax)  * 100)) : 0;
    const h2 = globalMax2 > 0 ? Math.max(2, Math.round((val2 / globalMax2) * 100)) : 0;

    // в dual-режиме нижняя часть — color2 (deward), верхняя — color (ward)
    const mainColor = isMax && !cfg.dual ? GOLD : cfg.color;

    return (
        <div className={`sbar_col ${isMax && !cfg.dual ? 'is_max' : ''}`}>
            <div className="sbar_track">
                {cfg.dual ? (
                    // два раздельных столбика рядом: девард | вард
                    <div className="sbar_dual">
                        <div className="sbar_dual_col">
                            <div className="sbar_fill" style={{ height: `${h}%`, background: cfg.color }} />
                        </div>
                        <div className="sbar_dual_col">
                            <div className="sbar_fill" style={{ height: `${h2}%`, background: cfg.color2 }} />
                        </div>
                    </div>
                ) : (
                    <div className="sbar_fill" style={{ height: `${h}%`, background: mainColor }} />
                )}
                <img
                    className="sbar_hero"
                    src={getAssetURL(heroName, 'heroes')}
                    alt=""
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
            </div>
            <div className="sbar_value">
                {cfg.dual ? (
                    <>
                        <span style={{ color: cfg.color }}>{fmtVal(val, cfg.fmt)}</span>
                        <span className="sbar_sep"> </span>
                        <span style={{ color: cfg.color2 }}>{fmtVal(val2, cfg.fmt)}</span>
                    </>
                ) : (
                    <span style={{ color: isMax ? GOLD : '#fff' }}>{fmtVal(val, cfg.fmt)}</span>
                )}
            </div>
        </div>
    );
};

interface Props {
    players: Player[];
    show: boolean;
    cfg: StatConfig;
}

const StatBars = ({ players, show, cfg }: Props) => {
    // Порядок как в нативном топбаре доты: сортируем по слоту в команде
    const bySlot = (a: Player, b: Player) =>
        (a.team_slot ?? a.player_slot ?? 0) - (b.team_slot ?? b.player_slot ?? 0);
    const radiant = players.filter(p => p.team_name === 'radiant').sort(bySlot).slice(0, 5);
    const dire    = players.filter(p => p.team_name === 'dire').sort(bySlot).slice(0, 5);
    // В топбаре доты Radiant слева, Dire справа
    const left  = radiant;
    const right = dire;

    const all = [...left, ...right];
    const globalMax  = Math.max(1, ...all.map(p => cfg.get(p)));
    const globalMax2 = cfg.dual && cfg.get2 ? Math.max(1, ...all.map(p => cfg.get2!(p))) : 1;
    // максимум только для single-режима
    const maxVal = globalMax;

    const renderSide = (list: Player[]) =>
        Array.from({ length: 5 }).map((_, i) => {
            const p = list[i];
            const isMax = !!p && !cfg.dual && cfg.get(p) === maxVal && maxVal > 1;
            return <BarCol key={i} player={p} cfg={cfg} globalMax={globalMax} globalMax2={globalMax2} isMax={isMax} />;
        });

    return (
        <div className={`sbar_overlay ${show ? '' : 'hide'}`}>
            <div className="sbar_frame">
                <div className="sbar_side left">{renderSide(left)}</div>

                <div className="sbar_center" style={{ ['--accent' as any]: cfg.color }}>
                    <img
                        className="sbar_center_icon"
                        src={`./assets/stats/${cfg.key}.png`}
                        alt=""
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="sbar_center_label">
                        {cfg.label.map((l, i) => <span key={i}>{l}</span>)}
                    </div>
                </div>

                <div className="sbar_side right">{renderSide(right)}</div>
            </div>
        </div>
    );
};

export default StatBars;
