/**
 * Statistics for an object pool
 */
export interface PoolStats {
  active: number;
  available: number;
  created: number;
  reused: number;
}

/**
 * Generic object pool for reusing objects to reduce garbage collection overhead
 * @template T The type of objects to pool
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private active: Set<T> = new Set();
  private created: number = 0;
  private reused: number = 0;

  /**
   * Creates a new object pool
   * @param factory Function to create new objects
   * @param reset Function to reset objects when released back to pool
   * @param maxSize Maximum number of objects to keep in the pool
   */
  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    private maxSize: number
  ) {}

  /**
   * Acquire an object from the pool or create a new one
   * @returns An object ready for use
   */
  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      const pooledObj = this.available.pop();
      if (pooledObj) {
        obj = pooledObj;
        this.reused++;
      } else {
        obj = this.factory();
        this.created++;
      }
    } else {
      obj = this.factory();
      this.created++;
    }

    this.active.add(obj);
    return obj;
  }

  /**
   * Release an object back to the pool for reuse
   * @param obj The object to release
   */
  release(obj: T): void {
    if (!this.active.has(obj)) {
      console.warn('Attempted to release object not acquired from this pool');
      return;
    }

    this.active.delete(obj);
    this.reset(obj);

    // Only keep up to maxSize objects in the pool
    if (this.available.length < this.maxSize) {
      this.available.push(obj);
    }
  }

  /**
   * Clear all pooled objects
   */
  clear(): void {
    this.available = [];
    this.active.clear();
  }

  /**
   * Get pool statistics
   * @returns Statistics about pool usage
   */
  getStats(): PoolStats {
    return {
      active: this.active.size,
      available: this.available.length,
      created: this.created,
      reused: this.reused,
    };
  }
}
