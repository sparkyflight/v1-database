import { DataTypes } from "sequelize";

const Post = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	userid: {
		type: DataTypes.STRING,
	},
	caption: {
		type: DataTypes.STRING,
	},
	image: {
		type: DataTypes.STRING,
	},
	plugins: {
		type: DataTypes.JSON,
	},
	createdat: {
		type: DataTypes.DATE,
	},
	postid: {
		type: DataTypes.STRING,
		unique: true,
	},
	upvotes: {
		type: DataTypes.JSON,
	},
	downvotes: {
		type: DataTypes.JSON,
	},
	comments: {
		type: DataTypes.JSON,
	},
};

export default {
	name: "posts",
	schema: Post,
};