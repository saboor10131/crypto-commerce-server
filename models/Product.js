const mongoose  = require('mongoose');
const {Schema} = mongoose


const productSchema = Schema({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    categoryId : {
        type : Schema.Types.ObjectId,
        ref : "Category",
        required : "true"
    },
    image : {
        type : String,
        required : true
    },
    tags : [String],
    sellerId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : "true"
    }
})

const ProductModel = mongoose.model('Product' , productSchema)
export default ProductModel