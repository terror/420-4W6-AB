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
        } catch (err) {
            console.log(err);
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
        } catch (err) {
            console.log(err);
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

        return new Post(
            id,
            user_id,
            category_id,
            title,
            type,
            content,
            created_at,
            edited_at,
            deleted_at
        );
    }

    async save() {
        // validate
        if (!this.content) return false;

        const connection = await Model.connect();
        const sql = 'UPDATE post SET content=?, edited_at=? where id=?';
        const d = new Date();
        try {
            await connection.execute(sql, [
                this.content,
                d.toISOString().split('T')[0] +
                    ' ' +
                    d.toTimeString().split(' ')[0],
                this.id,
            ]);
        } catch (err) {
            console.log(err);
            return false;
        } finally {
            await connection.end();
        }
        return true;
    }

    async delete() {
        const connection = await Model.connect();
        const sql = 'UPDATE post SET deleted_at=? where id=?';
        const d = new Date();
        try {
            await connection.execute(sql, [
                d.toISOString().split('T')[0] +
                    ' ' +
                    d.toTimeString().split(' ')[0],
                ,
                this.id,
            ]);
        } catch (err) {
            console.log(err);
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
