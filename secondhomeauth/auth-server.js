const express = require("express");
const app = express();
require("dotenv/config");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const speakeasy=require("speakeasy");
const nodemailer = require('nodemailer');
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5152"],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
  })
);
app.use(express.json());

// Our database
let DB = [];

/**
 *  This function is used verify a google account
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}
app.get("/", (req, res)=>{
    res.status(200).json({
        message:"working"
    });
})
app.post("/signup", async (req, res) => {
  try {
    // console.log({ verified: verifyGoogleToken(req.body.credential) });
    if (req.body.credential) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);

      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }

      const profile = verificationResponse?.payload;

      DB.push(profile);

      res.status(201).json({
        message: "Signup was successful",
        user: {
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          picture: profile?.picture,
          email: profile?.email,
          token: jwt.sign({ email: profile?.email }, "myScret", {
            expiresIn: "1d",
          }),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occured. Registration failed.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    if (req.body.credential) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);
      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }

      const profile = verificationResponse?.payload;

      const existsInDB = DB.find((person) => person?.email === profile?.email);

      if (!existsInDB) {
        return res.status(400).json({
          message: "You are not registered. Please sign up",
        });
      }

      res.status(201).json({
        message: "Login was successful",
        user: {
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          picture: profile?.picture,
          email: profile?.email,
          token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET, {
            expiresIn: "1d",
          }),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error?.message || error,
    });
  }
});
app.post('/api/generate-otp', (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32'
  });
  res.json({
    secret: secret.base32,
    otp: otp
  });
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { secret, otp } = req.body;
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: otp,
    window: 6
  });
  res.json({
    verified: verified
  });
});

// Send OTP via email
app.post('/api/send-otp', (req, res) => {
  const { email, otp } = req.body;
  console.log(otp);
  // Create transporter object
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'developersecondhome@gmail.com',
      pass: 'yahyiukcublngirs',
    }
  });

  // Create mail options
  const mailOptions = {
    from: 'developersecondhome@gmail.com',
    to: email,
    subject: 'One Time Password Verification',
    text: `Your OTP is ${otp}.`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.json({
        error: error.message
      });
    } else {
      console.log('Email sent: ' + info.response);
      res.json({
        message: 'OTP sent successfully!'
      });
    }
  });
});
app.post('/send-email', (req, res) => {
  const { email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'developersecondhome@gmail.com',
      pass: 'yahyiukcublngirs',
    },
  });

  const mailOptions = {
    from: 'developersecondhome@gmail.com',
    to: email,
    subject: 'OTP for Verfication at SecondHome',
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({
        message:`otp sent sucessfully to ${email}`,
        data:info.response
      })
    }
  });
});
app.listen("5152", () => console.log("Server running on port 5152"));