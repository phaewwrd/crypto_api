const prisma = require("../models/prisma");
const bcrypt = require("bcrypt");
const createError = require("../utils/createError");
const jwt = require("jsonwebtoken");


const authController = {};

authController.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword },
    });
    res.json({ user });
    
  } catch (error) {
    next(error);
  }


};

authController.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({ where: { email } });
    console.log(user);
    if (!user) {
      return createError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return createError(401, "Invalid email or password");
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({ token});
  } catch (error) {
    next(error);
}
};

module.exports = authController;
