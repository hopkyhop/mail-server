//ПРОЧТЕНИЕ ПОЧТЫ
const Imap = require("imap");
var htmlToText = require('html-to-text');

const imapConfig = {
  user: "",
  password: "",
  host: "imap.yandex.ru",
  port: 993,
  tls: true,
};

const imap = new Imap(imapConfig);

//Кол-во писем на ящике
function messagesCountCallback(err, box) {
  if (err) throw err;
  const unseenCount = box.messages.unseen;
  const totalCount = box.messages.total;
  console.log(
    `Количество непрочитанных сообщений: ${unseenCount}. Всего сообщений: ${totalCount}`
  );
  imap.end();
}

//Заголовки первых пяти сообщений
function headersOfMessagesCallback(err, box) {
  if (err) throw err;

  const searchCriteria = ["1:5"]; //first five messages
  const fetchOptions = {
    bodies: "HEADER.FIELDS (SUBJECT)", //get the header of messages
    markSeen: false, //mark messages as read when fetched
    struct: true, //fetch the message structure
  };

  imap.search(searchCriteria, (err, results) => {
    if (err) throw err;

    const fetchHeaders = imap.fetch(results, fetchOptions);

    fetchHeaders.on("message", (msg, seqno) => {
      msg.on("body", (stream, info) => {
        //data stream
        let buffer = "";
        stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));
        stream.on("end", () => {
          const headers = Imap.parseHeader(buffer);
          console.log(`Заголовок сообщения#${seqno} ${headers.subject[0]}`);
        });
      });
    });

    fetchHeaders.once("error", (err) => {
      console.error("Fetch error:", err);
    });

    fetchHeaders.once("end", () => {
      console.log("Done fetching all messages!");
      imap.end();
    });
  });
}

//Сообщение от одногруппника
function findMessagesCallback(err, box) {
  if (err) throw err;

  const searchCriteria = ['ALL', ["FROM", "reyper2014@yandex.ru"]];
  const fetchOptions = {
    bodies: "", //the entire message (header + body)
    markSeen: false, //mark messages as read when fetched
    struct: true, //fetch the message structure
  };

  imap.search(searchCriteria, (err, results) => {
    if (err) throw err;

    const fetchHeaders = imap.fetch(results, fetchOptions);

    fetchHeaders.on("message", (msg, seqno) => {
      msg.on("body", (stream, info) => {
        //data stream
        let buffer = "";
        stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));
        stream.on("end", () => {
          const headers = Imap.parseHeader(buffer);
          console.log("Message #%d", seqno);
          console.log("From:", headers.from[0]);
          console.log("Subject:", headers.subject[0]);
          console.log("Date:", headers.date[0]);
          const body = buffer.slice(buffer.lastIndexOf('<div>') + 5, buffer.lastIndexOf('</div>'))
          console.log("Body:", body);
        });
      });
    });

    fetchHeaders.once("error", (err) => {
      console.error("Fetch error:", err);
    });

    fetchHeaders.once("end", () => {
      imap.end();
    });
  });
}

imap.once("ready", function () {
  //imap.status("INBOX", messagesCountCallback);
  imap.openBox("INBOX", true, headersOfMessagesCallback);
  //imap.openBox("INBOX", true, findMessagesCallback);
});

imap.once("error", function (err) {
  console.log(err);
});

imap.once("end", function () {
  console.log("Connection ended");
});

imap.connect();
