// Game configuration and constants
export const GameConfig = {
  // Screen dimensions
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 768,
  
  // Game states
  GAME_STATES: {
    MAIN_MENU: 'MainMenu',
    LEVEL_SELECT: 'LevelSelect',
    PLAYING: 'Playing',
    PAUSED: 'Paused',
    WAVE_COMPLETE: 'WaveComplete',
    GAME_OVER: 'GameOver',
    VICTORY: 'Victory'
  },
  
  // Resource settings
  STARTING_MONEY: 500,
  STARTING_LIVES: 20,
  
  // Difficulty modes
  DIFFICULTY_MODES: {
    EASY: 'Easy',
    NORMAL: 'Normal',
    HARD: 'Hard',
    NIGHTMARE: 'Nightmare'
  },
  
  // Tower types
  TOWER_TYPES: {
    MACHINE_GUN: 'MachineGun',
    SNIPER: 'Sniper',
    SHOTGUN: 'Shotgun',
    FLAME: 'Flame',
    TESLA: 'Tesla'
  },
  
  // Zombie types
  ZOMBIE_TYPES: {
    BASIC: 'Basic',
    FAST: 'Fast',
    TANK: 'Tank',
    ARMORED: 'Armored',
    SWARM: 'Swarm',
    STEALTH: 'Stealth',
    MECHANICAL: 'Mechanical'
  }
};