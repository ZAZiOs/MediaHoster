import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
login: String,
pass: String,
canAddStuff: Boolean,
confirmed: Boolean,
isAdmin: Boolean,
token_check: String
})

export const UserDB = mongoose.models.user ?? mongoose.model("user", userSchema)