import React from 'react';
import { Faction, TeamDraft, DraftEntry, Player } from 'dotagsi';
import DraftSlot from './Pick';

interface TeamRowProps {
    draft?: TeamDraft;
    type: Faction;
    active: boolean;
    teamName: string;
    teamLogoUrl?: string | null;
    teamScore?: number | string;
    wins?: number;
    winsNeeded?: number;
    timeRemaining?: number;
    bonusTime?: number;
    firstPickTeam: 'radiant' | 'dire' | '';
    players?: Player[];
    showPlayersTop?: boolean;
}

const CM_STARTER: Array<{type:'pick'|'ban';idx:number}> = [
    {type:'ban',idx:0},{type:'ban',idx:1},{type:'ban',idx:2},
    {type:'pick',idx:0},
    {type:'ban',idx:3},{type:'ban',idx:4},
    {type:'pick',idx:1},{type:'pick',idx:2},{type:'pick',idx:3},
    {type:'ban',idx:5},{type:'ban',idx:6},
    {type:'pick',idx:4},
];
const CM_SECOND: Array<{type:'pick'|'ban';idx:number}> = [
    {type:'ban',idx:0},{type:'ban',idx:1},{type:'ban',idx:2},{type:'ban',idx:3},
    {type:'pick',idx:0},
    {type:'ban',idx:4},
    {type:'pick',idx:1},{type:'pick',idx:2},{type:'pick',idx:3},
    {type:'ban',idx:5},{type:'ban',idx:6},
    {type:'pick',idx:4},
];

const fmt = (sec: number) => {
    const s = Math.max(0, Math.round(sec));
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
};

const TeamRow = ({
                     draft, type, active, teamName, teamLogoUrl, teamScore,
                     wins, winsNeeded, timeRemaining, bonusTime,
                     firstPickTeam, players, showPlayersTop,
                 }: TeamRowProps) => {
    const thisStarts = firstPickTeam !== '' && firstPickTeam === type;
    const CM_ORDER = firstPickTeam === '' ? CM_STARTER : thisStarts ? CM_STARTER : CM_SECOND;
    const pickLabel = firstPickTeam === '' ? '' : thisStarts ? 'FIRST PICK' : 'LAST PICK';

    const entryMap = new Map<string, DraftEntry>();
    if (draft) for (const e of draft.picks) entryMap.set(`${e.type}-${e.order}`, e);

    const slots = CM_ORDER
        .map(({type:t, idx}) => entryMap.get(`${t}-${idx}`))
        .filter((e): e is DraftEntry => e !== undefined);

    const activeIdx = slots.findIndex(s => !s.class);

    const showBonus = active && (!timeRemaining || timeRemaining <= 0) && !!bonusTime && bonusTime > 0;
    const bonusDisplay = bonusTime ? fmt(bonusTime) : null;
    const isUrgent = !!bonusTime && bonusTime < 30 && showBonus;

    // ── Ники игроков с диагональными разделителями ──
    // 5 имён, выровнены по 5 пик-слотам
    const playerNames = players?.map(p => p.name) ?? [];

    // Обычный JSX, не вложенный компонент: <NamesRow/>, объявленный внутри рендера,
    // каждый тик был новым типом — React пересоздавал эти DOM-узлы 10 раз в секунду.
    const namesRow = (
        <div className={`draft_player_names ${type}`}>
            {playerNames.slice(0, 5).map((name, i) => (
                <div key={i} className="player_name_seg">
                    <span className="player_name_text">{name}</span>
                </div>
            ))}
        </div>
    );

    return (
        <>
            {showPlayersTop && namesRow}
            <div className={`team_row ${type} ${active ? 'active' : ''}`}>

                {/* Карточка команды */}
                <div className="team_row_info">
                    {/* Слот под halftone картинку (угол) */}
                    <div className={`team_row_halftone ${type}`} />

                    {pickLabel && <span className="team_row_pick_label">{pickLabel}</span>}
                    <div className="team_row_logo_name">
                        <div className="team_row_logo">
                            {teamLogoUrl
                                ? <img src={teamLogoUrl} alt={teamName} />
                                : <div className="team_row_logo_placeholder">✕</div>
                            }
                        </div>
                        <div className="team_row_name">{teamName}</div>
                    </div>
                    <div className="team_row_bottom_bar">
                        <span className={`team_row_side ${type}`}>{type.toUpperCase()}</span>
                        {!!winsNeeded && winsNeeded > 0 && (
                            <div className="series_win_boxes">
                                {Array.from({length: winsNeeded}).map((_, i) => (
                                    <div key={i} className={`series_win_box ${type} ${i < (wins??0) ? 'filled':''}`} />
                                ))}
                            </div>
                        )}
                        {bonusDisplay && (
                            <span className={`team_row_bonus ${isUrgent?'urgent':''}`}>{bonusDisplay}</span>
                        )}
                    </div>
                </div>

                {/* Карточки героев */}
                <div className="team_row_slots">
                    {slots.map((slot, i) => (
                        <DraftSlot
                            key={`${slot.type}-${slot.order}`}
                            entry={slot}
                            type={type}
                            active={active && i === activeIdx}
                            timeRemaining={active && i === activeIdx
                                ? (timeRemaining ?? bonusTime ?? 0)
                                : undefined}
                            teamLogoUrl={teamLogoUrl}
                        />
                    ))}
                </div>
            </div>
            {!showPlayersTop && namesRow}
        </>
    );
};

export default TeamRow;
export const TeamBaner = () => null;
export const TeamPicker = TeamRow;