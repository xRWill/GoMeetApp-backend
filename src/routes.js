import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import OrganizingController from './app/controllers/OrganizingController';
import SubscriptionController from './app/controllers/SubscriptionController';

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

// Meetups
routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);
routes.post('/meetups/:id/subscribe', SubscriptionController.store);

routes.get('/organizing', OrganizingController.index);

// Subscriptions
routes.get('/subscriptions', SubscriptionController.index);
// routes.put('/subscriptions/:id', SubscriptionController.update);
// routes.delete('/subscriptions/:id', SubscriptionController.delete);

export default routes;
