const faker = require('faker');
const http = require('http');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');
const Database = require('../src/database/Database');

class TestHelper {
	static generateUserData(username = null, email = null, password = null) {
		return {
			username: username ?? faker.internet.userName(),
			email: email ?? faker.internet.email(),
			password: password ?? faker.internet.password(),
		};
	}

	static async generateUser(username = null, email = null, password = null) {
		const userData = TestHelper.generateUserData(username, email, password);
		const user = await User.create(
			userData.username,
			userData.email,
			userData.password,
		);

		return user;
	}

	static async generateCategoryData(user = null, title = null, description = null) {
		const categoryUser = user ?? await TestHelper.generateUser();
		const categoryTitle = title ?? faker.lorem.words(5);
		const categoryDescription = description ?? faker.lorem.sentence();

		return {
			userId: categoryUser.getId(),
			title: categoryTitle,
			description: categoryDescription,
		};
	}

	static async generateCategory(user = null, title = null, description = null) {
		const categoryData = await TestHelper.generateCategoryData(user, title, description);
		const category = await Category.create(
			categoryData.userId,
			categoryData.title,
			categoryData.description,
		);

		return category;
	}

	static async generatePostData(type = null, user = null, category = null, title = null, content = null) {
		const postType = type ?? (Math.random() < 0.5 ? 'Text' : 'URL');
		const postUser = user ?? await TestHelper.generateUser();
		const postCategory = category ?? await TestHelper.generateCategory();
		const postTitle = title ?? faker.lorem.words(Math.floor(Math.random() * 5) + 1);
		const postContent = content ?? (postType === 'Text' ? faker.lorem.sentences() : faker.internet.url());

		return {
			type: postType,
			userId: postUser.getId(),
			categoryId: postCategory.getId(),
			title: postTitle,
			content: postContent,
		};
	}

	static async generatePost({
		type = null, user = null, category = null, title = null, content = null,
	} = {}) {
		const postData = await TestHelper.generatePostData(type, user, category, title, content);
		const post = await Post.create(
			postData.userId,
			postData.categoryId,
			postData.title,
			postData.type,
			postData.content,
		);

		return post;
	}

	static async generateCommentData(user = null, post = null, content = null, reply = null) {
		const commentUser = user ?? await TestHelper.generateUser();
		const commentPost = post ?? await TestHelper.generatePost();
		const commentContent = content ?? faker.lorem.paragraph();

		return {
			userId: commentUser.getId(),
			postId: commentPost.getId(),
			replyId: reply?.getId(),
			content: commentContent,
		};
	}

	static async generateComment({
		user = null, post = null, content = null, reply = null,
	} = {}) {
		const commentData = await TestHelper.generateCommentData(user, post, content, reply);
		const comment = await Comment.create(
			commentData.userId,
			commentData.postId,
			commentData.content,
			commentData.replyId,
		);

		return comment;
	}

	static async makeHttpRequest(method, path, data = {}) {
		const options = {
			host: 'localhost',
			port: 8000,
			path,
			method,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(JSON.stringify(data)),
			},
		};

		return new Promise((resolve, reject) => {
			let body = '';
			const request = http.request(options, (response) => {
				response.on('data', (chunk) => {
					body += chunk;
				});
				response.on('end', () => resolve([response.statusCode, JSON.parse(body)]));
			});

			request.on('error', (err) => reject(err));
			request.write(JSON.stringify(data));
			request.end();
		});
	}

	static async truncateDatabase(tables = [], autoIncrementStart = 1) {
		if (tables.length === 0) {
			await Database.truncate([
				'comment',
				'post',
				'category',
				'user',
				'post_vote',
				'comment_vote',
				'bookmarked_post',
				'bookmarked_comment',
			]);

			return;
		}

		await Database.truncate(tables, autoIncrementStart);
	}
}

module.exports = TestHelper;
