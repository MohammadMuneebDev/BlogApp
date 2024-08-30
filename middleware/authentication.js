const { validateToken } = require('../services/authentication'); // Ensure path is correct

function checkForAuthentication(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        console.log(`Token Cookie Value: ${tokenCookieValue}`); // Debug token

        if (!tokenCookieValue) {
            req.user = null; // Explicitly set user to null
            return next(); // No token, proceed to the next middleware or route handler
        }
        
        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload; // Attach user data to the request object
            console.log(`User Payload: ${JSON.stringify(userPayload)}`); // Debug user
        } catch (error) {
            console.error('Token validation error:', error);
            req.user = null; // Explicitly set user to null in case of error
        }
        
        next(); // Proceed to the next middleware or route handler
    };
}

module.exports = {checkForAuthentication};
