import { Dota2 } from "dotagsi";
import React from "react";
import { Match } from "../../api/interfaces";
import TeamPicker from "../Picker/Picker";

import "./../Picker/player.scss";
import TeamInfo from "../Picker/TeamInfo";
import Statistics from "../GameHUD/ObservedStatistics";
import TopSideBar from "../GameHUD/TopSideBar";
import Scoreboard, { stringToClock } from "../Scoreboard/Scoreboard";
import CameraContainer from "../Camera/Container";

import ObservedPlayer from "../GameHUD/Game";
import { actions, configs } from "../../App";

interface Props {
    game: Dota2;
    match: Match | null;
}

interface State {
    view: "draft" | "game" | "scoreboard" | null;
    text: string;
}

export default class Layout extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            view: null,
            text: "",
        };
    }

    componentDidMount() {
        actions.on("viewType", (data: any) => {
            this.setState({ view: data });
        });

        const handleViewType = (type: string) => {
            actions.on(type, () => {
                this.setState({
                    view: type === this.state.view ? null : (type as any),
                });
            });
        };
        handleViewType("scoreboard");
        handleViewType("game");
        handleViewType("draft");

        const configHandler = (data: any) => {
            if (!data || !data.view) return;
            this.setState({ text: data.view.info_box });
        };
        if (configs.data) {
            configHandler(configs.data);
        }
        configs.onChange(configHandler);
    }

    render() {
        const { game, match } = this.props;

        const state = game.map.game_state;

        let view = this.state.view;

        if (!view) {
            switch (state) {
                case "DOTA_GAMERULES_STATE_HERO_SELECTION":
                case "DOTA_GAMERULES_STATE_STRATEGY_TIME":
                case "DOTA_GAMERULES_STATE_TEAM_SHOWCASE":
                case "DOTA_GAMERULES_STATE_PRE_GAME":
                    view = "draft";
                    break;
                case "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS":
                    view = "game";
                    break;
                case "DOTA_GAMERULES_STATE_POST_GAME":
                    view = "scoreboard";
                    break;
                default:
                    break;
            }
        }

        let activeTeamBonusTime = 0;
        if (game.draft.activeteam !== undefined) {
            if (game.draft.activeteam === 2 && game.draft.radiant) {
                activeTeamBonusTime = game.draft.radiant.bonus_time;
            } else if (game.draft.activeteam === 3 && game.draft.dire) {
                activeTeamBonusTime = game.draft.dire.bonus_time;
            }
        }

        // ─── ID команд из матча (из БД) ───────────────────────────────────────
        // radiant = left, dire = right
        const radiantTeamId = match?.left?.id ?? null;
        const direTeamId = match?.right?.id ?? null;

        const observedTeamId =
            game.player?.team_name === "radiant"
                ? radiantTeamId
                : game.player?.team_name === "dire"
                    ? direTeamId
                    : null;

        const showGame = view === "game";
        console.log('🎥 game.player steamid:', game.player?.steamid);
        console.log('🎥 game.player accountid:', (game.player as any)?.accountid);

        return (
            <>
                <div className="layout">
                    <div className={`draft-screen-container ${view === "draft" ? "" : "hide"}`}>
                        <div className="draft-container">
                            <TeamPicker
                                draft={game.draft.radiant}
                                type={"radiant"}
                                active={game.draft.activeteam === 2}
                            />
                            <div className="tournament_info">
                                <div className="bo shadowed-text">
                                    {(match && match.matchType) || "BO2"}
                                </div>
                                <div className="picker_and_logo">
                                    <div className={`side_pick left ${game.draft.activeteam === 2 ? "active" : ""}`}></div>
                                    <div className={`side_pick right ${game.draft.activeteam === 3 ? "active" : ""}`}></div>
                                </div>
                            </div>
                            <TeamPicker
                                draft={game.draft.dire}
                                type={"dire"}
                                active={game.draft.activeteam === 3}
                            />
                        </div>
                        <div className="team_info_container s shadowed-text">
                            <TeamInfo
                                draft={game.draft}
                                team={game.map.radiant}
                                type={"radiant"}
                                players={game.players.filter((p) => p.team_name === "radiant")}
                            />
                            <div className="timer">
                                <div className="label shadowed-text">
                                    {game.draft.activeteam_time_remaining ? "Pick time" : "Bonus time"}
                                </div>
                                <div className="timer-time shadowed-text">
                                    {stringToClock(
                                        game.draft.activeteam_time_remaining || activeTeamBonusTime
                                    )}
                                </div>
                            </div>
                            <TeamInfo
                                draft={game.draft}
                                team={game.map.dire}
                                type={"dire"}
                                players={game.players.filter((p) => p.team_name === "dire")}
                            />
                        </div>
                    </div>

                    <Scoreboard
                        players={game.players}
                        map={game.map}
                        match={match}
                        show={view === "scoreboard"}
                    />
                </div>

                {/* Statistics рендерит TopSideBar для radiant внутри себя */}
                <Statistics
                    player={game.player}
                    type="radiant"
                    team={game.map.radiant}
                    teamId={radiantTeamId}
                    show={showGame}
                />

                {/* TopSideBar для dire */}
                <TopSideBar
                    type="dire"
                    team={game.map.dire}
                    teamId={direTeamId}
                    show={showGame}
                >
                    <span>{this.state.text}</span>
                </TopSideBar>

                {/* Наблюдаемый игрок */}
                <ObservedPlayer
                    players={game.players}
                    show={showGame}
                    player={game.player}
                    team={
                        game.player?.team_name === "radiant"
                            ? game.map.radiant
                            : game.map.dire
                    }
                    teamId={observedTeamId}
                    showCam={showGame}
                />

                {/* Глобальный менеджер камер — рендерит все стримы через портал */}
                <CameraContainer
                    observedSteamid={game.player?.steamid ?? null}
                    showCam={showGame}
                />
            </>
        );
    }
}