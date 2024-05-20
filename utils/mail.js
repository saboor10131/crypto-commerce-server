const express = require("express");
require("dotenv").config();

const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

module.exports.sendEmail = async (
  senderName,
  recipientName,
  recipientEmail,
  htmlContent
) => {
  try {
    let recipient = new Recipient(recipientEmail, recipientName);
    const sender = new Sender(
      "crypto-commerce@trial-jpzkmgqyzk2l059v.mlsender.net",
      senderName
    );

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([recipient])
      .setReplyTo(sender)
      .setSubject("File Download Link")
      .setHtml(htmlContent)
      .setText("This is the text content");

    const mailerSend = new MailerSend({
      apiKey: process.env.MAIL_SENDER_API_KEY,
    });
    
    return await mailerSend.email.send(emailParams);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send email");
  }
};