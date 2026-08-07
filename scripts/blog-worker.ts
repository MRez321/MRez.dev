/**
 * Scheduled-publishing worker. Publishes due posts every minute via BullMQ
 * (Upstash Redis as the broker). Run with:
 *   npm run blog:worker
 */
import { Worker } from "bullmq";
import { publishDuePosts } from "../features/blog/api/scheduler";
import { buildConnection, createPublishQueue, QUEUE_NAME, SWEEP_JOB } from "../features/blog/queue";

const SWEEP_INTERVAL_MS = 60_000;

async function main() {
  const connection = buildConnection();
  const queue = createPublishQueue();

  // Kick one immediately, then let the repeatable scheduler own the cadence.
  await queue.add(SWEEP_JOB, {}, { jobId: "startup-sweep" });
  await queue.upsertJobScheduler("sweep-every-minute", { every: SWEEP_INTERVAL_MS }, { name: SWEEP_JOB });
  console.log(`[blog-worker] sweep scheduled every ${SWEEP_INTERVAL_MS / 1000}s`);

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name !== SWEEP_JOB) return;
      const published = await publishDuePosts(false);
      if (published > 0) {
        console.log(`[blog-worker] published ${published} due post(s)`);
      }
    },
    { connection, concurrency: 1 }
  );

  worker.on("ready", () => console.log("[blog-worker] connected to Redis, waiting for jobs"));
  worker.on("error", (err) => console.error("[blog-worker] redis error:", err.message));
  worker.on("failed", (_job, err) => console.error("[blog-worker] job failed:", err.message));

  await worker.waitUntilReady();
  console.log("[blog-worker] ready. Ctrl+C to stop.");

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("[blog-worker] shutting down…");
    await worker.close();
    await queue.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[blog-worker] fatal:", err);
  process.exit(1);
});
