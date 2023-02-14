const { Schema } = require("mongoose");

const schema = new Schema({
	UserID: String,
	CreatedAt: Date,
	Token: String,
	Method: String,
});

module.exports = {
	name: "token",
	schema: schema,
};
