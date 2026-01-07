import { NextRequest, NextResponse } from "next/server";

import { getUserByEmail, getUserByUsername, updateUser, logUserActivity } from "@/lib/mysql/queries";
import { verifyPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, twoFactorCode } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Find user by email or username
    let user: any = await getUserByEmail(username);
    if (!user) {
      user = await getUserByUsername(username);
    }

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Hatalı şifre" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Hesabınız devre dışı bırakılmış" },
        { status: 403 }
      );
    }

    // Check 2FA if enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { requires2FA: true, message: "2FA kodu gerekli" },
          { status: 200 }
        );
      }

      const { verifyToken: verify2FA } = await import("@/lib/auth/two-factor");
      const isValid2FA = verify2FA(user.two_factor_secret, twoFactorCode);
      
      if (!isValid2FA) {
        return NextResponse.json(
          { error: "Geçersiz 2FA kodu" },
          { status: 401 }
        );
      }
    }

    // Update last login
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    await updateUser(user.id, {
      last_login_at: new Date(),
      last_login_ip: ipAddress
    });

    // Log activity
    await logUserActivity({
      user_id: user.id,
      action: 'login',
      ip_address: ipAddress,
      user_agent: request.headers.get('user-agent') || undefined
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Remove sensitive data
    delete user.password_hash;
    delete user.two_factor_secret;

    return NextResponse.json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Giriş yapılırken hata oluştu" },
      { status: 500 }
    );
  }
}

