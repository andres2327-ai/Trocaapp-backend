import { getConnection } from '../config/db.js';
import sql from 'mssql';

class Product {
  constructor(data) {
    this.id_producto = data.id_producto;
    this.id_usuario = data.id_usuario;
    this.titulo = data.titulo;
    this.descripcion = data.descripcion;
    this.fecha_publicacion = data.fecha_publicacion;
    this.estado = data.estado;
    this.preferencia = data.preferencia;
  }

  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM Productos');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Productos WHERE id_producto = @id');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async create() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id_usuario', sql.Int, this.id_usuario)
        .input('titulo', sql.VarChar(150), this.titulo)
        .input('descripcion', sql.Text, this.descripcion)
        .input('fecha_publicacion', sql.DateTime, this.fecha_publicacion || null)
        .input('estado', sql.VarChar(50), this.estado || null)
        .input('preferencia', sql.VarChar(50), this.preferencia || null)
        .query(`INSERT INTO Productos (
                  id_usuario, titulo, descripcion, fecha_publicacion, estado, preferencia
                ) OUTPUT INSERTED.* VALUES (
                  @id_usuario, @titulo, @descripcion, @fecha_publicacion, @estado, @preferencia
                )`);

      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async update() {
    try {
      const pool = await getConnection();
      const updates = [];
      const request = pool.request();

      request.input('id', sql.Int, this.id_producto);

      if (this.id_usuario !== undefined) {
        updates.push('id_usuario = @id_usuario');
        request.input('id_usuario', sql.Int, this.id_usuario);
      }
      if (this.titulo !== undefined) {
        updates.push('titulo = @titulo');
        request.input('titulo', sql.VarChar(150), this.titulo);
      }
      if (this.descripcion !== undefined) {
        updates.push('descripcion = @descripcion');
        request.input('descripcion', sql.Text, this.descripcion);
      }
      if (this.fecha_publicacion !== undefined) {
        updates.push('fecha_publicacion = @fecha_publicacion');
        request.input('fecha_publicacion', sql.DateTime, this.fecha_publicacion);
      }
      if (this.estado !== undefined) {
        updates.push('estado = @estado');
        request.input('estado', sql.VarChar(50), this.estado);
      }
      if (this.preferencia !== undefined) {
        updates.push('preferencia = @preferencia');
        request.input('preferencia', sql.VarChar(50), this.preferencia);
      }

      if (updates.length === 0) {
        return { rowsAffected: [0] };
      }

      const query = `UPDATE Productos SET ${updates.join(', ')} WHERE id_producto = @id`;
      const result = await request.query(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Productos WHERE id_producto = @id');
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default Product;
