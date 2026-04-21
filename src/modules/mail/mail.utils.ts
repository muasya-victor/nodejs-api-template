// services/mail.utils.ts
import { AppError } from "@/utils/errors.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import type { Transporter, SendMailOptions } from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base templates directory
const TEMPLATES_BASE_DIR = path.join(__dirname, "../../templates");

// Helper function to resolve template path
export function getTemplatePath(templateName: string): string {
  // templateName examples:
  // - "email/welcome.html"
  // - "email/verification.html"
  // - "email/password-reset.html"
  // - "notification/invitation.html"
  return path.join(TEMPLATES_BASE_DIR, templateName);
}

const transporter: Transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASS,
  },
});

// Email options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

// Template options
export interface TemplateOptions {
  templatePath: string;
  data: Record<string, string | number | undefined>;
  subject: string;
  to: string | string[];
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Function to read and process HTML template
export async function processTemplate(
  templatePath: string,
  data: Record<string, string | number | undefined>,
): Promise<string> {
  try {
    // Read the HTML file
    let html = await fs.readFile(templatePath, "utf-8");

    // Replace placeholders with actual data
    // Supports {{variableName}} syntax
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, String(value ?? ""));
    }

    return html;
  } catch (error) {
    console.error(`Error reading template from ${templatePath}:`, error);
    throw new AppError(`Failed to load email template: ${templatePath}`, 500);
  }
}

// Main email sending function
export async function sendEmail(options: EmailOptions): Promise<any> {
  try {
    await transporter.verify();

    const mailOptions: SendMailOptions = {
      from:
        options.from ||
        `"${process.env.SMTP_FROM_NAME || "Our Team"}" <${process.env.SMTP_MAIL}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    if (options.cc) {
      mailOptions.cc = Array.isArray(options.cc)
        ? options.cc.join(", ")
        : options.cc;
    }
    if (options.bcc) {
      mailOptions.bcc = Array.isArray(options.bcc)
        ? options.bcc.join(", ")
        : options.bcc;
    }
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw new AppError(
      "Failed to send email. Check your SMTP configuration.",
      500,
    );
  }
}
