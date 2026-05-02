/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import ejs from "ejs";
import path from "path";
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
}: SendEmailOptions) => {
    try {
        const templatePath = path.join(
            __dirname,
            `templates/${templateName}.ejs`
        );
        const html = await ejs.renderFile(templatePath, templateData);

        await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    email: envVars.EMAIL_SENDER.SMTP_FROM,
                    name: "SH Tour",
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html,
            },
            {
                headers: {
                    "api-key": envVars.BREVO_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`✉️ Email sent to ${to}`);
    } catch (error: any) {
        console.log("email sending error", error?.response?.data || error);
        throw new AppError(500, "Email sending failed");
    }
};