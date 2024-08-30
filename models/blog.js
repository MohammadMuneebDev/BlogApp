const { Schema, model } = require('mongoose');

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    coverImageURL: {
        type: String,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,  // References the User model
        ref: 'User',
        required: true
    }
}, {
    timestamps: true  // Automatically adds `createdAt` and `updatedAt` fields
});

module.exports = model('Blog', blogSchema);
