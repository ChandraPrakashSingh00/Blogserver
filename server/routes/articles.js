const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  likeArticle
} = require('../controllers/articleController');
const { validateArticle } = require('../middleware/validator');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getArticles);
router.get('/:slug', optionalAuth, getArticle);
router.post('/', authenticate, validateArticle, createArticle);
router.put('/:slug', authenticate, validateArticle, updateArticle);
router.delete('/:slug', authenticate, deleteArticle);
router.post('/:slug/like', authenticate, likeArticle);

module.exports = router;

