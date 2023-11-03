import { DataTypes } from "sequelize";

const User = {
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
		type: DataTypes.JSON,
	},
	subscribed: {
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
