import axios, { AxiosError } from 'axios';
import { addToQueue } from './queue';

interface WassengerParticipant {
  phone: string;
  admin: boolean;
}

export class WhatsAppService {
  private readonly wassengerToken: string;
  private readonly wassengerBaseUrl: string;
  private deviceId: string | null = null;

  constructor() {
    this.wassengerToken = process.env.WASSENGER_TOKEN as string;
    this.wassengerBaseUrl = 'https://api.wassenger.com/v1';
  }

  private async wassengerRequest(method: string, endpoint: string, data?: Record<string, unknown> | unknown[]) {
    try {
      const url = `${this.wassengerBaseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${this.wassengerToken}`;
      console.log('Making request to:', url);
      console.log('Request data:', data);
      
      const response = await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Wassenger API error details:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });
      }
      throw error;
    }
  }

  private async getDeviceId() {
    if (this.deviceId) return this.deviceId;

    const devices = await this.wassengerRequest('GET', '/devices');
    if (!devices || devices.length === 0) {
      throw new Error('No WhatsApp devices found');
    }

    this.deviceId = devices[0].id;
    return this.deviceId;
  }

  async addParticipant(phoneNumber: string, groupId: string, monthsDuration: number) {
    try {
      // Format phone number to include country code if not present
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Get device ID first
      const deviceId = await this.getDeviceId();
      
      // Add participant to the group
      const participant: WassengerParticipant = {
        phone: formattedPhone.replace(/\s+/g, ''), // Remove any spaces
        admin: false
      };

      await this.wassengerRequest('POST', `/devices/${deviceId}/groups/${groupId}/participants`, {
        participants: [participant]
      });

      // Schedule removal
      await addToQueue(formattedPhone, groupId, monthsDuration);

      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  async removeParticipant(phoneNumber: string, groupId: string) {
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const deviceId = await this.getDeviceId();
      
      await this.wassengerRequest('DELETE', `/devices/${deviceId}/groups/${groupId}/participants`, 
        [formattedPhone.replace(/\s+/g, '')]  // Array of phone numbers
      );
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }
}

export const whatsAppService = new WhatsAppService();