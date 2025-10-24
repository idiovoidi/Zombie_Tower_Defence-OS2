# Performance System

## Overview

This directory contains documentation related to game performance monitoring, optimization, and verification.

## Contents

- [PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md) - Comprehensive guide to performance testing and monitoring
- [LAYOUT_OPTIMIZATION_SUMMARY.md](LAYOUT_OPTIMIZATION_SUMMARY.md) - UI layout optimization results
- [GRAPHICS_AUDIT_SUMMARY.md](GRAPHICS_AUDIT_SUMMARY.md) - Graphics performance audit findings
- [CLEANUP_VERIFICATION_SUMMARY.md](CLEANUP_VERIFICATION_SUMMARY.md) - Memory cleanup verification results
- [CORPSE_CLEANUP_VERIFICATION.md](CORPSE_CLEANUP_VERIFICATION.md) - Corpse cleanup system verification
- [PERSISTENT_EFFECTS_VERIFICATION.md](PERSISTENT_EFFECTS_VERIFICATION.md) - Persistent effects cleanup verification

## Related Documentation

- [Memory Management](../Memory_Management/README.md) - Memory cleanup patterns
- [cleanup.md](../../../.kiro/steering/cleanup.md) - Cleanup steering rules

## Performance Targets

- Wave 1-5: 300-350MB memory usage
- Wave 10: ~400MB memory usage
- Wave 20+: ~450MB memory usage (stable)
- Memory should stabilize, not grow continuously
- 60 FPS target on modern hardware

## Testing Approach

1. Run extended gameplay sessions (20+ waves)
2. Monitor memory usage over time
3. Check for memory leaks (continuous growth)
4. Verify cleanup between waves
5. Profile graphics performance
6. Test on various hardware configurations

