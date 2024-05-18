const jwt = require("jsonwebtoken");

const validateToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, function (err, userData) {
    if (err) {
      console.log("if (err)")
      throw new Error(err);
    }
    if (!userData) {
      console.log("userData")
      throw new Error("Error");
    }
    return userData;
  });
};

const authorizeUserOrAdmin = (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Bad Request" });
    }
    const token = req.header("Authorization");
    let data = validateToken(token);
    if (data.id == id || data.role == "admin") next();
    else {
      return res
        .status(401)
        .json({ error: "You are not authorized for this request" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Access denied" });
  }
};

const authorizeSeller = (req, res, next) => {
  try {
    const token = req.header("Authorization");
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
const authorizeCustomer = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    let data = jwt.decode(token, process.env.JWT_SECRET);
    if (data.role != "customer") {
      return res
        .status(401)
        .json({ error: "You are not authorized for this request" });
    }
    req.userId = data.id;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Access denied" });
  }
};

const authorizeAdmin = (req, res, next) => {
  try {
    const token = req.header("Authorization");
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

const authenticateUser = (req, res , next) => {
  try {
    const token = req.header("Authorization");
    const userData = validateToken(token);
    const { id, role, name, email } = userData
    req.userId = id;
    req.userName = name;
    req.userEmail = email;
    req.userRole = role;
    next()
  } catch (error) {
    return res.status(500).json({ error: "Access denied" });
  }
};

module.exports = {
  authorizeUserOrAdmin,
  authorizeSeller,
  authorizeCustomer,
  authorizeAdmin,
  authenticateUser,
};
