import mongoose, { Schema } from "mongoose";

const userSchema =new Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
    },

})

const User = mongoose.model("User",userSchema);

export {User};

// Token will be the only thing that will be stored in local storage rest will be fetched 