import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if(!authHeader){
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  if(!token || token === ""){
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    req.isAuth = false;
    return next();
  }
  if(!decodedToken) {
    req.isAuth = false;
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
}

export default authMiddleware;