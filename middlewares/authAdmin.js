import e from "express"
import jwt from "jsonwebtoken"

// addAdmin middleware to check if the user is an admin
const authAdmin = (req, res, next) => {
  try {
    const {atoken} = req.headers
    if (!atoken) {
      return res.status(401).json({ message: "Bạn không được cấp quyền" })
    }
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET)
    if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" })
    }
    next()
  }
  catch (error) {
    return res.status(401).json({ message: error.message })
  }
}

export default authAdmin