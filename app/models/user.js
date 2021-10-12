var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
var User = new Schema({
    username : {
        type : String,
        lowercase : true,
        require : true ,
        unique : true
    },
    password : {
        type : String,
        require :true
    },
    email :
    {
        type : String,
        lowercase : true,
        require : true ,
        unique : true
    },
    role :
    {
        type : Number,
        require : true 
    }
});
User.pre('save',function(next)
{
    var user = this;
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password,salt,function(err, hash)
    {
        if(err)
        {
            return next(err);
        }
        user.password=hash;
        next();
    });
    });
});
User.methods.comparePassword = function(password)
{
    return bcrypt.compareSync(password, this.password);
}
module.exports = mongoose.model('User',User); 