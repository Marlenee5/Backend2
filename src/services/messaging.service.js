import twilio from 'twilio';

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_FROM_SMS,
    TWILIO_FROM_WAPP,
} = process.env;

const client = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null; // Si no hay credenciales, el cliente será null y se manejará en la clase


// Servicio de mensajería que utiliza Twilio para enviar SMS y WhatsApp
export class MessagingService {
    #client;
    constructor(twilioClient = client) { this.#client = twilioClient } // Permite inyectar un cliente Twilio simulado para pruebas unitarias
    #assert() { if (!this.#client) throw new Error('Twilio client no configurado. Verifique las variables de entorno.') }

    async sendSMS({ to, body }) {
        this.#assert();
        if (!to || !body) throw new Error('Número de destino y cuerpo del mensaje son requeridos');
        if (!TWILIO_FROM_SMS) throw new Error('Número de origen para SMS no configurado. Verifique las variables de entorno.');

        const message = await this.#client.messages.create({ from: TWILIO_FROM_SMS, to, body });
        return { sid: message.sid, status: message.status };
    }

    async sendWhatsApp({ to, body }) {
        this.#assert();
        if (!to || !body) throw new Error('Número de destino y cuerpo del mensaje son requeridos');
        if (!TWILIO_FROM_WAPP) throw new Error('Número de origen para WhatsApp no configurado. Verifique las variables de entorno.');

        // Agregar prefijo whatsapp: si no lo tiene
        const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        const message = await this.#client.messages.create({ from: TWILIO_FROM_WAPP, to: toWhatsApp, body });
        return { sid: message.sid, status: message.status };
    }

}

export const messagingService = new MessagingService();