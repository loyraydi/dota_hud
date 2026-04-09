import React from 'react';
import { Draft, Faction, TeamDraft } from 'dotagsi';
import PlayerPick, { PlayerBan } from './Pick';

const TeamPicker = ({ draft, type, active }: { draft?: TeamDraft, type: Faction, active: boolean }) => {
    if (!draft) {
        return <div className="team_draft">
            <div className={`players_draft ${type}`}>
                {/* Empty slots */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`player_draft ${type}`}>
                        <div className="player_preview">
                            <div className="background-imgs" />
                        </div>
                        <div className="draft_status hidden" />
                    </div>
                ))}
            </div>
        </div>
    }
    const picks = draft.picks.filter(pick => pick.type === 'pick').sort((a, b) => a.order - b.order);
    const smallestNotPickedOrder = Math.min(...picks.filter(entry => !entry.class).map(entry => entry.order));
    return <div className="team_draft">
        <div className={`players_draft ${type}`}>
            {
                picks.map((pick, idx) => <PlayerPick key={idx} entry={pick} type={type} active={active && smallestNotPickedOrder === pick.order} />)
            }
        </div>
    </div>
}

export const TeamBaner = ({ draft, type, active }: { draft?: TeamDraft, type: Faction, active: boolean }) => {
    if (!draft) {
        return <div className={`team_draft_ban ${type}`}>
            <div className={`players_draft_ban ${type}`}>
                {/* Empty ban slots */}
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="player_ban">
                        <div className="player_preview" />
                    </div>
                ))}
            </div>
        </div>
    }
    const picks = draft.picks.filter(pick => pick.type === 'ban').sort((a, b) => a.order - b.order);
    const smallestNotPickedOrder = Math.min(...picks.filter(entry => !entry.class).map(entry => entry.order));
    return <div className={`team_draft_ban ${type}`}>
        <div className={`players_draft_ban ${type}`}>
            {
                picks.map((pick, idx) => <PlayerBan key={idx} entry={pick} type={type} active={active && smallestNotPickedOrder === pick.order} />)
            }
        </div>
    </div>
}

export default TeamPicker;
