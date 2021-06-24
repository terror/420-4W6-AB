const Model = require('./Model');
const User = require('./User');

class Category extends Model {
    constructor(
        id,
        createdBy,
        title,
        description,
        createdAt = null,
        editedAt = null,
        deletedAt = null,
        user = null
    ) {
        super(id);
        this.createdBy = createdBy;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.editedAt = editedAt;
        this.deletedAt = deletedAt;
        this.user = user;
    }

    static async create(id, title, description) {
        // validate
        if (!id || !title || !description) return null;

        // check for existing user
        const user = await User.findById(id);
        if (!user) return null;

        const connection = await Model.connect();
        const sql = `INSERT INTO category (title, description) VALUES (?, ?)`;
        let results;

        try {
            [results] = await connection.execute(sql, [title, description]);
        } catch (err) {
            console.log(err);
        } finally {
            await connection.end();
        }
        if (!results) return null;

        const { insertId, created_at, edited_at, deleted_at } = results;

        return new Category(
            insertId,
            id,
            title,
            description,
            created_at,
            edited_at,
            deleted_at,
            user
        );
    }

    static async findById(id) {
        const connection = await Model.connect();
        const sql = `SELECT * FROM category where id = ?`;
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
            created_by,
            title,
            description,
            created_at,
            edited_at,
            deleted_at,
        } = results[0];

        return new Category(
            id,
            created_by,
            title,
            description,
            created_at,
            edited_at,
            deleted_at
        );
    }

    static async findByTitle(title) {
        const connection = await Model.connect();
        const sql = `SELECT * FROM category where title = ?`;
        let results;

        try {
            [results] = await connection.execute(sql, [title]);
        } catch (err) {
            console.log(err);
        } finally {
            await connection.end();
        }

        if (!results.length) return null;

        const {
            id,
            created_by,
            description,
            created_at,
            edited_at,
            deleted_at,
        } = results[0];

        return new Category(
            id,
            created_by,
            title,
            description,
            created_at,
            edited_at,
            deleted_at
        );
    }

    async save() {
        // validate
        if (!this.title) return false;

        const connection = await Model.connect();
        const sql = 'UPDATE category SET title=?, edited_at=? where id=?';
        const d = new Date();
        try {
            await connection.execute(sql, [
                this.title,
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
        const sql = 'UPDATE category SET deleted_at=? where id=?';
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

    setTitle(t) {
        this.title = t;
    }

    getDescription() {
        return this.description;
    }

    getUser() {
        return this.user;
    }
}

module.exports = Category;
