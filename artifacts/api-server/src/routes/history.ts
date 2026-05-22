import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, downloadsTable } from "@workspace/db";
import {
  ToggleFavoriteParams,
  DeleteHistoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/history", async (_req, res): Promise<void> => {
  const records = await db
    .select()
    .from(downloadsTable)
    .orderBy(desc(downloadsTable.createdAt))
    .limit(100);

  res.json(records.map(toRecord));
});

router.get("/history/favorites", async (_req, res): Promise<void> => {
  const records = await db
    .select()
    .from(downloadsTable)
    .where(eq(downloadsTable.favorited, true))
    .orderBy(desc(downloadsTable.createdAt));

  res.json(records.map(toRecord));
});

router.patch("/history/:id/favorite", async (req, res): Promise<void> => {
  const params = ToggleFavoriteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [existing] = await db
    .select()
    .from(downloadsTable)
    .where(eq(downloadsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  const [updated] = await db
    .update(downloadsTable)
    .set({ favorited: !existing.favorited })
    .where(eq(downloadsTable.id, params.data.id))
    .returning();

  res.json(toRecord(updated));
});

router.delete("/history/:id", async (req, res): Promise<void> => {
  const params = DeleteHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db
    .delete(downloadsTable)
    .where(eq(downloadsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/stats", async (_req, res): Promise<void> => {
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(downloadsTable);

  const favResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(downloadsTable)
    .where(eq(downloadsTable.favorited, true));

  const platformResult = await db
    .select({
      platform: downloadsTable.platform,
      count: sql<number>`count(*)::int`,
    })
    .from(downloadsTable)
    .groupBy(downloadsTable.platform)
    .orderBy(sql`count(*) desc`);

  const formatResult = await db
    .select({
      format: downloadsTable.type,
      count: sql<number>`count(*)::int`,
    })
    .from(downloadsTable)
    .groupBy(downloadsTable.type);

  res.json({
    totalDownloads: totalResult[0]?.count ?? 0,
    totalFavorites: favResult[0]?.count ?? 0,
    platformBreakdown: platformResult.map((r) => ({ platform: r.platform, count: r.count })),
    formatBreakdown: formatResult.map((r) => ({ format: r.format, count: r.count })),
  });
});

function toRecord(row: any) {
  return {
    id: row.id,
    url: row.url,
    type: row.type,
    platform: row.platform,
    title: row.title,
    thumbnail: row.thumbnail ?? null,
    filesize: row.filesize ?? null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    favorited: row.favorited,
  };
}

export default router;
