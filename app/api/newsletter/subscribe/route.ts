import { NextRequest, NextResponse } from "next/server";

import { addNewsletterSubscriber } from "@/lib/mysql/queries";
import { sendEmail } from "@/lib/email/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gereklidir" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçersiz e-posta adresi" },
        { status: 400 }
      );
    }

    await addNewsletterSubscriber(email, name);

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Bültenimize Hoş Geldiniz!',
      html: `
        <h1>Merhaba${name ? ` ${name}` : ''}!</h1>
        <p>Bültenimize abone olduğunuz için teşekkür ederiz.</p>
        <p>Artık en son haberlerimizi ve güncellemelerimizi e-posta ile alacaksınız.</p>
        <p>İyi günler dileriz!</p>
      `
    });

    return NextResponse.json({
      success: true,
      message: "Bültene başarıyla abone oldunuz!"
    });

  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Abonelik işlemi başarısız oldu" },
      { status: 500 }
    );
  }
}

