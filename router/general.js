const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   res.send(JSON.stringify({ books }, null, 4));
// });

// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//   try {
//     const requestedIsbn = req.params.isbn; // Retrieve ISBN from request parameters
//     const book = books[requestedIsbn];
    
//     if (book) {
//       res.status(200).json(book);
//     } else {
//       res.status(404).json({ message: "Book is not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error.toString())
//   }
// });
  
// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   const authors = req.params.author;
//   const book_arrays =  Object.values(books);
  
//   const book = book_arrays.filter((book) => book.author === authors);
//   res.status(200).json(book);
// });

// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   try {
//     const title = req.params.title;
//     const bookKeys = Object.values(books); // Get all book keys

//     const book = bookKeys.filter((book) => book.title === title);
//     res.status(200).json(book);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error.toString())
//   }
// });

//  Get book review
// public_users.get('/review/:isbn',function (req, res) {
//   try {
//     const isbn = req.params.isbn;
//     const book = books[isbn];
//     const reviews = book.reviews;

//     res.status(200).json(reviews);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error.toString())
//   }
// });


// With Promise & callbacks or async-await with Axios

const getBookList = () => {
  return new Promise((resolve,reject)=>{
    resolve(books);
  })
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBookList().then(
    (book)=>res.send(JSON.stringify(book, null, 4)),
    (error) => res.send("denied")
  );  
});

const getFromISBN = (isbn) =>{
  let book_ = books[isbn];  
  return new Promise((resolve,reject)=>{
    if (book_) {
      resolve(book_);
    }else{
      reject("Unable to find book!");
    }    
  })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getFromISBN(isbn).then(
    (book)=>res.send(JSON.stringify(book, null, 4)),
    (error) => res.send(error)
  )
});

function getFromAuthor(author){
  let output = [];
  return new Promise((resolve,reject)=>{
    for (var isbn in books) {
      let book_ = books[isbn];
      if (book_.author === author){
        output.push(book_);
      }
    }
    resolve(output);  
  })
}

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  getFromAuthor(author)
  .then(
    result =>res.send(JSON.stringify(result, null, 4))
  );
});

function getFromTitle(title){
  let output = [];
  return new Promise((resolve,reject)=>{
    for (var isbn in books) {
      let book_ = books[isbn];
      if (book_.title === title){
        output.push(book_);
      }
    }
    resolve(output);  
  })
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  getFromTitle(title)
  .then(
    result =>res.send(JSON.stringify(result, null, 4))
  );
});

module.exports.general = public_users;
