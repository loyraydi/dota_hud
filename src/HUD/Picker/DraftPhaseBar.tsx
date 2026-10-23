import React from 'react';
import { TeamDraft } from 'dotagsi';

interface Props {
    radiantDraft?: TeamDraft;
    direDraft?: TeamDraft;
    activeTeam?: number;
    firstPickTeam: 'radiant' | 'dire' | '';
}

const GLOBAL_CM_RADIANT_FIRST: Array<{ team: 'radiant'|'dire'; type: 'pick'|'ban'; idx: number }> = [
    {team:'radiant',type:'ban', idx:0},{team:'radiant',type:'ban', idx:1},
    {team:'dire',   type:'ban', idx:0},{team:'dire',   type:'ban', idx:1},
    {team:'radiant',type:'ban', idx:2},
    {team:'dire',   type:'ban', idx:2},{team:'dire',   type:'ban', idx:3},
    {team:'radiant',type:'pick',idx:0},
    {team:'dire',   type:'pick',idx:0},
    {team:'radiant',type:'ban', idx:3},{team:'radiant',type:'ban', idx:4},
    {team:'dire',   type:'ban', idx:4},
    {team:'radiant',type:'pick',idx:1},
    {team:'dire',   type:'pick',idx:1},{team:'dire',   type:'pick',idx:2},
    {team:'radiant',type:'pick',idx:2},{team:'radiant',type:'pick',idx:3},
    {team:'dire',   type:'pick',idx:3},
    {team:'radiant',type:'ban', idx:5},
    {team:'dire',   type:'ban', idx:5},
    {team:'radiant',type:'ban', idx:6},
    {team:'dire',   type:'ban', idx:6},
    {team:'radiant',type:'pick',idx:4},
    {team:'dire',   type:'pick',idx:4},
];

const GLOBAL_CM_DIRE_FIRST = GLOBAL_CM_RADIANT_FIRST.map(s => ({
    ...s, team: (s.team==='radiant'?'dire':'radiant') as 'radiant'|'dire',
}));

const PHASE_GROUPS = [
    {label:'БАН', count:7},
    {label:'ПИК', count:2},
    {label:'БАН', count:3},
    {label:'ПИК', count:6},
    {label:'БАН', count:4},
    {label:'ПИК', count:2},
];

// Цвета сторон из клиента (CSS-переменные). В SVG-атрибут stroke var() не резолвится —
// поэтому stroke задаём через style.
const COLORS = { radiant: 'var(--color-radiant, #ffeb00)', dire: 'var(--color-dire, #7B2FBE)' };

/**
 * Генерируем SVG программно в зависимости от типа и состояния.
 * Ширина сегмента = 120px (=ширина карточки), высота = 30px.
 *
 * Форма:
 * - БАН: одна стрелка (треугольник-зубец), скромная
 * - ПИК: двойная стрелка (два зубца), более выразительная
 * - Активный: ярко, с glow, двойная стрелка независимо от типа
 */
const SegmentSVG = ({
                        type, team, filled, isCurrent
                    }: {
    type: 'pick'|'ban';
    team: 'radiant'|'dire';
    filled: boolean;
    isCurrent: boolean;
}) => {
    const W = 120;
    const H = 30;
    const BASE = 21;   // базовая линия (низ)
    const cx = W / 2;
    const color = COLORS[team];

    // Состояние определяет цвет, яркость и насколько "поднята" стрелка
    const stroke = isCurrent ? color : filled ? color : '#4a4a4a';

    let lineOpacity: number;   // прозрачность горизонтальной линии
    let arrowOpacity: number;  // прозрачность шеврона
    if (isCurrent)      { lineOpacity = 0.9;  arrowOpacity = 1; }
    else if (filled)    { lineOpacity = 0.5;  arrowOpacity = 0.85; }
    else                { lineOpacity = 0.35; arrowOpacity = type === 'pick' ? 0.45 : 0.25; }

    const sw = isCurrent ? 2.5 : 2;

    // Высота шеврона: пик выше бана, активный — самый высокий
    const tip = isCurrent ? 10 : type === 'pick' ? 8 : 5;

    // Плавная горизонтальная линия с зазором от краёв
    const baseline = `M3,${BASE} L${W - 3},${BASE}`;

    // Один аккуратный шеврон по центру (одинаковая форма для всех)
    const half = 13; // полуширина шеврона
    const chevron = `M${cx - half},${BASE} L${cx},${BASE - tip} L${cx + half},${BASE}`;

    // Для активного — второй шеврон сверху (двойная стрелка)
    const chevron2 = `M${cx - half},${BASE - tip} L${cx},${BASE - tip * 1.9} L${cx + half},${BASE - tip}`;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', width: '100%', height: `${H}px`, overflow: 'visible' }}
        >
            {/* Горизонтальная база */}
            <path
                d={baseline}
                style={{ stroke }}
                strokeWidth={sw}
                opacity={lineOpacity}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />

            {/* Основной шеврон */}
            <path
                d={chevron}
                strokeWidth={sw}
                opacity={arrowOpacity}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={isCurrent ? { stroke, filter: `drop-shadow(0 0 4px ${color})` } : { stroke }}
            />

            {/* Второй шеврон только на активном */}
            {isCurrent && (
                <path
                    d={chevron2}
                    strokeWidth={sw}
                    opacity={0.6}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ stroke, filter: `drop-shadow(0 0 4px ${color})` }}
                />
            )}
        </svg>
    );
};

// Пропсы — примитивы: 24 сегмента не перерисовываются на каждом тике GSI
const SegmentSVGMemo = React.memo(SegmentSVG);

const DraftPhaseBar = ({ radiantDraft, direDraft, activeTeam, firstPickTeam}: Props) => {
    const GLOBAL_CM = firstPickTeam === 'radiant' ? GLOBAL_CM_RADIANT_FIRST : GLOBAL_CM_DIRE_FIRST;

    const buildMap = (d?: TeamDraft) => {
        const m = new Map<string, boolean>();
        if (!d) return m;
        for (const e of d.picks) if (e.class) m.set(`${e.type}-${e.order}`, true);
        return m;
    };
    const rMap = buildMap(radiantDraft);
    const dMap = buildMap(direDraft);

    const activeIdx = GLOBAL_CM.findIndex(({ team, type, idx }) => {
        if (activeTeam === 2 && team !== 'radiant') return false;
        if (activeTeam === 3 && team !== 'dire')    return false;
        return !(team === 'radiant' ? rMap : dMap).get(`${type}-${idx}`);
    });

    return (
        <div className="draft_phase_bar_wrap">
            {/* Метки БАН/ПИК */}
            <div className="phase_labels">
                <div className="phase_labels_inner">
                    {PHASE_GROUPS.map((ph, i) => (
                        <div key={i} className="phase_label_group" style={{ flex: ph.count }}>
                            <span className="phase_label_text">{ph.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Сегменты */}
            <div className="draft_phase_bar">
                {GLOBAL_CM.map((seg, i) => {
                    const map = seg.team === 'radiant' ? rMap : dMap;
                    const filled = map.get(`${seg.type}-${seg.idx}`) ?? false;
                    const isCurrent = i === activeIdx;
                    return (
                        <div
                            key={i}
                            className={`phase_seg ${seg.team} ${seg.type} ${filled?'filled':'empty'} ${isCurrent?'current':''}`}
                        >
                            <SegmentSVGMemo
                                type={seg.type}
                                team={seg.team}
                                filled={filled}
                                isCurrent={isCurrent}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DraftPhaseBar;