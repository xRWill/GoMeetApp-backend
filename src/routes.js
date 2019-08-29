import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

const routes = Router();
const upload = multer(multerConfig);

routes.post('/session', SessionController.store);

routes.get('/', (req, res) => res.json({ OK: true }));

routes.post('/users', UserController.store);

// Use middleware to authenticated routes
routes.use(authMiddleware);
// Update User (logged)
routes.get('/users', UserController.index);
routes.put('/users', UserController.update);

// Files
routes.get('/files', FileController.index);
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
