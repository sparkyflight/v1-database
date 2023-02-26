const { Schema } = require("mongoose");

const schema = new Schema({
	UserID: String,
	Caption: String,
	Image: String,
	Plugins: Object,
	Type: Number,
	CreatedAt: Date,
	PostID: String,
        Likes: Number,
        Dislikes: Number
});

module.exports = {
	name: "post",
	schema: schema,
};
