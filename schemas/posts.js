const { Schema } = require("mongoose");

const schema = new Schema({
	UserID: String,
	Caption: String,
	Image: String,
	Plugins: Object,
	Type: Number,
	CreatedAt: Date,
	PostID: String,
	Upvotes: Object,
	Downvotes: Object,
	Comments: Object,
});

module.exports = {
	name: "post",
	schema: schema,
};
