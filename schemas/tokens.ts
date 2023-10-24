import { Schema } from "mongoose";

const schema = new Schema({
	UserID: String,
	CreatedAt: Date,
	Token: String,
	Method: String,
});

export default {
	name: "token",
	schema: schema,
};
