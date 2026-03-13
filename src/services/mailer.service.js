import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import env from '../config/env/env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
} = env

// Función para construir el transporte de nodemailer utilizando las variables de entorno
function buildTransport() {
    if (!SMTP_HOST) throw new Error('SMTP_HOST no configurado. Verifique las variables de entorno.');
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: String(SMTP_SECURE || 'false') === 'true', // Convertir a booleano
        auth: {user: SMTP_USER, pass: SMTP_PASS},
    });
}

// Función para renderizar plantillas Handlebars desde el directorio de vistas de emails
async function renderTemplate(templateName, data) {
    const viewDir = path.join(__dirname, '../views/emails');
    const filePath = path.join(viewDir, `${templateName}.handlebars`);
    const source = await fs.readFile(filePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(data || {});
} 

export class MailerService {
    async sendMail({ to, subject, template, contexto= {} }) {
        if( !to || !subject || !template) throw new Error('Destinatario, asunto y plantilla son requeridos');
        
        const transport = buildTransport();
        const html = await renderTemplate(template, contexto);
        const info = await transport.sendMail({
            from: SMTP_FROM || SMTP_USER,
            to,
            subject,
            html,
        })

        return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
    }
}

export const mailerService = new MailerService();