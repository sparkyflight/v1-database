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
	type: {
		type: DataTypes.INTEGER,
	},
	createdat: {
		type: DataTypes.DATE,
	},
	postid: {
		type: DataTypes.STRING,
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
	name: "onlyfoodz_posts",
	schema: Post,
};
