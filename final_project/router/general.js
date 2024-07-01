const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function doesExist(username) {
    const user = users.find((user) => user.username === username);
    return !!user;
}

public_users.post("/register", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ username, password });
            return res
                .status(200)
                .json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    } else {
        return res.status(404).json({ message: "Username and password are required." });
    }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    const promise = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("Unable to fetch books.");
        }
    });

    promise.then((result) => {
        return res.status(200).send(result);
    });

    promise.catch((e) => {
        return res.status(500).send(e);
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    let isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        let book = books[isbn];

        if (book) {
            resolve(book);
        } else {
            reject("No book found.");
        }
    }).then((result) => {
        return res.send(result);
    }).catch(e => {
        req.status(404).send(e);
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    let authorName = req.params.author;

    new Promise((resolve, reject) => {
        let filteredBooks = Object.values(books).filter(
            (b) => b.author === authorName
        );

        if (filteredBooks.length > 0) {
            return resolve(filteredBooks);
        } else {
            return reject(`No books found written by ${authorName}`);
        }
    }).then((result) => {
        return res.send(result);
    }).catch(e => {
        req.status(404).send(e);
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    let title = req.params.title;

    new Promise((resolve, reject) => {
        let filteredBooks = Object.values(books).filter(
            (b) => b.title === title
        );

        if (filteredBooks.length > 0) {
            return resolve(filteredBooks);
        } else {
            return reject(`No books found titled ${title}`);
        }
    }).then((result) => {
        return res.send(result);
    }).catch(e => {
        req.status(404).send(e);
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    let isbn = req.params.isbn;

    let book = books[isbn];

    if (book) {
        return res.send(book.reviews);
    } else {
        return req.status(404).send("No book found.");
    }
});

module.exports.general = public_users;
