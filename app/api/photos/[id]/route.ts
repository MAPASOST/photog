import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deletePhoto, getPhoto } from "@/lib/photos";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const photo = getPhoto(id);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  deletePhoto(id);
  return NextResponse.json({ success: true });
}
