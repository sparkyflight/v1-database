import { DataTypes, Model } from "sequelize";

const Token = {
	UserID: DataTypes.STRING,
	CreatedAt: DataTypes.DATE,
	Token: DataTypes.STRING,
	Method: DataTypes.STRING,
};

export default {
	name: "token",
	schema: Token,
};
