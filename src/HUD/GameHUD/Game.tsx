import React, { useRef, useEffect, useState } from 'react';
import { Team, Player } from 'dotagsi';
import { apiUrl } from '../../api/api';
import { Avatar } from '../Players/Avatar';
import CameraContainer from '../Camera/Container';

const SILHOUETTE = './player_silhouette.webp';

// Известные иннейт-способности (добавлены в патче 7.36)
// Они не занимают кнопку в баре способностей
const INNATE_ABILITIES = new Set([
    'abaddon_borrowed_time_innate', 'alchemist_greed', 'ancient_apparition_cold_feet_innate',
    'antimage_spell_shield', 'arc_warden_tempest_double_innate', 'axe_coat_of_blood',
    'bane_nightmare_innate', 'batrider_sticky_napalm_innate', 'beastmaster_call_of_the_wild_innate',
    'bloodseeker_thirst', 'bounty_hunter_jinada_innate', 'brewmaster_drunken_brawler',
    'bristleback_bristleback', 'broodmother_spawn_spiderlings_innate', 'centaur_return',
    'chaos_knight_chaos_strike', 'chen_penitence_innate', 'clinkz_burning_army_innate',
    'crystal_maiden_brilliance_aura', 'dark_seer_ion_shell_innate', 'dark_willow_bramble_maze_innate',
    'dawnbreaker_solar_guardian_innate', 'dazzle_shadow_wave_innate', 'death_prophet_exorcism_innate',
    'disruptor_thunder_strike_innate', 'doom_bringer_devour', 'dragon_knight_dragon_blood',
    'drow_ranger_precision_aura', 'earth_spirit_geomagnetic_grip_innate', 'earthshaker_aftershock',
    'elder_titan_natural_order', 'ember_spirit_flame_guard_innate', 'enchantress_enchant_innate',
    'enigma_eidolons', 'faceless_void_time_walk_innate', 'grimstroke_phantom_ink_innate',
    'gyrocopter_flak_cannon_innate', 'huskar_burning_spear_innate', 'invoker_exort',
    'jakiro_dual_breath_innate', 'juggernaut_blade_dance', 'keeper_of_the_light_blinding_light_innate',
    'kunkka_tidebringer', 'legion_commander_duel_innate', 'leshrac_pulse_nova_innate',
    'lich_frost_nova_innate', 'lifestealer_open_wounds_innate', 'lina_fiery_soul',
    'lion_to_hell_and_back', 'lone_druid_spirit_bear_innate', 'luna_lunar_blessing',
    'lycan_shapeshift_innate', 'magnus_empower_innate', 'mars_gods_rebuke_innate',
    'medusa_mana_shield', 'meepo_divided_we_stand_innate', 'mirana_moonlight_shadow_innate',
    'monkey_king_tree_dance_innate', 'morphling_adaptive_strike_agi_innate', 'naga_siren_song_of_the_siren_innate',
    'night_stalker_hunter_in_the_night', 'nyx_assassin_spiked_carapace_innate', 'ogre_magi_multicast',
    'omniknight_purification_innate', 'oracle_fortune_s_end_innate', 'outworld_devourer_arcane_orb_innate',
    'pangolier_swashbuckle_innate', 'phantom_assassin_coup_de_grace', 'phantom_lancer_doppelwalk_innate',
    'phoenix_sun_ray_innate', 'puck_illusory_orb_innate', 'pudge_flesh_heap',
    'pugna_nether_blast_innate', 'queenofpain_blink_innate', 'razor_static_link_innate',
    'riki_smoke_screen_innate', 'rubick_null_field', 'sand_king_burrowstrike_innate',
    'shadow_demon_shadow_poison_innate', 'shadow_fiend_necromastery', 'shadow_shaman_ether_shock_innate',
    'silencer_curse_of_the_silent', 'skywrath_mage_arcane_bolt_innate', 'slardar_seaborn_sentinel',
    'slark_essence_shift', 'snapfire_scatterblast_innate', 'sniper_shrapnel_innate',
    'spectre_desolate', 'spirit_breaker_charge_of_darkness_innate', 'storm_spirit_galvanized',
    'sven_warcry_innate', 'techies_land_mines_innate', 'templar_assassin_psi_blades',
    'terrorblade_metamorphosis_innate', 'tidehunter_kraken_shell', 'timbersaw_reactive_armor',
    'tinker_march_of_the_machines_innate', 'tiny_grow_innate', 'treant_protector_living_armor_innate',
    'troll_warlord_fervor', 'tusk_walrus_punch_innate', 'underlord_atrophy_aura',
    'undying_decay_innate', 'ursa_fury_swipes', 'vengefulspirit_vengeance_aura',
    'venomancer_venomous_gale_innate', 'viper_corrosive_skin', 'visage_gravekeepers_cloak',
    'void_spirit_resonant_pulse_innate', 'warlock_fatal_bonds_innate', 'weaver_the_swarm_innate',
    'windranger_windrun_innate', 'winter_wyvern_arctic_burn_innate', 'witch_doctor_voodoo_restoration_innate',
    'wraithking_mortal_strike', 'zeus_static_field',
]);

const CAM_WIDTH = 205;
// Центр плашки камеры: слева от нижней центральной панели доты (она центрирована),
// поэтому от центра сцены, а не от левого края. На 1920 = прежние 399px.
const CAM_LEFT  = 'calc(50% - 561px)';

const MarqueeText = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const innerRef = useRef<HTMLSpanElement>(null);
    const [overflow, setOverflow] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        const inner = innerRef.current;
        if (!container || !inner) return;
        const check = () => setOverflow(inner.offsetWidth > container.offsetWidth + 1);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(container);
        return () => ro.disconnect();
    }, [text]);

    return (
        <span className="player_info_name" ref={containerRef}>
            {/* key={text}: прокрутка (2 круга, см. gamehud.scss) перезапускается на смене игрока */}
            <span key={text} className={overflow ? 'marquee_inner running' : 'marquee_inner'} ref={innerRef}>
                {text}
                {overflow && <>&nbsp;&nbsp;&nbsp;&nbsp;{text}</>}
            </span>
        </span>
    );
};

const ObservedPlayer = ({
    players,
    player,
    team,
    teamId,
    show,
}: {
    show: boolean;
    player: Player | null;
    players: Player[];
    team: Team | null;
    teamId: string | null;
}) => {
    // Контейнер под видео камеры: передаём узел напрямую (раньше CameraContainer искал
    // .obs_cam_video через MutationObserver на всём body — на каждый тик GSI)
    const [camTarget, setCamTarget] = useState<HTMLDivElement | null>(null);

    if (!player) return null;

    return (
        <div className={`player_container ${player.team_name} ${!show ? 'hide' : ''}`}
             style={{ width: CAM_WIDTH, left: CAM_LEFT }}>
            <div className={`player_info ${player.team_name}`}>
                {teamId && (
                    <img
                        className="player_info_logo"
                        src={`${apiUrl}api/teams/logo/${teamId}`}
                        alt=""
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                )}
                <MarqueeText text={player.name} />
            </div>
            <div className="player_picture" style={{ width: CAM_WIDTH }}>
                <Avatar player={player} teamId={teamId} fallback={SILHOUETTE} />
                <div className="obs_cam_video" ref={setCamTarget} style={{ position: 'absolute', inset: 0, zIndex: 2 }} />
                <CameraContainer observedSteamid={player.steamid} showCam={show} target={camTarget} />
            </div>
        </div>
    );
};

// Рендер зависит только от этих полей; объект player новый на каждом тике GSI
export default React.memo(ObservedPlayer, (a, b) =>
    a.show === b.show &&
    a.teamId === b.teamId &&
    a.player?.steamid === b.player?.steamid &&
    a.player?.name === b.player?.name &&
    a.player?.team_name === b.player?.team_name
);
