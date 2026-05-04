import jwt from "jsonwebtoken";

/**
 * Signs a JWT containing the user's ID.
 * Token expires in 30 days by default.
 *
 * @param {string} userId - The MongoDB _id of the user.
 * @returns {string} Signed JWT string.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
