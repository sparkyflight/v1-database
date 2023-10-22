import { Schema } from "mongoose";

const schema = new Schema({
	Name: String,
	UserID: String,
	UserTag: String,
	Bio: String,
	Avatar: String,
	CreatedAt: Date,
	Connections: Object,
	Notifications: Object,
	Followers: Object,
	Following: Object,
	Badges: Object,
	StaffPerms: Object,
});

export default {
	name: "user",
	schema: schema,
};
