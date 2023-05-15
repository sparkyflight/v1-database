// Packages
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("node:crypto");
const logger = require("./logger");
require("dotenv").config();

// Connect to MongoDB
const MONGO_URL = `mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/${
	process.env.ENV === "production" ? "nightmarebot" : "development"
}?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);

mongoose
	.connect(MONGO_URL)
	.then(() => {
		logger.success("Database", "Connected!");
	})
	.catch((err) => {
		logger.error("Database", `Failed to connect\nError: ${err}`);
	});

// Schemas
const schemaFiles = fs
	.readdirSync("./database/schemas")
	.filter((file) => file.endsWith(".js"));
const schemas = {};

for (const fileName of schemaFiles) {
	const file = require(`./schemas/${fileName}`);
	schemas[file.name] = mongoose.model(file.name, file.schema);
}

// Users
class Users {
	static async create(Username, UserID, Bio, Avatar, CreatedAt, Connections) {
		const doc = new schemas["user"]({
			Username,
			UserID,
			Bio,
			Avatar,
			CreatedAt,
			Connections,
			Notifications: [],
			Following: [],
			Followers: [],
			Badges: [],
			StaffPerms: [],
		});

		doc.save()
			.then(() => {
				return {
					Username,
					UserID,
					Bio,
					Avatar,
					CreatedAt,
					Connections,
					Notifications: [],
					Following: [],
					Followers: [],
					Badges: [],
					StaffPerms: [],
				};
			})
			.catch((err) => {
				return err;
			});
	}

	static async get(data) {
		let doc = await schemas["user"].findOne(data);
		if (doc) doc.Connections = [];

		return doc;
	}

	static async find(data) {
		let doc = schemas["user"].find(data);
		if (doc) doc.Connections = [];

		return doc;
	}

	static async update(id, data) {
		schemas["user"]
			.updateOne(
				{
					UserID: id,
				},
				data
			)
			.then((i) => {
				return i;
			})
			.catch((e) => {
				return e;
			});
	}

	static async delete(data) {
		return schemas["user"].deleteOne(data);
	}

	static async follow(UserID, Target) {
		schemas["user"]
			.updateOne(
				{
					UserID: Target,
				},
				{
					$push: {
						Followers: UserID,
					},
				}
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});

		schemas["user"]
			.updateOne(
				{
					UserID: UserID,
				},
				{
					$push: {
						Following: Target,
					},
				}
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});

		return true;
	}

	static async unfollow(UserID, Target) {
		schemas["user"]
			.updateOne(
				{
					UserID: Target,
				},
				{
					$pull: {
						Followers: UserID,
					},
				}
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});

		schemas["user"]
			.updateOne(
				{
					UserID: UserID,
				},
				{
					$pull: {
						Following: Target,
					},
				}
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});

		return true;
	}
}

// Tokens
class Tokens {
	static async create(UserID, Token, Method) {
		const doc = new schemas["token"]({
			UserID,
			CreatedAt: new Date(),
			Token,
			Method,
		});

		doc.save()
			.then(() => {
				return data;
			})
			.catch((err) => {
				return err;
			});
	}

	static async get(token) {
		const tokenData = await schemas["token"].findOne({
			Token: token,
		});

		if (tokenData) {
			const user = schemas["user"].findOne({
				UserID: tokenData.UserID,
			});

			if (user) {
				user["token"] = token;
				return user;
			} else
				return {
					error: "That user does not exist!",
				};
		} else
			return {
				error: "The specified token is invalid.",
			};
	}

	static async getAllUserTokens(UserID) {
		const doc = schemas["token"].find({
			UserID,
		});

		return doc;
	}

	static async delete(data) {
		return schemas["token"].deleteOne(data);
	}
}

// Posts
class Posts {
	static async create(UserID, Caption, Image, Plugins, Type) {
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

		doc.save()
			.then(() => {
				return { success: true };
			})
			.catch((err) => {
				return err;
			});
	}

	static async get(PostID) {
		let post = await schemas["post"].findOne({
			PostID: PostID,
		});

		if (post) {
			let user = await schemas["user"].findOne({ UserID: post.UserID });
			let team = false;

			if (!user || user.error) {
				user = await schemas["team"].findOne({ UserID: post.UserID });
				if (user || !user.error) team = true;
			}

			if (user || !user.error) {
				user.Connections = [];

				let data = {
					user: user,
					post: post,
					team: team,
				};

				return data;
			} else
				return {
					error: "The specified post id is invalid.",
				};
		} else
			return {
				error: "The specified post id is invalid.",
			};
	}

	static async find(data, type) {
		let posts = [];

		const docs = await schemas["post"].find({
			data: data,
			type: type,
		});

		for (const post of docs) {
			let Comments = [];

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

	static async listAllPosts(type) {
		let posts = [];

		const docs = await schemas["post"].find({
			Type: type,
		});

		for (let post of docs) {
			let Comments = [];

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

	static async update(id, data) {
		return await schemas["post"]
			.updateOne(
				{
					PostID: id,
				},
				data
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});
	}

	static async getAllUserPosts(UserID, Type) {
		const docs = schemas["post"].find({
			UserID,
			Type,
		});

		return docs;
	}

	static async delete(PostID) {
		return schemas["post"].deleteOne({
			PostID,
		});
	}

	static async upvote(PostID, UserID) {
		return schemas["post"]
			.updateOne(
				{
					PostID,
				},
				{
					$push: {
						Upvotes: UserID,
					},
				}
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});
	}

	static async downvote(PostID, UserID) {
		return schemas["post"]
			.updateOne(
				{
					PostID,
				},
				{
					$push: {
						Downvotes: UserID,
					},
				}
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});
	}

	static async comment(PostID, UserID, Caption) {
		return schemas["post"]
			.updateOne(
				{
					PostID,
				},
				{
					$push: {
						Comments: {
							UserID: UserID,
							Caption: Caption,
							Upvotes: [],
							Downvotes: [],
						},
					},
				}
			)
			.then((i) => {
				return i;
			})
			.catch((i) => {
				return i;
			});
	}
}

// Teams
class Teams {
	static async create(Username, UserID, Bio, Avatar, CreatorID) {
		const doc = new schemas["team"]({
			Username,
			UserID,
			Bio,
			Avatar,
			CreatedAt: new Date(),
			Following: [],
			Followers: [],
			Members: [
				{
					ID: CreatorID,
					Roles: ["OWNER"],
					MemberAddedAt: new Date(),
				},
			],
		});

		doc.save()
			.then(() => {
				return {
					Username,
					UserID,
					Bio,
					Avatar,
					CreatedAt: new Date(),
					Following: [],
					Followers: [],
					Members: [
						{
							ID: CreatorID,
							Roles: ["OWNER"],
							MemberAddedAt: new Date(),
						},
					],
				};
			})
			.catch((err) => {
				return err;
			});
	}

	static async get(data) {
		let doc = await schemas["team"].findOne(data);

		return doc;
	}

	static async update(id, data) {
		schemas["team"]
			.updateOne(
				{
					UserID: id,
				},
				data
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});
	}

	static async delete(data) {
		return schemas["team"].deleteOne(data);
	}

	static async listUsersTeams(userid) {
		let data = [];
		const db = await schemas["team"].find();

		db.forEach((team) => {
			const i = team.Members.find((i) => i.ID === userid);

			if (i) data.push(team);
			else return;
		});

		return data;
	}
}

// Polls
class Polls {
	static async create(
		UserID,
		PollID,
		ExpirationDate,
		Question,
		Description,
		Options
	) {
		const doc = new schemas["poll"]({
			UserID,
			CreatedAt: new Date(),
			ExpirationDate,
			PollID,
			Question,
			Description,
			Options,
		});

		doc.save()
			.then(() => {
				return doc;
			})
			.catch((err) => {
				return err;
			});
	}

	static async get(PollID) {
		return schemas["poll"].findOne({
			PollID,
		});
	}

	static async update(PollID, data) {
		return schemas["poll"]
			.updateOne(
				{
					PollID,
				},
				data
			)
			.then((i) => {
				return i;
			})
			.catch((err) => {
				return err;
			});
	}

	static async delete(data) {
		return schemas["poll"].deleteOne(data);
	}
}

// Expose Functions
module.exports = {
	Users,
	Tokens,
	Posts,
	Teams,
	Polls,
};
