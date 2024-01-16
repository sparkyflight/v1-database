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
		unique: true,
	},
	usertag: {
		type: DataTypes.STRING,
		unique: true,
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
	followers: {
		type: DataTypes.JSON,
	},
	following: {
		type: DataTypes.JSON,
	},
	badges: {
		type: DataTypes.JSON,
	},
	coins: {
		type: DataTypes.INTEGER,
	},
};

export default {
	name: "users",
	schema: User,
};
