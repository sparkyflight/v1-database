import { DataTypes, Model } from "sequelize";

const User = {
	Name: DataTypes.STRING,
	UserID: DataTypes.STRING,
	UserTag: DataTypes.STRING,
	Bio: DataTypes.STRING,
	Avatar: DataTypes.STRING,
	CreatedAt: DataTypes.DATE,
	Subscribers: DataTypes.JSON,
	Subscribed: DataTypes.JSON,
	Badges: DataTypes.JSON,
	Coins: DataTypes.INTEGER,
};

export default {
	name: "users",
	schema: User,
};
