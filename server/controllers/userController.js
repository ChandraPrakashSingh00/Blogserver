const { User, Article, Follow } = require('../models');
const { Op } = require('sequelize');

const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findOne({
      where: { username },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Article,
          as: 'articles',
          where: { published: true },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'name', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 10
        },
        {
          model: User,
          as: 'followers',
          attributes: ['id', 'username', 'name', 'avatar'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'following',
          attributes: ['id', 'username', 'name', 'avatar'],
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await Follow.findOne({
        where: {
          followerId: currentUserId,
          followingId: user.id
        }
      });
      isFollowing = !!follow;
    }

    const articlesCount = await Article.count({
      where: { authorId: user.id, published: true }
    });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toJSON(),
          isFollowing,
          articlesCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    const userToFollow = await User.findOne({ where: { username } });

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (userToFollow.id === followerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself'
      });
    }

    const [follow, created] = await Follow.findOrCreate({
      where: {
        followerId,
        followingId: userToFollow.id
      }
    });

    if (!created) {
      await follow.destroy();
      return res.json({
        success: true,
        data: { following: false, message: 'Unfollowed user' }
      });
    }

    res.json({
      success: true,
      data: { following: true, message: 'Following user' }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    await user.update({
      name: name !== undefined ? name : user.name,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  followUser,
  updateProfile
};

