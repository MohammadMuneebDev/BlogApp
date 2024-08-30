const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const { createTokenForUser } = require('../services/authentication'); // Ensure path is correct

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'], // Restrict to predefined roles
        default: 'USER',
    },
}, {
    timestamps: true
});

// Hook to hash password before saving
userSchema.pre('save', function(next) {
    if (!this.isModified('password')) return next();

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt)
        .update(this.password)
        .digest('hex');

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
    const hashedCandidatePassword = createHmac('sha256', this.salt)
        .update(candidatePassword)
        .digest('hex');

    return hashedCandidatePassword === this.password;
};

// Static method to authenticate user and generate token
userSchema.statics.matchPasswordAndGenerateToken = async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User not found');

    const hashedPassword = createHmac('sha256', user.salt)
        .update(password)
        .digest('hex');

    if (hashedPassword !== user.password) throw new Error('Incorrect password');

    const token = createTokenForUser(user);
    return token;
};

module.exports = model('User', userSchema);
