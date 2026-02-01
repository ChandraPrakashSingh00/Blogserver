const express = require('express');
const router = express.Router();
const {
  createComment,
  getComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { validateComment } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

router.get('/:slug', getComments);
router.post('/:slug', authenticate, validateComment, createComment);
router.put('/:id', authenticate, validateComment, updateComment);
router.delete('/:id', authenticate, deleteComment);

module.exports = router;

