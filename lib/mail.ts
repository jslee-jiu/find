import { Resend } from "resend";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM ?? "no-reply@example.com";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendMail(options: SendMailOptions): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY이 설정되지 않아 메일이 실제로 발송되지 않습니다.");
    console.log("Simulated mail:", options);
    return;
  }

  await resend.emails.send({
    from: resendFrom,
    to: options.to,
    subject: options.subject,
    html: options.html
  });
}
