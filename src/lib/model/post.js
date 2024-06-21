import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
filename: String,
dest: String,
filetype: String,
thumbnail: String
})

export const PostDB = mongoose.models.post ?? mongoose.model("post", postSchema)