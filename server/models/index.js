const sequelize = require('../config/database');
const User = require('./User');
const Article = require('./Article');
const Comment = require('./Comment');
const Like = require('./Like');
const Follow = require('./Follow');
const Tag = require('./Tag');

// User-Article relationships
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Article-Comment relationships
Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments' });
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// Nested comments
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// Like relationships
User.belongsToMany(Article, { through: Like, foreignKey: 'userId', as: 'likedArticles' });
Article.belongsToMany(User, { through: Like, foreignKey: 'articleId', as: 'likedBy' });

// Follow relationships
User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followingId'
});
User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});

// Article-Tag relationships (many-to-many)
Article.belongsToMany(Tag, { through: 'ArticleTags', foreignKey: 'articleId', as: 'tags' });
Tag.belongsToMany(Article, { through: 'ArticleTags', foreignKey: 'tagId', as: 'articles' });

module.exports = {
  sequelize,
  User,
  Article,
  Comment,
  Like,
  Follow,
  Tag
};

