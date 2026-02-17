import mongoose from "mongoose";

export const connectdb=async ()=>{
    try {
        const conn=await mongoose.connect(process.env.Mongo_url);
        console.log(`Mongodb connected to ${conn.connection.host}`)
    } catch (error) {
        console.log("Error Connecting DB",error.message);
    }
}