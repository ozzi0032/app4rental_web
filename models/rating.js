
const mongoose=require('mongoose');
const config=require('../config/database');


var Schema = mongoose.Schema;
const RatingSchema = mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User',required:true},
    rate:{type:Number,default:0},
    target:{type: Schema.Types.ObjectId, ref: 'User',required:true},
});

const Rating=module.exports=mongoose.model('Rating',RatingSchema);

module.exports.getRatingById=function(id,callback){
    Rating.findById(id,callback);
}

module.exports.getStar=function(id,id2,callback){
    Rating.findOne({user:id,target:id2},callback);
}

module.exports.findMine=function(id,callback){
    Rating.find({target:id}).populate().exec(callback);
}

module.exports.setStar=function(id,id2,num,callback){
    
    Rating.findOne({user:id,target:id2},(err,star)=>{
        if(err)throw err;
        if(star){star.rate=num;star.save(callback);}
        else{
            var star=new Rating({user:id,rate:num,target:id2});
            star.save(callback);
        }
    });
}