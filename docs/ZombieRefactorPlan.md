Refactor Zombie Rendering Pipeline for PixiJS v8 Compliance
The current zombie renderers (StealthZombieRenderer, TankZombieRenderer, etc.) use an immediate-mode approach where they call this.graphics.clear() and completely rebuild the zombie shape every single frame. According to the PixiJS v8 best practices documented in .skills/skills/pixijs-scene-graphics, this is a severe anti-pattern because PixiJS tessellates shapes into GPU triangles, meaning rebuilding geometry every frame causes significant performance overhead.

This plan details how to refactor the zombie rendering pipeline into a retained-mode skeletal animation system using Container hierarchies and static Graphics leaves.

User Review Required
IMPORTANT

The change requires completely restructuring how zombies are rendered. Rather than drawing the entire zombie with drawArm(), rect(), and circle() every frame, each renderer will define its body parts once during setup and only update their position and rotation during the render loop. This also involves isolating the particle system so it doesn't draw onto the zombie's body graphics. Does this approach align with your expectations for the PixiJS standards?

Proposed Changes
1. Particle System Decoupling
[MODIFY] src/renderers/zombies/ZombieParticleSystem.ts
Change render(graphics: Graphics) to render().
Inside render(), use this.graphics.clear() and draw particles into its own graphics object instead of polluting the zombie body's graphics object.
The ZombieParticleSystem is already creating its own Graphics object via this.graphics = new Graphics();, but currently it's unused during rendering. We will utilize it.
2. Base Renderer Transition to Container Root
[MODIFY] src/renderers/zombies/BaseZombieRenderer.ts
Change protected graphics: Graphics to protected container: Container.
Update showDamageEffect and applyHealthTint to apply tint on this.container.
Remove legacy helper methods like drawArm() since drawing will be handled once per part in the subclasses rather than continuously.
Provide a protected abstract initParts(): void for subclasses to implement.
3. Subclass Refactoring to Skeletal System
[MODIFY] All 7 Subclass Renderers
Files:

BasicZombieRenderer.ts
FastZombieRenderer.ts
StealthZombieRenderer.ts
SwarmZombieRenderer.ts
TankZombieRenderer.ts
ArmoredZombieRenderer.ts
MechanicalZombieRenderer.ts
Changes:

Add a protected isInitialized = false; flag.
Implement initParts() to construct individual Graphics nodes for each body part (e.g., this.head, this.torso, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg, this.wounds).
Add these parts to this.container, along with this.particles.getGraphics().
Rewrite render(container, state) to:
Call initParts() if !this.isInitialized.
Get anim = this.animator.getCurrentFrame().
Apply position and rotation to the pre-built Graphics parts (e.g., this.leftArm.rotation = anim.leftArmAngle).
Redraw wounds only if the state.health changes significantly, avoiding per-frame clears.
Verification Plan
Automated Tests
TypeScript compilation to ensure type correctness after changing this.graphics from Graphics to Container.
Manual Verification
Spawn different zombie types using debug tools or in-game wave spawners.
Verify that walking animations (arms swinging, head bobbing) look identical or better than the immediate-mode version.
Verify that damage flashes and health tints correctly apply to the entire Container.
Verify that particles (blood, smoke, gore chunks) render properly on top of or behind the zombies.