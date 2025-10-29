// controllers/postController.js
const Post = require('../models/Post');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// GET /api/posts
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, q } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
    ];

    const [posts, total] = await Promise.all([
      Post.find(filter).populate('author', 'username').populate('category', 'name slug').sort({ createdAt: -1 }).skip(parseInt(skip)).limit(parseInt(limit)),
      Post.countDocuments(filter),
    ]);

    res.json({ data: posts, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id
exports.getPost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findOne({ $or: [{ _id: id }, { slug: id }] })
      .populate('author', 'username')
      .populate('category', 'name slug');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // increment view count asynchronously (do not block response)
    post.viewCount = (post.viewCount || 0) + 1;
    post.save().catch((err) => console.error('Failed to increment viewCount', err));

    res.json(post);
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, excerpt, category: categoryId, tags = [], isPublished = false } = req.body;

    // ensure category exists
    const cat = await Category.findById(categoryId);
    if (!cat) return res.status(400).json({ message: 'Invalid category' });

    // featured image path (if file)
    const featuredImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const slug = req.body.slug || title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

    const post = new Post({
      title,
      content,
      excerpt,
      featuredImage,
      slug,
      author: req.user._id,
      category: categoryId,
      tags,
      isPublished,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // only author or admin can update
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updates = req.body;
    if (req.file) updates.featuredImage = `/uploads/${req.file.filename}`;

    Object.assign(post, updates);
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ message: 'Comment content required' });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, content });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};
