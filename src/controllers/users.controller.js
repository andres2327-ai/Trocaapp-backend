import { getConnection } from '../config/db.js';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT id_usuario, id_rol, nombre, correo, 
                   fecha_nacimiento, fecha_registro 
                   FROM Usuarios`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los usuarios",
            error: error.message
        });
    }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT id_usuario, id_rol, nombre, correo, 
                   fecha_nacimiento, fecha_registro 
                   FROM Usuarios WHERE id_usuario = @id`);
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener el usuario",
            error: error.message
        });
    }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
    const { id_rol, nombre, correo, contrasena, fecha_nacimiento } = req.body;

    // Validaciones
    if (!id_rol || !nombre || !correo || !contrasena) {
        return res.status(400).json({ 
            message: "id_rol, nombre, correo y contraseña son campos requeridos" 
        });
    }

    try {
        // Verificar si el correo ya existe
        const pool = await getConnection();
        const emailCheck = await pool.request()
            .input('correo', sql.VarChar(100), correo)
            .query('SELECT TOP 1 1 FROM Usuarios WHERE correo = @correo');

        if (emailCheck.recordset.length > 0) {
            return res.status(400).json({ 
                message: "El correo electrónico ya está registrado" 
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Insertar nuevo usuario
        const result = await pool.request()
            .input('id_rol', sql.Int, id_rol)
            .input('nombre', sql.VarChar(100), nombre)
            .input('correo', sql.VarChar(100), correo)
            .input('contrasena', sql.VarChar(255), hashedPassword)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
            .input('fecha_registro', sql.DateTime, new Date())
            .query(`
                INSERT INTO Usuarios (
                    id_rol, nombre, correo, contrasena, 
                    fecha_nacimiento, fecha_registro
                ) 
                OUTPUT 
                    INSERTED.id_usuario, 
                    INSERTED.id_rol,
                    INSERTED.nombre,
                    INSERTED.correo,
                    INSERTED.fecha_nacimiento,
                    INSERTED.fecha_registro
                VALUES (
                    @id_rol, @nombre, @correo, @contrasena,
                    @fecha_nacimiento, @fecha_registro
                )`);
        
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({
            message: "Error al crear el usuario",
            error: error.message
        });
    }
};

// Actualizar un usuario
export const updateUser = async (req, res) => {
    const { id_rol, nombre, correo, contrasena, fecha_nacimiento } = req.body;
    const { id } = req.params;

    try {
        const pool = await getConnection();
        
        // Verificar si el usuario existe
        const userExists = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT TOP 1 1 FROM Usuarios WHERE id_usuario = @id');

        if (userExists.recordset.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Si se está actualizando el correo, verificar que no exista para otro usuario
        if (correo) {
            const emailCheck = await pool.request()
                .input('correo', sql.VarChar(100), correo)
                .input('id', sql.Int, id)
                .query('SELECT TOP 1 1 FROM Usuarios WHERE correo = @correo AND id_usuario != @id');

            if (emailCheck.recordset.length > 0) {
                return res.status(400).json({ 
                    message: "El correo electrónico ya está registrado para otro usuario" 
                });
            }
        }

        // Construir query dinámica
        let updateQuery = 'UPDATE Usuarios SET ';
        const updates = [];
        const request = pool.request();

        if (id_rol) {
            updates.push('id_rol = @id_rol');
            request.input('id_rol', sql.Int, id_rol);
        }
        if (nombre) {
            updates.push('nombre = @nombre');
            request.input('nombre', sql.VarChar(100), nombre);
        }
        if (correo) {
            updates.push('correo = @correo');
            request.input('correo', sql.VarChar(100), correo);
        }
        if (contrasena) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(contrasena, salt);
            updates.push('contrasena = @contrasena');
            request.input('contrasena', sql.VarChar(255), hashedPassword);
        }
        if (fecha_nacimiento) {
            updates.push('fecha_nacimiento = @fecha_nacimiento');
            request.input('fecha_nacimiento', sql.Date, fecha_nacimiento);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                message: "No se proporcionaron campos para actualizar" 
            });
        }

        updateQuery += updates.join(', ') + ' WHERE id_usuario = @id';
        request.input('id', sql.Int, id);

        await request.query(updateQuery);
        
        // Obtener usuario actualizado
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT id_usuario, id_rol, nombre, correo, 
                   fecha_nacimiento, fecha_registro 
                   FROM Usuarios WHERE id_usuario = @id`);

        res.json({
            message: "Usuario actualizado exitosamente",
            usuario: result.recordset[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar el usuario",
            error: error.message
        });
    }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
    try {
        const pool = await getConnection();

        // Verificar si el usuario tiene productos asociados
        const productCheck = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT TOP 1 1 FROM Productos WHERE id_usuario = @id');

        if (productCheck.recordset.length > 0) {
            return res.status(400).json({ 
                message: "No se puede eliminar el usuario porque tiene productos asociados" 
            });
        }

        // Eliminar el usuario
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("DELETE FROM Usuarios WHERE id_usuario = @id");
        
        if (result.rowsAffected[0] > 0) {
            res.json({ message: "Usuario eliminado exitosamente" });
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar el usuario",
            error: error.message
        });
    }
};
