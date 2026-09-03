import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// export const registerRateLimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(5, "1 m"),
//   prefix: "lentra:register",
// });

// export const telegramSendFromLandingRateLimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(5, "1 m"),
//   prefix: "lentra:register",
// });
