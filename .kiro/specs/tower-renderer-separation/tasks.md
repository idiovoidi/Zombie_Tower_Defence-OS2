# Implementation Plan: Tower Renderer Separation

## Overview

This plan breaks down the refactoring into discrete, testable tasks. Each task builds on previous ones and can be validated independently.

---

## Phase 1: Infrastructure Setup

- [x] 1. Create renderer infrastructure

  - Create `src/renderers/towers/` directory structure
  - Create ITowerRenderer interface with render, renderShootingEffect, and destroy methods
  - Create TowerRendererFactory with static create method
  - Create BaseTowerRenderer abstract class with shared helper methods (addUpgradeStars)
  - Create DefaultTowerRenderer as fallback for unknown types
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 7.1, 7.4_

---

## Phase 2: Implement Individual Renderers

- [x] 2. Implement MachineGunRenderer
  - [x] 2.1 Create MachineGunRenderer class extending BaseTowerRenderer
    - Extract createMachineGunVisual() code from Tower.ts

    - Implement render() method with base structure rendering


    - Implement renderBarrel() private method for character rendering
    - Implement visual upgrade progression (wooden → reinforced → military)
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 4.4, 5.1, 5.2_
  - [x] 2.2 Implement shooting effects for MachineGunRenderer


    - Extract machine gun muzzle flash code from showShootingEffect()
    - Implement renderShootingEffect() method
    - Add proper cleanup with EffectCleanupManager

    - _Requirements: 2.4, 4.5, 5.3, 6.2_
  - [x] 2.3 Test MachineGunRenderer rendering


    - Create test to verify render output matches original
    - Test all 5 upgrade levels render correctly
    - Test shooting effect creates and cleans up properly
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Implement SniperRenderer




  - [x] 3.1 Create SniperRenderer class


    - Extract createSniperVisual() code from Tower.ts
    - Implement render() method with tower structure
    - Implement visual upgrade progression (wooden → reinforced → military)
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 5.1, 5.2_
  - [x] 3.2 Implement shooting effects for SniperRenderer


    - Extract sniper muzzle flash code
    - Implement renderShootingEffect() method
    - _Requirements: 2.4, 4.5, 5.3_
  - [x] 3.3 Test SniperRenderer


    - Test all upgrade levels
    - Test shooting effects
    - _Requirements: 5.1, 5.2, 5.3_



- [x] 4. Implement ShotgunRenderer



  - [x] 4.1 Create ShotgunRenderer class

    - Extract createShotgunVisual() code
    - Implement bunker-style rendering
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 5.1, 5.2_
  - [x] 4.2 Implement shooting effects for ShotgunRenderer


    - Extract shotgun muzzle flash code
    - _Requirements: 2.4, 4.5, 5.3_
  - [x] 4.3 Test ShotgunRenderer







    - _Requirements: 5.1, 5.2, 5.3_



- [x] 5. Implement FlameRenderer



  - [ ] 5.1 Create FlameRenderer class
    - Extract createFlameVisual() code
    - Implement circular platform rendering
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 5.1, 5.2_
  - [ ] 5.2 Implement shooting effects for FlameRenderer
    - Extract flame burst effect code
    - _Requirements: 2.4, 4.5, 5.3_
  - [ ] 5.3 Test FlameRenderer
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Implement TeslaRenderer



  - [x] 6.1 Create TeslaRenderer class


    - Extract createTeslaVisual() code
    - Implement coil structure rendering
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 5.1, 5.2_


  - [x] 6.2 Implement shooting effects for TeslaRenderer







    - Extract electric discharge effect code
    - _Requirements: 2.4, 4.5, 5.3_

  - [ ] 6.3 Test TeslaRenderer
    - _Requirements: 5.1, 5.2, 5.3_







- [ ] 7. Implement GrenadeRenderer



  - [x] 7.1 Create GrenadeRenderer class


    - Extract createGrenadeVisual() code
    - Implement launcher structure rendering
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 5.1, 5.2_



  - [x] 7.2 Implement shooting effects for GrenadeRenderer


    - Extract launch flash effect code
    - _Requirements: 2.4, 4.5, 5.3_
  - [ ] 7.3 Test GrenadeRenderer
    - _Requirements: 5.1, 5.2, 5.3_



- [ ] 8. Implement SludgeRenderer



  - [ ] 8.1 Create SludgeRenderer class
    - Extract createSludgeVisual() code
    - Implement tank structure rendering


    - _Requirements: 1.5, 2.1, 2.2, 2.3, 5.1, 5.2_

  - [x] 8.2 Implement shooting effects for SludgeRenderer


    - Extract toxic splash effect code
    - _Requirements: 2.4, 4.5, 5.3_
  - [ ] 8.3 Test SludgeRenderer
    - _Requirements: 5.1, 5.2, 5.3_

---



## Phase 3: Refactor Tower Class


- [ ] 9. Integrate renderer into Tower class

  - [ ] 9.1 Add renderer property and update constructor
    - Add `private renderer: ITowerRenderer` property to Tower class
    - Update constructor to call `TowerRendererFactory.create(type)`
    - Store renderer reference
    - Call `this.updateVisual()` after renderer assignment
    - _Requirements: 1.4, 3.3, 3.4, 3.5_
  - [ ] 9.2 Replace updateVisual() implementation
    - Replace switch statement with `this.renderer.render()` call
    - Pass visual, barrel, type, and upgradeLevel to renderer
    - Remove all create\*Visual() method calls
    - _Requirements: 2.5, 2.6, 3.5_
  - [ ] 9.3 Replace showShootingEffect() implementation
    - Replace switch statement with `this.renderer.renderShootingEffect()` call
    - Pass barrel, type, and upgradeLevel to renderer
    - Remove all shooting effect creation code
    - _Requirements: 2.5, 2.6, 3.5_
  - [ ] 9.4 Update destroy() method
    - Add `this.renderer.destroy()` call before `super.destroy()`
    - Add try-catch for error handling
    - _Requirements: 4.6, 6.1, 6.4_

- [x] 10. Remove obsolete code from Tower class



  - [x] 10.1 Remove visual creation methods

    - Delete createMachineGunVisual() method
    - Delete createSniperVisual() method
    - Delete createShotgunVisual() method
    - Delete createFlameVisual() method
    - Delete createTeslaVisual() method
    - Delete createGrenadeVisual() method
    - Delete createSludgeVisual() method
    - _Requirements: 2.5, 2.6, 3.6_

  - [ ] 10.2 Remove helper methods
    - Delete addUpgradeStars() method (now in BaseTowerRenderer)
    - Remove any other rendering-specific helper methods
    - _Requirements: 2.5, 2.6_
  - [x] 10.3 Verify Tower class size reduction

    - Confirm Tower.ts is approximately 600 lines (down from 1400+)
    - Ensure only game logic remains
    - _Requirements: 3.1, 3.2, 3.7_

---

## Phase 4: Testing and Validation

- [ ] 11. Unit testing
  - [ ] 11.1 Test renderer factory
    - Test factory creates correct renderer for each tower type
    - Test factory returns DefaultTowerRenderer for unknown types
    - Test renderer instances are independent
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 11.2 Test Tower integration
    - Test Tower constructor assigns renderer correctly
    - Test updateVisual() calls renderer.render()
    - Test showShootingEffect() calls renderer.renderShootingEffect()
    - Test destroy() calls renderer.destroy()
    - _Requirements: 1.4, 3.5, 4.4, 4.5, 4.6, 6.4_

- [ ] 12. Visual regression testing
  - [ ] 12.1 Test visual consistency
    - Verify each tower type renders identically to original
    - Test all 5 upgrade levels for each tower type
    - Compare screenshots before/after refactoring
    - _Requirements: 5.1, 5.2_
  - [ ] 12.2 Test animations and effects
    - Verify idle animations still work correctly
    - Verify shooting effects render correctly
    - Verify barrel rotation works correctly
    - Verify upgrade stars display correctly
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [ ] 13. Integration testing
  - [ ] 13.1 Test gameplay systems
    - Test tower placement works correctly
    - Test tower shooting works correctly
    - Test tower upgrades work correctly
    - Test tower destruction works correctly
    - Test tower targeting works correctly
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ] 13.2 Test manager compatibility
    - Verify TowerManager works without modifications
    - Verify TowerCombatManager works without modifications
    - Verify TowerPlacementManager works without modifications
    - _Requirements: 8.2, 8.3, 8.4_

- [ ] 14. Memory and performance testing
  - [ ] 14.1 Test memory management
    - Verify no memory leaks introduced
    - Test renderer cleanup on tower destruction
    - Test effect cleanup with EffectCleanupManager
    - Monitor memory usage during gameplay
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  - [ ] 14.2 Test performance
    - Measure rendering performance (should be unchanged)
    - Measure instantiation cost (should be negligible)
    - Test with multiple towers (50+)
    - _Requirements: 5.1_

---

## Phase 5: Documentation and Cleanup

- [ ] 15. Update documentation
  - Update Tower class JSDoc comments
  - Add JSDoc comments to renderer interface and classes
  - Update architecture diagrams if needed
  - Update steering rules with renderer pattern examples
  - _Requirements: All_

- [ ] 16. Code cleanup
  - Remove any commented-out code
  - Ensure consistent code formatting
  - Run linter and fix any issues
  - Verify all imports use @/ path aliases
  - _Requirements: All_

- [ ] 17. Final validation
  - Run full test suite
  - Manual gameplay testing (place, upgrade, shoot towers)
  - Performance profiling
  - Code review
  - _Requirements: All_

---

## Notes

- Each renderer should be implemented and tested independently before moving to the next
- Tower class refactoring should only begin after all renderers are complete and tested
- Visual regression testing is critical - towers must look identical after refactoring
- Memory management is critical - use EffectCleanupManager for all temporary effects
- The Tower public API must remain unchanged to ensure backward compatibility
