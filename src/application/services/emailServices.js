const sgMail = require("@sendgrid/mail");
const { success } = require("zod/v4");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log(process.env.SENDGRID_API_KEY);


const FROM_EMAIL_NO_REPLAY = 'no-reply@kronosapp.com.br';
const REPLY_TO_EMAIL_SUPPORT = 'suporte@kronosapp.com.br';

class EmailService{

    async _send(message){
        try{
            await sgMail.send(message);
            console.log(`E-mail enviado com sucesso para ${message.to}`);
            return { success: true };
        }catch(error){
            console.error(`Erro ao enviar e-mail para ${message.to}`, error);
            return { success: false, error: error};
        }
    }

    async sendProjectInvitation(recipientEmail, data){
        const { inviterName, projectName, inviteLink } = data;

        const message = {
            to: recipientEmail,
            from: FROM_EMAIL_NO_REPLAY,
            replyTo: REPLY_TO_EMAIL_SUPPORT,
            subject: `${inviterName} convidou você para o projeto ${projectName}`,
            html: `
                <h1>Olá!</h1>
                <p>Você foi convidade por <strong>${inviterName}</strong> para colaborar no projeto "<strong>${projectName}</strong>".</p>
                <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Aceitar Convite</a>
                <br><br>
                <p>Se o botão não funcionar, copie e cole este link no seu navegador: ${inviteLink}</p>
                `,
            text: `Olá! Você foi convidado por ${inviterName} para o projeto "${projectName}". Acesse este link para aceitar: ${inviteLink}`
        };

        return this._send(message);
    }

    async sendPasswordReset(recipientEmail, data){
        const message = {
            to: recipientEmail,
            from: FROM_EMAIL_NO_REPLAY,
            subject: 'Redefinição de Senha - Kronos',
            html: `<p>Para redefinir sua senha, por favor <a href="${data.resetLink}">clique aqui</a>.</p>`
        };

        return this._send(message);
    }
}

module.exports = new EmailService();