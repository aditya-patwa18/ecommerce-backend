import mongoose from "mongoose";

const userschema=new mongoose.schema({
    name:{
        type:String,
        required:[true,"name is reuqired"]
    },
    email:{
        type:String,
        required:[true,"email is reqired"],
        unique:true,
        lowercase:true,
        trim:true,

    },
    password:{
        type:String,
        required:[true,"enter your password"],
        minlength:[6,"password needs to be  set of atleast 6 character"]
    }
     
})
