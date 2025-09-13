import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
// ,{hash} 
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login=async (req,res)=>{
    const {email,password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message:"Please provide email and password"});
    }
    try {
        const user =await User.findOne({email: email.toLowerCase()});
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message:"User not found !!!"});
        }
        let isPasswordCorrect=await bcrypt.compare(password,user.password)
        if (isPasswordCorrect) {
            let token=crypto.randomBytes(20).toString("hex");

            user.token =token;
            await user.save();
            return res.status(httpStatus.OK).json({token:token, user: {name: user.name, email: user.email, username: user.username}});
        }else{
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid email or password"})
        }
    } catch (error) {
        return res.status(500).json({message :" Something went wrong!!!"});
    }
}


const register =async(req,res) =>{
    const {name,email,username,password}=req.body;
    if (!name || !email || !username || !password) {
        return res.status(400).json({message:"Please provide all required fields"});
    }
    try {
        // Check if email already exists
        const existingEmail=await User.findOne({email: email.toLowerCase()});
        if (existingEmail) {
            return res.status(httpStatus.CONFLICT).json({message:"Email already exists"});
        }
        
        // Check if username already exists
        const existingUsername=await User.findOne({username});
        if (existingUsername) {
            return res.status(httpStatus.CONFLICT).json({message:"Username already exists"});
        }
        
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser=new User({
            name:name,
            email: email.toLowerCase(),
            username:username,
            password:hashedPassword
        });
        await newUser.save();
        res.status(httpStatus.CREATED).json({message:"User registered successfully!!"});
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"});
    }
}

const getUserHistory = async (req,res) => {
    const {token} = req.query;
    try {
        const user= await User.findOne({token:token});
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message:"User not found"});
        }
        const meetings = await Meeting.find({user_id:user.email});
        res.json(meetings);
    } catch (error) {
        res.status(500).json({message:`Something went wrong ${error}`})
    }
}

const addToHistory = async (req,res) => {
    const {token,meeting_code} = req.body;
    try {
        const user=await User.findOne({token:token});
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message:"User not found"});
        }
        const newMeeting = new Meeting({
            user_id:user.email,
            meetingCode:meeting_code
        })

        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message:"Added code to history"});
    } catch (error) {
        res.status(500).json({message:`Something went wrong ${error}`})
    }
}

const validateMeetingCode = async (req,res) => {
    const {meetingCode} = req.body;
    
    // Check if meeting code is provided
    if (!meetingCode) {
        return res.status(400).json({message:"Meeting code is required"});
    }
    
    // Check meeting code length (should be exactly 8 characters)
    if (meetingCode.length !== 8) {
        return res.status(400).json({
            message:"Meeting code must be exactly 8 characters long",
            valid: false
        });
    }
    
    try {
        // Check if meeting exists in database
        const meeting = await Meeting.findOne({meetingCode: meetingCode});
        
        if (meeting) {
            return res.status(200).json({
                message:"Meeting code is valid",
                valid: true,
                meeting: {
                    meetingCode: meeting.meetingCode,
                    date: meeting.date,
                    user_id: meeting.user_id
                }
            });
        } else {
            return res.status(404).json({
                message:"No meeting found with this code",
                valid: false
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:"Something went wrong while validating meeting code",
            valid: false
        });
    }
}

const validateToken = async (req,res) => {
    const {token} = req.body;
    
    // Check if token is provided
    if (!token) {
        return res.status(400).json({message:"Token is required"});
    }
    
    try {
        // Check if user exists with this token
        const user = await User.findOne({token: token});
        
        if (user) {
            return res.status(200).json({
                message:"Token is valid",
                valid: true,
                user: {
                    name: user.name,
                    email: user.email,
                    username: user.username
                }
            });
        } else {
            return res.status(401).json({
                message:"Invalid or expired token",
                valid: false
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:"Something went wrong while validating token",
            valid: false
        });
    }
}

const logout = async (req,res) => {
    const {token} = req.body;
    
    try {
        // Find user and clear their token
        const user = await User.findOne({token: token});
        
        if (user) {
            user.token = null;
            await user.save();
            return res.status(200).json({
                message:"Logged out successfully"
            });
        } else {
            return res.status(401).json({
                message:"Invalid token"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:"Something went wrong while logging out"
        });
    }
}

const deleteMeeting = async (req, res) => {
    const {meetingCode} = req.body;
    
    if (!meetingCode) {
        return res.status(400).json({message:"Meeting code is required"});
    }
    
    try {
        const deletedMeeting = await Meeting.findOneAndDelete({meetingCode: meetingCode});
        
        if (deletedMeeting) {
            return res.status(200).json({
                message:"Meeting deleted successfully",
                deleted: true
            });
        } else {
            return res.status(404).json({
                message:"Meeting not found",
                deleted: false
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:"Something went wrong while deleting meeting",
            deleted: false
        });
    }
}

export {login,register,getUserHistory,addToHistory,validateMeetingCode,validateToken,logout,deleteMeeting};