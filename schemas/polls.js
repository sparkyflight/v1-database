const { Schema } = require("mongoose");

const schema = new Schema({
	UserID: String,
	CreatedAt: Date,
        ExpirationDate: Date,
	Question: String,
        Description: String,
        Options: Array,
});

module.exports = {
	name: "poll",
	schema: schema,
};
