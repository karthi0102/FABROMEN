const mongoose = require("mongoose")
const {Schema}=mongoose
const passportLocalMongoose=require('passport-local-mongoose');
const reviewSchema={
    body:String,
    rating:Number,
}
const userSchema =new Schema({
    email:{
        type:String
    },
    phone:Number,
   address:String,
   orders:[
       {
           type:Schema.Types.ObjectId,
           ref:"Product",
       }
   ],
   display:Number,
   otp:Number,
   display:Number,
   review:{reviewSchema}
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User',userSchema)