// models/Post.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    featuredImage: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, maxlength: 300 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    comments: [CommentSchema],
  },
  { timestamps: true }
);

// Create slug from title if not provided
PostSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

PostSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Post', PostSchema);
