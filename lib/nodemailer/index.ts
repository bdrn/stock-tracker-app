import nodemailer from "nodemailer";
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
} from "./templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro
  );

  const mailOptions = {
    from: `Signalist <noreply@signalist.app>`,
    to: email,
    subject: "Welcome to Signalist - your stock market toolkit is ready",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsEmail = async ({
  email,
  name: _name, // Reserved for future template personalization
  date,
  newsContent,
}: NewsEmailData) => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date
  ).replace("{{newsContent}}", newsContent);

  const mailOptions = {
    from: `Signalist <noreply@signalist.app>`,
    to: email,
    subject: `Market News Summary - ${date}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
