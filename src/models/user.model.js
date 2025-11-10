const sql = require('mssql');
const dbConfig = require('../config/db');

class User {
    constructor(user) {
        this.id_usuario = user.id_usuario;
        this.nombre = user.nombre;
        this.email = user.email;
        // Otros campos según tu esquema de usuarios
    }

    static async getAll() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .query('SELECT * FROM Usuarios');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Usuarios WHERE id_usuario = @id');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    async create() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('nombre', sql.VarChar, this.nombre)
                .input('email', sql.VarChar, this.email)
                .query('INSERT INTO Usuarios (nombre, email) OUTPUT INSERTED.id_usuario VALUES (@nombre, @email)');
            this.id_usuario = result.recordset[0].id_usuario;
            return this;
        } catch (error) {
            throw error;
        }
    }

    async update() {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('id', sql.Int, this.id_usuario)
                .input('nombre', sql.VarChar, this.nombre)
                .input('email', sql.VarChar, this.email)
                .query('UPDATE Usuarios SET nombre = @nombre, email = @email WHERE id_usuario = @id');
            return this;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Usuarios WHERE id_usuario = @id');
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
