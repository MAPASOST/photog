import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { savePhoto, ensureUploadsDir } from "@/lib/photos";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  ensureUploadsDir();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(uploadPath, buffer);

  // Try to get image dimensions
  let width = 0;
  let height = 0;
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buffer).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  } catch {
    // sharp optional
  }

  const photo = {
    id: randomUUID(),
    filename,
    title: (formData.get("title") as string) || file.name.replace(/\.[^.]+$/, ""),
    description: (formData.get("description") as string) || "",
    location: (formData.get("location") as string) || "",
    takenAt: (formData.get("takenAt") as string) || new Date().toISOString().split("T")[0],
    uploadedAt: new Date().toISOString(),
    width,
    height,
  };

  savePhoto(photo);
  return NextResponse.json(photo);
}
