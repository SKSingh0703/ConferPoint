import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrpyt from "bcryptjs";
// ,{hash} 
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login=async (req,res)=>{
    const {username,password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message:"Please Provide"});
    }
    try {
        const user =await User.findOne({username});
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message:"User not fount !!!"});
        }
        let isPasswordCorrect=await bcrpyt.compare(password,user.password)
        if (isPasswordCorrect) {
            let token=crypto.randomBytes(20).toString("hex");

            user.token =token;
            await user.save();
            return res.status(httpStatus.OK).json({token:token});
        }else{
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid Username or password"})
        }
    } catch (error) {
        return res.status(500).json({message :" Something went wrong!!!"});
    }
}


const register =async(req,res) =>{
    const {name,username,password}=req.body;
    try {
        const existingUser=await User.findOne({username});
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({message:"User already exists"});
        }
        const hashedPassword = await bcrpyt.hash(password,10);
        const newUser=new User({
            name:name,username:username,password:hashedPassword
        });
        await newUser.save();
        res.status(httpStatus.CREATED).json({message:"User registered!!"});
    } catch (error) {
        res.json({message:"Something went wrong !!!"});
    }
}

const getUserHistory = async (req,res) => {
    const {token} = req.query;
    try {
        const user= await User.findOne({token:token});
        const meetings = await Meeting.find({user_id:user.username});
        res.json(meetings);
    } catch (error) {
        res.json({message:`Something went wrong ${error}`})
    }
}

const addToHistory = async (req,res) => {
    const {token,meeting_code} = req.body;
    try {
        const user=await User.findOne({token:token});
        const newMeeting = new Meeting({
            user_id:user.username,
            meetingCode:meeting_code
        })

        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message:"Added code to history"});
    } catch (error) {
        res.json({message:`Something went wrong ${error}`})
    }
}

export {login,register,getUserHistory,addToHistory};