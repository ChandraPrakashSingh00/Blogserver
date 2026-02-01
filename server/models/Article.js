const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const slugify = require('slugify');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 300]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  readingTime: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  hooks: {
    beforeCreate: async (article) => {
      if (article.title && !article.slug) {
        article.slug = slugify(article.title, { lower: true, strict: true });
        // Calculate reading time (average 200 words per minute)
        const wordCount = article.content.split(/\s+/).length;
        article.readingTime = Math.max(1, Math.ceil(wordCount / 200));
      }
    },
    beforeUpdate: async (article) => {
      if (article.changed('title') && !article.slug) {
        article.slug = slugify(article.title, { lower: true, strict: true });
      }
      if (article.changed('content')) {
        const wordCount = article.content.split(/\s+/).length;
        article.readingTime = Math.max(1, Math.ceil(wordCount / 200));
      }
      if (article.changed('published') && article.published && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    }
  },
  timestamps: true
});

module.exports = Article;

