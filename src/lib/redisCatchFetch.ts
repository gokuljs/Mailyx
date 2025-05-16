import redisHandler from "./redis";

export async function catchFirst<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600,
): Promise<T> {
  const cached = await redisHandler.get<T>(key);
  if (cached) {
    console.log(`[Cache HIT] ${key}`);
    return cached;
  }
  console.log(`[Cache MISS] ${key}`);
  const data = await fetcher();

  // Only cache if data is not empty
  if (
    data &&
    (typeof data !== "object" ||
      Object.keys(data).length > 0 ||
      (Array.isArray(data) && data.length > 0))
  ) {
    await redisHandler.set(key, data, ttl);
  } else {
    console.log(`[Cache SKIP] Empty data for ${key}`);
  }

  return data;
}
