# Implementation Plan

- [x] 1. Move effects folder to renderers directory





  - Move all files from `src/effects/` to `src/renderers/effects/`
  - Update imports in Tower.ts to reference new location
  - Update imports in tower-specific classes (FlameTower.ts, SniperTower.ts, etc.)
  - Update imports in TowerCombatManager.ts
  - Search codebase for any other files importing from `src/effects/` and update them
  - Run TypeScript compiler to verify no import errors
  - _Requirements: 7.1, 7.2_

- [ ] 2. Create tower renderer interfaces and base class
- [ ] 2.1 Create ITowerRenderer interface
  - Define interface in `src/renderers/towers/ITowerRenderer.ts`
  - Include lifecycle methods: update(deltaTime), destroy()
  - Include visual update methods: updateVisual(state), updateBarrelRotation(rotation)
  - Include effect methods: showShootingEffect(), showSelectionEffect(), hideSelectionEffect()
  - Include range methods: showRange(container), hideRange()
  - Include state query methods: getContainer(), getBarrel()
  - _Requirements: 7.1_

- [ ] 2.2 Create ITowerRenderState interface
  - Define interface in `src/renderers/towers/ITowerRenderState.ts`
  - Include properties: type, upgradeLevel, position, range, isIdle, timeSinceLastShot
  - Add JSDoc comments documenting each property
  - _Requirements: 7.2_

- [ ] 2.3 Create BaseTowerRenderer class
  - Implement BaseTowerRenderer in `src/renderers/towers/BaseTowerRenderer.ts`
  - Implement ITowerRenderer interface
  - Add protected properties: container, visual, barrel, rangeVisualizer, upgradeLevel, type
  - Add idle animation state properties: idleTime, idleScanDirection, idleScanAngle, currentRotation
  - Add selection effect properties: selectionHighlight, pulseInterval
  - Implement constructor to initialize container and graphics objects
  - Implement update() method to call updateIdleAnimation() and updateSpecialEffects()
  - Implement addUpgradeStars() method for rendering upgrade level indicators
  - Implement showRange() method delegating to TowerRangeVisualizer
  - Implement hideRange() method
  - Implement showSelectionEffect() method with pulsing highlight animation
  - Implement hideSelectionEffect() method with proper cleanup
  - Implement destroy() method following cleanup pattern (timers first, then children, then parent)
  - Define abstract methods: createTowerVisual(), createBarrelVisual(), updateIdleAnimation(), createShootingEffect()
  - Define optional hook: updateSpecialEffects()
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Implement MachineGunTowerRenderer
- [ ] 3.1 Create MachineGunTowerRenderer class
  - Create file `src/renderers/towers/MachineGunTowerRenderer.ts`
  - Extend BaseTowerRenderer
  - Add barrelHeatGlow property
  - Implement constructor to initialize with MACHINE_GUN type and create BarrelHeatGlow
  - Implement createTowerVisual() for base visual (barricade → metal plates → fortification based on upgrade level)
  - Implement createBarrelVisual() for little man with machine gun (gear improves with upgrades)
  - Implement updateIdleAnimation() for left-right scanning motion
  - Implement createShootingEffect() for muzzle flash at gun tip
  - Override updateSpecialEffects() to update barrelHeatGlow
  - Override showShootingEffect() to add heat, spawn shell casing, and spawn muzzle flash light
  - Implement spawnShellCasing() private method
  - Implement spawnMuzzleFlashLight() private method
  - Implement destroy() to clean up barrelHeatGlow
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 3.2 Write unit tests for MachineGunTowerRenderer
  - Test constructor initializes correctly
  - Test createTowerVisual() creates appropriate graphics for each upgrade level
  - Test idle animation updates correctly
  - Test shooting effect creates and cleans up graphics
  - Test destroy() cleans up all resources
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Implement SniperTowerRenderer
- [ ] 4.1 Create SniperTowerRenderer class
  - Create file `src/renderers/towers/SniperTowerRenderer.ts`
  - Extend BaseTowerRenderer
  - Add laserSight property (level 3+)
  - Add currentTarget property for laser sight tracking
  - Implement constructor to initialize with SNIPER type
  - Implement createTowerVisual() for watchtower visual (wood → reinforced → military based on upgrade level)
  - Implement createBarrelVisual() for little man with sniper rifle (camo improves with upgrades)
  - Implement updateIdleAnimation() for subtle breathing motion
  - Implement createShootingEffect() for large dramatic muzzle flash
  - Override updateSpecialEffects() to update laser sight if active
  - Override showShootingEffect() to spawn scope glint and shell casing
  - Implement spawnScopeGlint() private method
  - Implement spawnShellCasing() private method
  - Implement destroy() to clean up laser sight
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 4.2 Write unit tests for SniperTowerRenderer
  - Test constructor initializes correctly
  - Test createTowerVisual() creates appropriate graphics for each upgrade level
  - Test idle animation breathing motion
  - Test laser sight activation at level 3+
  - Test destroy() cleans up all resources
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Implement ShotgunTowerRenderer
- [ ] 5.1 Create ShotgunTowerRenderer class
  - Create file `src/renderers/towers/ShotgunTowerRenderer.ts`
  - Extend BaseTowerRenderer
  - Implement constructor to initialize with SHOTGUN type
  - Implement createTowerVisual() for bunker visual (sandbags → reinforced → heavy fortified based on upgrade level)
  - Implement createBarrelVisual() for little man with shotgun (armor improves with upgrades)
  - Implement updateIdleAnimation() for occasional pump/check animation every 5 seconds
  - Implement createShootingEffect() for dual-barrel muzzle flash
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 5.2 Write unit tests for ShotgunTowerRenderer
  - Test constructor initializes correctly
  - Test createTowerVisual() creates appropriate graphics for each upgrade level
  - Test pump animation timing
  - Test destroy() cleans up all resources
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Implement FlameTowerRenderer
- [ ] 6.1 Create FlameTowerRenderer class
  - Create file `src/renderers/towers/FlameTowerRenderer.ts`
  - Extend BaseTowerRenderer
  - Implement constructor to initialize with FLAME type
  - Implement createTowerVisual() for fuel tank visual (barrel → fuel station → incinerator based on upgrade level)
  - Implement createBarrelVisual() for little man with flamethrower (protective gear improves with upgrades)
  - Implement updateIdleAnimation() for flickering/pilot light effect
  - Implement createShootingEffect() for multi-layered flame burst with particles
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 6.2 Write unit tests for FlameTowerRenderer
  - Test constructor initializes correctly
  - Test createTowerVisual() creates appropriate graphics for each upgrade level
  - Test flickering animation
  - Test destroy() cleans up all resources
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7. Implement TeslaTowerRenderer
- [ ] 7.1 Create TeslaTowerRenderer class
  - Create file `src/renderers/towers/TeslaTowerRenderer.ts`
  - Extend BaseTowerRenderer
  - Implement constructor to initialize with TESLA type
  - Implement createTowerVisual() for capacitor visual (coils → advanced → military based on upgrade level)
  - Implement createBarrelVisual() for little man with tesla gun (insulation improves with upgrades)
  - Implement updateIdleAnimation() for slow rotation back and forth with capacitor glow
  - Implement createShootingEffect() for electric discharge with radiating sparks
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 7.2 Write unit tests for TeslaTowerRenderer
  - Test constructor initializes correctly
  - Test createTowerVisual() creates appropriate graphics for each upgrade level
  - Test rotation animation
  - Test destroy() cleans up all resources
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implement GrenadeTowerRenderer
- [ ] 8.1 Create GrenadeTowerRenderer class
  - Create file `src/renderers/towers/GrenadeTowerRenderer.ts`
  - Extend BaseTowerRenderer
  - Implement constructor to initialize with GRENADE type
  - Implement createTowerVisual() for launcher platform visual (sandbags → reinforced → military based on upgrade level)
  - Implement createBarrelVisual() for little man with grenade launcher (gear improves with upgrades)
  - Implement updateIdleAnimation() for subtle bobbing motion
  - Implement createShootingEffect() for launch flash with smoke puff
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8.2 Write unit tests for GrenadeTowerRenderer
  - Test constructor initializes correctly
  - Test createTowerVisual() creates appropriate graphics for each upgrade level
  - Test bobbing animation
  - Test destroy() cleans up all resources
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Implement SludgeTowerRenderer
- [ ] 9.1 Create SludgeTowerRenderer class
  - Create file `src/renderers/towers/SludgeTowerRenderer.ts`
  - Extend BaseTowerRenderer
  - Implement constructor to initialize with SLUDGE type
  - Implement createTowerVisual() for toxic tank visual (barrels → vat → hazmat facility based on upgrade level)
  - Implement createBarrelVisual() for little man with sludge launcher (hazmat suit improves with upgrades)
  - Implement updateIdleAnimation() for bubbling/dripping animation with wobble
  - Implement createShootingEffect() for toxic splash with drip particles
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 9.2 Write unit tests for SludgeTowerRenderer
  - Test constructor initializes correctly
  - Test createTowerVisual() creates appropriate graphics for each upgrade level
  - Test bubbling animation
  - Test destroy() cleans up all resources
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Create tower renderer factory and exports
- [ ] 10.1 Create TowerRendererFactory
  - Create file `src/renderers/towers/TowerRendererFactory.ts`
  - Implement static create() method with switch statement for all tower types
  - Throw error for unknown tower types
  - Add JSDoc comments documenting factory usage
  - _Requirements: 1.1, 2.1_

- [ ] 10.2 Create index.ts for tower renderers
  - Create file `src/renderers/towers/index.ts`
  - Export all renderer classes
  - Export interfaces (ITowerRenderer, ITowerRenderState)
  - Export factory (TowerRendererFactory)
  - _Requirements: 2.5_

- [ ] 11. Refactor Tower.ts to use renderers
- [ ] 11.1 Update Tower.ts to delegate rendering
  - Add renderer property of type ITowerRenderer
  - Update constructor to create renderer using TowerRendererFactory
  - Add renderer container as child of tower container
  - Update update() method to call renderer.update() with current state
  - Update shoot() method to call renderer.showShootingEffect()
  - Update upgrade() method to call renderer.updateVisual() with new state
  - Update showRange() method to delegate to renderer
  - Update hideRange() method to delegate to renderer
  - Update destroy() method to call renderer.destroy() before super.destroy()
  - Remove all visual creation methods (createMachineGunVisual, createSniperVisual, etc.)
  - Remove all idle animation methods (idleAnimationMachineGun, idleAnimationSniper, etc.)
  - Remove showShootingEffect() implementation (now in renderers)
  - Remove showSelectionEffect() and hideSelectionEffect() implementations
  - Remove spawnShellCasing(), spawnScopeGlint(), spawnMuzzleFlashLight() methods
  - Remove visual, barrel, and effect-related properties
  - Remove updateVisual() method (now handled by renderer)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.3, 7.4_

- [ ]* 11.2 Update Tower.ts unit tests
  - Update tests to verify renderer is created correctly
  - Update tests to verify renderer methods are called appropriately
  - Update tests to verify renderer is destroyed with tower
  - Remove tests for visual methods that no longer exist in Tower.ts
  - _Requirements: 1.4_

- [ ] 12. Update tower-specific classes
- [ ] 12.1 Update tower subclasses to work with new architecture
  - Review FlameTower.ts, SniperTower.ts, etc. for any renderer-specific overrides
  - Remove any visual-related overrides (now handled by renderers)
  - Ensure shoot() method calls super.shoot() to trigger renderer effects
  - Update imports to remove references to removed visual methods
  - _Requirements: 1.4, 2.3_

- [ ]* 12.2 Update tower subclass tests
  - Update tests to verify tower behavior without visual code
  - Verify renderer integration works correctly
  - _Requirements: 1.4_

- [ ] 13. Update TowerCombatManager integration
- [ ] 13.1 Update TowerCombatManager to work with new renderer architecture
  - Review TowerCombatManager.ts for any direct visual manipulation
  - Update barrel rotation calls to use renderer interface
  - Update target tracking for laser sight to use renderer interface
  - Verify shooting effects are triggered through tower.shoot() method
  - _Requirements: 1.4, 7.3_

- [ ]* 13.2 Update TowerCombatManager tests
  - Update tests to verify renderer integration
  - Test barrel rotation updates
  - Test effect triggering
  - _Requirements: 1.4_

- [ ] 14. Final cleanup and verification
- [ ] 14.1 Remove unused code and update imports
  - Search for any remaining imports of removed Tower.ts methods
  - Remove unused imports from Tower.ts
  - Update any documentation referencing old architecture
  - Run linter and fix any issues
  - _Requirements: 1.2, 1.3_

- [ ] 14.2 Run full test suite
  - Run all unit tests and verify they pass
  - Run TypeScript compiler and verify no errors
  - Check test coverage meets 80% threshold
  - _Requirements: 1.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 14.3 Visual regression testing
  - Manually test each tower type at each upgrade level
  - Verify all idle animations work correctly
  - Verify all shooting effects appear correctly
  - Verify selection effects work correctly
  - Verify range indicators work correctly
  - Compare visuals to pre-refactor screenshots if available
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 14.4 Performance testing
  - Monitor memory usage with multiple towers
  - Verify no memory leaks after wave cleanup
  - Check FPS with 10+ towers active
  - Profile renderer update() performance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
