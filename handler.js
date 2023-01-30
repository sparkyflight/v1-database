// Packages
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("./logger");

// Connect to MongoDB
mongoose.connect("mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/?retryWrites=true&w=majority").then(() => {
    logger.success("Mongoose", "Connected!");
});
