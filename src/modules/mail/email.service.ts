import { sendEmail, processTemplate, getTemplatePath } from "./mail.utils.js";
import { AppError } from "@/utils/errors.js";

interface TemplateOptions {
  templateName: string;
  to: string;
  subject: string;
  data: Record<string, string | number | undefined>;
  from?: string;
  text?: string;
}

/**
 * Sends an email using an HTML template with variable replacement
 * 
 * @param options.templateName - Path to HTML template (e.g., "email/welcome.html")
 * @param options.to - Recipient email(s)
 * @param options.subject - Email subject
 * @param options.data - Data for {{placeholder}} replacement
 * @param options.from - Optional custom sender
 * @param options.text - Optional plain text version (auto-generated from HTML if not provided)
 * 
 * @returns Promise with nodemailer result
 * @throws {AppError} If template loading or email sending fails
 */
async function sendTemplateEmail(options: TemplateOptions) {
  try {
    const templatePath = getTemplatePath(options.templateName);
    const html = await processTemplate(templatePath, options.data);

    const result = await sendEmail({
      to: options.to,
      subject: options.subject,
      html,
      text: options.text || html.replace(/<[^>]*>/g, ""), // Strip HTML as fallback text
      ...(options.from && { from: options.from }),
    });

    return result;
  } catch (error) {
    console.error(`Failed to send ${options.templateName} email:`, error);
    throw new AppError(
      error instanceof Error ? error.message : "Failed to send email",
      500,
    );
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendTemplateEmail({
    templateName: "email/welcome.html",
    to: to,
    subject: `Welcome to ${process.env.APP_NAME || "Our Platform"}, ${name}!`,
    data: {
      name,
      year: new Date().getFullYear(),
      appName: process.env.APP_NAME || "Our Platform",
      supportEmail: process.env.SUPPORT_EMAIL || "support@example.com",
      dashboardLink: `${process.env.APP_URL}/dashboard`,
    },
  });
}


