const express = require("express");
const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

//database file
const db = require("../data/dataBase");

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  //get all the posts and display
  //here also we can tune the find methode as we do not want all the data and this will also reduce the band width of the database
  const posts = await db
    .getDb()
    .collection("posts")
    .find({}, { title: 1, summary: 1, "author.name": 1 })
    .toArray();
  //if no posts

  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  //take all the authors and display in the create post page

  const authors = await db.getDb().collection("authors").find().toArray();
  //console.log(authors);

  res.render("create-post", { authors: authors });
});

//the post route of the create a new post
router.post("/posts", async function (req, res) {
  //take the author id
  const authorId = new ObjectId(req.body.author);
  const author = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  //data from the user entered in the for
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    boby: req.body.content,
    date: new Date(),
    //we have to also get the author id
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  //now insert the data in to the database
  const post = await db.getDb().collection("posts").insertOne(newPost);
  console.log(post);

  res.redirect("/posts");
});

//more detais
router.get("/posts/:id", async function (req, res) {
  //the id id is in the req
  const postId = req.params.id;
  //take all the post data
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }, { summary: 0 });
  //no psot
  if (!post) {
    return res.render("404");
  }

  //THIS IS A HUMAN READABLE DATE

  post.humanReadableDate = post.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //convert that date to maschine readable date
  post.date = post.date.toISOString();
  res.render("post-detail", { post: post });
});

//edit post
//in the edit post we have to go to the edit/:id and render the update post tempate
//also we have to display the current details in those feilds and update the database after the data is changed

router.get("/posts/:id/edit", async function (req, res) {
  const postId = req.params.id;
  //fetch all the data in the id from the data base
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) });

  //check the validity of the post
  if (!post) {
    return res.render("404");
  }

  res.render("update-post", { post: post });
});

//post methode for update the post
router.post("/posts/:id/edit", function (req, res) {
  const postID = req.params.id;
  //now we have to upadae the database
  db.getDb()
    .collection("posts")
    .updateOne(
      { _id: new ObjectId(postID) },
      {
        $set: {
          //here we have to set the new values given by the user
          title: req.body.title,
          summary: req.body.summary,
          boby: req.body.content,
        },
      }
    );

  res.redirect("/posts");
});

//delete the post
router.get("/posts/:id/delete", async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) });

  res.render("delete-post", { post: post });
});

router.post("/posts/:id/delete", async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .deleteOne({ _id: new ObjectId(postId) });

  res.redirect("/posts");
});

module.exports = router;
