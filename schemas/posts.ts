import { Schema } from "mongoose";

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

export default {
	name: "post",
	schema: schema,
};
