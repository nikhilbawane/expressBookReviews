const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const jwtSecret = "SuperSecretKey";

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    let user = users.find((user) => user.username === username);
    return !!user;
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    let user = users.find(
        (user) => user.username === username && user.password === password
    );

    return !!user;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign(
            { data: password },
            jwtSecret,
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = { accessToken, username };

        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).send("Invalid Login. check username and password");
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.query.review;

    console.log(req.session.authorization["username"]);

    books[isbn].reviews[req.session.authorization["username"]] = review;

    let result = { message: "Review added sucessfully.", reviews: books[isbn].reviews };

    return res.status(200).send(JSON.stringify(result, null, 4));
});

// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;

    console.log(req.session.authorization["username"]);

    delete books[isbn].reviews[req.session.authorization["username"]];

    return res.status(200).send("Review deleted.");
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
