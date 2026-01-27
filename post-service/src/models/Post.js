import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    mediaIds: [
        {
            type: String
        }
    ],
    createdAt:{
        type: Date,
        default: Date.now
    }
},{
    timestamps: true
})

//we will have different service for search we can remove this index 
postSchema.index({content: 'text'})

const Post = mongoose.model('Post', postSchema);

export default Post;
