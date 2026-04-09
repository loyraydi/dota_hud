import React from 'react';
import { Draft, DraftEntry, Faction, TeamDraft } from 'dotagsi';
import Snow from "./snowflake.png";
import { getAssetURL } from '../../api/api';
const PlayerPick = ({ entry, type, active }: { entry: DraftEntry, type: Faction, active: boolean }) => {
    const order = entry.order + 1;
    let text = '';
    
    if (active) {
        text = 'PICK';
    }
    
    return <div className={`player_draft ${type} ${active ? 'active' : ''}`}>
        <div className="player_preview">
            {entry.class ? (
                <>
                    <div 
                        className="background-imgs" 
                        style={{
                            backgroundImage: `url('${getAssetURL(entry.class, "heroes")}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </>
            ) : (
                <div className="background-imgs" />
            )}
        </div>
        <div className={`draft_status ${active ? 'active' : ''} ${!text && !active ? 'hidden' : ''}`}>
            {text}
        </div>
    </div>
}

export const PlayerBan = ({ entry, type, active }: { entry: DraftEntry, type: Faction, active: boolean }) => {
    const order = entry.order + 1;

    if (!entry.class) {

        return <div className={`player_ban ${type} ${active ? 'active' : ''}`}>
            <div className="player_preview" style={{backgroundColor:'#0E0018'}}>
            </div>
        </div>
    }

    return <div className={`player_ban ${entry.order} ${type} ${active ? 'active' : ''}`}>
        <div className="player_preview">
            <img src={getAssetURL(entry.class, "heroes")} />
        </div>
    </div>
}

export default PlayerPick;
