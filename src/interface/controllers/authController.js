const DatabaseErrors = require("../../utils/databaseErrors.js");
const StatusCode = require("../../utils/status-code.js");

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


class AuthController {
    async handleGoogleLogin (req, res) {
        const { token } = req.body;

        try{
            // VERIFICAR O TOKEN COM O GOOGLE
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID, // Especificando o meu id de cliente.
            });

            const payload = ticket.getPayload();
            // O payload contém as informações do usuário do Google
            const { sub: googleId, email, name, picture } = payload;

            console.log("Informações do usuário do Google", payload);
            
            const user = await 
        }catch(err){
            
        }
    };
}