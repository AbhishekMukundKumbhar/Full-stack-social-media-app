const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require('../keys');

module.exports = (req,res,next)=>{
    const {authorization} = req.headers;
    if(!authorization){
        return res.status(401).json({error : "Please login"});
    }
    const token = authorization.replace("Bearer ","");
    jwt.verify(token,JWT_SECRET_KEY,(err,payload)=>{
        if(err){
            return res.status(401).json({error : "Please login"});
        }
        req.user = payload.user;
        next();
    });
    
}