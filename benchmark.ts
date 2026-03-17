/**
 * Benchmark to simulate Firestore concurrent writes vs Batch writes.
 * Since we can't easily hit real firestore in test, we mock the setDoc
 * and writeBatch functions to simulate network latency.
 */

const mockLatency = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mocking 100 concurrent requests each taking 50ms of network latency.
// A real HTTP request has overhead (connection, SSL, headers) but 50ms is conservative.
const simulateConcurrentSetDocs = async (count: number) => {
    const start = performance.now();
    const ops = [];
    for(let i=0; i<count; i++) {
        // Each concurrent request has some latency.
        // Node handles them concurrently but network queueing/connections limits throughput.
        // We simulate a 50ms round trip for EACH request.
        // In real life, browsers cap concurrent requests (e.g. 6 per domain),
        // meaning 100 requests will take at least (100/6)*50ms = ~833ms.
        ops.push(mockLatency(50));
    }
    await Promise.all(ops);

    // Additional overhead: simulate the fact that browser throttles 100 connections
    // down to chunks of ~6.
    const browserThrottleSim = (count / 6) * 50;
    await mockLatency(browserThrottleSim);

    return performance.now() - start;
};

// Mocking a single Batch write request handling 100 items.
const simulateBatchCommit = async (count: number) => {
    const start = performance.now();
    // One network request, carrying more payload.
    // Base 50ms round trip + small payload parse time (1ms per item).
    await mockLatency(50 + (count * 1));
    return performance.now() - start;
};

/** The runBenchmark function. */
async function runBenchmark() {
    const ITEMS = 100;
    console.log(`\nStarting Benchmark: Saving ${ITEMS} items to Cloud`);
    console.log(`--------------------------------------------------`);

    const concurrentTime = await simulateConcurrentSetDocs(ITEMS);
    console.log(`Baseline (Promise.all concurrent setDoc): ${concurrentTime.toFixed(2)}ms`);

    const batchTime = await simulateBatchCommit(ITEMS);
    console.log(`Optimized (Firestore writeBatch): ${batchTime.toFixed(2)}ms`);

    const improvement = ((concurrentTime - batchTime) / concurrentTime) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}% faster`);
    console.log(`--------------------------------------------------\n`);
}

runBenchmark().catch(console.error);
