import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import Schema from 'mongoose';

const videoSchema = new Schema({
    videoFile:{
        type:String,//Cludinary URL
        required:true,
    }
    ,
    thumbnail:{
        type:String,//Cludinary URL
        required:true,
    },
    title:{
        type:String,
        required:true,

    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number, //Cludinary 
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{timestamps:true});

Video.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model('Video', videoSchema);