import { DataTypes } from "sequelize";

const DevApp = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
	},
	creatorid: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	logo: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	token: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
	},
	permissions: {
		type: DataTypes.JSON,
		defaultValue: ["global.*"],
	},
	createdat: {
		type: DataTypes.DATE,
	},
};

export default {
	name: "applications",
	schema: DevApp,
};
