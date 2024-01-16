// Packages
import { Sequelize, Model, Table } from "sequelize-typescript";
import { info, error } from "./logger.js";
import fs from "node:fs";
import "dotenv/config";
import { Post, OnlyfoodzPost, Application, User } from "./types.interface.js";
import crypto from "crypto";

// Connect to PostgreSQL
const sequelize = new Sequelize({
	dialect: "postgres",
	host: "100.124.138.24",
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
	.readdirSync("./dist/v1-database/schemas")
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
class Users extends Model implements User {
	id: number;
	name: string;
	userid: string;
	usertag: string;
	bio: string;
	avatar: string;
	createdat: Date;
	followers: string[];
	following: string[];
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
				name: name,
				userid: userid,
				usertag: usertag,
				bio: bio,
				avatar: avatar,
				createdat: new Date(),
				followers: [],
				following: [],
				badges: [],
				coins: 200,
			});

			return true;
		} catch (error) {
			return error;
		}
	}

	static async get(data: any): Promise<User | null> {
		const doc = await Users.findOne({
			where: data,
		});

		if (!doc) return null;
		else return doc;
	}

	static async find(data: any): Promise<User[]> {
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

			let following = user.following;
			following.push(Target);

			let followers = target.followers;
			followers.push(UserID);

			await Users.update(
				{
					followers: followers,
				},
				{
					where: {
						userid: Target,
					},
				}
			);

			await Users.update(
				{
					following: following,
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

			let following = user.following;
			following = following.filter((p) => p !== Target);

			let followers = target.followers;
			followers = followers.filter((p) => p !== UserID);

			await Users.update(
				{
					followers: followers,
				},
				{
					where: {
						userid: Target,
					},
				}
			);

			await Users.update(
				{
					following: following,
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

// Posts (Sparkyflight)
@Table({
	tableName: "posts",
})
class Posts extends Model implements Post {
	userid: string;
	caption: string;
	image: string;
	plugins: { type: string; url: string }[];
	createdat: Date;
	postid: string;
	upvotes: string[];
	downvotes: string[];
	comments: {
		user: User;
		comment: { caption: string; image: string };
	}[];

	static async createPost(
		userid: string,
		caption: string,
		image: string,
		plugins: Post["plugins"]
	): Promise<boolean | Error> {
		try {
			await Posts.create({
				userid: userid,
				caption: caption,
				image: image,
				plugins: plugins,
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

		let Comments: Post["comments"] = [];

		if (post) {
			let user = await Users.get({ userid: post.userid });

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
				};

				return data;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	static async find(data: object): Promise<object[]> {
		let posts: object[] = [];

		const docs = await Posts.findAll({
			where: {
				...data,
			},
		});

		for (const post of docs) {
			let Comments: Post["comments"] = [];

			let user = await Users.get({ userid: post.userid });

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user) continue;
			else {
				post.comments = Comments;

				posts.push({
					post: post,
					user: user,
				});
			}
		}

		return posts;
	}

	static async listAllPosts(): Promise<object[]> {
		let posts: object[] = [];

		const docs = await Posts.findAll();

		for (let post of docs) {
			let Comments: Post["comments"] = [];

			let user = await Users.get({ userid: post.userid });

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user) continue;
			else {
				post.comments = Comments;

				posts.push({
					post: post,
					user: user,
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

	static async getAllUserPosts(UserID: string): Promise<Post[]> {
		let posts: Post[] = [];

		const docs = await Posts.findAll({
			where: { userid: UserID },
		});

		for (let post of docs) {
			let Comments: Post["comments"] = [];

			let user = await Users.get({ userid: post.userid });

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user) continue;
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
			let post = await Posts.get(PostID);
			post.post.upvotes.push(UserID);

			const result = await Posts.updatePost(PostID, {
				upvotes: post.post.upvotes,
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
			let post = await Posts.get(PostID);
			post.post.downvotes.push(UserID);

			const result = await Posts.updatePost(PostID, {
				downvotes: post.post.downvotes,
			});
			return result;
		} catch (err) {
			return err;
		}
	}

	static async comment(
		PostID: string,
		User: User,
		Caption: string,
		Image: string
	): Promise<boolean | Error> {
		try {
			let post = await Posts.get(PostID);

			if (post) {
				post.post.comments.push({
					user: User,
					comment: {
						caption: Caption,
						image: Image,
					},
				});

				const result = await Posts.updatePost(PostID, {
					comments: post.post.comments,
				});
				return result;
			} else return false;
		} catch (err) {
			return err;
		}
	}
}

// Posts (Onlyfoodz)
@Table({
	tableName: "onlyfoodz_posts",
})
class OnlyfoodzPosts extends Model implements OnlyfoodzPost {
	userid: string;
	caption: string;
	image: string;
	plugins: { type: string; url: string }[];
	createdat: Date;
	postid: string;
	upvotes: string[];
	downvotes: string[];
	comments: {
		user: User;
		comment: { caption: string; image: string };
	}[];

	static async createPost(
		userid: string,
		caption: string,
		image: string,
		plugins: OnlyfoodzPost["plugins"]
	): Promise<boolean | Error> {
		try {
			await OnlyfoodzPosts.create({
				userid: userid,
				caption: caption,
				image: image,
				plugins: plugins,
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
		let post = await OnlyfoodzPosts.findOne({
			where: {
				postid: PostID,
			},
		});

		let Comments: OnlyfoodzPost["comments"] = [];

		if (post) {
			let user = await Users.get({ userid: post.userid });

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
				};

				return data;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	static async find(data: object, type: string): Promise<object[]> {
		let posts: object[] = [];

		const docs = await OnlyfoodzPosts.findAll({
			where: {
				...data,
				type: type,
			},
		});

		for (const post of docs) {
			let Comments: OnlyfoodzPost["comments"] = [];

			let user = await Users.get({ userid: post.userid });

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user) continue;
			else {
				post.comments = Comments;

				posts.push({
					post: post,
					user: user,
				});
			}
		}

		return posts;
	}

	static async listAllPosts(): Promise<object[]> {
		let posts: object[] = [];

		const docs = await OnlyfoodzPosts.findAll();

		for (let post of docs) {
			let Comments: OnlyfoodzPost["comments"] = [];

			let user = await Users.get({ userid: post.userid });

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user) continue;
			else {
				post.comments = Comments;

				posts.push({
					post: post,
					user: user,
				});
			}
		}

		return posts;
	}

	static async updatePost(id: string, data: any): Promise<boolean | Error> {
		try {
			await OnlyfoodzPosts.update(data, {
				where: {
					postid: id,
				},
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async getAllUserPosts(UserID: string): Promise<OnlyfoodzPost[]> {
		let posts: OnlyfoodzPost[] = [];

		const docs = await OnlyfoodzPosts.findAll({
			where: { userid: UserID },
		});

		for (let post of docs) {
			let Comments: OnlyfoodzPost["comments"] = [];

			let user = await Users.get({ userid: post.userid });

			for (const comment of post.comments) {
				let user = await Users.get({
					userid: comment.user.userid,
				});

				if (user) Comments.push(comment);
				else continue;
			}

			if (!user) continue;
			else {
				post.comments = Comments;

				posts.push(post);
			}
		}

		return posts;
	}

	static async delete(PostID: string): Promise<boolean | Error> {
		try {
			await OnlyfoodzPosts.destroy({
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
			let post = await OnlyfoodzPosts.get(PostID);
			post.post.upvotes.push(UserID);

			const result = await OnlyfoodzPosts.updatePost(PostID, {
				upvotes: post.post.upvotes,
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
			let post = await OnlyfoodzPosts.get(PostID);
			post.post.downvotes.push(UserID);

			const result = await OnlyfoodzPosts.updatePost(PostID, {
				downvotes: post.post.downvotes,
			});
			return result;
		} catch (err) {
			return err;
		}
	}

	static async comment(
		PostID: string,
		User: User,
		Caption: string,
		Image: string
	): Promise<boolean | Error> {
		try {
			let post = await OnlyfoodzPosts.get(PostID);

			if (post) {
				post.post.comments.push({
					user: User,
					comment: {
						caption: Caption,
						image: Image,
					},
				});

				const result = await OnlyfoodzPosts.updatePost(PostID, {
					comments: post.post.comments,
				});
				return result;
			} else return false;
		} catch (err) {
			return err;
		}
	}
}

// Developer Applications
@Table({
	tableName: "applications",
})
class Applications extends Model implements Application {
	id: number;
	creatorid: string;
	name: string;
	logo: string;
	token: string;
	active: boolean;
	permissions: string[];
	createdat: Date;

	static async createApp(
		creator_id: string,
		name: string,
		logo: string
	): Promise<string | Error> {
		try {
			const token: string = crypto
				.createHash("sha256")
				.update(
					`${crypto.randomUUID()}_${crypto.randomUUID()}`.replace(
						/-/g,
						""
					)
				)
				.digest("hex");

			await Applications.create({
				creatorid: creator_id,
				name: name,
				logo: logo,
				token: token,
				active: true,
				permissions: ["global.*"],
				createdat: new Date(),
			});

			return token;
		} catch (err) {
			return err;
		}
	}

	static async updateApp(token: string, data: any): Promise<boolean | Error> {
		try {
			await Applications.update(data, {
				where: {
					token: token,
				},
			});

			return true;
		} catch (err) {
			return err;
		}
	}

	static async get(token: string): Promise<Application | null> {
		const tokenData = await Applications.findOne({
			where: {
				token: token,
			},
		});

		if (tokenData) return tokenData;
		else return null;
	}

	static async getAllApplications(
		creatorid: string
	): Promise<Application[] | Error> {
		try {
			const doc = await Applications.findAll({
				where: {
					creatorid: creatorid,
				},
			});

			return doc;
		} catch (error) {
			return error;
		}
	}

	static async delete(data: any): Promise<boolean | Error> {
		try {
			await Applications.destroy({
				where: data,
			});

			return true;
		} catch (err) {
			return err;
		}
	}
}

const init = () => {
	sequelize.addModels([Users, Posts, OnlyfoodzPosts, Applications]);

	Users.init(schemaData["users"].schema, {
		sequelize: sequelize,
		modelName: schemaData["users"].name,
	});

	Posts.init(schemaData["posts"].schema, {
		sequelize: sequelize,
		modelName: schemaData["posts"].name,
	});

	OnlyfoodzPosts.init(schemaData["onlyfoodz_posts"].schema, {
		sequelize: sequelize,
		modelName: schemaData["onlyfoodz_posts"].name,
	});

	Applications.init(schemaData["applications"].schema, {
		sequelize: sequelize,
		modelName: schemaData["applications"].name,
	});

	sequelize.sync({
		alter: {
			drop: false,
		},
	});
};
setTimeout(() => init(), 3000);

// Export the classes
export { Users, Posts, OnlyfoodzPosts, Applications };
