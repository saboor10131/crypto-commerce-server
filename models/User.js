const mongoose  = require('mongoose');
const {Schema} = mongoose


const userSchema = Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['admin', 'seller' , 'customer'],
        default : 'customer'
    }
})

const UserModel = mongoose.model('User' , userSchema)
export default UserModel