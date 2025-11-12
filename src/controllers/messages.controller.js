import { getConnection } from '../config/db.js';
import sql from 'mssql';
import Message from '../models/message.model.js';

// Obtener todos los mensajes
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.getAll();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
  }
};

// Obtener mensaje por id
export const getMessageById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const message = await Message.getById(id);
    if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el mensaje', error: error.message });
  }
};

// Crear mensaje
export const createMessage = async (req, res) => {
  const { id_usuario_remitente, id_usuario_receptor, mensaje } = req.body;

  if (!id_usuario_remitente || !id_usuario_receptor || !mensaje) {
    return res.status(400).json({ message: 'id_usuario_remitente, id_usuario_receptor y mensaje son requeridos' });
  }

  try {
    const pool = await getConnection();

    // Verificar que ambos usuarios existan
    const usersCheck = await pool.request()
      .input('rem', sql.Int, id_usuario_remitente)
      .input('rec', sql.Int, id_usuario_receptor)
      .query('SELECT id_usuario FROM Usuarios WHERE id_usuario IN (@rem, @rec)');

    if (usersCheck.recordset.length < 2 && id_usuario_remitente !== id_usuario_receptor) {
      return res.status(400).json({ message: 'Alguno de los usuarios especificados no existe' });
    }

    const msg = new Message({ id_usuario_remitente, id_usuario_receptor, mensaje });
    const created = await msg.create();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el mensaje', error: error.message });
  }
};

// Actualizar mensaje (p. ej. marcar como leído o editar texto)
export const updateMessage = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  const { mensaje, leido } = req.body;

  try {
    const existing = await Message.getById(id);
    if (!existing) return res.status(404).json({ message: 'Mensaje no encontrado' });

    const msg = new Message({ id_mensaje: id, mensaje, leido });
    const result = await msg.update();

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      const updated = await Message.getById(id);
      return res.json({ message: 'Mensaje actualizado', mensaje: updated });
    }

    res.status(400).json({ message: 'No se actualizaron campos' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el mensaje', error: error.message });
  }
};

// Eliminar mensaje
export const deleteMessage = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const existing = await Message.getById(id);
    if (!existing) return res.status(404).json({ message: 'Mensaje no encontrado' });

    const result = await Message.delete(id);
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.json({ message: 'Mensaje eliminado exitosamente' });
    }

    res.status(400).json({ message: 'No se pudo eliminar el mensaje' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el mensaje', error: error.message });
  }
};
