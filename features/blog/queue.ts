import { Queue, Worker, type ConnectionOptions } from "bullmq";

export const QUEUE_NAME = "blog-publish";
export const SWEEP_JOB = "sweep";

/** Upstash Redis TCP endpoint derived from the REST URL + token already in .env. */
export function buildConnection(): ConnectionOptions {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are required");
  }
  return {
    host: new URL(url).hostname,
    port: 6379,
    password: token,
    tls: {},
    maxRetriesPerRequest: null,
  };
}

export function createPublishQueue() {
  return new Queue(QUEUE_NAME, { connection: buildConnection() });
}
