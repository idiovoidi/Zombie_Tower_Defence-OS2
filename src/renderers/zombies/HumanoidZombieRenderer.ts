import { BaseZombieRenderer } from './BaseZombieRenderer';
import { STANDARD_HUMANOID_OFFSETS } from './HumanoidPartBuilder';

/**
 * Standard bipedal zombie skeleton with shared animation offsets.
 */
export abstract class HumanoidZombieRenderer extends BaseZombieRenderer {
  protected getAnimationOffsets() {
    return STANDARD_HUMANOID_OFFSETS;
  }
}
