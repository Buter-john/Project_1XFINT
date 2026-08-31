const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key, { reset = false } = {}) {
  const now = Date.now();

  if (reset) {
    attempts.delete(key);
    return { allowed: true };
  }

  const entry = attempts.get(key);

  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(key, { count: 1, start: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false };
  }

  entry.count += 1;
  return { allowed: true };
}