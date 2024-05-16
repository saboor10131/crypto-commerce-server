const jwt = require("jsonwebtoken");

const authenticateUserOrAdmin = (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Bad Request" });
    }
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "Access denied" });
    }
    let data = jwt.decode(token, process.env.JWT_SECRET);
    if (data.id == id || data.role == "admin") next();
    else {
      return res
        .status(401)
        .json({ error: "You are not authorized for this request" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const authenticateSeller = (req, res, next) => {
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
    req.sellerId = data.id;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const authenticateAdmin = (req, res, next) => {
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
    req.adminId = data.id;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  authenticateUserOrAdmin,
  authenticateSeller,
  authenticateAdmin,
};
