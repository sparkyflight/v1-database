interface OnlyfoodzPost {
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
		user: User;
		comment: {
			caption: string;
			image: string;
		};
	}[];
}

interface Token {
	userid: string;
	createdat: Date;
	token: string;
	method: string;
}

interface User {
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

export type { OnlyfoodzPost, Token, User };
