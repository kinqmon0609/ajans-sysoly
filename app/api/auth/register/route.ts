import { NextRequest, NextResponse } from "next/server";

import { createUser, getUserByEmail, getUserByUsername } from "@/lib/mysql/queries";
import { hashPassword, generateToken as generateRandomToken } from "@/lib/auth/password";
import { sendEmail, renderTemplate } from "@/lib/email/mailer";
import { getEmailTemplate } from "@/lib/mysql/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, full_name } = body;

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanlar gereklidir" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten alınmış" },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateRandomToken();

    // Create user
    await createUser({
      username,
      email,
      password_hash,
      full_name,
      role: 'viewer' // Default role
    });

    // Send verification email
    const template = await getEmailTemplate('email_verification');
    if (template) {
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/verify-email?token=${verificationToken}`;
      const htmlContent = renderTemplate(template.html_content, {
        name: full_name || username,
        verification_link: verificationLink
      });

      await sendEmail({
        to: email,
        subject: template.subject,
        html: htmlContent
      });
    }

    return NextResponse.json({
      success: true,
      message: "Kayıt başarılı! E-posta adresinizi doğrulayın."
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Kayıt olurken hata oluştu" },
      { status: 500 }
    );
  }
}

