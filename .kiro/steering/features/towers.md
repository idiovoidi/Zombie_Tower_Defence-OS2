---
inclusion: fileMatch
fileMatchPattern: ['**/towers/**/*.ts', '**/Tower*.ts', '**/tower*.ts']
---

# Tower Reference

## Stats

| Tower | Cost | Damage | Range | Fire Rate | Special |
|-------|------|--------|-------|-----------|---------|
| Machine Gun | $250 | 12 | 150 | 8/s | High fire rate |
| Sniper | $900 | 150 | 400 | 1/s | Armor-piercing |
| Shotgun | $400 | 60 | 120 | 0.8/s | Double-barrel cone |
| Flame | $750 | 200 | 120 | 0.75/s | Area DoT, burning |
| Tesla | $1500 | 80 | 200 | 2/s | Chain lightning |
| Grenade | $1250 | 90 | 180 | 0.3/s | Explosive AoE |
| Sludge | $800 | 0 | 100 | 0.25/s | Slow pools |

## Upgrade Scaling (max level 5)

| Stat | Machine Gun | Grenade | Others |
|------|-------------|---------|--------|
| Damage | +25%/lvl | +20%/lvl | +50%/lvl |
| Fire Rate | +30%/lvl | +10%/lvl | +10%/lvl |
| Range | +20%/lvl | +20%/lvl | +20%/lvl |

Upgrade cost: `baseCost × (level + 1) × 0.75` (Sludge: `× 0.6`)

## Key Files
- `src/objects/Tower.ts` — base class
- `src/objects/Tower.interface.ts` — ITower interface
- `src/config/towerConstants.ts` — all stats
- `src/config/gameConfig.ts` — TOWER_TYPES constants
- `src/managers/TowerManager.ts` — placement, targeting, upgrades

## Patterns

**New tower type:** add to `TOWER_TYPES` → define stats in `towerConstants.ts` → register in `TowerManager` → create renderer in `src/renderers/towers/`.

**Placement:** `towerManager.canPlaceTower(gx, gy)` → `towerFactory.createTower(type, x, y)` → `towerManager.addTower(tower)`

**Targeting:** find nearest in range → `barrel.rotation = Math.atan2(dy, dx)` → check `canShoot(time)` → `tower.shoot()` + `showShootingEffect()`

**Upgrades:** check `upgradeLevel < 5` → `calculateUpgradeCost(type, level)` → `tower.upgrade()` → `tower.updateVisual()`

**Visual structure:** `visual` = base/platform, `barrel` = rotatable weapon. Upgrade tiers: wood/sandbags (1-2) → metal/armor (3-4) → military (5).
