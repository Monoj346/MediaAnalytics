import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import JWT from "jsonwebtoken";

// generate access & refresh tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.");
    }
};

const signUp = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) throw new ApiError(409, "user with email already exists");

    const user = await User.create({
        email: normalizedEmail,
        password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) throw new ApiError(500, "user registration failed, please try again");

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    );
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) throw new ApiError(400, "email is required.");
    if (!password) throw new ApiError(400, "password is required.");

    const user = await User.findOne({
        $or: [{ email: email.trim().toLowerCase() }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist.");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully !!!."
            )
        );
});

export { signUp, login };