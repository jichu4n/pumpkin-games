export interface ThrottlerConfig {
  // The number of milliseconds to wait before allowing another call.
  waitMs: number | ((key: string) => number);
}

export const DEFAULT_WAIT_MS = 500;
export const DEFAULT_THROTTLE_CONFIG: ThrottlerConfig = Object.freeze({
  waitMs: DEFAULT_WAIT_MS,
});

export class Throttler {
  private lastCallTime = 0;
  private lastKey: string | null = null;
  private config: ThrottlerConfig;

  constructor(config: Partial<ThrottlerConfig> = {}) {
    this.lastCallTime = 0;
    this.config = {...DEFAULT_THROTTLE_CONFIG, ...config};
  }

  shouldProceed(key: string): boolean {
    const now = new Date().getTime();
    let shouldProceed: boolean;
    if (key === this.lastKey) {
      const waitMs =
        typeof this.config.waitMs === 'function'
          ? this.config.waitMs(this.lastKey)
          : this.config.waitMs;
      shouldProceed = now - this.lastCallTime >= waitMs;
    } else {
      shouldProceed = true;
    }
    if (shouldProceed) {
      this.lastCallTime = now;
      this.lastKey = key;
    }
    return shouldProceed;
  }
}
