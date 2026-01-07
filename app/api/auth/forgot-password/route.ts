import { NextRequest, NextResponse } from "next/server";

import { getUserByEmail, updateUser } from "@/lib/mysql/queries";
import { generateToken } from "@/lib/auth/password";
import { sendEmail, renderTemplate } from "@/lib/email/mailer";
import { getEmailTemplate } from "@/lib/mysql/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "E-posta gereklidir" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    
    if (!user) {
      // Güvenlik için kullanıcı bulunamasa bile başarılı mesajı döndür
      return NextResponse.json({
        success: true,
        message: "Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi"
      });
    }

    // Reset token oluştur (1 saat geçerli)
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await updateUser(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: resetExpires
    });

    // E-posta şablonunu al
    const template = await getEmailTemplate('password_reset');
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/reset-password?token=${resetToken}`;

    if (template) {
      const htmlContent = renderTemplate(template.html_content, {
        name: user.full_name || user.username,
        reset_link: resetLink
      });

      await sendEmail({
        to: email,
        subject: template.subject,
        html: htmlContent
      });
    } else {
      // Şablon yoksa basit e-posta gönder
      await sendEmail({
        to: email,
        subject: 'Şifre Sıfırlama Talebi',
        html: `
          <h1>Şifre Sıfırlama</h1>
          <p>Merhaba ${user.full_name || user.username},</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
          <a href="${resetLink}">Şifreyi Sıfırla</a>
          <p>Bu link 1 saat geçerlidir.</p>
        `
      });
    }

    return NextResponse.json({
      success: true,
      message: "Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

