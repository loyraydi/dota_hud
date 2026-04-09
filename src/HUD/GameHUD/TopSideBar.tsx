import React from 'react';
import { Faction, Team } from 'dotagsi';
import { apiUrl } from '../../api/api';

const TopSideBar = ({
                        children,
                        type,
                        team,
                        teamId,
                        show,
                    }: {
    children: any;
    type: Faction;
    team: Team;
    teamId: string | null;
    show: boolean;
}) => {
    return (
        <div className={`top_side_bar ${type === 'radiant' ? 'left' : 'right'} ${!show ? 'hide' : ''}`}>
            {type === 'radiant' ? (
                <div className="logo_and_type">
                    <div className={`type_color ${type}`}></div>
                    {teamId && (
                        <img
                            src={`${apiUrl}api/teams/logo/${teamId}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                </div>
            ) : null}
            {children}
            {type === 'dire' ? (
                <div className="logo_and_type">
                    <div className={`type_color ${type}`}></div>
                    {teamId && (
                        <img
                            src={`${apiUrl}api/teams/logo/${teamId}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default TopSideBar;