const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

// ================= PORT =================
const port = process.env.PORT || 4000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB connected"))
.catch((err)=>console.log(err));

// ================= API CHECK =================
app.get("/", (req, res) => {
  res.send("Express is running");
});

// ================= STATIC IMAGE =================
app.use("/images", express.static("upload/images"));

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// ================= UPLOAD IMAGE =================
app.post("/upload", upload.single("product"), (req, res) => {

  const image_url =
  process.env.RENDER_EXTERNAL_URL + "/images/" + req.file.filename;

  res.json({
    success: 1,
    image_url
  });
});

// ================= PRODUCT MODEL =================
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  img: String,
  category: String,
  new_price: Number,
  old_price: Number,
});

// ================= ADD PRODUCT =================
app.post("/addproduct", async (req, res) => {

  let products = await Product.find({});
  let id = products.length > 0 ? products[products.length-1].id+1 : 1;

  const product = new Product({
    id,
    name: req.body.name,
    img: req.body.img,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({success:true});
});

// ================= GET ALL =================
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  res.json(products);
});

// ================= USER =================
const User = mongoose.model("Users", {
  name: String,
  email: {type:String,unique:true},
  password: String,
  cartdata: Object,
});

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {

  let check = await User.findOne({email:req.body.email});
  if(check){
    return res.json({success:false});
  }

  let cart={};
  for(let i=0;i<300;i++){cart[i]=0;}

  const newUser = new User({
    name:req.body.username,
    email:req.body.email,
    password:req.body.password,
    cartdata:cart
  });

  await newUser.save();

  const token = jwt.sign(
    {user:{id:newUser.id}},
    process.env.JWT_SECRET
  );

  res.json({success:true,token});
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {

  let user=await User.findOne({email:req.body.email});
  if(user && req.body.password===user.password){

    const token = jwt.sign(
      {user:{id:user.id}},
      process.env.JWT_SECRET
    );

    res.json({success:true,token});
  }
  else{
    res.json({success:false});
  }
});

// ================= START =================
app.listen(port, ()=>{
  console.log("Server running");
});
