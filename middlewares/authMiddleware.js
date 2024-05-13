const jwt = require("jsonwebtoken");

const verifySeller = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "Access denied" });
    }
    let data = jwt.decode(token, process.env.JWT_SECRET);
    if (data.role != "seller") {
      return res
        .status(401)
        .json({ error: "You are not authorized for this request" });
    }
    req.sellerId =  data.id;
    next();
  } catch (error) {
    return res.status(500);
  }
};

const verifyAdmin = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "Access denied" });
    }
    let data = jwt.decode(token, process.env.JWT_SECRET);
    if (data.role != "admin") {
      return res
        .status(401)
        .json({ error: "You are not authorized for this request" });
    }
    next();
  } catch (error) {
    return res.status(500);
  }
};

module.exports = {
  verifySeller,
  verifyAdmin,
};
