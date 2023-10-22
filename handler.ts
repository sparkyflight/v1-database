// Packages
import mongoose from "mongoose";
import fs from "fs";
import { success, error } from "./logger.js";
import "dotenv/config";
import crypto from "crypto";

// Connect to MongoDB
const MONGO_URL = `mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/${
	process.env.ENV === "production" ? "nightmarebot" : "development"
}?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);

mongoose
	.connect(MONGO_URL)
	.then(() => {
		success("Database", "Connected!");
	})
	.catch((err) => {
		error("Database", `Failed to connect\nError: ${err}`);
	});

// Schemas
const schemaFiles = fs
	.readdirSync("./dist/database/schemas")
	.filter((file) => file.endsWith(".js"));
const schemas: { [key: string]: mongoose.Model<any> } = {};

for (const fileName of schemaFiles) {
	import(`./schemas/${fileName}`)
		.then((module) => {
			const file = module.default;
			schemas[file.name] = mongoose.model(file.name, file.schema);
		})
		.catch((error) => {
			console.error(`Error importing ${fileName}: ${error}`);
		});
}

// Users
class Users {
	static async create(
		Name: string,
		UserID: string,
		UserTag: string,
		Bio: string,
		Avatar: string,
		CreatedAt: Date,
		Connections: object
	): Promise<object | Error> {
		const doc = new schemas["user"]({
			Name,
			UserID,
			UserTag,
			Bio,
			Avatar,
			CreatedAt,
			Connections,
			Notifications: {},
			Following: [],
			Followers: [],
			Badges: [],
			StaffPerms: [],
		});

		try {
			await doc.save();
			return {
				Name,
				UserID,
				UserTag,
				Avatar,
				CreatedAt,
				Connections,
				Notifications: [],
				Following: [],
				Followers: [],
				Badges: [],
				StaffPerms: [],
			};
		} catch (err) {
			return err;
		}
	}

	static async get(data: object): Promise<object | null> {
		const doc = await schemas["user"].findOne(data);
		return doc;
	}

	static async find(data: object): Promise<object[]> {
		const docs = await schemas["user"].find(data);

		return docs.map((p) => {
			let d = p.toObject();
			d["Connections"] = [];
			return d;
		});
	}

	static async update(id: string, data: object): Promise<object | Error> {
		try {
			const result = await schemas["user"].updateOne(
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
			const result = await schemas["user"].deleteOne(data);
			return result;
		} catch (err) {
			return err;
		}
	}

	static async follow(
		UserID: string,
		Target: string
	): Promise<boolean | Error> {
		try {
			await schemas["user"].updateOne(
				{ UserID: Target },
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
						Following: Target,
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
			await schemas["user"].updateOne(
				{ UserID: Target },
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
						Following: Target,
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
class Tokens {
	static async create(
		UserID: string,
		Token: string,
		Method: string
	): Promise<object | Error> {
		const doc = new schemas["token"]({
			UserID,
			CreatedAt: new Date(),
			Token,
			Method,
		});

		try {
			await doc.save();
			return doc;
		} catch (err) {
			return err;
		}
	}

	static async get(token: string): Promise<object | Error> {
		const tokenData = await schemas["token"].findOne({ Token: token });

		if (tokenData) {
			const user = await schemas["user"].findOne({
				UserID: tokenData.UserID,
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

	static async getAllUserTokens(UserID: string): Promise<object[]> {
		const doc = await schemas["token"].find({ UserID });
		return doc;
	}

	static async delete(data: object): Promise<object | Error> {
		try {
			const result = await schemas["token"].deleteOne(data);
			return result;
		} catch (err) {
			return err;
		}
	}
}

// Posts
class Posts {
	static async create(
		UserID: string,
		Caption: string,
		Image: string,
		Plugins: object,
		Type: number
	): Promise<object | Error> {
		const doc = new schemas["post"]({
			UserID,
			Caption,
			Image,
			Plugins,
			Type,
			CreatedAt: new Date(),
			PostID: crypto.randomUUID(),
			Upvotes: [],
			Downvotes: [],
			Comments: [],
		});

		try {
			await doc.save();
			return { success: true };
		} catch (err) {
			return err;
		}
	}

	static async get(PostID: string): Promise<object | Error> {
		let post = await schemas["post"].findOne({ PostID });

		let Comments: object[] = [];

		if (post) {
			let user = await schemas["user"].findOne({ UserID: post.UserID });
			let team = false;

			if (!user || user.error) {
				user = await schemas["team"].findOne({ UserID: post.UserID });
				if (user || !user.error) team = true;
			}

			if (user || !user.error) {
				user.Connections = [];

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

				post.Comments = Comments;

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

	static async update(id: string, data: object): Promise<object | Error> {
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
class Teams {
	static async create(
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

	static async update(id: string, data: object): Promise<object | Error> {
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
}

// Export the classes
export { Users, Tokens, Posts, Teams };
