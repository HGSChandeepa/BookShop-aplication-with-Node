const express = require("express");
const router = express.Router();
const db = require("../database/database");

//home route here we are redirecting to the /books path as the root
//and this path is a relative path not an absolute path
router.get("/", function (req, res) {
  res.redirect("books");
});

//books route
router.get("/books", async function (req, res) {
  const query = `SELECT books.* , publications.name AS pub_name FROM books INNER JOIN publications ON books.pub_id = publications.id`;
  const [books] = await db.query(query);

  res.render("books-list", { books: books });
});

//cretae a new book
router.get("/new-book", async function (req, res) {
  const [publications] = await db.query("SELECT * FROM publications");
  res.render("create-book", { publications: publications });
});

//create the post route and add the new data and display  > /books
router.post("/books", async function (req, res) {
  //take the user entered data and update
  // user entered data
  const bookData = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.level,
    req.body.publication,
  ];

  ///add to the ddb
  await db.query(
    "INSERT INTO books (title , summary , body , level , pub_id ) VALUES (?)",
    [bookData]
  );

  res.redirect("/books");
});

//book detail page routes
router.get("/books/:id", async function (req, res) {
  //we have to display the correct post
  const query = `SELECT books.* , publications.name AS pub_name , publications.email AS pub_email FROM books   INNER JOIN publications ON books.pub_id =publications.id WHERE books.id = ?`;

  const [book] = await db.query(query, [req.params.id]);

  //if no book is found
  if (!book || book.length === 0) {
    return res.status(404).render("404");
  }

  ///date format
  const bookData = {
    ...book[0],
    date: book[0].date.toISOString(),
    humanDate: book[0].date.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  res.render("book-details", { book: bookData });
});

//edit post

router.get("/books/:id/edit", async function (req, res) {
  // show the default data
  const query = `SELECT * FROM   books  WHERE books.id = ?`;
  const [book] = await db.query(query, [req.params.id]);

  //if no books
  if (!book || book.length === 0) {
    return res.status(404).render("404");
  }

  res.render("update-book", { book: book[0] });
});

//post methode for the update methode

router.post("/books/:id/edit", async function (req, res) {
  //data and update
  const query = `UPDATE books  SET title = ?  , summary = ?, body = ? WHERE books.id = ?`;

  const bookData = [req.body.title, req.body.summary, req.body.content];

  const [book] = await db.query(query, [
    bookData[0],
    bookData[1],
    bookData[2],
    req.params.id,
  ]);

  res.redirect("/books");
});

//delete a books
router.get("/books/:id/delete", async function (req, res) {
  const query = `SELECT * FROM   books  WHERE books.id = ?`;
  const [book] = await db.query(query, [req.params.id]);

  //if no books
  if (!book || book.length === 0) {
    return res.status(404).render("404");
  }

  res.render("delete-book", { book: book[0] });
});

router.post("/books/:id/delete", async function (req, res) {
  await db.query("DELETE FROM books WHERE books.id = ?", [req.params.id]);

  res.redirect("/books");
});
//module export
module.exports = router;
