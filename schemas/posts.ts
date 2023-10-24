import { DataTypes, Model } from "sequelize";

const Post = {
	UserID: DataTypes.STRING,
	Caption: DataTypes.STRING,
	Image: DataTypes.STRING,
	Plugins: DataTypes.JSON,
	Type: DataTypes.INTEGER,
	CreatedAt: DataTypes.DATE,
	PostID: DataTypes.STRING,
	Upvotes: DataTypes.JSON,
	Downvotes: DataTypes.JSON,
	Comments: DataTypes.JSON,
};

export default {
	name: "post",
	schema: Post,
};
