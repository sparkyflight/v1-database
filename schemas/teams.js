const { Schema } = require("mongoose");

const schema = new Schema({
	ID: String,
        Name: String,
        Bio: String,
        Avatar: String,
        Followers: Object,
        Following: Object,
        Members: Object
});

module.exports = {
	name: "team",
	schema: schema,
};
