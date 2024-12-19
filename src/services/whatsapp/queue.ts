import redis from './redis';

interface RemoveParticipantJob {
  phoneNumber: string;
  groupId: string;
  processAt: number;
}

const QUEUE_KEY = 'whatsapp:removal:queue';

export async function addToQueue(phoneNumber: string, groupId: string, monthsDuration: number) {
  const processAt = Date.now() + (monthsDuration * 30 * 24 * 60 * 60 * 1000);
  const job: RemoveParticipantJob = {
    phoneNumber,
    groupId,
    processAt,
  };

  await redis.zadd(QUEUE_KEY, processAt, JSON.stringify(job));
  return true;
}

export async function getQueueJobs() {
  const jobs = await redis.zrange(QUEUE_KEY, 0, -1, 'WITHSCORES');
  const formattedJobs = [];

  for (let i = 0; i < jobs.length; i += 2) {
    const job = JSON.parse(jobs[i]);
    const score = Number.parseInt(jobs[i + 1]);
    formattedJobs.push({
      ...job,
      processAt: new Date(score).toISOString(),
    });
  }

  return formattedJobs;
}

export async function getPendingJobs() {
  const now = Date.now();
  return redis.zrangebyscore(QUEUE_KEY, 0, now);
}

export async function removeJob(jobString: string) {
  await redis.zrem(QUEUE_KEY, jobString);
} 