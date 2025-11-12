import { getConnection } from '../config/db.js';
import sql from 'mssql';

class Message {
  constructor(data) {
    this.id_mensaje = data.id_mensaje;
    this.id_usuario_remitente = data.id_usuario_remitente;
    this.id_usuario_receptor = data.id_usuario_receptor;
    this.mensaje = data.mensaje;
    this.fecha_envio = data.fecha_envio;
    this.leido = data.leido;
  }

  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM Mensajes ORDER BY fecha_envio DESC');
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
        .query('SELECT * FROM Mensajes WHERE id_mensaje = @id');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async create() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id_rem', sql.Int, this.id_usuario_remitente)
        .input('id_rec', sql.Int, this.id_usuario_receptor)
        .input('mensaje', sql.NVarChar(sql.MAX), this.mensaje)
        .input('fecha_envio', sql.DateTime, this.fecha_envio || null)
        .input('leido', sql.Bit, this.leido || 0)
        .query(`INSERT INTO Mensajes (
                  id_usuario_remitente, id_usuario_receptor, mensaje, fecha_envio, leido
                ) OUTPUT INSERTED.* VALUES (
                  @id_rem, @id_rec, @mensaje, @fecha_envio, @leido
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

      request.input('id', sql.Int, this.id_mensaje);

      if (this.mensaje !== undefined) {
        updates.push('mensaje = @mensaje');
        request.input('mensaje', sql.NVarChar(sql.MAX), this.mensaje);
      }
      if (this.leido !== undefined) {
        updates.push('leido = @leido');
        request.input('leido', sql.Bit, this.leido ? 1 : 0);
      }

      if (updates.length === 0) return { rowsAffected: [0] };

      const query = `UPDATE Mensajes SET ${updates.join(', ')} WHERE id_mensaje = @id`;
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
        .query('DELETE FROM Mensajes WHERE id_mensaje = @id');
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default Message;
