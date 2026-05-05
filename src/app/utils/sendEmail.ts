/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { Resend } from "resend";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData?: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[];
}

export const sendEmail = async ({
    to,
    subject,
    templateName,
    templateData,
    attachments,
}: SendEmailOptions) => {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    // ✅ LOCAL → Gmail SMTP (unchanged, works perfectly)
    if (process.env.NODE_ENV !== "production") {
        console.log("\n📧 [LOCAL] Sending via Gmail SMTP to:", to);

        const transporter = nodemailer.createTransport({
            host: envVars.EMAIL_SENDER.SMTP_HOST,       // smtp.gmail.com
            port: Number(envVars.EMAIL_SENDER.SMTP_PORT), // 587
            secure: false,
            auth: {
                user: envVars.EMAIL_SENDER.SMTP_USER,     // shafin.nextgen1@gmail.com
                pass: envVars.EMAIL_SENDER.SMTP_PASS,     // ugfnjutqcpnayrof (app pass)
            },
            tls: { rejectUnauthorized: false },
        });

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to,
            subject,
            html,
            attachments: attachments?.map((a) => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType,
            })),
        });

        console.log(`✉️ [LOCAL] Email sent: ${info.messageId}`);
        return;
    }

    // 🚀 PRODUCTION → Resend HTTP API (bypasses Railway block)
    console.log("\n📧 [PROD] Sending via Resend to:", to);

    const resend = new Resend(envVars.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
        from: "SH Tour <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        attachments: attachments?.map((a) => ({
            filename: a.filename,
            content:
                a.content instanceof Buffer
                    ? a.content.toString("base64")
                    : a.content,
        })),
    });

    if (error) {
        console.error("📧 Resend error:", error);
        throw new AppError(500, `Email sending failed: ${error.message}`);
    }

    console.log(`✉️ [PROD] Resend email sent: ${data?.id}`);
};