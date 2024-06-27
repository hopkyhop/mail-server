//ОТПРАВКА СООБЩЕНИЯ
require("dotenv").config();
const nodemailer = require("nodemailer");

const senderEmail = "";
const destEmail = "";

const senderText = "Уткина А.В. М30-409Б-20";
const destText = "Наклёскин М.В. М30-409Б-20";
const date = new Date();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const options = {
  from: senderEmail,
  to: destEmail,
  subject: "Почтовый протокол",
  text: `Сообщение от ${senderText} к ${destText}. Отправлено в ${date}`,
};

transporter.sendMail(options);
