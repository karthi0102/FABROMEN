const mongoose= require('mongoose')
const {Schema}=require('mongoose')
const ImageSchema =  new Schema({
    url:String,
    filename:String,
})
const productSchema = new Schema({
    name:String,
    image:[ImageSchema],
    price:Number,
    sprice:Number,
    rating:Number,
    desc:String,
})

module.exports = mongoose.model('Product',productSchema);
