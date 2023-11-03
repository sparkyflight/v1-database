// Packages
import { Model, Sequelize } from "sequelize";
import { info, error } from "./logger.js";
import fs from "fs";
import "dotenv/config";
import crypto from "crypto";

// Connect to PostgreSQL
const sequelize = new Sequelize({
	dialect: "postgres",
	host: process.env.ENV === "production" ? "0.0.0.0" : "100.65.43.129",
	username: "select",
	password: "password",
	database: "onlyfoodz",
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
let schemas = [];
let schemaData = [];

for (const fileName of schemaFiles) {
	import(`./schemas/${fileName}`)
		.then((module) => {
			const file = module.default;

			schemaData[file.name] = file;
			schemas[file.name] = sequelize.define(file.name, file.schema);
		})
		.catch((error) => {
			console.error(error);
		});
}

// Users
class Users extends Model {
	subscribed: any;
	subscribers: any;

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

	static async get(data: any): Promise<object | null> {
		const doc = await Users.findOne({
			where: data,
		});

		return doc;
	}

	static async find(data: any): Promise<object[]> {
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
					Subscribed: subscribed,
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
						UserID: Target,
					},
				}
			);

			await Users.update(
				{
					subscribed: subscribed,
				},
				{
					where: {
						UserID: UserID,
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
class Tokens extends Model {
	userid: any;

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

// Posts
class Posts extends Model {
	UserID: any; // wip
	comments: any;
	static async createPost(
		userid: string,
		caption: string,
		image: string,
		plugins: object,
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

	static async get(PostID: string): Promise<object | Error> {
		let post = await Posts.findOne({
			where: {
				postid: PostID,
			},
		});

		let Comments: object[] = [];

		if (post) {
			let user = await Users.get({ UserID: post.UserID });
			let team = false;

			if (!user) {
				user = await Users.get({ UserID: post.UserID });
				if (user) team = true;
			}

			if (user) {
				for (const comment of post.comments) {
					let user = await Users.get({
						UserID: comment.UserID,
					});

					if (user) {
						Comments.push({
							comment: comment,
							user: user,
						});
					} else continue;
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

		const docs = await schemas["post"].find({
			data: data,
			type: type,
		});

		for (const post of docs) {
			let Comments: object[] = [];

			let user = {
				data: await schemas["user"].findOne({ UserID: post.UserID }),
				team: false,
			};

			let team = {
				data: await schemas["team"].findOne({ UserID: post.UserID }),
				team: true,
			};

			for (const comment of post.Comments) {
				let user = await schemas["user"].findOne({
					UserID: comment.UserID,
				});

				if (user) {
					user.Connections = [];
					Comments.push({
						comment: comment,
						user: user,
					});
				} else continue;
			}

			if (!user.data && !team.data) continue;
			else {
				post.Comments = Comments;

				(user.data === null ? team.data : user.data).Connections = [];

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

		const docs = await schemas["post"].find({
			Type: type,
		});

		for (let post of docs) {
			let Comments: object[] = [];

			let user = {
				data: await schemas["user"].findOne({ UserID: post.UserID }),
				team: false,
			};

			let team = {
				data: await schemas["team"].findOne({ UserID: post.UserID }),
				team: true,
			};

			for (const comment of post.Comments) {
				let user = await schemas["user"].findOne({
					UserID: comment.UserID,
				});

				if (user) {
					user.Connections = [];
					Comments.push({
						comment: comment,
						user: user,
					});
				} else continue;
			}

			if (!user.data && !team.data) continue;
			else {
				post.Comments = Comments;

				(user.data === null ? team.data : user.data).Connections = [];

				posts.push({
					post: post,
					user: user.data === null ? team.data : user.data,
					team: user.data === null ? true : false,
				});
			}
		}

		return posts;
	}

	static async updatePost(id: string, data: object): Promise<object | Error> {
		try {
			const result = await schemas["post"].updateOne(
				{ PostID: id },
				data
			);
			return result;
		} catch (err) {
			return err;
		}
	}

	static async getAllUserPosts(
		UserID: string,
		Type: string
	): Promise<object[]> {
		let posts: object[] = [];

		const docs = await schemas["post"].find({
			UserID,
			Type,
		});

		for (let post of docs) {
			let Comments: object[] = [];

			let user = {
				data: await schemas["user"].findOne({ UserID: post.UserID }),
				team: false,
			};

			let team = {
				data: await schemas["team"].findOne({ UserID: post.UserID }),
				team: true,
			};

			for (const comment of post.Comments) {
				let user = await schemas["user"].findOne({
					UserID: comment.UserID,
				});

				if (user) {
					user.Connections = [];
					Comments.push({
						comment: comment,
						user: user,
					});
				} else continue;
			}

			if (!user.data && !team.data) continue;
			else {
				post.Comments = Comments;

				posts.push(post);
			}
		}

		return posts;
	}

	static async delete(PostID: string): Promise<object | Error> {
		try {
			const result = await schemas["post"].deleteOne({
				PostID,
			});
			return result;
		} catch (err) {
			return err;
		}
	}

	static async upvote(
		PostID: string,
		UserID: string
	): Promise<object | Error> {
		try {
			const result = await schemas["post"].updateOne(
				{
					PostID,
				},
				{
					$push: {
						Upvotes: UserID,
					},
				}
			);
			return result;
		} catch (err) {
			return err;
		}
	}

	static async downvote(
		PostID: string,
		UserID: string
	): Promise<object | Error> {
		try {
			const result = await schemas["post"].updateOne(
				{
					PostID,
				},
				{
					$push: {
						Downvotes: UserID,
					},
				}
			);
			return result;
		} catch (err) {
			return err;
		}
	}

	static async comment(
		PostID: string,
		UserID: string,
		Caption: string
	): Promise<object | Error> {
		try {
			const result = await schemas["post"].updateOne(
				{
					PostID,
				},
				{
					$push: {
						Comments: {
							UserID: UserID,
							CommentID: crypto.randomUUID(),
							Caption: Caption,
							Upvotes: [],
							Downvotes: [],
						},
					},
				}
			);
			return result;
		} catch (err) {
			return err;
		}
	}
}

// Teams
class Teams extends Model {
	static async createTeam(
		Name: string,
		UserID: string,
		UserTag: string,
		Bio: string,
		Avatar: string,
		CreatorID: string
	): Promise<object | Error> {
		const doc = new schemas["team"]({
			Name,
			UserID,
			UserTag,
			Bio,
			Avatar,
			CreatedAt: new Date(),
			Following: {},
			Followers: {},
			Members: [
				{
					ID: CreatorID,
					Roles: ["OWNER"],
					MemberAddedAt: new Date(),
				},
			],
		});

		try {
			await doc.save();
			return {
				Name,
				UserID,
				UserTag,
				Bio,
				Avatar,
				CreatedAt: doc.CreatedAt,
				Following: [],
				Followers: [],
				Members: [
					{
						ID: CreatorID,
						Roles: ["OWNER"],
						MemberAddedAt: doc.CreatedAt,
					},
				],
			};
		} catch (err) {
			return err;
		}
	}

	static async get(data: object): Promise<object | null> {
		const doc = await schemas["team"].findOne(data);
		return doc;
	}

	static async find(data: object): Promise<object[]> {
		const docs = await schemas["team"].find(data);

		return docs.map((t) => {
			t["Members"] = t["Members"].map((member) => {
				return {
					ID: member.ID,
					Roles: member.Roles,
					MemberAddedAt: member.MemberAddedAt,
				};
			});
			t["Following"] = [];
			t["Followers"] = [];
			return t;
		});
	}

	static async updateTeam(id: string, data: object): Promise<object | Error> {
		try {
			const result = await schemas["team"].updateOne(
				{ UserID: id },
				data
			);
			return result;
		} catch (err) {
			return err;
		}
	}

	static async delete(data: object): Promise<object | Error> {
		try {
			const result = await schemas["team"].deleteOne(data);
			return result;
		} catch (err) {
			return err;
		}
	}

	static async follow(
		UserID: string,
		TeamID: string
	): Promise<boolean | Error> {
		try {
			await schemas["team"].updateOne(
				{ UserID: TeamID },
				{
					$push: {
						Followers: UserID,
					},
				}
			);

			await schemas["user"].updateOne(
				{ UserID: UserID },
				{
					$push: {
						Following: TeamID,
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
		TeamID: string
	): Promise<boolean | Error> {
		try {
			await schemas["team"].updateOne(
				{ UserID: TeamID },
				{
					$pull: {
						Followers: UserID,
					},
				}
			);

			await schemas["user"].updateOne(
				{ UserID: UserID },
				{
					$pull: {
						Following: TeamID,
					},
				}
			);

			return true;
		} catch (err) {
			return err;
		}
	}

	static async invite(
		TeamID: string,
		UserID: string
	): Promise<boolean | Error> {
		try {
			await schemas["team"].updateOne(
				{ UserID: TeamID },
				{
					$push: {
						Members: {
							ID: UserID,
							Roles: ["MEMBER"],
							MemberAddedAt: new Date(),
						},
					},
				}
			);

			await schemas["user"].updateOne(
				{ UserID: UserID },
				{
					$push: {
						Teams: TeamID,
					},
				}
			);

			return true;
		} catch (err) {
			return err;
		}
	}

	static async kick(
		TeamID: string,
		UserID: string
	): Promise<boolean | Error> {
		try {
			await schemas["team"].updateOne(
				{ UserID: TeamID },
				{
					$pull: {
						Members: {
							ID: UserID,
						},
					},
				}
			);

			await schemas["user"].updateOne(
				{ UserID: UserID },
				{
					$pull: {
						Teams: TeamID,
					},
				}
			);

			return true;
		} catch (err) {
			return err;
		}
	}

	static async listUsersTeams(UserID: string): Promise<object | Error> {
		try {
			let data = [];
			const db = await schemas["team"].find();

			db.forEach((team) => {
				const i = team.Members.find((i) => i.ID === UserID);

				if (i) data.push(team);
				else return;
			});

			return data;
		} catch (error) {
			return error;
		}
	}
}

const init = () => {
	Users.init(schemaData["users"].schema, {
		sequelize: sequelize,
		modelName: schemaData["users"].name,
	});

	Tokens.init(schemaData["tokens"].schema, {
		sequelize: sequelize,
		modelName: schemaData["tokens"].name,
	});

	Teams.init(schemaData["teams"].schema, {
		sequelize: sequelize,
		modelName: schemaData["teams"].name,
	});

	Posts.init(schemaData["posts"].name, {
		sequelize: sequelize,
		modelName: schemaData["posts"].name,
	});

	sequelize.sync();
};
setTimeout(() => init(), 2000);

// Export the classes
export { Users, Tokens, Posts, Teams };
