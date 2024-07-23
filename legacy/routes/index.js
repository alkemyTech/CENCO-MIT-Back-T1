import express from 'express';
import { userRouter } from './userRoutes.js'; 
import { adminRouter } from "./adminRouter.js";
const router = express.Router();

router.use('/users', userRouter)
router.use("/admin", adminRouter);

export default router;
