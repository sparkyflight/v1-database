import { DataTypes, Model } from "sequelize";

const Team = {
	Name: DataTypes.STRING,
	UserID: DataTypes.STRING,
	UserTag: DataTypes.STRING,
	Bio: DataTypes.STRING,
	Avatar: DataTypes.STRING,
	CreatedAt: DataTypes.DATE,
	Subscribers: DataTypes.JSON,
	Subscribed: DataTypes.JSON,
	Members: DataTypes.JSON,
	Badges: DataTypes.JSON,
};

export default {
	name: "team",
	schema: Team,
};
