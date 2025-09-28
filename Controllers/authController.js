const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendResponseToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // Make it so that the browser/client cannot modify the cookie
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; // Remove password from the response

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Added the passwordChangedAt,role fields to the request body
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  // Send Welcome Email
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  // Web token to signIn new users automatically.
  sendResponseToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if required fields are filled
  if (!email || !password)
    return next(new AppError('Please enter your email and password', 400));

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.passwordCorrect(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // If user exist, create a web token
  sendResponseToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// Only for rendered pages
exports.isLogedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 2. Verify token.
      const decodedPayload = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRETE,
      );

      // 3.Check if user still exists
      const currentUser = await User.findById(decodedPayload.id);
      if (!currentUser) return next();

      // 4. Check if user changed password after token was issued.
      if (currentUser.passwordChangedAfter(decodedPayload.iat)) return next();

      // Set user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1. Get token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('You are not logged in. Please log in to get started.', 401),
    );
  // 2. Verify token wether it has been tempered with.
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRETE,
  );

  // 3.Check if user still exists
  const currentUser = await User.findById(decodedPayload.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );

  // 4. Check if user changed password after token was issued.
  if (currentUser.passwordChangedAfter(decodedPayload.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // Grant access to the protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'?create error:continue.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with this email address.', 404));

  // 2. Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save();

  try {
    // 3. Send it to user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Reset token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user from DB based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired.', 400));

  // 2. If there's a user and token hasn't expired, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // 3. Update the user's changedPasswordAt field using a pre-save hook
  // 4. Login the user
  sendResponseToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if password is correct
  if (!(await user.passwordCorrect(req.body.passwordPrevious, user.password)))
    return next(new AppError('password incorrect!', 401));

  // 3. If password is correct, update user's password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Login user,send JWT
  sendResponseToken(user, 200, res);
});
