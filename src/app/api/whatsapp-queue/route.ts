import { getQueueJobs, getPendingJobs, removeJob } from '@/services/whatsapp/queue';
import { whatsAppService } from '@/services/whatsapp';
import { NextResponse } from 'next/server';
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";

export const GET = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para ver la cola de WhatsApp" },
        { status: 403 }
      );
    }

    try {
      // Process any pending jobs first
      const pendingJobs = await getPendingJobs();
      
      for (const jobString of pendingJobs) {
        try {
          const job = JSON.parse(jobString);
          await whatsAppService.removeParticipant(job.phoneNumber, job.groupId);
          await removeJob(jobString);
          console.log(`Successfully removed ${job.phoneNumber} from group ${job.groupId}`);
        } catch (error) {
          console.error('Failed to process job:', error);
        }
      }

      // Get all jobs
      const jobs = await getQueueJobs();

      return NextResponse.json({ jobs });
    } catch (error) {
      console.error('Error fetching queue status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch queue status' },
        { status: 500 }
      );
    }
  })
);