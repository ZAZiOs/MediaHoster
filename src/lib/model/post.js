import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
file: String,
filetype: String,
thumbnail: String
})

export const PostDB = mongoose.models.post ?? mongoose.model("post", postSchema)