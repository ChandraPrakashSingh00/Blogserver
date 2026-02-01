const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 50]
    }
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: async (tag) => {
      if (tag.name && !tag.slug) {
        const slugify = require('slugify');
        tag.slug = slugify(tag.name, { lower: true, strict: true });
      }
    }
  },
  timestamps: true
});

module.exports = Tag;

