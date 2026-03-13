import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface SendInvitationEmailParams {
  email: string;
  token: string;
  workspaceId: string;
}

export async function sendInvitationEmail({
  email,
  token,
  workspaceId,
}: SendInvitationEmailParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/invitation/${token}`;

  const { data, error } = await resend.emails.send({
    from: "Frameport <onboarding@resend.dev>",
    to: email,
    subject: "You're invited to join a Frameport workspace!",
    html: `
      <h2>You've been invited!</h2>
      <p>Click the link below to join the workspace:</p>
      <a href="${magicLink}" 
         style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">
        Accept Invitation
      </a>
      <p>This link expires in 7 days.</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }

  console.log("Email sent successfully:", data);
}
