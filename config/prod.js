module.exports = {
  googleProjectID: process.env.GOOGLE_PROJECT_ID,
  dialogFlowSessionID: process.env.DIALOGFLOW_SESSION_ID,
  dialogFlowSessionLanguageCode: process.env.DIALOGFLOW_LANGUGAGE_CODE,
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: JSON.parse(process.env.GOOGLE_PRIVATE_KEY),
  mongoURI: process.env.MONGO_URI,
  clientURL: process.env.CLIENT_URL,
  mailKey: process.env.MAIL_KEY,
  emailFrom: process.env.EMAIL_FROM,
  jwtAccountActivation: process.env.JWT_ACCOUNT_ACTIVATION,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
