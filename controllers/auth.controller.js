const User = require("../models/auth.model");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandling");
const sgMail = require("@sendgrid/mail");
const config = require("../config/keys");
const { translate } = require("@paiva/translation-google");
sgMail.setApiKey(config.mailKey);

exports.registerController = (req, res) => {
  const {
    first_name,
    last_name,
    age,
    gender,
    contact_no,
    location,
    email,
    password,
  } = req.body;
  console.log(
    first_name,
    last_name,
    age,
    gender,
    contact_no,
    location,
    email,
    password
  );

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    User.findOne({
      email,
    }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          errors: "Email is taken",
        });
      }
    });

    const token = jwt.sign(
      {
        first_name,
        last_name,
        age,
        gender,
        contact_no,
        location,
        email,
        password,
      },
      config.jwtAccountActivation,
      {
        expiresIn: "5m",
      }
    );

    const emailData = {
      from: config.emailFrom,
      to: email,
      subject: "Account activation link",
      html: `
                <h1>Please use the following to activate your account</h1>
                <p>${config.clientURL}/users/activate/${token}</p>
                <hr />
                <p>This email may contain sensitive information</p>
                <p>${config.clientURL}</p>
            `,
    };

    sgMail
      .send(emailData)
      .then((sent) => {
        return res.json({
          message: `Email has been sent to ${email}`,
        });
      })
      .catch((err) => {
        return res.status(400).json({
          success: false,
          errors: errorHandler(err),
        });
      });
  }
};

exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, config.jwtAccountActivation, (err, decoded) => {
      if (err) {
        console.log("Activation error");
        return res.status(401).json({
          errors: "Expired link. Signup again",
        });
      } else {
        const {
          first_name,
          last_name,
          age,
          gender,
          contact_no,
          location,
          email,
          password,
        } = jwt.decode(token);

        console.log(email);
        const user = new User({
          first_name,
          last_name,
          age,
          gender,
          contact_no,
          location,
          email,
          password,
        });

        user.save((err, user) => {
          if (err) {
            console.log("Save error", errorHandler(err));
            return res.status(401).json({
              errors: errorHandler(err),
            });
          } else {
            return res.json({
              success: true,
              message: user,
              message: "Signup success",
            });
          }
        });
      }
    });
  } else {
    return res.json({
      message: "error happening please try again",
    });
  }
};
exports.signinController = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    // check if user exist
    User.findOne({
      email,
    }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          errors: "User with that email does not exist. Please signup",
        });
      }
      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          errors: "Email and password do not match",
        });
      }
      // generate a token and send to client
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      const {
        _id,
        first_name,
        last_name,
        age,
        gender,
        contact_no,
        location,
        email,
        role,
      } = user;

      return res.json({
        token,
        user: {
          _id,
          first_name,
          last_name,
          age,
          gender,
          contact_no,
          location,
          email,
          role,
        },
      });
    });
  }
};

exports.forgotPasswordController = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    User.findOne(
      {
        email,
      },
      (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: "User with that email does not exist",
          });
        }

        const token = jwt.sign(
          {
            _id: user._id,
          },
          process.env.JWT_RESET_PASSWORD,
          {
            expiresIn: "10m",
          }
        );

        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Password Reset link`,
          html: `
                    <h1>Please use the following link to reset your password</h1>
                    <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                    <hr />
                    <p>This email may contain sensetive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `,
        };

        return user.updateOne(
          {
            resetPasswordLink: token,
          },
          (err, success) => {
            if (err) {
              console.log("RESET PASSWORD LINK ERROR", err);
              return res.status(400).json({
                error:
                  "Database connection error on user password forgot request",
              });
            } else {
              sgMail
                .send(emailData)
                .then((sent) => {
                  // console.log('SIGNUP EMAIL SENT', sent)
                  return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
                  });
                })
                .catch((err) => {
                  // console.log('SIGNUP EMAIL SENT ERROR', err)
                  return res.json({
                    message: err.message,
                  });
                });
            }
          }
        );
      }
    );
  }
};

exports.resetPasswordController = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(
        resetPasswordLink,
        process.env.JWT_RESET_PASSWORD,
        function (err, decoded) {
          if (err) {
            return res.status(400).json({
              error: "Expired link. Try again",
            });
          }

          User.findOne(
            {
              resetPasswordLink,
            },
            (err, user) => {
              if (err || !user) {
                return res.status(400).json({
                  error: "Something went wrong. Try later",
                });
              }

              const updatedFields = {
                password: newPassword,
                resetPasswordLink: "",
              };

              user = _.extend(user, updatedFields);

              user.save((err, result) => {
                if (err) {
                  return res.status(400).json({
                    error: "Error resetting user password",
                  });
                }
                res.json({
                  message: `Great! Now you can login with your new password`,
                });
              });
            }
          );
        }
      );
    }
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
// Google Login
exports.googleController = (req, res) => {
  const { idToken } = req.body;

  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
    .then((response) => {
      // console.log('GOOGLE LOGIN RESPONSE',response)
      const {
        email_verified,
        first_name,
        last_name,
        age,
        gender,
        contact_no,
        location,
        email,
      } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const {
              _id,
              email,
              first_name,
              last_name,
              age,
              gender,
              contact_no,
              location,
              role,
            } = user;
            return res.json({
              token,
              user: {
                _id,
                email,
                first_name,
                last_name,
                age,
                gender,
                contact_no,
                location,
                role,
              },
            });
          } else {
            // return res.status(400).json({
            //   error: "Admin with that email does not exist",
            // });
            let password = email + process.env.JWT_SECRET;
            user = new User({
              first_name,
              last_name,
              age,
              gender,
              contact_no,
              location,
              email,
              password,
              role: "admin",
            });
            user.save((err, data) => {
              if (err) {
                console.log("ERROR GOOGLE LOGIN ON USER SAVE", err);
                return res.status(400).json({
                  error: "User signup failed with google",
                });
              }
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );
              const {
                _id,
                email,
                first_name,
                last_name,
                age,
                gender,
                contact_no,
                location,
                role,
              } = data;
              return res.json({
                token,
                user: {
                  _id,
                  email,
                  first_name,
                  last_name,
                  age,
                  gender,
                  contact_no,
                  location,
                  role,
                },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try again",
        });
      }
    });
};

exports.inputDatasetController = (req, res) => {
  // const { token } = req.body;
  const { inputData } = req.body;
  console.log(inputData);

  // const errors = validationResult(req);

  // console.log(errors);

  console.log(inputData);
  // console.log(errors);

  let translated;

  // @paiva/translation-google
  translate(inputData, {
    from: "tl",
    to: "en",
  })
    .then((res) => {
      console.log("@paiva/translation-google");
      console.log(res.text);
      translated = res.from.text.value;
      //
      console.log(res.from.text.autoCorrected);

      //=> 这是Google翻译
      console.log(res.from.language.iso);

      //
      console.log(res.from.text.value);
      //=> en
      console.log(res.from.text.didYouMean);
    })
    .catch((err) => {
      console.error(err);
    });

  result = sentiment.analyze(translated);

  console.dir(result); // Score: -2, Comparative: -0.666
  // return errors;
  // const user = new User({
  //   first_name,
  //   last_name,
  //   age,
  //   gender,
  //   contact_no,
  //   location,
  //   email,
  //   password,
  // });

  // user.save((err, user) => {
  //   if (err) {
  //     console.log("Save error", errorHandler(err));
  //     return res.status(401).json({
  //       errors: errorHandler(err),
  //     });
  //   } else {
  //     return res.json({
  //       success: true,
  //       message: user,
  //       message: "Signup success",
  //     });
  //   }
  // });
};

exports.fetchAllController = async (req, res) => {
  try {
    let data = await User.find({ role: "subscriber" });
    console.log(data);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};
