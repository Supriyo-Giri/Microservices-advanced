import express from 'express'
import { createPostController, getAllPostsController, getAllPostByIdController } from '../controllers/post.controller.js'
import { authenticateRequest } from '../middlewares/auth.js';

const router = express.Router();

//auth middleware - verifes uses is authenticated or not
router.use(authenticateRequest)

router.post('/create',createPostController);
router.get('/',getAllPostsController);
router.get('/:id',getAllPostByIdController);

export default router;