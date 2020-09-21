// Imports
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = '8s7eiHGZ478r5efJ9zE7NXbYs6MSq34iEUCL2KRRLZ7HB3jt55jBS9893sg3Vfuc3h5h88xVs54kBwbt'

// Exported functions
module.exports = {
    generateTokenForUser: function (userData) {
        return jwt.sign({
            userId: userData.id,
            permission_id: userData.permission_id
        },
        JWT_SIGN_SECRET,
            {
                expiresIn: '1h'
            })
    }
}
