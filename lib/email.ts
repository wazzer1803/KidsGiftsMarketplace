type SendOtpEmailInput = {
  toEmail: string;
  otp: string;
  phone: string;
};

function getOtpEmailText(input: SendOtpEmailInput) {
  return [
    "Your Wonderland OTP code",
    "",
    `OTP: ${input.otp}`,
    `Phone: ${input.phone}`,
    "",
    "This code expires in 5 minutes.",
    "If you did not request this code, ignore this email."
  ].join("\n");
}

function getOtpEmailHtml(input: SendOtpEmailInput) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1f2a44; line-height: 1.5;">
      <h2 style="margin: 0 0 10px;">Wonderland OTP</h2>
      <p style="margin: 0 0 16px;">Use this OTP to login:</p>
      <p style="font-size: 30px; font-weight: 700; letter-spacing: 6px; margin: 0 0 12px;">
        ${input.otp}
      </p>
      <p style="margin: 0 0 8px;">Phone: <strong>${input.phone}</strong></p>
      <p style="margin: 0 0 8px;">This code expires in 5 minutes.</p>
      <p style="margin: 0; color: #65718b;">If you did not request this code, ignore this email.</p>
    </div>
  `;
}

async function sendViaResend(input: SendOtpEmailInput) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.toEmail],
      subject: "Your Wonderland OTP",
      text: getOtpEmailText(input),
      html: getOtpEmailHtml(input)
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Resend OTP email failed: ${payload}`);
  }

  return true;
}

async function sendViaBrevo(input: SendOtpEmailInput) {
  const apiKey = process.env.BREVO_API_KEY || "";
  const fromEmail = process.env.BREVO_FROM_EMAIL || "";
  if (!apiKey || !fromEmail) return false;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        email: fromEmail,
        name: process.env.BREVO_FROM_NAME || "Home And Kids Corner"
      },
      to: [{ email: input.toEmail }],
      subject: "Your Wonderland OTP",
      textContent: getOtpEmailText(input),
      htmlContent: getOtpEmailHtml(input)
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Brevo OTP email failed: ${payload}`);
  }

  return true;
}

export async function sendOtpEmail(input: SendOtpEmailInput) {
  if (await sendViaResend(input)) {
    return;
  }

  if (await sendViaBrevo(input)) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Email OTP provider not configured. Set RESEND_* or BREVO_* variables."
    );
  }

  // Dev fallback
  console.log(`[DEV OTP EMAIL] to=${input.toEmail} phone=${input.phone} otp=${input.otp}`);
}
