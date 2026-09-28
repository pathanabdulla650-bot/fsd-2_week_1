const express = require("express");

const app = express();
const PORT = 3000;

// =====================================================
// Middleware
// =====================================================

// Global logger middleware
function logger(req, res, next) {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
}

// Global request timing middleware
function timer(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`Request completed in ${duration} ms`);
    });

    next();
}

// Route-specific middleware
function checkApiKey(req, res, next) {
    if (req.headers["x-api-key"] === "12345") {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

// Apply global middleware
app.use(logger);
app.use(timer);

// JSON body parsing middleware
app.use(express.json());


// =====================================================
// PART (a) - Routes, Route Parameters, Query Parameters
// =====================================================

// 1. Basic route
app.get("/", (req, res) => {
    res.send("Welcome to the ExpressJS application!");
});

// 2. Route parameter
// Example: GET /user/42
app.get("/user/:id", (req, res) => {
    const id = req.params.id;

    res.send(`User ID: ${id}`);
});

// 3. Query parameters
// Example: GET /search?q=express&limit=5
app.get("/search", (req, res) => {
    const query = req.query.q || "";
    const limit = req.query.limit || "not specified";

    res.send(`Searching for '${query}', limit ${limit}`);
});

// 4. URL building using req.originalUrl
app.get("/url-info", (req, res) => {
    res.json({
        message: "Current requested URL",
        originalUrl: req.originalUrl
    });
});

// 5. Redirect example
app.get("/home", (req, res) => {
    res.redirect("/");
});


// =====================================================
// PART (b) - In-Memory Books Resource
// =====================================================

let books = [
    {
        id: 1,
        title: "The Hobbit",
        author: "Tolkien"
    },
    {
        id: 2,
        title: "Dune",
        author: "Herbert"
    }
];

let nextId = 3;


// GET /books - Retrieve all books
app.get("/books", (req, res) => {
    res.json(books);
});


// GET /books/:id - Retrieve a specific book
app.get("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            error: "Book not found"
        });
    }

    res.json(book);
});


// POST /books - Add a new book
app.post("/books", (req, res) => {
    const { title, author } = req.body;

    // Validate input
    if (!title || !author) {
        return res.status(400).json({
            error: "Title and author are required"
        });
    }

    const newBook = {
        id: nextId++,
        title: title,
        author: author
    };

    books.push(newBook);

    res.status(201).json(newBook);
});


// DELETE /books/:id - Delete a book
app.delete("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: "Book not found"
        });
    }

    books.splice(index, 1);

    res.status(204).send();
});


// =====================================================
// Route-specific middleware demonstration
// =====================================================

// This route requires x-api-key: 12345
app.get("/protected", checkApiKey, (req, res) => {
    res.json({
        message: "You accessed the protected route successfully."
    });
});


// =====================================================
// 404 Handler
// =====================================================

app.use((req, res) => {
    res.status(404).send("Route Not Found");
});


// =====================================================
// Start Server
// =====================================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
