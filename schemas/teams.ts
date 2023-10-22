import { Schema } from "mongoose";

const schema = new Schema({
	Name: String,
	UserID: String,
	UserTag: String,
	Bio: String,
	Avatar: String,
	CreatedAt: Date,
	Followers: Object,
	Following: Object,
	Members: Object,
});

export default {
	name: "team",
	schema: schema,
};
