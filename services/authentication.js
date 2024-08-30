const JWT = require('jsonwebtoken');

const secret = '$sperman@123'; // Ensure this secret is kept secure and consistent

function createTokenForUser(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };
    const token = JWT.sign(payload, secret, { expiresIn: '1h' }); // Optionally, set an expiration time
    return token;
}

const validateToken = (token) => {
    try {
        return JWT.verify(token, secret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    createTokenForUser,
    validateToken
};
