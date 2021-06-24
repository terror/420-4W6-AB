const Model = require('./Model');
const User = require('./User');
const Post = require('./Post');
const CommentException = require('../exceptions/CommentException');

class Comment extends Model {
  constructor(
    id,
    postId,
    userId,
    content,
    createdAt = null,
    editedAt = null,
    deletedAt = null,
    user = null,
    post = null,
    replyId = null
  ) {
    super(id);
    this.postId = postId;
    this.userId = userId;
    this.content = content;
    this.createdAt = createdAt;
    this.editedAt = editedAt;
    this.deletedAt = deletedAt;
    this.user = user;
    this.post = post;
    this.replyId = replyId;
  }

  static async create(userId, postId, content, replyId = null) {
    // validate
    if (!content)
      throw new CommentException('Cannot create Comment: Missing content.');

    // check for user and category
    const user = await User.findById(userId);
    if (!user)
      throw new CommentException(
        `Cannot create Comment: User does not exist with ID ${userId}.`
      );

    const post = await Post.findById(postId);
    if (!post)
      throw new CommentException(
        `Cannot create Comment: Post does not exist with ID ${postId}.`
      );

    const connection = await Model.connect();
    const sql = `INSERT INTO comment (user_id, post_id, reply_id, content) VALUES (?, ?, ?, ?)`;
    let results;

    try {
      [results] = await connection.execute(sql, [
        userId,
        postId,
        replyId,
        content,
      ]);
    } catch (_) {
    } finally {
      await connection.end();
    }
    if (!results) return null;

    const { insertId, created_at, edited_at, deleted_at } = results;

    if (replyId) {
      const ret = new Comment(
        insertId - 1,
        userId,
        postId,
        content,
        created_at,
        edited_at,
        deleted_at,
        user,
        post,
        replyId
      );
      return new Comment(
        insertId,
        userId,
        postId,
        content,
        created_at,
        edited_at,
        deleted_at,
        user,
        post,
        ret
      );
    }
    return new Comment(
      insertId,
      userId,
      postId,
      content,
      created_at,
      edited_at,
      deleted_at,
      user,
      post,
      replyId
    );
  }

  static async findById(id) {
    if (!id) return null;
    const connection = await Model.connect();
    const sql = `SELECT * FROM comment where id = ?`;
    let results;

    try {
      [results] = await connection.execute(sql, [id]);
    } catch (_) {
    } finally {
      await connection.end();
    }

    if (!results.length) return null;

    const {
      post_id,
      user_id,
      reply_id,
      content,
      created_at,
      edited_at,
      deleted_at,
    } = results[0];

    // check for user and category
    const user = await User.findById(user_id);
    if (!user) return null;

    const post = await Post.findById(post_id);
    if (!post) return null;

    return new Comment(
      id,
      post_id,
      user_id,
      content,
      created_at,
      edited_at,
      deleted_at,
      user,
      post,
      reply_id
    );
  }

  static async findByPost(post_id) {
    if (!post_id) return null;
    const connection = await Model.connect();
    const sql = `SELECT * FROM comment where post_id = ?`;
    let results;

    try {
      [results] = await connection.execute(sql, [post_id]);
    } catch (_) {
    } finally {
      await connection.end();
    }

    if (!results.length) return null;

    let ret = [];
    for (let i = 0; i < results.length; ++i) {
      const {
        id,
        user_id,
        reply_id,
        content,
        created_at,
        edited_at,
        deleted_at,
      } = results[i];

      // check for user and category
      const user = await User.findById(user_id);
      if (!user) return null;

      const post = await Post.findById(post_id);
      if (!post) return null;

      ret.push(
        new Comment(
          id,
          post_id,
          user_id,
          content,
          created_at,
          edited_at,
          deleted_at,
          user,
          post,
          reply_id
        )
      );
    }
    return ret;
  }

  static async getReplies(reply_id) {
    if (!reply_id) return null;
    const connection = await Model.connect();
    const sql = `SELECT * FROM comment where reply_id = ?`;
    let results;

    try {
      [results] = await connection.execute(sql, [reply_id]);
    } catch (_) {
    } finally {
      await connection.end();
    }

    if (!results.length) return null;

    let ret = [];
    for (let i = 0; i < results.length; ++i) {
      const {
        id,
        post_id,
        user_id,
        content,
        created_at,
        edited_at,
        deleted_at,
      } = results[i];

      // check for user and category
      const user = await User.findById(user_id);
      if (!user) return null;

      const post = await Post.findById(post_id);
      if (!post) return null;

      ret.push(
        new Comment(
          id,
          post_id,
          user_id,
          content,
          created_at,
          edited_at,
          deleted_at,
          user,
          post,
          reply_id
        )
      );
    }
    return ret;
  }

  async save() {
    // validate
    if (!this.content)
      throw new CommentException('Cannot update Comment: Missing content.');

    const connection = await Model.connect();
    const sql = 'UPDATE comment SET content=?, edited_at=NOW() where id=?';
    try {
      await connection.execute(sql, [this.content, this.id]);
    } catch (_) {
    } finally {
      await connection.end();
    }
    return true;
  }

  async remove() {
    const connection = await Model.connect();
    const sql = 'UPDATE comment SET deleted_at=NOW() where id=?';
    try {
      await connection.execute(sql, [this.id]);
    } catch (_) {
      return false;
    } finally {
      await connection.end();
    }
    return true;
  }

  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
  }

  getUser() {
    return this.user;
  }

  getPost() {
    return this.post;
  }

  getRepliedTo() {
    return this.replyId;
  }
}

module.exports = Comment;
