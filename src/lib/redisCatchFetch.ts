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
  await redisHandler.set(key, data, ttl);
  return data;
}
