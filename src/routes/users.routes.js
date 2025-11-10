import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';

const router = Router();

// Obtener todos los usuarios
router.get('/', getUsers);

// Obtener un usuario específico
router.get('/:id', getUserById);

// Crear un nuevo usuario
router.post('/', createUser);

// Actualizar un usuario
router.put('/:id', updateUser);

// Eliminar un usuario
router.delete('/:id', deleteUser);

export default router;
