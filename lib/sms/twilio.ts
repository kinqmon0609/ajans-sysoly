import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface SMSOptions {
  to: string;
  message: string;
}

/**
 * Send SMS using Twilio
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  if (!client || !twilioPhone) {
    console.warn('Twilio not configured. SMS not sent.');
    return false;
  }

  try {
    await client.messages.create({
      body: options.message,
      to: options.to,
      from: twilioPhone,
    });
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

/**
 * Send WhatsApp message using Twilio
 */
export async function sendWhatsApp(options: SMSOptions): Promise<boolean> {
  if (!client || !twilioPhone) {
    console.warn('Twilio not configured. WhatsApp message not sent.');
    return false;
  }

  try {
    await client.messages.create({
      body: options.message,
      to: `whatsapp:${options.to}`,
      from: `whatsapp:${twilioPhone}`,
    });
    return true;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

