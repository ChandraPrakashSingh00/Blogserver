const { Comment, Article, User } = require('../models');

const createComment = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const comment = await Comment.create({
      content,
      articleId: article.id,
      userId,
      parentId: parentId || null
    });

    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'name', 'avatar']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: { comment: createdComment }
    });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const comments = await Comment.findAll({
      where: {
        articleId: article.id,
        parentId: null
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'name', 'avatar']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
    }

    await comment.update({ content });

    const updatedComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'avatar']
        }
      ]
    });

    res.json({
      success: true,
      data: { comment: updatedComment }
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    await comment.destroy();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment
};

