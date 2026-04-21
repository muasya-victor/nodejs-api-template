import { AppError } from "@/utils/errors.js";
import dotenv from "dotenv"
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASS,
  },
});

try {
    await transporter.verify();

    const info = await transporter.sendMail({
      from: '"Example Team" <team@example.com>', // sender address
      to: "alice@example.com, bob@example.com", // list of recipients
      subject: "Hello", // subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // HTML body
    });

}
catch (error) {
    throw new AppError("Failed to verify mail transporter. Check your SMTP configuration.", 500);
}