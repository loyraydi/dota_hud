export interface NeutralCharm {
    title: string;
    icon: string;  // enhancement_*.webp in items folder
}

// item_level 1 = first charm, item_level 2 = second charm
const neutralItemCharms: Record<string, [NeutralCharm, NeutralCharm]> = {
    // ─── TIER 1 ───────────────────────────────────────────────────────────────
    item_broom_handle:   [{ title: 'NIMBLE',      icon: 'enhancement_nimble'       }, { title: 'FLEETFOOTED', icon: 'enhancement_fleetfooted' }],
    item_chipped_vest:   [{ title: 'TOUGH',       icon: 'enhancement_tough'        }, { title: 'RESTORATIVE', icon: 'enhancement_restorative' }],
    item_faded_broach:   [{ title: 'WISE',        icon: 'enhancement_wise'         }, { title: 'MYSTICAL',    icon: 'enhancement_mystical'    }],
    item_iron_talon:     [{ title: 'FIERCE',      icon: 'enhancement_fierce'       }, { title: 'TOUGH',       icon: 'enhancement_tough'       }],
    item_ocean_heart:    [{ title: 'VITAL',       icon: 'enhancement_vital'        }, { title: 'MYSTICAL',    icon: 'enhancement_mystical'    }],
    item_occult_bracelet:[{ title: 'VITAL',       icon: 'enhancement_vital'        }, { title: 'WISE',        icon: 'enhancement_wise'        }],
    item_spark_of_courage:[{ title: 'HULKING',   icon: 'enhancement_hulking'      }, { title: 'AUDACIOUS',   icon: 'enhancement_audacious'   }],
    item_safety_bubble:  [{ title: 'VAST',        icon: 'enhancement_vast'         }, { title: 'VITAL',       icon: 'enhancement_vital'       }],
    item_royal_jelly:    [{ title: 'RESTORATIVE', icon: 'enhancement_restorative'  }, { title: 'VITAL',       icon: 'enhancement_vital'       }],
    item_possessed_mask: [{ title: 'VAMPIRIC',    icon: 'enhancement_vampiric'     }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
    item_ironwood_tree:  [{ title: 'TOUGH',       icon: 'enhancement_tough'        }, { title: 'HULKING',     icon: 'enhancement_hulking'     }],
    item_leather_ball:   [{ title: 'FLEETFOOTED', icon: 'enhancement_fleetfooted'  }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],

    // ─── TIER 2 ───────────────────────────────────────────────────────────────
    item_ring_of_aquila: [{ title: 'MYSTICAL',    icon: 'enhancement_mystical'     }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],
    item_vambrace:       [{ title: 'VITAL',       icon: 'enhancement_vital'        }, { title: 'WISE',        icon: 'enhancement_wise'        }],
    item_nether_shawl:   [{ title: 'MYSTICAL',    icon: 'enhancement_mystical'     }, { title: 'VAST',        icon: 'enhancement_vast'        }],
    item_dragon_scale:   [{ title: 'TOUGH',       icon: 'enhancement_tough'        }, { title: 'VITAL',       icon: 'enhancement_vital'       }],
    item_essence_ring:   [{ title: 'WISE',        icon: 'enhancement_wise'         }, { title: 'MYSTICAL',    icon: 'enhancement_mystical'    }],
    item_clumsy_net:     [{ title: 'HULKING',     icon: 'enhancement_hulking'      }, { title: 'FLEETFOOTED', icon: 'enhancement_fleetfooted' }],
    item_philosophers_stone:[{ title: 'GREEDY',   icon: 'enhancement_greedy'       }, { title: 'WISE',        icon: 'enhancement_wise'        }],
    item_orb_of_destruction:[{ title: 'FIERCE',   icon: 'enhancement_fierce'       }, { title: 'TOUGH',       icon: 'enhancement_tough'       }],
    item_quickening_charm:[{ title: 'FLEETFOOTED',icon: 'enhancement_fleetfooted'  }, { title: 'QUICKENED',   icon: 'enhancement_quickened'   }],
    item_trusty_shovel:  [{ title: 'GREEDY',      icon: 'enhancement_greedy'       }, { title: 'TOUGH',       icon: 'enhancement_tough'       }],
    item_seeds_of_serenity:[{ title: 'KEEN-EYED', icon: 'enhancement_keen_eyed'   }, { title: 'RESTORATIVE', icon: 'enhancement_restorative'  }],
    item_poor_mans_shield: [{ title: 'ALERT',       icon: 'enhancement_alert'       }, { title: 'BRAWNY',      icon: 'enhancement_brawny'      }],
    item_searing_signet:   [{ title: 'FEVERISH',   icon: 'enhancement_feverish'    }, { title: 'QUICKENED',   icon: 'enhancement_quickened'   }],
    item_serrated_shiv:    [{ title: 'FIERCE',     icon: 'enhancement_fierce'      }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],
    item_unrelenting_eye:  [{ title: 'CURIOUS',    icon: 'enhancement_curious'     }, { title: 'MYSTICAL',    icon: 'enhancement_mystical'    }],
    item_psychic_headband: [{ title: 'WISE',       icon: 'enhancement_wise'        }, { title: 'QUICKENED',   icon: 'enhancement_quickened'   }],
    item_partisans_brand:  [{ title: 'FIERCE',     icon: 'enhancement_fierce'      }, { title: 'FEVERISH',    icon: 'enhancement_feverish'    }],
    item_defiant_shell:    [{ title: 'TOUGH',      icon: 'enhancement_tough'       }, { title: 'HULKING',     icon: 'enhancement_hulking'     }],
    item_grove_bow:        [{ title: 'KEEN-EYED',  icon: 'enhancement_keen_eyed'   }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],
    item_pupils_gift:      [{ title: 'WISE',       icon: 'enhancement_wise'        }, { title: 'MYSTICAL',    icon: 'enhancement_mystical'    }],
    item_ring_of_tarrasque:[{ title: 'VITAL',      icon: 'enhancement_vital'       }, { title: 'HULKING',     icon: 'enhancement_hulking'     }],
    item_dagger_of_ristul: [{ title: 'FIERCE',     icon: 'enhancement_fierce'      }, { title: 'MYSTICAL',    icon: 'enhancement_mystical'    }],
    item_veil_of_discord:  [{ title: 'MYSTICAL',   icon: 'enhancement_mystical'    }, { title: 'WISE',        icon: 'enhancement_wise'        }],

    // ─── TIER 3 ───────────────────────────────────────────────────────────────
    item_mind_breaker:   [{ title: 'WISE',        icon: 'enhancement_wise'         }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
    item_vindicators_axe:[{ title: 'FIERCE',      icon: 'enhancement_fierce'       }, { title: 'HULKING',     icon: 'enhancement_hulking'     }],
    item_enchanted_quiver:[{ title: 'KEEN-EYED',  icon: 'enhancement_keen_eyed'    }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
    item_paladin_sword:  [{ title: 'VITAL',       icon: 'enhancement_vital'        }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
    item_stormcrafter:   [{ title: 'MYSTICAL',    icon: 'enhancement_mystical'     }, { title: 'QUICKENED',   icon: 'enhancement_quickened'   }],
    item_repair_kit:     [{ title: 'VITAL',       icon: 'enhancement_vital'        }, { title: 'TOUGH',       icon: 'enhancement_tough'       }],
    item_titan_sliver:   [{ title: 'FIERCE',      icon: 'enhancement_fierce'       }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],
    item_elven_tunic:    [{ title: 'NIMBLE',      icon: 'enhancement_nimble'       }, { title: 'KEEN-EYED',   icon: 'enhancement_keen_eyed'   }],
    item_vampire_fangs:  [{ title: 'VAMPIRIC',    icon: 'enhancement_vampiric'     }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
    item_doubloon:       [{ title: 'GREEDY',      icon: 'enhancement_greedy'       }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],

    // ─── TIER 4 ───────────────────────────────────────────────────────────────
    item_ninja_gear:     [{ title: 'FLEETFOOTED', icon: 'enhancement_fleetfooted'  }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],
    item_illusionsts_cape:[{ title: 'BOUNDLESS',  icon: 'enhancement_boundless'    }, { title: 'NIMBLE',      icon: 'enhancement_nimble'      }],
    item_penta_edged_sword:[{ title: 'FIERCE',    icon: 'enhancement_fierce'       }, { title: 'DOMINANT',    icon: 'enhancement_dominant'    }],
    item_havoc_hammer:   [{ title: 'HULKING',     icon: 'enhancement_hulking'      }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
    item_rattlecage:     [{ title: 'TOUGH',       icon: 'enhancement_tough'        }, { title: 'HULKING',     icon: 'enhancement_hulking'     }],
    item_spell_prism:    [{ title: 'QUICKENED',   icon: 'enhancement_quickened'    }, { title: 'MYSTICAL',    icon: 'enhancement_mystical'    }],
    item_ascetic_cap:    [{ title: 'TIMELESS',    icon: 'enhancement_timeless'     }, { title: 'TOUGH',       icon: 'enhancement_tough'       }],
    item_horror_picnic:  [{ title: 'MANIC',       icon: 'enhancement_manic'        }, { title: 'FEVERISH',    icon: 'enhancement_feverish'    }],
    item_martyrs_plate:  [{ title: 'TITANIC',     icon: 'enhancement_titanic'      }, { title: 'EVOLVED',     icon: 'enhancement_evolved'     }],
    item_venomous_rat:   [{ title: 'FEVERISH',    icon: 'enhancement_feverish'     }, { title: 'VAMPIRIC',    icon: 'enhancement_vampiric'    }],
    item_trickster_cloak:[{ title: 'ALERT',       icon: 'enhancement_alert'        }, { title: 'CURIOUS',     icon: 'enhancement_curious'     }],

    // ─── TIER 5 ───────────────────────────────────────────────────────────────
    item_ex_machina:     [{ title: 'QUICKENED',   icon: 'enhancement_quickened'    }, { title: 'TIMELESS',    icon: 'enhancement_timeless'    }],
    item_demonicon:      [{ title: 'DOMINANT',    icon: 'enhancement_dominant'     }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
    item_mirror_shield:  [{ title: 'VAST',        icon: 'enhancement_vast'         }, { title: 'TOUGH',       icon: 'enhancement_tough'       }],
    item_apex:           [{ title: 'NIMBLE',      icon: 'enhancement_nimble'       }, { title: 'WISE',        icon: 'enhancement_wise'        }],
    item_pirate_hat:     [{ title: 'GREEDY',      icon: 'enhancement_greedy'       }, { title: 'FLEETFOOTED', icon: 'enhancement_fleetfooted' }],
    item_force_boots:    [{ title: 'FLEETFOOTED', icon: 'enhancement_fleetfooted'  }, { title: 'QUICKENED',   icon: 'enhancement_quickened'   }],
    item_giants_ring:    [{ title: 'TITANIC',     icon: 'enhancement_titanic'      }, { title: 'HULKING',     icon: 'enhancement_hulking'     }],
    item_book_of_shadows:[{ title: 'ALERT',       icon: 'enhancement_alert'        }, { title: 'WISE',        icon: 'enhancement_wise'        }],
    item_fallen_sky:     [{ title: 'BOUNDLESS',   icon: 'enhancement_boundless'    }, { title: 'FIERCE',      icon: 'enhancement_fierce'      }],
};

export function getNeutralCharm(itemName: string, itemLevel: number): NeutralCharm | null {
    if (!itemLevel || itemLevel < 1) return null;
    const charms = neutralItemCharms[itemName];
    if (!charms) return null;
    return charms[itemLevel - 1] ?? null;
}
