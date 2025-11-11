import { getConnection } from '../config/db.js';
import sql from 'mssql';
import Product from '../models/product.model.js';

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const product = await Product.getById(id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

// Crear producto
export const createProduct = async (req, res) => {
  const { id_usuario, titulo, descripcion, fecha_publicacion, estado, preferencia } = req.body;

  if (!id_usuario || !titulo) {
    return res.status(400).json({ message: 'id_usuario y titulo son requeridos' });
  }

  try {
    const pool = await getConnection();

    // Verificar que el usuario exista
    const userCheck = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query('SELECT TOP 1 1 FROM Usuarios WHERE id_usuario = @id_usuario');

    if (userCheck.recordset.length === 0) {
      return res.status(400).json({ message: 'El usuario especificado no existe' });
    }

    const product = new Product({ id_usuario, titulo, descripcion, fecha_publicacion, estado, preferencia });
    const created = await product.create();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  const { id_usuario, titulo, descripcion, fecha_publicacion, estado, preferencia } = req.body;

  try {
    // Verificar existencia
    const existing = await Product.getById(id);
    if (!existing) return res.status(404).json({ message: 'Producto no encontrado' });

    // Si se cambia id_usuario, comprobar que exista
    if (id_usuario) {
      const pool = await getConnection();
      const userCheck = await pool.request()
        .input('id_usuario', sql.Int, id_usuario)
        .query('SELECT TOP 1 1 FROM Usuarios WHERE id_usuario = @id_usuario');
      if (userCheck.recordset.length === 0) {
        return res.status(400).json({ message: 'El usuario especificado no existe' });
      }
    }

    const product = new Product({ id_producto: id, id_usuario, titulo, descripcion, fecha_publicacion, estado, preferencia });
    const result = await product.update();

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      const updated = await Product.getById(id);
      return res.json({ message: 'Producto actualizado exitosamente', producto: updated });
    }

    res.status(400).json({ message: 'No se actualizaron campos' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const existing = await Product.getById(id);
    if (!existing) return res.status(404).json({ message: 'Producto no encontrado' });

    // Si necesitas validar relaciones adicionales, agrégalas aquí
    const result = await Product.delete(id);
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.json({ message: 'Producto eliminado exitosamente' });
    }

    res.status(400).json({ message: 'No se pudo eliminar el producto' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};
