// Packages
import { Sequelize, Model, Table } from "sequelize-typescript";
import { info, error } from "./logger.js";
import fs from "fs";
import "dotenv/config";
import {
	PostsTypings,
	UsersTypings,
	TokensTypings,
	TeamsTypings,
} from "./types.interface.js";
import crypto from "crypto";

// Connect to PostgreSQL
const sequelize = new Sequelize({
	dialect: "postgres",
	host: process.env.ENV === "production" ? "0.0.0.0" : "100.65.43.129",
	username: "select",
	password: "password",
	database: "sparkyflight",
	logging: (r) => {
		return console.log(r);
	},
	define: {
		timestamps: false,
	},
});

sequelize
	.authenticate()
	.then(() => info("PostgreSQL", "Connected!"))
	.catch((err) => error("PostgreSQL", `Unable to connect.\nError: ${err}`));

// Schemas
const schemaFiles = fs
	.readdirSync("./dist/database/schemas")
	.filter((file) => file.endsWith(".js"));
let schemaData = [];

for (const fileName of schemaFiles) {
	import(`./schemas/${fileName}`)
		.then((module) => {
			const file = module.default;
			schemaData[file.name] = file;
		})
		.catch((error) => {
			console.error(error);
		});
}

// Users
@Table({
	tableName: "users",
})
class Users extends Model implements UsersTypings {
	name: string;
	userid: string;
	usertag: string;
	bio: string;
	avatar: string;
	createdat: Date;
	subscribers: string[];
	subscribed: string[];
	badges: string[];
	coins: number;

	static async createUser(
		name: string,
		userid: string,
		usertag: string,
		bio: string,
		avatar: string
	): Promise<boolean | Error> {
		try {
			await Users.create({
				name,
				userid,
				usertag,
				bio,
				avatar,
				createdat: new Date(),
				subscribers: [],
				subscribed: [],
				badges: [],
				coins: 200,
			});

			return true;
		} catch (error) {
			return error;
		}
	}

	static async get(data: any): Promise<UsersTypings | null> {
		const doc = await Users.findOne({
			where: data,
		});

		if (!doc) return null;
		else return doc;
	}

	static async find(data: any): Promise<UsersTypings[]> {
		const docs = await Users.findAll({
			where: data,
		});

		return docs;
	}

	static async updateUser(
		id: string,
		data: object
	): Promise<boolean | Error> {
		try {
			await Users.update(data, {
				where: {
					userid: id,
				},
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async delete(data: any): Promise<boolean | Error> {
		try {
			await Users.destroy({
				where: data,
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async follow(
		UserID: string,
		Target: string
	): Promise<boolean | Error> {
		try {
			const user = await Users.findOne({
				where: {
					userid: UserID,
				},
			});

			const target = await Users.findOne({
				where: {
					userid: Target,
				},
			});

			let subscribed = user.subscribed;
			subscribed.push(Target);

			let subscribers = target.subscribers;
			subscribers.push(UserID);

			await Users.update(
				{
					subscribers: subscribers,
				},
				{
					where: {
						userid: Target,
					},
				}
			);

			await Users.update(
				{
					subscribed: subscribed,
				},
				{
					where: {
						userid: UserID,
					},
				}
			);

			return true;
		} catch (err) {
			return err;
		}
	}

	static async unfollow(
		UserID: string,
		Target: string
	): Promise<boolean | Error> {
		try {
			const user = await Users.findOne({
				where: {
					userid: UserID,
				},
			});

			const target = await Users.findOne({
				where: {
					userid: Target,
				},
			});

			let subscribed = user.subscribed;
			delete subscribed[subscribed.findIndex((p) => p === Target)];

			let subscribers = target.subscribers;
			delete subscribers[subscribers.findIndex((p) => p === UserID)];

			await Users.update(
				{
					subscribers: subscribers,
				},
				{
					where: {
						userid: Target,
					},
				}
			);

			await Users.update(
				{
					subscribed: subscribed,
				},
				{
					where: {
						userid: UserID,
					},
				}
			);

			return true;
		} catch (err) {
			return err;
		}
	}
}

// Tokens
@Table({
	tableName: "tokens",
})
class Tokens extends Model implements TokensTypings {
	userid: string;
	createdat: Date;
	token: string;
	method: string;

	static async createToken(
		userid: string,
		token: string,
		method: string
	): Promise<boolean | Error> {
		try {
			await Tokens.create({
				userid,
				createdat: new Date(),
				token,
				method,
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async get(token: string): Promise<object | Error> {
		const tokenData = await Tokens.findOne({
			where: {
				token: token,
			},
		});

		if (tokenData) {
			const user = await Tokens.findOne({
				where: {
					userid: tokenData.userid,
				},
			});

			if (user) {
				user["token"] = token;
				return user;
			} else {
				return {
					error: "That user does not exist!",
				};
			}
		} else {
			return {
				error: "The specified token is invalid.",
			};
		}
	}

	static async getAllUserTokens(userid: string): Promise<object[] | Error> {
		try {
			const doc = await Tokens.findAll({
				where: {
					userid: userid,
				},
			});

			return doc;
		} catch (error) {
			return error;
		}
	}

	static async delete(data: any): Promise<boolean | Error> {
		try {
			await Tokens.destroy({
				where: data,
			});

			return true;
		} catch (err) {
			return err;
		}
	}
}

// Posts (Onlyfoodz)
@Table({
	tableName: "onlyfoodz_posts",
})
class OnlyfoodzPosts extends Model implements PostsTypings {
	userid: string;
	caption: string;
	image: string;
	plugins: { type: string; url: string }[];
	type: number;
	createdat: Date;
	postid: string;
	upvotes: string[];
	downvotes: string[];
	comments: {
		user: UsersTypings | TeamsTypings;
		comment: { caption: string; image: string };
	}[];

	static async createPost(
		userid: string,
		caption: string,
		image: string,
		plugins: any,
		type: number
	): Promise<boolean | Error> {
		try {
			await Posts.create({
				userid,
				caption,
				image,
				plugins,
				type,
				createdat: new Date(),
				postid: crypto.randomUUID(),
				upvotes: [],
				downvotes: [],
				comments: [],
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async get(PostID: string): Promise<any | Error> {
		let post = await Posts.findOne({
			where: {
				postid: PostID,
			},
		});

		let Comments: PostsTypings["comments"] = [];

		if (post) {
			let user = await Users.get({ userid: post.userid });
			let team = false;

			if (!user) {
				user = await Users.get({ userid: post.userid });
				if (user) team = true;
			}

			if (user) {
				for (const comment of post.comments) {
					let user = await Users.get({
						userid: comment.user.userid,
					});

					if (user) Comments.push(comment);
					else continue;
				}

				post.comments = Comments;

				let data = {
					user: user,
					post: post,
					team: team,
				};

				return data;
			} else {
				return {
					error: "The specified post id is invalid.",
				};
			}
		} else {
			return {
				error: "The specified post id is invalid.",
			};
		}
	}

	static async find(data: object, type: string): Promise<object[]> {
		let posts: object[] = [];

		const docs = await Posts.findAll({
			where: {
				...data,
				type: type,
			},
		});

		for (const post of docs) {
			let Comments: PostsTypings["comments"] = [];

			let user = {
				data: await Users.get({ userid: post.userid }),
				team: false,
			};

			let team = {
				data: await Teams.get({ userid: post.userid }),
				team: true,
			};

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user.data && !team.data) continue;
			else {
				post.comments = Comments;

				posts.push({
					post: post,
					user: user.data === null ? team.data : user.data,
					team: user.data === null ? true : false,
				});
			}
		}

		return posts;
	}

	static async listAllPosts(type: string): Promise<object[]> {
		let posts: object[] = [];

		const docs = await Posts.findAll({
			type: type,
		});

		for (let post of docs) {
			let Comments: PostsTypings["comments"] = [];

			let user = {
				data: await Users.get({ userid: post.userid }),
				team: false,
			};

			let team = {
				data: await Teams.get({ userid: post.userid }),
				team: true,
			};

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user.data && !team.data) continue;
			else {
				post.comments = Comments;

				posts.push({
					post: post,
					user: user.data === null ? team.data : user.data,
					team: user.data === null ? true : false,
				});
			}
		}

		return posts;
	}

	static async updatePost(id: string, data: any): Promise<boolean | Error> {
		try {
			await Posts.update(data, {
				where: {
					postid: id,
				},
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async getAllUserPosts(
		UserID: string,
		Type: string
	): Promise<PostsTypings[]> {
		let posts: PostsTypings[] = [];

		const docs = await Posts.findAll({
			where: { userid: UserID, type: Type },
		});

		for (let post of docs) {
			let Comments: PostsTypings["comments"] = [];

			let user = {
				data: await Users.get({ userid: post.userid }),
				team: false,
			};

			let team = {
				data: await Teams.get({ userid: post.userid }),
				team: true,
			};

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user.data && !team.data) continue;
			else {
				post.comments = Comments;

				posts.push(post);
			}
		}

		return posts;
	}

	static async delete(PostID: string): Promise<boolean | Error> {
		try {
			await Posts.destroy({
				where: {
					postid: PostID,
				},
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async upvote(
		PostID: string,
		UserID: string
	): Promise<boolean | Error> {
		try {
			const post = await Posts.get(PostID);
			post.upvotes.push(UserID);

			const result = await Posts.updatePost(PostID, {
				upvotes: post.upvotes,
			});
			return result;
		} catch (err) {
			return err;
		}
	}

	static async downvote(
		PostID: string,
		UserID: string
	): Promise<boolean | Error> {
		try {
			const post = await Posts.get(PostID);
			post.downvotes.push(UserID);

			const result = await Posts.updatePost(PostID, {
				downvotes: post.downvotes,
			});
			return result;
		} catch (err) {
			return err;
		}
	}

	static async comment(
		Post: PostsTypings,
		User: UsersTypings,
		Caption: string,
		Image: string
	): Promise<boolean | Error> {
		try {
			const post = await Posts.get(Post.postid);

			if (post) {
				post.comments.push({
					user: User,
					comment: {
						caption: Caption,
						image: Image,
					},
				});

				const result = await Posts.updatePost(Post.postid, {
					comments: post.comments,
				});
				return result;
			} else return false;
		} catch (err) {
			return err;
		}
	}
}

const init = () => {
	sequelize.addModels([Users, Tokens, Teams, Posts]);

	Users.init(schemaData["users"].schema, {
		sequelize: sequelize,
		modelName: schemaData["users"].name,
	});

	Tokens.init(schemaData["tokens"].schema, {
		sequelize: sequelize,
		modelName: schemaData["tokens"].name,
	});

	OnlyfoodzPosts.init(schemaData["onlyfoodz_posts"].schema, {
		sequelize: sequelize,
		modelName: schemaData["onlyfoodz_posts"].name,
	});

	sequelize.sync();
};
setTimeout(() => init(), 2000);

// Export the classes
export { 
	Users, Tokens, OnlyfoodzPosts
};
