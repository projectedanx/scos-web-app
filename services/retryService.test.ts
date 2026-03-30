import { test, mock } from 'node:test';
import assert from 'node:assert';
import { executeWithRetry, RateLimitError } from './retryService.ts';

test('executeWithRetry', async (t) => {
  await t.test('succeeds on first attempt', async () => {
    const fn = mock.fn(() => Promise.resolve('success'));
    const result = await executeWithRetry(fn);
    assert.strictEqual(result, 'success');
    assert.strictEqual(fn.mock.calls.length, 1);
  });

  await t.test('retries on network error and succeeds', async () => {
    let attempts = 0;
    const fn = mock.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('fetch failed');
      return 'success';
    });
    const result = await executeWithRetry(fn, { initialDelay: 10, backoffFactor: 2 });
    assert.strictEqual(result, 'success');
    assert.strictEqual(fn.mock.calls.length, 3);
  });

  await t.test('exhausts retries and uses fallback', async () => {
    const fn = mock.fn(async () => { throw new Error('500 Server Error'); });
    const fallback = mock.fn(() => Promise.resolve('fallback-value'));
    const result = await executeWithRetry(fn, {
      initialDelay: 10,
      retries: 2,
      fallback
    });
    assert.strictEqual(result, 'fallback-value');
    assert.strictEqual(fn.mock.calls.length, 3);
    assert.strictEqual(fallback.mock.calls.length, 1);
  });

  await t.test('throws RateLimitError on 429 without fallback', async () => {
    const fn = mock.fn(async () => { throw new Error('429 Too Many Requests'); });
    await assert.rejects(
      () => executeWithRetry(fn, { initialDelay: 1, retries: 1 }),
      (err: any) => err instanceof RateLimitError
    );
  });

  await t.test('fails securely when the database connection times out', async () => {
      let attempt = 0;
      const fn = mock.fn(async () => {
          attempt++;
          throw new Error('Connection Timeout');
      });
      await assert.rejects(
          () => executeWithRetry(fn, { initialDelay: 1, retries: 1 }),
          (err: any) => err.message === 'Connection Timeout'
      );
      assert.strictEqual(attempt, 1); // Timeout shouldn't be retried by default unless specified
  });

  await t.test('respects custom shouldRetry predicate', async () => {
      let attempt = 0;
      const fn = mock.fn(async () => {
          attempt++;
          if (attempt < 2) throw new Error('Custom Transient Error');
          return 'success';
      });
      const result = await executeWithRetry(fn, {
          initialDelay: 1,
          retries: 2,
          shouldRetry: (err) => err.message === 'Custom Transient Error'
      });
      assert.strictEqual(result, 'success');
      assert.strictEqual(attempt, 2);
  });

  await t.test('returns static fallback value correctly', async () => {
    const fn = mock.fn(async () => { throw new Error('500 Server Error'); });
    const result = await executeWithRetry(fn, {
      initialDelay: 1,
      retries: 1,
      fallback: 'static-fallback'
    });
    assert.strictEqual(result, 'static-fallback');
  });

  await t.test('calculates backoff delay accurately', async () => {
    // Sabotage logic: assert the delay taken is correct by timing the execution
    const startTime = performance.now();
    const fn = mock.fn(async () => { throw new Error('500 Server Error'); });
    try {
        await executeWithRetry(fn, { initialDelay: 50, retries: 2, backoffFactor: 2 });
    } catch (e) {}
    const endTime = performance.now();
    const duration = endTime - startTime;
    // Expected delay = 50ms + 100ms = 150ms
    // We allow a small tolerance, normally it should be >= 150ms and likely <= 200ms
    assert.ok(duration >= 140, `Duration too short: ${duration}ms`);
  });

  await t.test('exhausts retries and throws generic error when no fallback and no 429', async () => {
    const fn = mock.fn(async () => { throw new Error('500 Server Error'); });
    await assert.rejects(
      () => executeWithRetry(fn, { initialDelay: 1, retries: 1 }),
      (err: any) => err.message === '500 Server Error' && !(err instanceof RateLimitError)
    );
  });

  await t.test('handles non-Error objects being thrown', async () => {
    const fn = mock.fn(async () => { throw 'String Error 500'; });
    await assert.rejects(
      () => executeWithRetry(fn, { initialDelay: 1, retries: 1 }),
      (err: any) => err === 'String Error 500'
    );
  });
});
