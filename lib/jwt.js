const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const generateAccessToken = async (payload, secret, options) => {
  let token = jwt.sign(payload, secret, options);
  return token;
};

const verifyToken = async (token, secret, options) => {
  return jwt.verify(token, secret, options);
};

const getTokenSecret = async database => {
  if (JWT_SECRET) return JWT_SECRET;
  const context = database.createContext();
  const cert = await context.getObject("Certificate");
  const secret = cert.private;
  context.destroy();
  return secret;
};

module.exports = {
  generateAccessToken,
  verifyToken,
  getTokenSecret
};
