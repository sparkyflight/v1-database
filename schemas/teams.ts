import { DataTypes } from "sequelize";

const Team = {
	Name: {
		type: DataTypes.STRING,
	},
	UserID: {
		type: DataTypes.STRING,
	},
	UserTag: {
		type: DataTypes.STRING,
	},
	Bio: {
		type: DataTypes.STRING,
	},
	Avatar: {
		type: DataTypes.STRING,
	},
	CreatedAt: {
		type: DataTypes.DATE,
	},
	Subscribers: {
		type: DataTypes.JSON,
	},
	Subscribed: {
		type: DataTypes.JSON,
	},
	Members: {
		type: DataTypes.JSON,
	},
	Badges: {
		type: DataTypes.JSON,
	},
};

export default {
	name: "teams",
	schema: Team,
};
