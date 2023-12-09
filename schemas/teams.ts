import { DataTypes } from "sequelize";

const Team = {
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
	supporters: {
		type: DataTypes.JSON,
	},
	members: {
		type: DataTypes.JSON,
	},
	badges: {
		type: DataTypes.JSON,
	},
};

export default {
	name: "teams",
	schema: Team,
};
