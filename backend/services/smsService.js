const { logger } = require('../utils/logger');
const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    // Configuration Twilio pour WhatsApp
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    // Ne créer le client Twilio que si les credentials sont valides et correctement formatés
    if (this.accountSid && this.authToken && this.accountSid.startsWith('AC')) {
      try {
        this.client = new twilio(this.accountSid, this.authToken);
        console.log('[WhatsAppService] Twilio client initialized successfully');
      } catch (error) {
        console.error('[WhatsAppService] Failed to initialize Twilio client:', error.message);
        this.client = null;
      }
    } else {
      console.log('[WhatsAppService] Twilio not configured or invalid credentials, using fallback mode');
      this.client = null;
    }
  }

  async sendAppointmentConfirmation(phone, clientName, appointmentDate, appointmentTime, queueNumber) {
    try {
      const message = `SALEKA BANQUE: Bonjour ${clientName}, votre rendez-vous de confirmation de compte est programmé pour le ${appointmentDate} à ${appointmentTime}. Votre numéro de file est ${queueNumber}. Merci de votre confiance.`;
      
      // Formater le numéro pour WhatsApp (ajouter le code pays si nécessaire)
      const whatsappPhone = this.formatPhoneForWhatsApp(phone);
      
      logger.info('WhatsApp Appointment Confirmation:', {
        phone: whatsappPhone,
        message,
        appointmentDate,
        appointmentTime,
        queueNumber
      });

      // Envoyer via Twilio WhatsApp si configuré
      if (this.client && this.whatsappNumber) {
        await this.client.messages.create({
          from: `whatsapp:${this.whatsappNumber}`,
          to: `whatsapp:${whatsappPhone}`,
          body: message
        });
        logger.info('WhatsApp message sent successfully');
      } else {
        // Fallback: log en mode développement
        console.log('WhatsApp would be sent to:', whatsappPhone);
        console.log('Message:', message);
      }

      return { success: true, message: 'WhatsApp notification sent successfully' };
    } catch (error) {
      logger.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendAccountCreationNotification(phone, clientName, accountNumber) {
    try {
      const message = `SALEKA BANQUE: Bonjour ${clientName}, votre compte bancaire a été créé avec succès. Numéro de compte: ${accountNumber}. Bienvenue chez SALEKA BANQUE.`;
      
      const whatsappPhone = this.formatPhoneForWhatsApp(phone);
      
      logger.info('WhatsApp Account Creation Notification:', {
        phone: whatsappPhone,
        message,
        accountNumber
      });

      if (this.client && this.whatsappNumber) {
        await this.client.messages.create({
          from: `whatsapp:${this.whatsappNumber}`,
          to: `whatsapp:${whatsappPhone}`,
          body: message
        });
        logger.info('WhatsApp message sent successfully');
      } else {
        console.log('WhatsApp would be sent to:', whatsappPhone);
        console.log('Message:', message);
      }

      return { success: true, message: 'WhatsApp notification sent successfully' };
    } catch (error) {
      logger.error('WhatsApp send error:', error);
      throw error;
    }
  }

  formatPhoneForWhatsApp(phone) {
    // Formater le numéro pour WhatsApp (format international)
    // Supprimer les espaces, tirets et parenthèses
    let formatted = phone.replace(/[\s\-\(\)]/g, '');
    
    // Ajouter le code pays Cameroun si le numéro commence par 0
    if (formatted.startsWith('0')) {
      formatted = '+237' + formatted.substring(1);
    }
    
    // Si le numéro ne commence pas par +, ajouter le code pays par défaut
    if (!formatted.startsWith('+')) {
      formatted = '+237' + formatted;
    }
    
    return formatted;
  }
}

module.exports = new WhatsAppService();
