import { messagingService as svc} from '../services/messaging.service.js';

// Controlador para manejar las solicitudes de mensajería (SMS y WhatsApp)

class MessagingController {
    async sendSMS(req, res) {
        try {
            const { to, body } = req.body; // Extrae el número de destino y el mensaje del cuerpo de la solicitud
            const result = await svc.sendSMS({ to, body }); // Llama al servicio para enviar el SMS
            res.status(200).json({ ok: true, ...result });
        } catch (error) { res.status(400).json({ ok: false, error: error.message }) }
    }

    async sendWhatsApp(req, res) {
        try {
            const { to, body } = req.body;
            const result = await svc.sendWhatsApp({ to, body });
            res.status(200).json({ ok: true, ...result });
        } catch (error) { res.status(400).json({ ok: false, error: error.message }) }
    }
}

export const messagingController = new MessagingController();