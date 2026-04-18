import { describe, it } from 'node:test';
import assert from 'node:assert';
import { executeWithRetry, RateLimitError } from '../retryService.ts';

describe('executeWithRetry', () => {
  it('returns successfully on the first attempt without retrying', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      return 'success';
    };

    const result = await executeWithRetry(fn);
    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 1);
  });

  it('retries on rate limit (429) and succeeds', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw new Error('429 Too Many Requests');
      return 'success';
    };

    const result = await executeWithRetry(fn, { initialDelay: 1, backoffFactor: 1 });
    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 3);
  });

  it('throws RateLimitError when retries are exhausted for a rate limit error', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      throw new Error('429 quota exceeded');
    };

    await assert.rejects(
      async () => executeWithRetry(fn, { retries: 2, initialDelay: 1 }),
      RateLimitError
    );
    assert.strictEqual(attempts, 3); // 1 initial + 2 retries
  });

  it('throws immediately for non-retryable errors', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      throw new Error('Some random error');
    };

    await assert.rejects(
      async () => executeWithRetry(fn, { retries: 2, initialDelay: 1 }),
      /Some random error/
    );
    assert.strictEqual(attempts, 1); // Should not retry
  });

  it('respects custom shouldRetry predicate', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 2) throw new Error('RetryMe');
      return 'success';
    };

    const result = await executeWithRetry(fn, {
      initialDelay: 1,
      shouldRetry: (err) => err.message === 'RetryMe'
    });
    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 2);
  });

  it('returns the literal fallback value when retries are exhausted', async () => {
    const fn = async () => {
      throw new Error('500 Internal Server Error');
    };

    const result = await executeWithRetry(fn, {
      retries: 1,
      initialDelay: 1,
      fallback: 'fallback_value'
    });
    assert.strictEqual(result, 'fallback_value');
  });

  it('executes the fallback function when retries are exhausted', async () => {
    const fn = async () => {
      throw new Error('500 Internal Server Error');
    };

    const fallbackFn = async () => 'fallback_function_value';

    const result = await executeWithRetry(fn, {
      retries: 1,
      initialDelay: 1,
      fallback: fallbackFn
    });
    assert.strictEqual(result, 'fallback_function_value');
  });
});

  it('calculates backoff delay accurately', async () => {
    let attempts = 0;
    const delays: number[] = [];
    const originalSetTimeout = global.setTimeout;

    // Mock setTimeout to capture delays
    (global as any).setTimeout = (cb: any, ms: number) => {
        delays.push(ms);
        cb();
    };

    const fn = async () => {
      attempts++;
      throw new Error('500 Server Error');
    };

    await assert.rejects(
        executeWithRetry(fn, {
            retries: 2,
            initialDelay: 50,
            backoffFactor: 2,
        })
    );

    global.setTimeout = originalSetTimeout;
    assert.deepStrictEqual(delays, [50, 100]);
  });

  it('exhausts retries and throws generic error when no fallback and no 429', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      throw new Error('500 Server Error');
    };

    await assert.rejects(
      async () => executeWithRetry(fn, { retries: 1, initialDelay: 1 }),
      /500 Server Error/
    );
    assert.strictEqual(attempts, 2);
  });

  it('handles non-Error objects being thrown', async () => {
      let attempts = 0;
      const fn = async () => {
          attempts++;
          throw "String Error 500";
      };

      await assert.rejects(
          async () => executeWithRetry(fn, { retries: 1, initialDelay: 1 }),
          (err: any) => err === "String Error 500"
      );
      assert.strictEqual(attempts, 2);
  });
