/**
 * Alive dismemberment and crawl-state tuning.
 * Thresholds are health ratios crossed downward (e.g. 0.75 = drop below 75% HP).
 */
export const DismembermentConfig = {
  /** HP ratios that trigger a limb-loss roll when crossed downward */
  THRESHOLDS: [0.75, 0.5, 0.25] as readonly number[],

  /** Base chance to lose one limb when a threshold is crossed */
  LIMB_LOSS_CHANCE: 0.45,

  /** Force crawl even with legs intact at or below this HP ratio */
  CRITICAL_CRAWL_HP: 0.15,

  /** Speed multipliers applied on top of base * variation * sludge slow */
  SPEED: {
    /** Both legs gone, or critical HP crawl */
    crawl: 0.3,
    /** Exactly one leg remaining (not crawling) */
    oneLeg: 0.7,
    /** Missing arms only — no speed change */
    noArms: 1.0,
  },

  /**
   * Multiplies LIMB_LOSS_CHANCE by zombie type key (GameConfig.ZOMBIE_TYPES values).
   * Missing types default to 1.
   */
  TYPE_CHANCE_MULT: {
    Basic: 1.0,
    Fast: 1.1,
    Tank: 0.7,
    Armored: 0.65,
    Swarm: 1.25,
    Stealth: 1.0,
    Mechanical: 0.35,
    Boss: 0.5,
    NecroTank: 0.55,
  } as Record<string, number>,

  /** At the 25% threshold, bias rolls toward legs so crawl is reachable */
  LOW_HP_LEG_BIAS: 0.65,
} as const;

export type LimbId = 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

export interface LimbFlags {
  leftArm: boolean;
  rightArm: boolean;
  leftLeg: boolean;
  rightLeg: boolean;
}
