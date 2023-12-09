interface PostsTypings {
	userid: string;
	caption: string;
	image: string;
	plugins: any[];
	type: number;
	createdat: Date;
	postid: string;
	upvotes: string[];
	downvotes: string[];
	comments: any[];
}

interface TeamsTypings {
	name: string;
	userid: string;
	usertag: string;
	bio: string;
	avatar: string;
	createdat: Date;
	supporters: string[];
	members: any[];
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

export { PostsTypings, TeamsTypings, TokensTypings, UsersTypings };
