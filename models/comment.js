const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    blogId: {
        type: Schema.Types.ObjectId, // Reference to the Blog model
        ref: 'Blog',
       
    },
    createdBy: {
        type: Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
       
    }
}, {
    timestamps: true  // Automatically adds `createdAt` and `updatedAt` fields
});

module.exports = model('Comment', commentSchema);
