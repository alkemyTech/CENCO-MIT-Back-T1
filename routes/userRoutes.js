import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authenticate.js';


export const userRouter = Router();
userRouter.get('/myinfo', authenticateToken, userController.getUserInfo);


userRouter.post('/login', userController.login)
userRouter.post('/signup', userController.signUp);                                                                                  
userRouter.get('/:id', userController.getById);




