ixi.js Best Practices Overhaul Plan
This plan aims to overhaul the codebase to utilize Pixi.js v8 to its maximum potential, based on the pixijs-performance and pixijs-migration-v8 skill documents. The current implementation uses Pixi.js v8 correctly in terms of APIs, but misses critical performance optimizations.

User Review Required
WARNING

This overhaul touches multiple core systems, particularly rendering loops and object lifecycle (spawning/destroying). I recommend testing thoroughly after these changes are applied to ensure visual consistency and stability. Do you approve this general direction?

Proposed Changes



