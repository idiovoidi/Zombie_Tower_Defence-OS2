/**
 * Library Import Test
 * Verifies that statistical analysis libraries load correctly
 */

import * as ss from 'simple-statistics';
import regression from 'regression';
import { all, create } from 'mathjs';

/**
 * Test that all required libraries can be imported and basic functions work
 */
export function testLibraryImports(): boolean {
  try {
    // Test simple-statistics
    const testData = [1, 2, 3, 4, 5];
    const mean = ss.mean(testData);
    const stdDev = ss.standardDeviation(testData);

    if (typeof mean !== 'number' || typeof stdDev !== 'number') {
      console.error('❌ simple-statistics test failed');
      return false;
    }

    // Test regression
    const regressionData: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
    ];
    const result = regression.linear(regressionData);

    if (!result || typeof result.equation[0] !== 'number') {
      console.error('❌ regression test failed');
      return false;
    }

    // Test mathjs
    const math = create(all);
    const matrixTest = math.matrix([
      [1, 2],
      [3, 4],
    ]);
    const det = math.det(matrixTest);

    if (typeof det !== 'number') {
      console.error('❌ mathjs test failed');
      return false;
    }

    console.log('✅ All statistical libraries loaded successfully');
    console.log(`   - simple-statistics: mean=${mean}, stdDev=${stdDev.toFixed(2)}`);
    console.log(`   - regression: slope=${result.equation[0]}, intercept=${result.equation[1]}`);
    console.log(`   - mathjs: determinant=${det}`);

    return true;
  } catch (error) {
    console.error('❌ Library import test failed:', error);
    return false;
  }
}

// Run test immediately when imported (for verification)
if (import.meta.env.DEV) {
  testLibraryImports();
}
