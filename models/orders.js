const mongoose=require('mongoose')
const {Schema}=mongoose

const orderSchema = new Schema({
    customer:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },

})

module.exports =  mongoose.model('Order',orderSchema);