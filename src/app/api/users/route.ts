import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  image: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https:\/\/res\.cloudinary\.com\/.+/.test(value),
      "Image must be uploaded through Cloudinary"
    )
    .nullable()
    .optional(),
  service: z.string().trim().max(120).nullable().optional(),
});

async function getCurrentUserEmail() {
  const session = await getServerSession(authOptions);
  return session?.user?.email;
}

function formValueToString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  return value;
}

function formValueToNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function GET() {
  const email = await getCurrentUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      service: true,
      isActive: true,
      status: true,
      currentStreak: true,
      longestStreak: true,
      lastLoggedInAt: true,
      autoEnrich: true,
      defaultSendWindow: true,
      webPushEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PUT(request: NextRequest) {
  const email = await getCurrentUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let data: z.infer<typeof profileSchema>;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const imageFile = formData.get("imageFile");

    data = profileSchema.parse({
      name: formValueToString(formData.get("name")),
      image: formValueToNullableString(formData.get("image")),
      service: formValueToNullableString(formData.get("service")),
    });

    if (imageFile instanceof File && imageFile.size > 0) {
      const uploadedImage = await uploadImageToCloudinary(imageFile);
      data.image = uploadedImage.imageUrl;
    }
  } else {
    const body = await request.json();
    data = profileSchema.parse(body);
  }

  const user = await prisma.user.update({
    where: { email },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      service: true,
      isActive: true,
      status: true,
      currentStreak: true,
      longestStreak: true,
      lastLoggedInAt: true,
      autoEnrich: true,
      defaultSendWindow: true,
      webPushEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ data: user });
}
