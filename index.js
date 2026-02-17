const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());


// ================= DATABASE CONNECTION =================
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB connected"))
.catch((err)=>console.log(err));


// ================= API CHECK =================
app.get("/", (req, res) => {
  res.send("Express is running");
});


// ================= IMAGE STORAGE =================
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

app.use("/images", express.static("upload/images"));


// 🔴 IMPORTANT FIX HERE
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `https://ecommerce-backend-xmia.onrender.com/images/${req.file.filename}`,
  });
});


// ================= PRODUCT MODEL =================
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  img: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});


// ================= ADD PRODUCT =================
app.post("/addproduct", async (req, res) => {

  let products = await Product.find({});
  let id;

  if (products.length > 0) {
    let last_product = products[products.length - 1];
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id: id,
    name: req.body.name,
    img: req.body.img,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();

  res.json({
    success: true,
    name: req.body.name,
  });
});


// ================= REMOVE PRODUCT =================
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({
    success: true,
    id: req.body.id,
  });
});


// ================= GET ALL PRODUCTS =================
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  res.send(products);
});


// ================= USER MODEL =================
const User = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartdata: { type: Object },
  date: { type: Date, default: Date.now() },
});


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {

  let check = await User.findOne({ email: req.body.email });

  if (check) {
    return res.status(400).json({
      success: false,
      errors: "User already exists",
    });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }

  const newUser = new User({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartdata: cart,
  });

  await newUser.save();

  const data = {
    user: {
      id: newUser.id,
    },
  };

  const token = jwt.sign(data, process.env.JWT_SECRET);

  res.json({ success: true, token });
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {

  let existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {

    const passCompare = req.body.password === existingUser.password;

    if (passCompare) {

      const data = {
        user: {
          id: existingUser.id,
        },
      };

      const token = jwt.sign(data, process.env.JWT_SECRET);

      res.json({ success: true, token });

    } else {
      res.json({ success: false, error: "Wrong Password" });
    }

  } else {
    res.json({ success: false, error: "Wrong Email ID" });
  }
});


// ================= START SERVER =================
app.listen(port, () => {
  console.log("Server running on port " + port);
});
