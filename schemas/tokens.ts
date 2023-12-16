import { DataTypes } from "sequelize";

const Token = {
	userid: {
		type: DataTypes.STRING,
	},
	createdat: {
		type: DataTypes.DATE,
	},
	token: {
		type: DataTypes.STRING,
	},
	method: {
		type: DataTypes.STRING,
	},
};

export default {
	name: "tokens",
	schema: Token,
};
