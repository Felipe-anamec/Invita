"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { logSafe } from "@/lib/logger";
import { AddEventPhotoSchema, DeleteEventPhotoSchema } from "@/lib/schemas";
import { findApprovedGuestByToken } from "./shared";
import { eventActionMessage } from "./localization";

export async function getEventPhotos(eventId: string, options?: { isVenuePhoto?: boolean }) {
  const where: { eventId: string; isVenuePhoto?: boolean } = { eventId };
  if (options?.isVenuePhoto !== undefined) {
    where.isVenuePhoto = options.isVenuePhoto;
  }

  return db.eventPhoto.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      caption: true,
      uploaderName: true,
      uploaderId: true,
      isVenuePhoto: true,
      createdAt: true,
    },
  });
}

export async function addEventPhoto(rawInput: unknown) {
  const data = AddEventPhotoSchema.parse(rawInput);

  const event = await db.event.findUnique({
    where: { id: data.eventId },
    select: {
      slug: true,
      hostId: true,
      visibility: true,
      status: true,
      coHosts: { select: { userId: true } },
    },
  });

  if (!event || event.status === "CANCELLED" || event.status === "DELETED") {
    return { success: false, error: await eventActionMessage("eventNotFound") };
  }

  const session = await getSession();
  const isHost = event.hostId === session?.userId || session?.role === "ADMIN";
  const isCohost = event.coHosts.some((ch: { userId: string }) => ch.userId === session?.userId);

  let uploaderName: string;
  let uploaderId: string;

  // Venue photos may only be uploaded by host or co-hosts
  if (data.isVenuePhoto) {
    if (!session || (!isHost && !isCohost)) {
      return { success: false, error: await eventActionMessage("forbidden") };
    }
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    });
    uploaderName = user?.name?.trim() || user?.email || "Host";
    uploaderId = session.userId;
  } else if (session && (isHost || isCohost)) {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    });
    uploaderName = user?.name?.trim() || user?.email || "Host";
    uploaderId = session.userId;
  } else if (session) {
    // Authenticated non-host user
    const rsvp = await db.rSVP.findFirst({
      where: { eventId: data.eventId, userId: session.userId },
      select: { id: true, guestName: true, approved: true },
    });

    if (event.visibility === "PRIVATE" && (!rsvp || !rsvp.approved)) {
      return { success: false, error: await eventActionMessage("forbidden") };
    }

    if (rsvp) {
      uploaderName = rsvp.guestName;
      uploaderId = rsvp.id;
    } else {
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true },
      });
      uploaderName = user?.name?.trim() || user?.email || "Guest";
      uploaderId = session.userId;
    }
  } else {
    // Guest via editToken
    const rsvp = await findApprovedGuestByToken(data.guestEditToken, data.eventId);
    if (!rsvp) {
      return { success: false, error: await eventActionMessage("unauthorized") };
    }
    uploaderName = rsvp.guestName;
    uploaderId = rsvp.id;
  }

  const photo = await db.eventPhoto.create({
    data: {
      eventId: data.eventId,
      url: data.url,
      caption: data.caption,
      uploaderName,
      uploaderId,
      isVenuePhoto: data.isVenuePhoto,
    },
  });

  await logActivity(
    data.eventId,
    data.isVenuePhoto ? "venue_photo_add" : "gallery_photo_add",
    `${uploaderName} subió una fotografía${data.caption ? `: "${data.caption}"` : ""}`,
    uploaderName
  ).catch(logSafe("addEventPhoto"));

  revalidatePath(`/e/${event.slug}`);
  return { success: true, photo };
}

export async function deleteEventPhoto(rawInput: unknown) {
  const data = DeleteEventPhotoSchema.parse(rawInput);

  const photo = await db.eventPhoto.findUnique({
    where: { id: data.photoId },
    include: {
      event: {
        select: {
          slug: true,
          hostId: true,
          coHosts: { select: { userId: true } },
        },
      },
    },
  });

  if (!photo) {
    return { success: false, error: await eventActionMessage("eventNotFound") };
  }

  const session = await getSession();
  const isHost = photo.event.hostId === session?.userId || session?.role === "ADMIN";
  const isCohost = photo.event.coHosts.some(
    (ch: { userId: string }) => ch.userId === session?.userId
  );

  let isAuthorized = isHost || isCohost;

  if (!isAuthorized && session && photo.uploaderId === session.userId) {
    isAuthorized = true;
  } else if (!isAuthorized && data.guestEditToken) {
    const rsvp = await findApprovedGuestByToken(data.guestEditToken, photo.eventId);
    if (rsvp && photo.uploaderId === rsvp.id) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return { success: false, error: await eventActionMessage("forbidden") };
  }

  await db.eventPhoto.delete({
    where: { id: data.photoId },
  });

  revalidatePath(`/e/${photo.event.slug}`);
  return { success: true };
}
