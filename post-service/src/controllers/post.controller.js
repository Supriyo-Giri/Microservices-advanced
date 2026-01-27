import Post from "../models/post.js";
import logger from "../utils/logger.js";
import validateCreatePost from "../utils/validation.js";
// import Redis from 'ioredis';

// import ENV from "../utils/env.js";
// const redisClient = new Redis(ENV.REDIS_URL);

async function invalidateCache(req, input) {
  const cachedKey = `post:${input}`
  await req.redisClient.del(cachedKey);
  const keys = await req.redisClient.keys("posts:*");
  if(keys.length > 0){
    await req.redisClient.del(keys);
  }
}

export const createPostController = async (req, res) => {
  logger.info("Create Post Endpoint was hit");
  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.message}`);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();
    await invalidateCache(req,newlyCreatedPost._id.toString())
    logger.info("Post created Successfully", newlyCreatedPost);
    res.status(201).json({
      success: true,
      message: "Post created Successfully",
    });
  } catch (error) {
    logger.error("Error creating post", error);
    return res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

export const getAllPostsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);
    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();
    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts/limit),
      totalPosts: totalPosts
    }

    //save our posts in redis cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result))
    res.json(result);
    
  } catch (error) {
    logger.error("Error fetching posts", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching posts",
    });
  }
};

export const getAllPostByIdController = async (req, res) => {
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if(cachedPost){
      return res.json(JSON.parse(cachedPost));
    }
    const singlePostDetailsById = await Post.findById(postId);
    if(!singlePostDetailsById){
      return res.status(404).json({
        message: 'Post not found',
        success: false
      })
    }
    await req.redisClient.setex(cachedPost, 3600, JSON.stringify(singlePostDetailsById))

    res.json(singlePostDetailsById)
  } catch (error) {
    logger.error("Error fetching post", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching post",
    });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    })

    if(!post){
      return res.status(404).json({
        success: false,
        message: 'post not found'
      });
    }

    await invalidateCache(req, req.params.id);
    res.json({
      message: 'post deleted successfully',
      success: true
    })

  } catch (error) {
    logger.error("Error deleting post", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting post",
    });
  }
};
