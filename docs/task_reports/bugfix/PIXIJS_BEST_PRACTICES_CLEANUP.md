# PixiJS Best Practices Cleanup

**Date:** 2026-05-02  
**Status:** In Progress  
**Priority:** Medium  
**Category:** Performance & Memory Optimization

## Overview

After installing and reviewing the PixiJS skills documentation, several areas for improvement were identified in the codebase. These changes will improve performance, reduce memory usage, and follow PixiJS v8 best practices.

## Issues Identified

### 1. Destroy Patterns Missing Options [MEDIUM]

**Files Affected:**
- `src/utils/ResourceCleanupManager.ts` (line 182)
- `src/renderers/effects/EffectManager.ts` (23 occurrences)
- `src/objects/Projectile.ts` (line 531, 541)
- Various other destroy calls throughout codebase

**Current Code:**
```typescript
effect.graphics.destroy();  // Missing cleanup options
sludgePool.destroy();
this.destroy();
```

**Required Change:**
Per `pixijs-scene-container` skill (lines 253-267), destroy calls should specify cleanup options:
- `{ children: true }` - for containers with children
- `{ texture: true, textureSource: true }` - when textures should be freed
- `{ children: true, texture: true, textureSource: true }` - for complete cleanup

**Impact:** Prevents GPU memory leaks by properly freeing texture resources.

---

### 2. No Culling Implementation [HIGH]

**Files Affected:**
- All renderer files (zombies, towers, effects)
- `src/renderers/VisualMapRenderer.ts`
- `src/managers/ZombieManager.ts`

**Current State:** No culling is implemented. Off-screen objects continue to be rendered.

**Required Change:**
Per `pixijs-performance` skill (lines 17-21):
```typescript
import { CullerPlugin, extensions } from "pixi.js";
extensions.add(CullerPlugin);

// On off-screen containers:
container.cullable = true;
container.cullArea = new Rectangle(0, 0, 256, 256);
```

**Impact:** Significant performance improvement for large maps with many off-screen objects.

---

### 3. No cacheAsTexture Usage [MEDIUM]

**Files Affected:**
- Static UI components
- Background elements
- Map terrain that doesn't change

**Current State:** No GPU-level caching for static content.

**Required Change:**
Per `pixijs-performance` skill (lines 11-15):
```typescript
container.cacheAsTexture(true);
// ... when container changes:
container.updateCacheTexture();
// ... before destroying:
container.cacheAsTexture(false);
container.destroy({ children: true });
```

**Impact:** Reduces draw calls for static UI elements and backgrounds.

---

### 4. App Initialization Missing GC Tuning [LOW]

**File Affected:** `src/main.ts` (lines 38-42)

**Current Code:**
```typescript
await app.init({
  background: '#101010',
  width: 1280,
  height: 768,
});
```

**Required Change:**
Per `pixijs-performance` skill (lines 78-82):
```typescript
await app.init({
  background: '#101010',
  width: 1280,
  height: 768,
  gcActive: true,
  gcMaxUnusedTime: 120000,  // 2 minutes
  gcFrequency: 60000,       // 1 minute
});
```

**Impact:** Better control over texture garbage collection timing.

---

## Implementation Plan

### Phase 1: Destroy Pattern Fixes
- [ ] Update `ResourceCleanupManager.destroyGraphics()` with options
- [ ] Update `ResourceCleanupManager.destroyContainer()` with options
- [ ] Audit and fix all destroy calls in EffectManager
- [ ] Audit and fix destroy calls in Projectile.ts

### Phase 2: Culling Implementation
- [ ] Add CullerPlugin to main.ts
- [ ] Implement culling in ZombieManager for off-screen zombies
- [ ] Implement culling in Tower renderers
- [ ] Add cullArea to effect containers

### Phase 3: Texture Caching
- [ ] Identify static UI elements for caching
- [ ] Implement cacheAsTexture for backgrounds
- [ ] Add cache management for dynamic UI changes

### Phase 4: GC Tuning
- [ ] Add gcMaxUnusedTime and gcFrequency to app.init()

---

## What Was Done Right

The following patterns already follow PixiJS best practices:

1. **ParticleContainer Usage** (`BloodParticleSystem.ts`)
   - Correct v8 pattern with `Particle` instances
   - Proper `dynamicProperties` configuration
   - Object pooling implemented

2. **Object Pooling** (`GraphicsPool.ts`, `BloodParticleSystem.ts`)
   - Graphics pool with reset function
   - Particle pool with size limits

3. **Resource Cleanup Structure** (`ResourceCleanupManager.ts`)
   - Centralized cleanup orchestration
   - Proper cleanup order (timers first)
   - Tracks `destroyed` flag

---

## References

- Skills Location: `.skills/skills/`
- `pixijs-performance` - Destroy patterns, culling, caching
- `pixijs-scene-container` - Container destroy options
- `pixijs-scene-particle-container` - ParticleContainer best practices
