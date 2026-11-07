import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { assertCaptcha, CaptchaVerificationError } from "@/lib/captcha";
import { CAPTCHA_RESPONSE_FIELD } from "@/lib/captcha-types";
import { detectImage, stripJpegMetadata } from "@/lib/image-sanitize";
import { findApprovedGuestByToken } from "@/app/actions/event/shared";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const session = await getSession();

  const eventId = formData.get("eventId") as string | null;
  const guestEditToken = formData.get("guestEditToken") as string | null;

  let isAuthorized = false;

  // 1. Host or Admin session
  if (session && (session.role === "HOST" || session.role === "ADMIN")) {
    isAuthorized = true;
  }

  // 2. Event-specific authorization for registered participants
  if (!isAuthorized && eventId) {
    if (session) {
      const rsvp = await db.rSVP.findFirst({
        where: { eventId, userId: session.userId },
        select: { approved: true },
      });
      if (rsvp?.approved) {
        isAuthorized = true;
      }
    } else if (guestEditToken) {
      const rsvp = await findApprovedGuestByToken(guestEditToken, eventId);
      if (rsvp) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const captchaToken = formData.get(CAPTCHA_RESPONSE_FIELD);
  try {
    await assertCaptcha("image_upload", typeof captchaToken === "string" ? captchaToken : null);
  } catch (error) {
    if (error instanceof CaptchaVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });

  let buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImage(buffer);

  if (!detected) {
    return NextResponse.json({ error: "Images only (JPEG, PNG, WebP)" }, { status: 400 });
  }

  // Sanitize JPEG metadata (EXIF/GPS)
  if (detected.ext === ".jpg") {
    buffer = Buffer.from(stripJpegMetadata(buffer));
  }

  const filename = `${randomUUID()}${detected.ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/api/uploads/${filename}` });
}
