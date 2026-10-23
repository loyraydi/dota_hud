import { Dota2 } from "dotagsi";
import React from "react";
import { Match } from "../../api/interfaces";

import "./../Picker/player.scss";
import TeamInfo from "../Picker/TeamInfo";
import DraftPhaseBar from "../Picker/DraftPhaseBar";
import TopSideBar from "../GameHUD/TopSideBar";
import BuybackBar from "../GameHUD/BuybackBar";
import KeyItemsBar from "../GameHUD/KeyItemsBar";
import UltSideBar from "../GameHUD/UltSideBar";
import RoshanNotify from "../GameHUD/RoshanNotify";
import CourierBar from "../GameHUD/CourierBar";
import KillList from "../GameHUD/KillList";
import Scoreboard from "../Scoreboard/Scoreboard";
import Comparison from "../Comparison/Comparison";
import StatBars, { STAT_CONFIGS } from "../Comparison/StatBars";
import ObservedPlayer from "../GameHUD/Game";
import { actions, configs } from "../../api/services";
import Presence from "../Presence";

interface Props { game: Dota2; match: Match | null; }
interface State {
    view: 'draft' | 'game' | 'scoreboard' | null;
    showComparison: boolean;
    activeStat: string | null;
    showRoshan: boolean;
    sidesSwapped: boolean;
    text: string;
    /** Команда которая сделала первый бан — определяется один раз и сохраняется */
    firstPickTeam: 'radiant' | 'dire' | '';
}

export default class Layout extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { view: null, showComparison: false, activeStat: null, showRoshan: false, sidesSwapped: false, text: '', firstPickTeam: '' };
    }

    // Текущий вид — на <html data-hud-view>: по нему спонсор-блок встаёт в своё место
    // (драфт — справа от пиков, игра — между предметами и магазином), без перерисовки.
    private lastView: State['view'] = null;
    private syncViewAttr() {
        const v = this.lastView ?? '';
        if (document.documentElement.dataset.hudView !== v) document.documentElement.dataset.hudView = v;
    }

    componentDidMount() {
        this.syncViewAttr();
        actions.on('viewType', (data: any) => this.setState({ view: data }));
        ['scoreboard', 'game', 'draft'].forEach(type => {
            actions.on(type, () => this.setState({ view: type === this.state.view ? null : type as any }));
        });
        actions.on('comparison', () => this.setState(s => ({ showComparison: !s.showComparison })));
        actions.on('roshan', () => this.setState(s => ({ showRoshan: !s.showRoshan })));
        actions.on('swapSides', () => this.setState(s => ({ sidesSwapped: !s.sidesSwapped })));
        // Каждая стат-панель — свой бинд, тогглится независимо
        STAT_CONFIGS.forEach(cfg => {
            actions.on(cfg.key, () => this.setState(s => ({ activeStat: s.activeStat === cfg.key ? null : cfg.key })));
        });
        const configHandler = (data: any) => {
            if (data?.view) this.setState({ text: data.view.info_box });
        };
        if (configs.data) configHandler(configs.data);
        configs.onChange(configHandler);
    }

    componentDidUpdate() {
        this.syncViewAttr();
        const { draft } = this.props.game;
        const { firstPickTeam } = this.state;

        if (firstPickTeam !== '') return; // уже определили, не меняем

        const radiantBan0 = draft.radiant?.picks.find(p => p.type === 'ban' && p.order === 0)?.class ?? '';
        const direBan0    = draft.dire?.picks.find(p => p.type === 'ban' && p.order === 0)?.class ?? '';

        // Метод 1: один уже забанил, другой нет — надёжный способ
        if (radiantBan0 !== '' && direBan0 === '') {
            this.setState({ firstPickTeam: 'radiant' });
            return;
        }
        if (direBan0 !== '' && radiantBan0 === '') {
            this.setState({ firstPickTeam: 'dire' });
            return;
        }

        // Метод 2: оба ещё не банили — смотрим кто сейчас активен
        // activeteam в самом начале = кто ходит первым
        if (radiantBan0 === '' && direBan0 === '' && draft.activeteam !== undefined) {
            const allEmpty = [
                ...(draft.radiant?.picks ?? []),
                ...(draft.dire?.picks ?? []),
            ].every(p => !p.class);

            if (allEmpty) {
                if (draft.activeteam === 2) this.setState({ firstPickTeam: 'radiant' });
                if (draft.activeteam === 3) this.setState({ firstPickTeam: 'dire' });
            }
        }
    }

    render() {
        const { game, match } = this.props;
        const { firstPickTeam } = this.state;
        let view = this.state.view;

        if (!view) {
            switch (game.map.game_state) {
                case "DOTA_GAMERULES_STATE_HERO_SELECTION":
                case "DOTA_GAMERULES_STATE_STRATEGY_TIME":
                case "DOTA_GAMERULES_STATE_TEAM_SHOWCASE":
                case "DOTA_GAMERULES_STATE_PRE_GAME":
                    view = 'draft'; break;
                case "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS":
                    view = "game"; break;
                case "DOTA_GAMERULES_STATE_POST_GAME":
                    view = "scoreboard"; break;
            }
        }
        this.lastView = view;

        const { draft } = game;
        const isRadiantActive = draft.activeteam === 2;
        const isDireActive    = draft.activeteam === 3;

        const radiantTime = isRadiantActive ? (draft.activeteam_time_remaining ?? 0) : undefined;
        const direTime    = isDireActive    ? (draft.activeteam_time_remaining ?? 0) : undefined;
        const radiantBonus = draft.radiant?.bonus_time;
        const direBonus    = draft.dire?.bonus_time;

        // Свитч сторон: свопаем, какая настроенная команда (left/right) = radiant/dire.
        // Флаг из матча (клиент) ИЛИ ручной тогл в HUD (экшен swapSides / бинд).
        const swapped = (!!(match as any)?.reverseSide) !== this.state.sidesSwapped;
        const radiantTeamId = (swapped ? match?.right?.id : match?.left?.id)  ?? null;
        const direTeamId    = (swapped ? match?.left?.id  : match?.right?.id) ?? null;

        const observedHeroName = game.player?.hero?.name;
        const observedPlayer = observedHeroName
            ? (game.players.find(p => p.hero?.name === observedHeroName) ?? game.player)
            : game.player;
        const observedTeam = observedPlayer
            ? (observedPlayer.team_name === "radiant" ? game.map.radiant : game.map.dire)
            : null;
        const observedTeamId = observedPlayer?.team_name === 'radiant' ? radiantTeamId : direTeamId;

        return (
            <>
                <div className="layout">
                    {/* Скрытые панели не держим в DOM (см. Presence): иначе видео драфта и
                        анимации баров крутятся весь матч и отъедают FPS у игры */}
                    <Presence show={view === 'draft'}>{(visible) => (
                    <div className={`draft-screen-container ${visible ? '' : 'hide'}`}>
                        <div className="draft-rows-container">
                            <TeamInfo
                                draft={draft}
                                team={game.map.radiant}
                                type="radiant"
                                players={game.players.filter(p => p.team_name === 'radiant')}
                                match={match}
                                teamId={radiantTeamId}
                                active={isRadiantActive}
                                timeRemaining={radiantTime}
                                bonusTime={radiantBonus}
                                firstPickTeam={firstPickTeam}
                            />
                            <div className="draft_divider">
                                <span className="draft_bo_label">
                                    {(match && match.matchType) || 'BEST OF 3'}
                                </span>
                            </div>
                            <DraftPhaseBar
                                radiantDraft={draft.radiant}
                                direDraft={draft.dire}
                                activeTeam={draft.activeteam}
                                firstPickTeam={firstPickTeam}
                            />
                            <TeamInfo
                                draft={draft}
                                team={game.map.dire}
                                type="dire"
                                players={game.players.filter(p => p.team_name === 'dire')}
                                match={match}
                                teamId={direTeamId}
                                active={isDireActive}
                                timeRemaining={direTime}
                                bonusTime={direBonus}
                                firstPickTeam={firstPickTeam}
                            />
                        </div>
                    </div>
                    )}</Presence>
                    <Presence show={view === 'scoreboard'} hideMs={500}>{(visible) => (
                        <Scoreboard players={game.players} map={game.map} match={match} show={visible} reverseSide={swapped} />
                    )}</Presence>
                <Presence show={this.state.showComparison} hideMs={500}>{(visible) => (
                    <Comparison
                        players={game.players}
                        show={visible}
                        observedPlayer={observedPlayer ?? null}
                        leftTeamId={direTeamId}
                        rightTeamId={radiantTeamId}
                    />
                )}</Presence>
                {STAT_CONFIGS.map(cfg => (
                    <Presence key={cfg.key} show={this.state.activeStat === cfg.key} hideMs={450}>{(visible) => (
                        <StatBars
                            players={game.players}
                            show={visible}
                            cfg={cfg}
                        />
                    )}</Presence>
                ))}
                </div>

                <TopSideBar type="radiant" team={game.map.radiant} teamId={radiantTeamId} show={view === 'game'} />
                <TopSideBar type="dire" team={game.map.dire} teamId={direTeamId} show={view === 'game'} info={this.state.text} />
                <UltSideBar players={game.players} show={view === 'game'} />
                <RoshanNotify roshan={game.roshan} map={game.map} show={this.state.showRoshan} />
                <CourierBar player={observedPlayer ?? null} show={view === 'game'} />
                <KillList player={observedPlayer ?? null} players={game.players} show={view === 'game'} />
                <BuybackBar players={game.players} show={view === 'game'} clockTime={(game.map as any).clock_time ?? 0} />
                <KeyItemsBar players={game.players} show={view === 'game'} />
                <ObservedPlayer
                    players={game.players} show={view === 'game'}
                    player={observedPlayer} team={observedTeam} teamId={observedTeamId}
                />
            </>
        );
    }
}