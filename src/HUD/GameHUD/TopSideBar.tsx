import React from 'react';
import { Faction, Team, Player } from 'dotagsi';
import { apiUrl, getAssetURL } from '../../api/api';

interface HeroStats {
    hero: string;
    level: number;
    gold: number;
    health: number;
    mana: number;
    buyback: boolean;
}

const TopSideBar = ({
                        children,
                        type,
                        team,
                        teamId,
                        show,
                        teamName,
                        score,
                        players,
                    }: {
    children: any;
    type: Faction;
    team: Team;
    teamId: string | null;
    show: boolean;
    teamName?: string;
    score?: number;
    players?: Player[];
}) => {
    // Получаем игроков команды
    const teamPlayers = (players || []).filter(p => p.team_name === type).slice(0, 5);

    return (
        <div className={`top_side_bar ${type === 'radiant' ? 'left' : 'right'} ${!show ? 'hide' : ''}`}>
            <div className="team_header">
                <div className={`team_header_bg ${type}`}></div>
                <div className="team_name_section">
                    <span className="team_name">{teamName || team.name || (type === 'radiant' ? 'RADIANT' : 'DIRE')}</span>
                    <span className="team_mode">M/H</span>
                </div>
                
                <div className="heroes_bar">
                    {teamPlayers.map((player, idx) => (
                        <div key={idx} className="hero_item">
                            <div 
                                className="hero_portrait"
                                style={{
                                    backgroundImage: player.hero?.name 
                                        ? `url('${getAssetURL(player.hero.name, 'heroes_icons')}')` 
                                        : 'none'
                                }}
                            />
                            <div className="hero_stats">
                                <div className="stat_row">
                                    <div className="stat_box gold">
                                        <span className="stat_icon">💰</span>
                                        <span>{player.gold_reliable + player.gold_unreliable || 0}</span>
                                    </div>
                                    <div className="stat_box health">
                                        <span className="stat_icon">❤</span>
                                        <span>{player.health || 0}</span>
                                    </div>
                                    {player.buyback_cost > 0 && (
                                        <div className="stat_box buyback">
                                            <span>BUYBACK</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="team_score">
                    {score !== undefined ? score : team.score || 0}
                </div>
            </div>
        </div>
    );
};

export default TopSideBar;
