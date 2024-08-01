import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken"


export const register =async (req,res)=>{
    const {username , email , password} = req.body;

    try {
        const hashedPassword =await bcrypt.hash(password,10)
    
        const newUser = await prisma.user.create({
            data:{
                username,
                email,
                password : hashedPassword,
            }
        });
    
        res.status(201).json({
            message : "user created Successfully",
            successs: true,
            data: newUser
        })
    
    } catch (error) {
        res.status(500).json({
            message : "error while user created ",
            successs: false,
            error:error
            
        })
    }
};

export const login = async(req,res)=>{
    const {username,password} = req.body;
   try {
        const user = await prisma.user.findUnique({
            where:{username}
        })

        if(!user){
            res.status(401).json({
                message:"user Not found"
            })
        }

     const isPassordvalid = await bcrypt.compare(password,user.password)

     if(!isPassordvalid){
        res.status(401).json({
            message:"password is not valid"
        })
     }

     const age = 1000 * 60* 60 * 24 * 7;

     const token = jwt.sign({
        id:user.id,
        isadmin:false,
     },process.env.JWT_SECRET_KEY,{expiresIn:age})

     
    const {password:userPassword , ...userInfo} = user

     res.cookie("token",token,{
        httpOnly:true,
        //secure:true
        maxAge:age
     }).status(200).json({
        userInfo
     })

   } catch (error) {
    res.status(500).json({
        message : "failed to login user",
        successs: false,
        error:error
   })
    
}
}

export const logout = (req,res)=>{
    res.clearCookie("token").status(200).json({
        message:"logout Successfull"
    });
}