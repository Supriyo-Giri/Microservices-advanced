import logger from "../utils/logger.js";
import validateRegistration from "../utils/validation.js";
import { User } from "../models/User.js";
import { generateTokens } from "../utils/generateToken.js";
import ENV from "../utils/env.js";
import argon2 from "argon2";
import { RefreshToken } from "../models/RefreshToken.js";

//health check controller
export const healthCheckController = (req, res) => {
  logger.info(
    `${req.method} ${req.url} ${req.ip} Health check end point was hit`,
  );
  try {
    res.status(200).json({
      success: true,
      message: "Service is up and running...",
    });
    logger.warn(`Service is up and running...`);
  } catch (error) {
    logger.error("Error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//get all users
export const getAllUsersController = async (req, res) => {
  logger.info(`${req.method} ${req.url} ${req.ip} All users endpoint was hit`);
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users: users,
    });
    logger.warn(`All users were successfully fetched`);
  } catch (error) {
    logger.error(`Error in get all users controller: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//user registration
export const registerUserController = async (req, res) => {
  logger.info(
    `${req.method} ${req.url} ${req.ip} Registration end point was hit`,
  );
  try {
    //schema validation
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.message}`);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn(`User already exists ${username}`);
      return res.status(400).json({
        success: false,
        message: "user with this email or password already exists",
      });
    }

    user = new User({ username, email, password });

    await user.save();
    logger.warn(`User created successfully [id: ${user._id}]`);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered Successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Registration error occured: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//user login
export const loginUserController = async (req, res) => {
  logger.info(`${req.method} ${req.url} ${req.ip} Login user endpoint was hit`);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn(`${req.ip} Login failed! Incomplete fields`);
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      logger.warn(`${req.ip} Login failed! User not found`);
      return res.status(400).json({
        success: false,
        message: "email not found",
      });
    }

    const correctPassword = argon2.verify(user.password, password);
    if (!correctPassword) {
      logger.warn(`${req.ip} Login failed! Incorrect Password`);
      return res.status(400).json({
        success: false,
        message: "Incorrect Password!",
      });
    }

    logger.warn(`${req.ip} User logged in successfully [id: ${user._id}]`);
    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User logged in Successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Login error occured: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// refresh token
export const refreshTokenController = async (req, res) => {
  logger.info(
    `${req.method} ${req.url} ${req.ip} Refresh Token endpoint was hit`,
  );
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn(`Refresh token missing`);
      res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh Token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh Token",
      });
    }
    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res.status(401).json({
        message: "User not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    //delete old refresh token
    await RefreshToken.deleteOne({ _id: storedToken.id });
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error(`Refresh Token error occured: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//logout
export const logoutController = async (req, res) => {
  logger.info(
    `${req.method} ${req.url} ${req.ip} Logout user endpoint was hit`,
  );
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token is missing");
      res.status(500).json({
        success: false,
        message: "Refresh token is missing",
      });
    }
    await RefreshToken.deleteOne({token: refreshToken})
    logger.info('refresh token deleted for logout');
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
    });

    logger.warn(`${req.ip} Logged out successfully`);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error(`Logout error occured: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
