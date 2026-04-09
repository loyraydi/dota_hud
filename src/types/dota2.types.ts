/**
 * Dota 2 Game State Integration — raw payload types
 * Based on the official Dota 2 GSI documentation.
 */

export interface Dota2Provider {
  name: string;
  appid: number;
  version: number;
  timestamp: number;
}

export interface Dota2Map {
  name: string;
  matchid: string;
  game_time: number;
  clock_time: number;
  daytime: boolean;
  nightstalker_night: boolean;
  game_state:
    | "DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD"
    | "DOTA_GAMERULES_STATE_HERO_SELECTION"
    | "DOTA_GAMERULES_STATE_PRE_GAME"
    | "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS"
    | "DOTA_GAMERULES_STATE_POST_GAME"
    | string;
  paused: boolean;
  win_team: "none" | "radiant" | "dire";
  customgamename: string;
  radiant_ward_purchase_cooldown: number;
  dire_ward_purchase_cooldown: number;
  roshan_state: string;
  roshan_state_end_seconds: number;
  radiant_win_chance?: number;
}

export interface Dota2Player {
  steamid: string;
  accountid: string;
  name: string;
  activity: "playing" | "menu" | string;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  kill_streak: number;
  commands_issued: number;
  kill_list: Record<string, number>;
  team_name: "radiant" | "dire" | string;
  gold: number;
  gold_reliable: number;
  gold_unreliable: number;
  gold_from_hero_kills: number;
  gold_from_creep_kills: number;
  gold_from_income: number;
  gold_from_shared: number;
  gpm: number;
  xpm: number;
}

export interface Dota2HeroAbility {
  level: number;
  can_cast: boolean;
  passive: boolean;
  ability_active: boolean;
  cooldown: number;
  ultimate: boolean;
  charges?: number;
  max_charges?: number;
  charge_cooldown?: number;
}

export interface Dota2Hero {
  xpos: number;
  ypos: number;
  id: number;
  name: string;
  level: number;
  xp: number;
  alive: boolean;
  respawn_seconds: number;
  buyback_cost: number;
  buyback_cooldown: number;
  health: number;
  max_health: number;
  health_percent: number;
  mana: number;
  max_mana: number;
  mana_percent: number;
  silenced: boolean;
  stunned: boolean;
  disarmed: boolean;
  magicimmune: boolean;
  hexed: boolean;
  muted: boolean;
  break: boolean;
  aghanims_scepter: boolean;
  aghanims_shard: boolean;
  smoked: boolean;
  has_debuff: boolean;
  talent_1: boolean;
  talent_2: boolean;
  talent_3: boolean;
  talent_4: boolean;
  talent_5: boolean;
  talent_6: boolean;
  talent_7: boolean;
  talent_8: boolean;
  attributes_level: number;
  abilities: Record<string, Dota2HeroAbility>;
}

export interface Dota2Item {
  name: string;
  purchaser: number;
  item_level: number;
  passive: boolean;
  can_cast: boolean;
  cooldown: number;
  charges: number;
}

export interface Dota2Items {
  slot0: Dota2Item;
  slot1: Dota2Item;
  slot2: Dota2Item;
  slot3: Dota2Item;
  slot4: Dota2Item;
  slot5: Dota2Item;
  slot6?: Dota2Item;
  slot7?: Dota2Item;
  slot8?: Dota2Item;
  stash0?: Dota2Item;
  stash1?: Dota2Item;
  stash2?: Dota2Item;
  stash3?: Dota2Item;
  stash4?: Dota2Item;
  stash5?: Dota2Item;
  teleport0?: Dota2Item;
  neutral0?: Dota2Item;
}

export interface Dota2TeamDetails {
  score: number;
  tower_state: number;
  barracks_state: number;
}

export interface Dota2AllPlayerEntry {
  steamid: string;
  name: string;
  activity: string;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  gold: number;
  gold_reliable: number;
  gold_unreliable: number;
  gpm: number;
  xpm: number;
  net_worth: number;
  hero_id: number;
  hero_name: string;
  level: number;
  health: number;
  max_health: number;
  health_percent: number;
  mana: number;
  max_mana: number;
  mana_percent: number;
  ultimate_state: string;
  ultimate_cooldown: number;
  item0?: string;
  item1?: string;
  item2?: string;
  item3?: string;
  item4?: string;
  item5?: string;
  respawn_seconds: number;
  buyback_cost: number;
  buyback_cooldown: number;
  team_name: "radiant" | "dire" | string;
  player_slot: number;
  team_slot: number;
  alive: boolean;
  aghanims_scepter: boolean;
  aghanims_shard: boolean;
}

export interface Dota2NeutralsEntry {
  neutral0: Dota2Item;
}

export interface Dota2Draft {
  activeteam: number;
  pick: boolean;
  activeteam_time_remaining: number;
  radiant_bonus_time: number;
  dire_bonus_time: number;
  team2: Record<string, { id: number; class: string; is_pick: boolean; order: number }>;
  team3: Record<string, { id: number; class: string; is_pick: boolean; order: number }>;
}

export interface Dota2Wearable {
  style?: number;
}

export interface Dota2RawPayload {
  provider?: Dota2Provider;
  map?: Dota2Map;
  player?: Dota2Player;
  hero?: Dota2Hero;
  abilities?: Record<string, Dota2HeroAbility>;
  items?: Dota2Items;
  previously?: Partial<Dota2RawPayload>;
  allplayers?: Record<string, Dota2AllPlayerEntry>;
  team2?: Dota2TeamDetails;
  team3?: Dota2TeamDetails;
  draft?: Dota2Draft;
  neutralitems?: Record<string, unknown>;
  wearables?: Record<string, Dota2Wearable>;
}
