import { mockDailyLogs } from "@/lib/mock-data";

export async function GET() {
  return Response.json(mockDailyLogs);
}
