import { DataTypes } from "sequelize";

const User = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
	},
	userid: {
		type: DataTypes.STRING,
	},
	usertag: {
		type: DataTypes.STRING,
	},
	bio: {
		type: DataTypes.STRING,
	},
	avatar: {
		type: DataTypes.STRING,
	},
	createdat: {
		type: DataTypes.DATE,
	},
	subscribers: {
		type: "text[]",
	},
	subscribed: {
		type: "text[]",
	},
	badges: {
		type: "text[]",
	},
	coins: {
		type: DataTypes.INTEGER,
	},
};

export default {
	name: "users",
	schema: User,
};
