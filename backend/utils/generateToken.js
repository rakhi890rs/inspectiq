import jwt from "jsonwebtoken";

// Signs a JWT containing the user id and role
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Sends the token both as an httpOnly cookie (used by the browser)
// and in the JSON body (useful for non-browser clients / testing).
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRE) || 7;
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      isEmailVerified: user.isEmailVerified,
    },
  });
};
