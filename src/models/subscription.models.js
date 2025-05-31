import mongoose from 'mongoose';

const subscriptionSchema = new mongooseSchema({
    subscriber:{type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:0
    }
,
    channel:[{type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
],
ch
        
},{timestamps:true});

export const Subscription=mongoosemodel("Subscription",subscriptionSchema);