"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetEmailTemplate = exports.verificationEmailTemplate = exports.BRAND_NAME = void 0;
exports.BRAND_NAME = "MetricMind";
const verificationEmailTemplate = (fullName, otp) => {
    const firstName = fullName.split(" ")[0];
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
            background-color: #f5f5f7;
            padding: 40px 0;
          }

          .container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          }

          .header {
            background: linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%);
            padding: 60px 40px 40px;
            text-align: center;
            border-bottom: 1px solid #e5e5e7;
          }

          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #1d1d1f;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
          }

          .hero-title {
            font-size: 28px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 12px;
            letter-spacing: -0.3px;
          }

          .hero-subtitle {
            font-size: 15px;
            color: #86868b;
            line-height: 1.5;
            margin: 0;
          }

          .content {
            padding: 48px 40px;
            text-align: center;
          }

          .greeting {
            font-size: 15px;
            color: #1d1d1f;
            margin-bottom: 24px;
            line-height: 1.6;
          }

          .description {
            font-size: 15px;
            color: #86868b;
            line-height: 1.6;
            margin-bottom: 36px;
          }

          .otp-container {
            background-color: #f5f5f7;
            border-radius: 12px;
            padding: 32px 24px;
            margin: 32px 0;
            border: 1px solid #e5e5e7;
          }

          .otp-label {
            font-size: 13px;
            color: #86868b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
            font-weight: 500;
          }

          .otp-code {
            font-family: 'Courier New', monospace;
            font-size: 36px;
            font-weight: 600;
            color: #1d1d1f;
            letter-spacing: 8px;
            word-spacing: 12px;
            tracking: normal;
          }

          .expiration {
            font-size: 13px;
            color: #86868b;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e7;
          }

          .security-note {
            background-color: #f5f5f7;
            border-left: 3px solid #34c759;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 28px 0;
            text-align: left;
          }

          .security-note-title {
            font-size: 13px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 6px;
          }

          .security-note-text {
            font-size: 13px;
            color: #86868b;
            line-height: 1.5;
          }

          .footer {
            padding: 32px 40px;
            border-top: 1px solid #e5e5e7;
            text-align: center;
            background-color: #f5f5f7;
          }

          .footer-text {
            font-size: 12px;
            color: #86868b;
            line-height: 1.5;
            margin-bottom: 16px;
          }

          .footer-links {
            font-size: 12px;
            color: #86868b;
          }

          .footer-links a {
            color: #0071e3;
            text-decoration: none;
            margin: 0 8px;
          }

          .footer-links a:hover {
            text-decoration: underline;
          }

          .copyright {
            font-size: 11px;
            color: #a1a1a6;
            margin-top: 12px;
          }

          @media (max-width: 600px) {
            .container {
              border-radius: 12px;
            }

            .header {
              padding: 40px 24px 32px;
            }

            .logo {
              font-size: 28px;
            }

            .hero-title {
              font-size: 24px;
            }

            .content {
              padding: 36px 24px;
            }

            .otp-container {
              padding: 28px 20px;
            }

            .otp-code {
              font-size: 32px;
              letter-spacing: 6px;
            }

            .footer {
              padding: 28px 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo">M</div>
            <h1 class="hero-title">Verify Your Email</h1>
            <p class="hero-subtitle">Complete your ${exports.BRAND_NAME} registration in seconds</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Hi ${firstName},</p>

            <p class="description">
              Welcome to ${exports.BRAND_NAME}! We're thrilled to have you join our learning community.
              Please verify your email address using the code below to get started.
            </p>

            <!-- OTP Box -->
            <div class="otp-container">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiration">Expires in 10 minutes</div>
            </div>

            <!-- Security Note -->
            <div class="security-note">
              <div class="security-note-title">🔒 Keep it secure</div>
              <div class="security-note-text">
                Never share this code with anyone. ${exports.BRAND_NAME} staff will never ask for it.
              </div>
            </div>

            <p class="description" style="margin: 28px 0 0 0;">
              Didn't request this code? You can safely ignore this email.
              Your account won't be created unless you verify it.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              This is an automated message. Please don't reply to this email.
            </p>
            <div class="footer-links">
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
            </div>
            <p class="copyright">© ${new Date().getFullYear()} ${exports.BRAND_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
exports.verificationEmailTemplate = verificationEmailTemplate;
const passwordResetEmailTemplate = (fullName, otp) => {
    const firstName = fullName.split(" ")[0];
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
            background-color: #f5f5f7;
            padding: 40px 0;
          }

          .container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          }

          .header {
            background: linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%);
            padding: 60px 40px 40px;
            text-align: center;
            border-bottom: 1px solid #e5e5e7;
          }

          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #1d1d1f;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
          }

          .hero-title {
            font-size: 28px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 12px;
            letter-spacing: -0.3px;
          }

          .hero-subtitle {
            font-size: 15px;
            color: #86868b;
            line-height: 1.5;
            margin: 0;
          }

          .content {
            padding: 48px 40px;
            text-align: center;
          }

          .greeting {
            font-size: 15px;
            color: #1d1d1f;
            margin-bottom: 24px;
            line-height: 1.6;
          }

          .description {
            font-size: 15px;
            color: #86868b;
            line-height: 1.6;
            margin-bottom: 36px;
          }

          .otp-container {
            background-color: #f5f5f7;
            border-radius: 12px;
            padding: 32px 24px;
            margin: 32px 0;
            border: 1px solid #e5e5e7;
          }

          .otp-label {
            font-size: 13px;
            color: #86868b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
            font-weight: 500;
          }

          .otp-code {
            font-family: 'Courier New', monospace;
            font-size: 36px;
            font-weight: 600;
            color: #1d1d1f;
            letter-spacing: 8px;
            word-spacing: 12px;
          }

          .expiration {
            font-size: 13px;
            color: #86868b;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e7;
          }

          .warning-box {
            background-color: #fff5f5;
            border-left: 3px solid #ff3b30;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 28px 0;
            text-align: left;
          }

          .warning-title {
            font-size: 13px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 6px;
          }

          .warning-text {
            font-size: 13px;
            color: #86868b;
            line-height: 1.5;
          }

          .steps-container {
            background-color: #f5f5f7;
            border-radius: 12px;
            padding: 24px;
            margin: 28px 0;
            text-align: left;
          }

          .steps-title {
            font-size: 13px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 16px;
            text-align: center;
          }

          .step {
            margin-bottom: 12px;
          }

          .step-number {
            display: inline-block;
            width: 24px;
            height: 24px;
            background-color: #0071e3;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 12px;
          }

          .step-text {
            display: inline;
            font-size: 13px;
            color: #86868b;
          }

          .footer {
            padding: 32px 40px;
            border-top: 1px solid #e5e5e7;
            text-align: center;
            background-color: #f5f5f7;
          }

          .footer-text {
            font-size: 12px;
            color: #86868b;
            line-height: 1.5;
            margin-bottom: 16px;
          }

          .footer-links {
            font-size: 12px;
            color: #86868b;
          }

          .footer-links a {
            color: #0071e3;
            text-decoration: none;
            margin: 0 8px;
          }

          .footer-links a:hover {
            text-decoration: underline;
          }

          .copyright {
            font-size: 11px;
            color: #a1a1a6;
            margin-top: 12px;
          }

          @media (max-width: 600px) {
            .container {
              border-radius: 12px;
            }

            .header {
              padding: 40px 24px 32px;
            }

            .logo {
              font-size: 28px;
            }

            .hero-title {
              font-size: 24px;
            }

            .content {
              padding: 36px 24px;
            }

            .otp-container {
              padding: 28px 20px;
            }

            .otp-code {
              font-size: 32px;
              letter-spacing: 6px;
            }

            .footer {
              padding: 28px 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo">M</div>
            <h1 class="hero-title">Reset Your Password</h1>
            <p class="hero-subtitle">Secure your ${exports.BRAND_NAME} account in just a few steps</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Hi ${firstName},</p>

            <p class="description">
              We received a request to reset your password.
              Use the code below to create a new password for your account.
            </p>

            <!-- OTP Box -->
            <div class="otp-container">
              <div class="otp-label">Reset Code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiration">Expires in 10 minutes</div>
            </div>

            <!-- Steps -->
            <div class="steps-container">
              <div class="steps-title">How to reset your password</div>
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-text">Enter this code on the reset page</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span class="step-text">Create a new, strong password</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span class="step-text">Sign back in to your account</span>
              </div>
            </div>

            <!-- Warning -->
            <div class="warning-box">
              <div class="warning-title">⚠️ Didn't request this?</div>
              <div class="warning-text">
                If you didn't ask for a password reset, ignore this email.
                Your password is still safe and unchanged.
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              This is an automated message. Please don't reply to this email.
            </p>
            <div class="footer-links">
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
            </div>
            <p class="copyright">© ${new Date().getFullYear()} ${exports.BRAND_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
exports.passwordResetEmailTemplate = passwordResetEmailTemplate;
