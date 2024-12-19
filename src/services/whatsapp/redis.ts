import { Redis } from 'ioredis';

const redis = new Redis(process.env.KV_URL as string);

export default redis; 