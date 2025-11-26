const mongoose = require('mongoose');
;


const journalSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    entryText:{
        type:String,
        required:true,
        minlength:[1,"Journal entry must be at least 1 character long"],
        maxlength:[5000,"Journal entry cannot exceed 5000 characters"],
        trim:true
    },
    moodScore:{
        type:Number,
        min:1,
        max:10
    },
    analysis:{
        summary:{
            type:String,
            maxlength:2000,
            trim:true
        },
        keywords:{
            type:[String],
            default:[]
        }
    }


},{timestamps:true})

journalSchema.index({userId:1,createdAt:-1});
const journalModel = mongoose.model('Journal',journalSchema);
module.exports=journalModel;