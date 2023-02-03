const { Schema } = require("mongoose");

const schema = new Schema({
	UserID: String,
    CreatedAt: String,
    Token: String,
    Method: String
});

module.exports = {
    name: "token",
	schema: schema,
};
