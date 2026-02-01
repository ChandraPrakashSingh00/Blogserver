const { Article, User, Tag, Like, Comment } = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');

const createArticle = async (req, res, next) => {
  try {
    const { title, subtitle, content, coverImage, tags, published } = req.body;
    const authorId = req.user.id;

    let slug = slugify(title, { lower: true, strict: true });
    const existingArticle = await Article.findOne({ where: { slug } });
    if (existingArticle) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await Article.create({
      title,
      subtitle,
      content,
      coverImage,
      slug,
      authorId,
      published: published || false
    });

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
            defaults: {
              name: tagName.trim(),
              slug: slugify(tagName.trim(), { lower: true, strict: true })
            }
          });
          return tag;
        })
      );
      await article.setTags(tagInstances);
    }

    const createdArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'name', 'avatar', 'bio']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: { article: createdArticle }
    });
  } catch (error) {
    next(error);
  }
};

const getArticles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      tag,
      author,
      search,
      published = true
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { published: published === 'true' };

    if (author) {
      const authorUser = await User.findOne({ where: { username: author } });
      if (authorUser) {
        where.authorId = authorUser.id;
      }
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    let include = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'name', 'avatar', 'bio']
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ];

    if (tag) {
      const tagInstance = await Tag.findOne({ where: { slug: tag } });
      if (tagInstance) {
        include = [
          include[0],
          {
            ...include[1],
            where: { id: tagInstance.id }
          }
        ];
      }
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: {
        articles: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    console.log('Fetching article with slug:', slug, 'User ID:', userId);

    // First, find the article with basic info
    const article = await Article.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'name', 'avatar', 'bio']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    if (!article) {
      console.log('Article not found with slug:', slug);
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check if user can view this article (published or owner)
    if (!article.published && article.authorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Article is not published'
      });
    }

    // Get likes count separately
    const likesCount = await Like.count({
      where: { articleId: article.id }
    });

    // Get comments separately to avoid complex nested query
    const comments = await Comment.findAll({
      where: { articleId: article.id, parentId: null },
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

    // Check if user liked the article
    let isLiked = false;
    if (userId) {
      const like = await Like.findOne({
        where: { userId, articleId: article.id }
      });
      isLiked = !!like;
    }

    // Increment views
    await article.increment('views');
    await article.reload();

    res.json({
      success: true,
      data: {
        article: {
          ...article.toJSON(),
          isLiked,
          likesCount,
          comments
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, subtitle, content, coverImage, tags, published } = req.body;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    if (article.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this article'
      });
    }

    let newSlug = article.slug;
    if (title && title !== article.title) {
      newSlug = slugify(title, { lower: true, strict: true });
      const existingArticle = await Article.findOne({
        where: { slug: newSlug, id: { [Op.ne]: article.id } }
      });
      if (existingArticle) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
    }

    await article.update({
      title: title || article.title,
      subtitle: subtitle !== undefined ? subtitle : article.subtitle,
      content: content || article.content,
      coverImage: coverImage !== undefined ? coverImage : article.coverImage,
      slug: newSlug,
      published: published !== undefined ? published : article.published
    });

    if (tags && Array.isArray(tags)) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
            defaults: {
              name: tagName.trim(),
              slug: slugify(tagName.trim(), { lower: true, strict: true })
            }
          });
          return tag;
        })
      );
      await article.setTags(tagInstances);
    }

    const updatedArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'name', 'avatar', 'bio']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      success: true,
      data: { article: updatedArticle }
    });
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    if (article.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this article'
      });
    }

    await article.destroy();

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const likeArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const [like, created] = await Like.findOrCreate({
      where: { userId, articleId: article.id }
    });

    if (!created) {
      await like.destroy();
      return res.json({
        success: true,
        data: { liked: false, message: 'Article unliked' }
      });
    }

    res.json({
      success: true,
      data: { liked: true, message: 'Article liked' }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  likeArticle
};

