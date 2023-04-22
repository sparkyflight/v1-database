const { Schema } = require("mongoose");

const schema = new Schema({
	Username: String,
	UserID: String,
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

module.exports = {
	name: "user",
	schema: schema,
};
