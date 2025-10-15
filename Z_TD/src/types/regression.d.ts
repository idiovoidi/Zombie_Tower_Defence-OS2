/**
 * Type definitions for regression library
 */

declare module 'regression' {
  export interface DataPoint {
    0: number;
    1: number;
  }

  export interface RegressionResult {
    equation: number[];
    points: DataPoint[];
    string: string;
    r2: number;
    predict(x: number): [number, number];
  }

  export interface RegressionOptions {
    order?: number;
    precision?: number;
  }

  export interface RegressionMethods {
    linear(data: DataPoint[], options?: RegressionOptions): RegressionResult;
    exponential(data: DataPoint[], options?: RegressionOptions): RegressionResult;
    logarithmic(data: DataPoint[], options?: RegressionOptions): RegressionResult;
    power(data: DataPoint[], options?: RegressionOptions): RegressionResult;
    polynomial(data: DataPoint[], options?: RegressionOptions): RegressionResult;
  }

  const regression: RegressionMethods;
  export default regression;
}
