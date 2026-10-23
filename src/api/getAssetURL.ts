export const getAssetURL = (
    asset: string | null | undefined,
    assetType:
        | "heroes_animated"
        | "heroes_icons"
        | "heroes"
        | "items"
        | "draft_animated"
        | "abilities"
        | "runes"
        | "facets"
): string => {
    if (!asset) return "";

    const base = "./assets/dota2";

    switch (assetType) {
        case "heroes_icons":
            return `${base}/heroes/icons/${asset.replace("npc_dota_hero_", "")}.webp`;
        case "heroes_animated":
            return `${base}/heroes/animated/${asset.startsWith("npc_dota_hero_") ? asset : `npc_dota_hero_${asset}`}.webm`;
        case "draft_animated":
            return `${base}/heroes/animated_draft/${asset.startsWith("npc_dota_hero_") ? asset : `npc_dota_hero_${asset}`}.webm`;
        case "heroes":
            return `${base}/heroes/${asset.replace("npc_dota_hero_", "")}.webp`;
        case "items":
            return `${base}/items/${asset.replace(/^item_/, "")}.webp`;
        case "abilities":
            return `${base}/abilities/${asset}.webp`;
        case "runes":
            return `${base}/runes/${asset}.webp`;
        case "facets":
            return `${base}/facets/${asset}.png`;
        default:
            return "";
    }
};