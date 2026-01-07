import { NextRequest, NextResponse } from "next/server";

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { getUserById, updateUser, deleteUser } from "@/lib/mysql/queries";
import { hashPassword } from "@/lib/auth/password";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Remove sensitive data
    delete (user as any).password_hash;
    delete (user as any).two_factor_secret;

    return NextResponse.json({ user });

  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Kullanıcı yüklenemedi" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates: any = {};
    
    if (body.username) updates.username = body.username;
    if (body.email) updates.email = body.email;
    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.role) updates.role = body.role;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    
    if (body.password) {
      updates.password_hash = await hashPassword(body.password);
    }

    await updateUser(id, updates);

    return NextResponse.json({ success: true, message: "Kullanıcı güncellendi" });

  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Kullanıcı güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const { id } = await params;
    await deleteUser(id);

    return NextResponse.json({ success: true, message: "Kullanıcı silindi" });

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Kullanıcı silinemedi" }, { status: 500 });
  }
}

