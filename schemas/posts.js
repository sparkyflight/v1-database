const { Schema } = require("mongoose");

const schema = new Schema({
	UserID: String,
	Caption: String,
	Image: String,
	Plugins: String,
	Type: Number,
	CreatedAt: Date,
	PostID: String,
});

module.exports = {
	name: "post",
	schema: schema,
};
