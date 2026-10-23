import React from 'react';
import { Faction, Team, Player } from 'dotagsi';
import TopSideBar from './TopSideBar';

const Statistics = ({ player, type, team, teamId, show }: { player: Player | null, type: Faction, team: Team, teamId: string | null, show: boolean}) => {
    return (
        <TopSideBar type={type} team={team} teamId={teamId} show={show}>
            <></>
        </TopSideBar>
    );
};

export default Statistics;
