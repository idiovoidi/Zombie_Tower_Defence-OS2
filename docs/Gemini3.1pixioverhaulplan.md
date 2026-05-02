ixi.js Best Practices Overhaul Plan
This plan aims to overhaul the codebase to utilize Pixi.js v8 to its maximum potential, based on the pixijs-performance and pixijs-migration-v8 skill documents. The current implementation uses Pixi.js v8 correctly in terms of APIs, but misses critical performance optimizations.

User Review Required
WARNING

This overhaul touches multiple core systems, particularly rendering loops and object lifecycle (spawning/destroying). I recommend testing thoroughly after these changes are applied to ensure visual consistency and stability. Do you approve this general direction?

Proposed Changes
1. Dynamic Text Optimization
Problem: UI text components (e.g., BottomBar, HUD, StatsPanel) update text properties unconditionally every frame, triggering expensive canvas re-renders and GPU uploads.
Solution:
Add text update guards (e.g., if (text.text !== next) text.text = next;) to all dynamically updated text fields across the UI.
Note: If a bitmap font is available, we will convert frequent updaters to BitmapText. Given the lack of a loaded .fnt asset, text guarding is the safest immediate performance win for canvas Text.
2. Object Pooling for Frequent Entities
Problem: Projectile and Zombie objects are instantiated with new and destroyed with destroy() rapidly during gameplay. This deallocates GPU resources and triggers garbage collection heavily.
Solution:
Implement a Pool<T> utility (or use Pixi's Pool).
Refactor ProjectileManager and ZombieManager to recycle objects (toggle visibility, reset properties) instead of destroying and recreating them.
3. Static UI Caching (cacheAsTexture)
Problem: Complex UI panels like BottomBar are composed of many Graphics shapes (rivets, borders, background textures) that are drawn every frame.
Solution:
Apply cacheAsTexture(true) to static UI containers.
This caches the subtree to a single texture, drastically reducing draw calls.
4. Culling Optimization
Problem: CullerPlugin is registered, but objects rarely utilize it.
Solution:
Set cullableChildren = false on static UI roots that are always visible to save CPU overhead.
Ensure map tiles or entities that go off-screen utilize cullable = true.
5. Memory Management & GC Configuration
Problem: Application.init() does not explicitly define Garbage Collection parameters, and destruction patterns could be more robust.
Solution:
Update main.ts to configure gcMaxUnusedTime and gcFrequency.
Audit destroy() calls to ensure we pass { children: true } when appropriate to prevent memory leaks from nested graphics/sprites.
Verification Plan
Automated/Manual Testing
Start the game and monitor the FPS.
Open the UI and verify that the BottomBar and TowerInfoPanel render correctly and continue to update values.
Spawn a large wave of zombies and verify that ZombieManager correctly reuses objects from the pool without leaking memory or crashing.
Verify that projectiles properly hit and return to the pool without graphical glitches.