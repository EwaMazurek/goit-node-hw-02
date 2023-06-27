const jwt = require("jsonwebtoken");
const User = require("./models/userModel");

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const userToken = jwt.verify(token, process.env.SECRET_KEY);
      const userId = userToken.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json(error.message);
    }
  } else {
    res.status(401).json({ message: "Token missing" });
  }
};

module.exports = verifyToken;
