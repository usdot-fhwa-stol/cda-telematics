const jwt = require("jsonwebtoken");
const verifyToken = (req) => {
  try {
    //Authorization: 'TOKEN'
    const token = req.headers.authorization;
    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      if (decodedToken && decodedToken.exp > new Date().getTime() / 1000) {
        return decodedToken;
      }
    }
  } catch (err) {
    console.log(err);
  }
  return undefined;
};

module.exports = { verifyToken };
