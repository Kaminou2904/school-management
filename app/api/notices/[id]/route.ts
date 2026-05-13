import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";

// Dismiss for everyone (toggle isActive)
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const notice = await Notice.findById(id);
    if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 });

    notice.isActive = !notice.isActive;
    await notice.save();
    return NextResponse.json(notice);
  } catch {
    return NextResponse.json({ error: "Failed to update notice" }, { status: 500 });
  }
}

// Delete permanently
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 });

    return NextResponse.json({ message: "Notice deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
  }
}
