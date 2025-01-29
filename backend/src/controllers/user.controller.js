import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError, ApiResponce, uploadOnCloudinary, asyncHandler } from "../utils/index.js";

const genereteAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validationBeforeSave: false });

        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Something Went Wrong While Generating Access And Refresh Token");
    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, birthdate } = req.body;

    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }



    let existedUser = await User.findOne({ $or: [{ username, email }] })
    if (existedUser) {
        throw new ApiError(401, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError(500, "Something Went Wrong While Uploading Avatar  " + req.files?.avatar[0].path);
    }

    const avatarOnlinePath = await uploadOnCloudinary(avatarLocalPath);



    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatarOnlinePath,
        birthdate
    })

    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
        throw new ApiError(500, "Something Went Wrong While Creating User");
    }
    return res.status(200).json(new ApiResponce(200, createdUser, "User Created Successfully"));
}
)

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email }).select('-avatar');

    if (!user) {
        throw new ApiError(401, "User Not Found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(402, "Incorrect Password");
    }
    const { accessToken, refreshToken } = await genereteAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    const sendRes = await User.findById(user._id).select("-password -avatar -is_admin ");
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponce(200, {
            user: sendRes, accessToken, refreshToken
        }, "Login Success"));
})

const LogoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired ");
        }

        const option = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await genereteAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(new ApiResponce(200,
                { accessToken, refreshToken: newRefreshToken },
                "Access Token Refreshed Successfully"
            )
            )
    }
    catch (error) {
        throw new ApiError(401, error?.message || "Something Went Wrong While Refreshing Access Token");
    }
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponce(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Password Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatarOnlinePath = await uploadOnCloudinary(avatarLocalPath);

    if (!avatarOnlinePath) {
        throw new ApiError(500, "Something Went Wrong While Uploading Avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                avatar: avatarOnlinePath.url
            }
        }, {
        new: true
    }
    ).select("-password -is_admin");

    return res
        .status(200)
        .json(new ApiResponce(200, user, "Avatar Updated Successfully"))
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { username, email, birthdate } = req.body;

    if (!username || !email || !birthdate) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username: username,
                email: email,
                birthdate: birthdate
            }
        }, {
        new: true
    }
    ).select("-password -is_admin");
    console.log("New User Data = ", user);

    return res
        .status(200)
        .json(new ApiResponce(200, user, "User Details Updated Successfully"))
})

export { registerUser, loginUser, LogoutUser, refreshAccessToken, getCurrentUser, updatePassword, updateUserAvatar, updateUserDetails }


