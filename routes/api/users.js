const express = require("express");
const User = require("../../models/userModel");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const verifyToken = require("../../token");
const gravatar = require("gravatar");
const multer = require("multer");
const jimp = require("jimp");
const fs = require("fs");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/signup", async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    res.status(400).json(error.message);
  } else {
    const { email, password } = value;
    const user = await User.findOne({ email }).lean();
    if (user) res.status(409).json({ message: "email in use" });
    else
      try {
        const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
        const newUser = new User({ email, avatarURL });
        newUser.setPassword(password);
        await newUser.save();
        res
          .status(201)
          .json({ user: { email: newUser.email, subscryption: newUser.subscription } });
      } catch (err) {
        res.status(500).json(err.message);
      }
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(user.validPassword(password));
    if (!user.validPassword(password)) {
      res.status(401).json({ message: "Email or password is wrong" });
    } else {
      const secretKey = process.env.SECRET_KEY;
      const token = jwt.sign({ id: user._id }, secretKey);
      user.token = token;
      await user.save();
      res.status(200).json({
        token: user.token,
        user: {
          email: email,
          subscription: user.subscription,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/current", verifyToken, (req, res) => {
  const currentUser = {
    email: req.user.email,
    subscription: req.user.subscription,
  };

  res.status(200).json(currentUser);
});

router.get("/logout", verifyToken, async (req, res) => {
  const user = req.user;
  user.token = null;
  await user.save();
  res.status(204).json({ message: "No content" });
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

router.patch("/", verifyToken, async (req, res) => {
  const user = req.user;
  const newSubscription = req.body.subscription;
  const { error } = subscriptionSchema.validate({ subscription: newSubscription });
  if (error) res.status(400).json(error.message);
  else {
    user.subscription = req.body.subscription;
    await user.save();
    res.status(201).json({ message: `subscryption updated to ${newSubscription}` });
  }
});

router.patch("/avatars", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    const { file, user } = req;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Process the avatar with jimp and set its dimensions to 250x250
    const processedAvatar = await jimp.read(file.path);
    processedAvatar.cover(250, 250).write(file.path);

    // Move the user's avatar from the tmp folder to public/avatars and give it a unique name
    const fileName = `${user._id}-${Date.now()}-${file.originalname}`;
    const newPath = `public/avatars/${fileName}`;
    await fs.renameSync(file.path, newPath);

    // Update the user's avatarURL field
    user.avatarURL = `/avatars/${fileName}`;
    await user.save();

    res.status(200).json({ avatarURL: user.avatarURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
