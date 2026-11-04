import { promises as fs } from "fs";
import path from "path";

/** 构建期读取 public/data 下的静态 JSON（网站部署在 Vercel，无需后端服务）。 */
export async function readData<T>(file: string): Promise<T | null> {
  try {
    const full = path.join(process.cwd(), "public", "data", file);
    const text = await fs.readFile(full, "utf8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** 列出 meetings.json 中的会议日期（用于 generateStaticParams）。 */
export async function meetingDates(): Promise<string[]> {
  const data = await readData<{ meetings: { meeting_date: string }[] }>("meetings.json");
  return (data?.meetings ?? []).map((m) => m.meeting_date);
}
