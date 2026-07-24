import { Router } from "express";
import { eq } from "drizzle-orm";
import { requireAuth, requirePasswordSet, type AuthedRequest } from "../middleware/requireAuth.js";
import { requireMasterAdmin } from "../middleware/requireAdminDepartment.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { upload } from "../middleware/upload.js";
import { setProfileSchema } from "../utils/validation.js";
import { db } from "../db/client.js";
import { profiles } from "../db/schema.js";
import { uploadAttachmentBuffer, getSignedAttachmentUrl } from "../services/storage.service.js";

export const profilesRouter = Router();

profilesRouter.use(requireAuth, requirePasswordSet);

function identifierFor(req: AuthedRequest): string {
  return req.auth!.sub;
}

async function toProfileDto(row: typeof profiles.$inferSelect | undefined, identifier: string) {
  if (!row) return { identifier };
  const avatarUrl = row.avatarPath ? await getSignedAttachmentUrl(row.avatarPath).catch(() => null) : null;
  return { ...row, avatarUrl };
}

profilesRouter.get(
  "/me",
  asyncHandler(async (req: AuthedRequest, res) => {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.identifier, identifierFor(req)))
      .limit(1);
    res.json(await toProfileDto(row, identifierFor(req)));
  }),
);

profilesRouter.post(
  "/me/avatar",
  upload.single("file"),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!req.file) throw new HttpError(400, "file is required");
    const identifier = identifierFor(req);
    const { path } = await uploadAttachmentBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "avatars",
    );
    const [existing] = await db.select().from(profiles).where(eq(profiles.identifier, identifier)).limit(1);
    const [row] = existing
      ? await db
          .update(profiles)
          .set({ avatarPath: path, updatedAt: new Date() })
          .where(eq(profiles.identifier, identifier))
          .returning()
      : await db.insert(profiles).values({ identifier, avatarPath: path }).returning();
    res.json(await toProfileDto(row, identifier));
  }),
);

profilesRouter.patch(
  "/me",
  asyncHandler(async (req: AuthedRequest, res) => {
    const patch = setProfileSchema.parse(req.body);
    const identifier = identifierFor(req);
    const [existing] = await db.select().from(profiles).where(eq(profiles.identifier, identifier)).limit(1);
    // Official mail is locked after first entry, for every role — once set,
    // only the master-only PATCH /:identifier override channel can change it.
    if (existing?.officeMail && patch.officeMail !== undefined && patch.officeMail !== existing.officeMail) {
      throw new HttpError(
        403,
        "official mail is locked after first entry — contact the master admin to change it",
      );
    }
    const [row] = existing
      ? await db
          .update(profiles)
          .set({ ...patch, updatedAt: new Date() })
          .where(eq(profiles.identifier, identifier))
          .returning()
      : await db
          .insert(profiles)
          .values({ identifier, ...patch })
          .returning();
    res.json(await toProfileDto(row, identifier));
  }),
);

// Master-admin-only: view/edit any employee's profile (e.g. office mail) by identifier.
// Registered after "/me" so that literal route continues to win for the caller's own profile.
profilesRouter.get(
  "/:identifier",
  requireMasterAdmin,
  asyncHandler(async (req, res) => {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.identifier, req.params.identifier))
      .limit(1);
    res.json(await toProfileDto(row, req.params.identifier));
  }),
);

profilesRouter.patch(
  "/:identifier",
  requireMasterAdmin,
  asyncHandler(async (req, res) => {
    const patch = setProfileSchema.parse(req.body);
    const identifier = req.params.identifier;
    const [existing] = await db.select().from(profiles).where(eq(profiles.identifier, identifier)).limit(1);
    const [row] = existing
      ? await db
          .update(profiles)
          .set({ ...patch, updatedAt: new Date() })
          .where(eq(profiles.identifier, identifier))
          .returning()
      : await db
          .insert(profiles)
          .values({ identifier, ...patch })
          .returning();
    res.json(await toProfileDto(row, identifier));
  }),
);
