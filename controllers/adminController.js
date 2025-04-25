import validator from "validator";
import bcript from "bcrypt";
import {v2 as cloudinary} from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";

//API them bac si
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file // Assuming you are using multer to handle file uploads
    
    //check xem co thieu thong tin khong
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    //validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
      });
    }

    //validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      });
    }

    //hash password
    const salt = await bcript.genSalt(10);
    const hashedPassword = await bcript.hash(password, salt);

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
    const imageUrl = imageUpload.secure_url; // Get the secure URL of the uploaded image




    const doctorData = {
        name,
        email,
        image: imageUrl,
        password: hashedPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        address: JSON.parse(address),
        date: Date.now()
    }

    const newDoctor = await doctorModel(doctorData);
    await newDoctor.save();
    res.status(201).json({
      success: true,
      message: "Thêm bác sĩ thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//API admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(email+password, process.env.JWT_SECRET);
        res.status(200).json({
          success: true,
          message: "Đăng nhập thành công",
          token: token,
        });
    }
    else {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// API lay danh sach bac si
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Lấy danh sách bác sĩ thành công",
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export { addDoctor, loginAdmin, allDoctors };