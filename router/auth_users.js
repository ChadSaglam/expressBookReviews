const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username)=>{
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
}
  
const authenticatedUser = (username,password)=>{ //returns boolean
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}
  
//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {  
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  console.log("add review: ", req.params, req.body, req.session);
  if (books[isbn]) {
      let book = books[isbn];
      book.reviews[username] = review;
      return res.status(200).send("Review successfully posted");
  }
  else {
      return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const requestedIsbn = req.params.isbn;
    const userName = req.session.authorization.username; 
    const book = books[requestedIsbn].reviews;

    if (!userName) {
      return res.status(401).json({ message: "Unauthorized UserName!" });
    }

    if (book) {
      if (book[userName]) { 
        delete book[userName]; 
        res.json({ message: "Review deleted successfully" });
      } else {
        res.status(404).json({ message: "Review is not found" }); 
      }
    } else {
      res.status(404).json({ message: "Book is not found" }); 
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting review" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
