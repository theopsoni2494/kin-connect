import { Router } from "express";
<<<<<<< HEAD
import { requireAuth, requirePasswordSet } from "../middleware/requireAuth.js";
=======
import { requireAuth } from "../middleware/requireAuth.js";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import { upload } from "../middleware/upload.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import {
  createTextAttachment,
  createFileAttachment,
  getAttachment,
  toAttachmentDto,
} from "../services/attachment.service.js";

export const attachmentsRouter = Router();

<<<<<<< HEAD
attachmentsRouter.use(requireAuth, requirePasswordSet);
=======
attachmentsRouter.use(requireAuth);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

/**
 * Accepts either:
 *  - multipart/form-data with a `file` field + `kind` field (voice/video/photo/file)
 *  - application/json body { kind: 'text', text: '...' }
 */
attachmentsRouter.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const kind = (req.body?.kind as string) ?? (req.file ? "file" : "text");

    if (kind === "text") {
      const text = (req.body?.text as string)?.trim();
      if (!text) throw new HttpError(400, "text is required for kind=text");
      const row = await createTextAttachment(text);
      return res.status(201).json(await toAttachmentDto(row));
    }

    if (!req.file) throw new HttpError(400, "file is required for kind=" + kind);
    if (!["voice", "video", "photo", "file"].includes(kind)) {
      throw new HttpError(400, `invalid kind: ${kind}`);
    }
    const row = await createFileAttachment(
      kind as "voice" | "video" | "photo" | "file",
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );
    res.status(201).json(await toAttachmentDto(row));
  }),
);

attachmentsRouter.get(
  "/:id/url",
  asyncHandler(async (req, res) => {
    const row = await getAttachment(req.params.id);
    if (!row) throw new HttpError(404, "attachment not found");
    res.json(await toAttachmentDto(row));
  }),
);
