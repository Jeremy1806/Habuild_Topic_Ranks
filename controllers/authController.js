const { promisify } = require("util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.email);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  if (!req.body.email) {
    return res.status(401).json({
      status: "failed",
      message: "did not provide email",
    });
  }

  if (!req.body.password) {
    return res.status(401).json({
      status: "failed",
      message: "did not provide password",
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  try {
    const newUser = await User.create({
      email: req.body.email,
      password: hashedPassword,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if the username and password are provided.
  if (!email || !password) {
    // Sending error -> calling next with argument to invoke the global error handling middleware.
    // return - to avoid sending two responses we terminate the function here itself.
    return res.status(401).json({
      status: "failed",
      message: "did not provide password or email",
    });
  }
  // 2) Check if the user exists and password is correct.
  try {
    const user = await User.findByPk(email);

    // The second condition can be evaluated when user exists.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "failed",
        message: "incorrect email or password",
      });
    }

    // 3) If everything is okay, send the token.
    createSendToken(user, 200, res);
  } catch (error) {
    console.error(error);
  }
};

// Very important to mark functions in catchAsync as async otherwise catch isn't available on them.
exports.isAuthenticated = async (req, res, next) => {
  let token;

  // 1) Get the token from the request and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "failed",
      message: "did not provide auth token",
    });
  }

  // 2) Token verification
  // We convert the callback form of JWT function into async await style, so first we promisify the function.
  // Then the function is called with the necessary arguments.
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // If the code reaches here that means the token was issued by us.
    // 3) Check if the user still exits
    const freshUser = await User.findOne(decoded.id);

    if (!freshUser) {
      return res.status(401).json({
        status: "failed",
        message: "User belonging to this token does not exist",
      });
    }

    // If the code has made this far means the credentials are authentic.
    // Making the user data available for the subsequent protected middlewares.
    req.user = freshUser;
    next();
  } catch (error) {
    console.error(error);
  }
  // GRANT ACCESS TO THE PROTECTED ROUTE
};
