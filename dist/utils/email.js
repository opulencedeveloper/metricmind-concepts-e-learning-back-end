"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// @ts-ignore - node-fetch types
const config_1 = __importDefault(require("../config"));
const template_1 = require("./template");
const { gmailUser, gmailPass, from } = config_1.default.mail;
// Gmail transport for development
const gmailTransport = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
        user: gmailUser,
        pass: gmailPass,
    },
    pool: true, // Reuse connections for better performance
    maxConnections: 5,
    maxMessages: 100,
});
// Send email via Gmail (Development)
const sendViaGmail = async (input) => {
    const mailOptions = {
        from: `"${template_1.BRAND_NAME} Team" <${gmailUser}>`,
        to: input.receiverEmail,
        subject: input.subject,
        html: input.emailTemplate,
    };
    // Only add replyTo if explicitly provided
    if (input.replyTo) {
        mailOptions.replyTo = input.replyTo;
    }
    try {
        const info = await gmailTransport.sendMail(mailOptions);
        console.log(`[${template_1.BRAND_NAME}] Email sent via Gmail to ${input.receiverEmail}`, {
            messageId: info.messageId,
            subject: input.subject,
            timestamp: new Date().toISOString(),
        });
        return info;
    }
    catch (error) {
        console.log(`[${template_1.BRAND_NAME}] Gmail email failure:`, error);
        throw error;
    }
};
// Main sendEmail function - switches based on environment
const sendEmail = async (input) => {
    return sendViaGmail(input);
};
exports.sendEmail = sendEmail;
