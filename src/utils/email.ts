import nodemailer from "nodemailer";
// @ts-ignore - node-fetch types
import config from "../config";
import { IOTP, ISendEmail } from "./interface";
import { BRAND_NAME } from "./template";
import { AppEnvironment } from "../config";

const { gmailUser, gmailPass, from } = config.mail;

// Gmail transport for development
const gmailTransport = nodemailer.createTransport({
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
const sendViaGmail = async (input: ISendEmail) => {
  const mailOptions: any = {
    from: `"${BRAND_NAME} Team" <${gmailUser}>`,
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
    console.log(`[${BRAND_NAME}] Email sent via Gmail to ${input.receiverEmail}`, {
      messageId: info.messageId,
      subject: input.subject,
      timestamp: new Date().toISOString(),
    });
    return info;
  } catch (error) {
    console.log(`[${BRAND_NAME}] Gmail email failure:`, error);
    throw error;
  }
};

// Main sendEmail function - switches based on environment
export const sendEmail = async (input: ISendEmail) => {
  return sendViaGmail(input);
};
