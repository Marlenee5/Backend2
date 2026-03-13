import { mailerService as svc } from '../services/mailer.service.js';

class MailerController {
    async sendWelcome(req, res) {
        try{
            const { to, name } = req.body;
            const r = await svc.sendMail({
                to,
                subject: `Bienvenido/a ${name || "Usuario"}!`,
                template: 'welcome',
                contexto: { name: name || "Usuario"},
            })
            res.status(200).json({ ok: true, ...r});
        } catch(err) {res.status(400).json({error: err.message})};
    }

    async sendOrderTemplate(req, res) {
        try{
            const { to, code, status } = req.body;
            const r = await svc.sendMail({
                to,
                subject: `Actualizacion de tu orden ${code}`,
                template: 'order-status',
                contexto: { code, status },
            })
            res.status(200).json({ ok: true, ...r});
        } catch(err) {res.status(400).json({error: err.message})};
    }
}

export const mailerController = new MailerController();