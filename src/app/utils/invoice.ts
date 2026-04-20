/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";
import fs from "fs";
import path from "path";

export interface IInvoiceData {
    transactionId: string;
    bookingDate: Date;
    userName: string;
    tourTitle: string;
    guestCount: number;
    totalAmount: number;
}

const BRAND_GREEN = "#085041";
const BRAND_MID = "#1D9E75";
const BRAND_LIGHT = "#E1F5EE";
const BRAND_SUBTLE = "#9FE1CB";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";

const LOGO_PATH = fs.existsSync(path.join(process.cwd(), "src/app/assets/Logo.png"))
    ? path.join(process.cwd(), "src/app/assets/Logo.png")
    : path.join(process.cwd(), "dist/app/assets/Logo.png");

export const generatePdf = async (
    invoiceData: IInvoiceData
): Promise<Buffer<ArrayBufferLike>> => {
    try {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: "A4", margin: 0 });
            const buffer: Uint8Array[] = [];

            doc.on("data", (chunk) => buffer.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffer)));
            doc.on("error", (err) => reject(err));

            const W = 595.28;
            const M = 50;

            // ✅ BDT prefix instead of ৳ — PDFKit built-in fonts don't support Bengali Unicode
            const fmt = (n: number) => `BDT ${n.toLocaleString()}`;

            // ── Header bar ──────────────────────────────────────────
            doc.rect(0, 0, W, 110).fill(BRAND_GREEN);

            if (fs.existsSync(LOGO_PATH)) {
                doc.image(LOGO_PATH, M, 15, { height: 80 });
            } else {
                doc.circle(M + 20, 55, 20).fill(BRAND_MID);
                doc.fontSize(13).fillColor(BRAND_LIGHT).font("Helvetica-Bold")
                    .text("SH", M + 9, 48, { lineBreak: false });
                doc.fontSize(16).fillColor(BRAND_LIGHT).font("Helvetica-Bold")
                    .text("SH Tour", M + 50, 42, { lineBreak: false });
                doc.fontSize(10).fillColor(BRAND_SUBTLE).font("Helvetica")
                    .text("Your journey, our passion", M + 50, 62, { lineBreak: false });
            }

            // Invoice label
            doc.fontSize(9).fillColor(BRAND_SUBTLE).font("Helvetica")
                .text("INVOICE", 0, 38, {
                    align: "right", width: W - M, lineBreak: false,
                });
            doc.fontSize(12).fillColor(BRAND_LIGHT).font("Helvetica-Bold")
                .text(
                    `#${invoiceData.transactionId.slice(-8).toUpperCase()}`,
                    0, 56,
                    { align: "right", width: W - M, lineBreak: false }
                );

            // ── Billed to / Date row ─────────────────────────────────
            let y = 130;
            doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica")
                .text("BILLED TO", M, y);
            doc.fillColor(TEXT_MUTED).fontSize(8)
                .text("BOOKING DATE", W / 2, y);

            y += 14;
            doc.fillColor(TEXT_DARK).fontSize(13).font("Helvetica-Bold")
                .text(invoiceData.userName, M, y);
            doc.fillColor(TEXT_DARK).fontSize(13).font("Helvetica-Bold")
                .text(
                    new Date(invoiceData.bookingDate).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                    }),
                    W / 2, y
                );

            // Status pill
            y += 22;
            doc.roundedRect(W / 2, y, 118, 18, 9).fill(BRAND_LIGHT);
            doc.fillColor(BRAND_GREEN).fontSize(9).font("Helvetica")
                .text("Payment confirmed", W / 2 + 10, y + 4, { lineBreak: false });

            // ── Divider ──────────────────────────────────────────────
            y += 36;
            doc.rect(M, y, W - M * 2, 0.5).fill(BORDER);

            // ── Tour details ─────────────────────────────────────────
            y += 20;
            doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica")
                .text("TOUR DETAILS", M, y);

            y += 14;
            doc.roundedRect(M, y, W - M * 2, 62, 6).fill("#F9FAFB");

            doc.fillColor(TEXT_DARK).fontSize(13).font("Helvetica-Bold")
                .text(invoiceData.tourTitle, M + 14, y + 12, {
                    width: W - M * 2 - 110, lineBreak: false,
                });
            doc.fillColor(TEXT_MUTED).fontSize(10).font("Helvetica")
                .text(
                    `${invoiceData.guestCount} guest${invoiceData.guestCount > 1 ? "s" : ""}`,
                    M + 14, y + 32,
                    { lineBreak: false }
                );
            doc.fillColor(TEXT_DARK).fontSize(13).font("Helvetica-Bold")
                .text(
                    fmt(invoiceData.totalAmount),
                    0, y + 22,
                    { align: "right", width: W - M - 14, lineBreak: false }
                );

            // ── Totals ───────────────────────────────────────────────
            y += 82;
            doc.rect(M, y, W - M * 2, 0.5).fill(BORDER);

            y += 16;
            const perPerson = Math.round(invoiceData.totalAmount / invoiceData.guestCount);
            doc.fillColor(TEXT_MUTED).fontSize(10).font("Helvetica")
                .text(
                    `Subtotal (${invoiceData.guestCount} x ${fmt(perPerson)})`,
                    M, y
                );
            doc.fillColor(TEXT_MUTED).fontSize(10)
                .text(
                    fmt(invoiceData.totalAmount),
                    0, y,
                    { align: "right", width: W - M, lineBreak: false }
                );

            y += 20;
            doc.fillColor(TEXT_MUTED).fontSize(10)
                .text("Service fee", M, y);
            doc.fillColor(TEXT_MUTED).fontSize(10)
                .text("BDT 0", 0, y, { align: "right", width: W - M, lineBreak: false });

            y += 16;
            doc.rect(M, y, W - M * 2, 0.5).fill(BORDER);

            y += 14;
            doc.fillColor(TEXT_DARK).fontSize(13).font("Helvetica-Bold")
                .text("Total paid", M, y);
            doc.fillColor(BRAND_MID).fontSize(13).font("Helvetica-Bold")
                .text(
                    fmt(invoiceData.totalAmount),
                    0, y,
                    { align: "right", width: W - M, lineBreak: false }
                );

            // ── Footer ───────────────────────────────────────────────
            const footerY = 760;
            doc.rect(0, footerY, W, 82).fill(BRAND_GREEN);

            if (fs.existsSync(LOGO_PATH)) {
                doc.image(LOGO_PATH, M, footerY + 10, { height: 40 });
            }

            doc.fillColor(BRAND_SUBTLE).fontSize(9).font("Helvetica")
                .text("Thank you for traveling with SH Tour", M + 120, footerY + 16)
                .text("support@shtour.com", M + 120, footerY + 30);

            doc.fillColor(BRAND_LIGHT).fontSize(8)
                .text(
                    `Transaction ID: ${invoiceData.transactionId}`,
                    M, footerY + 60
                );

            doc.end();
        });
    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `PDF creation error: ${error.message}`);
    }
};