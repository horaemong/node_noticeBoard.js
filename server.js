const express = require("express");
const path = require("path");
const app = express();
const mysql = require("mysql2");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// db

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "board",
}); // 실제는 이렇게 비밀번호 적나라하게 적으면 절대 안됨

conn.connect(); // mysql과 연결

// board data
let board;
let board_length;

var sql = "select * from topic";
conn.query(sql, function (err, rows, fields) {
  if (err) {
    console.error("error connecting: " + err.stack);
  }
  board = rows;
  board_length = rows[rows.length - 1].id;

  console.log(rows);
  console.log(board_length);
});

// ejs
app.set("view engine", "ejs");

app.listen(8080, () => {
  console.log("http://localhost:8080 에서 서버 실행중");
});

app.use(express.static(path.join(__dirname, "public")));

// routing

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.get("/ai-chat", function (req, res) {
  res.send("ai chat");
});

app.get("/education", function (req, res) {
  res.send("edu");
});

app.get("/board", function (req, res) {
  res.render("board.ejs", { posts: board });
});

app.get("/graph", function (req, res) {
  res.send("ai chat");
});

app.get("/chat", function (req, res) {
  res.send("ai chat");
});

app.get("/boardWrite", function (req, res) {
  res.render("boardWrite.ejs");
});

// REST API

app.post("/boardAdd", async (req, res) => {
  var today = new Date();
  var year = today.getFullYear();
  var month = ("0" + (today.getMonth() + 1)).slice(-2);
  var day = ("0" + today.getDate()).slice(-2);
  var hours = ("0" + today.getHours()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);

  var dateString = year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds;

  var id = req.body;
  var param = [board_length + 1, id.title, id.content, dateString, board_length + 1, "no", "no"];

  console.log(id);
  console.log(dateString);
  var sql = "INSERT INTO `board`.`topic` (`id`, `title`, `description`, `created`, `TOPIC_ID`, `author`, `profile`) VALUES(?,?,?,?,?,?,?)";
  conn.query(sql, param, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });

  board_length++;
  console.log(board_length);
  res.redirect("/board");
});

app.get("/boardDetail/:id", (req, res) => {
  var sql = "select * from topic WHERE id = ?";
  conn.query(sql, req.params.id, function (err, rows, fields) {
    if (err) {
      console.error("error connecting: " + err.stack);
    }
    console.log(rows[0]);
    console.log(rows[0].title);
    res.render("boardDetail.ejs", { post: rows });
  });
});

// edit

app.get("/boardEdit/:id", (req, res) => {
  var sql = "select * from topic WHERE id = ?";
  conn.query(sql, req.params.id, function (err, rows, fields) {
    if (err) {
      console.error("error connecting: " + err.stack);
    }
    console.log(rows[0]);
    console.log(rows[0].title);
    res.render("boardEdit.ejs", { post: rows });
  });
});

app.post("/boardEdit", (req, res) => {
  var id = req.body;
  var sql = `UPDATE topic SET title='${id.title}', description='${id.content}' WHERE id=${id.id}`;

  conn.query(sql, id.id, function (err, rows, fields) {
    if (err) {
      console.error("error connecting: " + err.stack);
    }
    console.log("수정 완료");

    res.redirect("/board");
  });
});

app.get("/boardDelete/:id", (req, res) => {
  var id = req.params.id;
  var sql = `DELETE FROM topic WHERE id=${id}`;

  conn.query(sql, function (err, rows, fields) {
    if (err) {
      console.error("error connecting: " + err.stack);
    }
    console.log("삭제 완료");

    var sql2 = "select * from topic";
    conn.query(sql2, function (err, rows, fields) {
      if (err) {
        console.error("error connecting: " + err.stack);
      }

      board = rows;
      res.redirect("/board");
    });
  });
});
