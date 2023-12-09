interface PostsTypings {
	userid: string;
	caption: string;
	image: string;
	plugins: {
		type: string;
		url: string;
	}[];
	type: number;
	createdat: Date;
	postid: string;
	upvotes: string[];
	downvotes: string[];
	comments: {
		user: UsersTypings | TeamsTypings;
		comment: {
			caption: string;
			image: string;
		};
	}[];
}

interface TeamsTypings {
	name: string;
	userid: string;
	usertag: string;
	bio: string;
	avatar: string;
	createdat: Date;
	supporters: string[];
	members: {
		id: string;
		roles: string[];
		memberaddedat: Date;
	}[];
	badges: string[];
}

interface TokensTypings {
	userid: string;
	createdat: Date;
	token: string;
	method: string;
}

interface UsersTypings {
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
}

export type { PostsTypings, TeamsTypings, TokensTypings, UsersTypings };
