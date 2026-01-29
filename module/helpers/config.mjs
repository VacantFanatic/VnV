export const VNV = {};

/**
 * The set of Ability Scores used within the Vice and Violence system.
 * @type {Object}
 */
VNV.abilities = {
  smarts: 'VNV.Ability.Smarts.long',
  brawn: 'VNV.Ability.Brawn.long',
  guts: 'VNV.Ability.Guts.long',
  charm: 'VNV.Ability.Charm.long',
};

VNV.abilityAbbreviations = {
  smarts: 'VNV.Ability.Smarts.abbr',
  brawn: 'VNV.Ability.Brawn.abbr',
  guts: 'VNV.Ability.Guts.abbr',
  charm: 'VNV.Ability.Charm.abbr',
};

/**
 * The list of Kin (races/species) available in the system.
 * @type {Object}
 */
VNV.kin = {
  humans: 'VNV.Kin.Humans',
  goblins: 'VNV.Kin.Goblins',
  elves: 'VNV.Kin.Elves',
  dwarfs: 'VNV.Kin.Dwarfs',
  orcs: 'VNV.Kin.Orcs',
  dragonkin: 'VNV.Kin.Dragonkin',
  centaurs: 'VNV.Kin.Centaurs',
  satyrs: 'VNV.Kin.Satyrs',
  relmers: 'VNV.Kin.Relmers',
  alloyans: 'VNV.Kin.Alloyans',
  dwellers: 'VNV.Kin.Dwellers',
  otherlings: 'VNV.Kin.Otherlings',
};

/**
 * Default ability bonuses for each Kin.
 * Humans have an empty array as they can select any attribute.
 * @type {Object}
 */
VNV.kinBonuses = {
  humans: [], // Humans can select any attribute
  goblins: [],
  elves: [],
  dwarfs: [],
  orcs: [],
  dragonkin: [],
  centaurs: [],
  satyrs: [],
  relmers: [],
  alloyans: [],
  dwellers: [],
  otherlings: [],
};

/**
 * Game rules configuration.
 * @type {Object}
 */
VNV.rules = {
  maxLevel: 10,
  exertionPointsPerLongRest: 3,
  exertionOveruseDamage: "2d6",
  requiredSleepHours: 6,
  sleepCheckInterval: 24, // hours
  exhaustedPenalty: { smarts: -1, brawn: -1 },
  shortRestDuration: 30, // minutes per die
  initiativeDie: "d6",
  actionsPerTurn: { combat: 1, tactical: 2 }
};

/**
 * Status effects configuration.
 * @type {Object}
 */
VNV.statusEffects = {
  exhausted: {
    label: 'VNV.Status.Exhausted',
    description: 'VNV.Status.Exhausted.Desc',
    penalties: { smarts: -1, brawn: -1 }
  },
  dehydrated: {
    label: 'VNV.Status.Dehydrated',
    description: 'VNV.Status.Dehydrated.Desc'
  },
  vice: {
    label: 'VNV.Status.Vice',
    description: 'VNV.Status.Vice.Desc'
  },
  downed: {
    label: 'VNV.Status.Downed',
    description: 'VNV.Status.Downed.Desc'
  },
  dead: {
    label: 'VNV.Status.Dead',
    description: 'VNV.Status.Dead.Desc'
  },
  ghost: {
    label: 'VNV.Status.Ghost',
    description: 'VNV.Status.Ghost.Desc'
  },
  zombie: {
    label: 'VNV.Status.Zombie',
    description: 'VNV.Status.Zombie.Desc'
  }
};
