const Category = require('./Category');
const Model = require('./Model');
const User = require('./User');

class Post extends Model {
    constructor(
        id,
        userId,
        categoryId,
        title,
        type,
        content,
        createdAt = null,
        editedAt = null,
        deletedAt = null,
        user = null,
        category = null
    ) {
        super(id);
        this.userId = userId;
        this.categoryId = categoryId;
        this.title = title;
        this.type = type;
        this.content = content;
        this.createdAt = createdAt;
        this.editedAt = editedAt;
        this.deletedAt = deletedAt;
        this.user = user;
        this.category = category;
    }

    static async create(userId, categoryId, title, type, content) {
        // validate
        if (!userId || !categoryId || !title || !type || !content) return null;

        // check for user and category
        const user = await User.findById(userId);
        if (!user) return null;

        const category = await Category.findById(categoryId);
        if (!category) return null;

        const connection = await Model.connect();
        const sql = `INSERT INTO post (user_id, category_id, title, type, content) VALUES (?, ?, ?, ?, ?)`;
        let results;

        try {
            [results] = await connection.execute(sql, [
                userId,
                categoryId,
                title,
                type,
                content,
            ]);
        } catch (_) {
        } finally {
            await connection.end();
        }
        if (!results) return null;

        const { insertId, created_at, edited_at, deleted_at } = results;

        return new Post(
            insertId,
            userId,
            categoryId,
            title,
            type,
            content,
            created_at,
            edited_at,
            deleted_at,
            user,
            category
        );
    }

    static async findById(id) {
        if (!id) return null;
        const connection = await Model.connect();
        const sql = `SELECT * FROM post where id = ?`;
        let results;

        try {
            [results] = await connection.execute(sql, [id]);
        } catch (_) {
        } finally {
            await connection.end();
        }

        if (!results.length) return null;

        const {
            user_id,
            category_id,
            title,
            type,
            content,
            created_at,
            edited_at,
            deleted_at,
        } = results[0];

        // check for user and category
        const user = await User.findById(user_id);
        if (!user) return null;

        const category = await Category.findById(category_id);
        if (!category) return null;

        return new Post(
            id,
            user_id,
            category_id,
            title,
            type,
            content,
            created_at,
            edited_at,
            deleted_at,
            user,
            category
        );
    }

    async save() {
        // validate
        if (!this.content || this.type === 'URL' || !this.type) return false;

        const connection = await Model.connect();
        const sql = 'UPDATE post SET content=?, edited_at=NOW() where id=?';
        try {
            await connection.execute(sql, [this.content, this.id]);
        } catch (_) {
            return false;
        } finally {
            await connection.end();
        }
        return true;
    }

    async remove() {
        const connection = await Model.connect();
        const sql = 'UPDATE post SET deleted_at=NOW() where id=?';
        try {
            await connection.execute(sql, [this.id]);
        } catch (_) {
            return false;
        } finally {
            await connection.end();
        }
        return true;
    }

    getTitle() {
        return this.title;
    }

    setTitle(title) {
        this.title = title;
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

    getCategory() {
        return this.category;
    }
}

module.exports = Post;
