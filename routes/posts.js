// routes/posts.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/posts
router.get('/', postController.getPosts);

// GET /api/posts/:id (id or slug)
router.get('/:id', postController.getPost);

// POST create post (requires auth)
router.post(
  '/',
  auth,
  upload.single('featuredImage'),
  [
    body('title').isLength({ min: 3 }).withMessage('Title min 3 chars'),
    body('content').isLength({ min: 10 }).withMessage('Content min 10 chars'),
    body('category').notEmpty().withMessage('category required'),
  ],
  postController.createPost
);

// PUT update post
router.put(
  '/:id',
  auth,
  upload.single('featuredImage'),
  [
    body('title').optional().isLength({ min: 3 }).withMessage('Title min 3 chars'),
    body('content').optional().isLength({ min: 10 }).withMessage('Content min 10 chars'),
  ],
  postController.updatePost
);

// DELETE post
router.delete('/:id', auth, postController.deletePost);

// POST comment
router.post('/:id/comments', auth, postController.addComment);

module.exports = router;
