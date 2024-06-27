import { Router } from 'express';
import { userController } from '../controllers/userController.js';


export const userRouter = Router();

userRouter.post('/login', userController.login)
userRouter.post('/signup', userController.signUp);                                                                                  
userRouter.get('/:id', userController.getById);




