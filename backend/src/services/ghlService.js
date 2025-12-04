import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

class GHLService {
  constructor() {
    this.apiKey = process.env.GHL_API_KEY;
    this.locationId = process.env.GHL_LOCATION_ID;
    
    this.client = axios.create({
      baseURL: GHL_API_BASE,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });
  }

  // Get all users/staff in the location
  async getUsers() {
    try {
      const response = await this.client.get(`/users/`, {
        params: {
          locationId: this.locationId
        }
      });
      
      return response.data.users || response.data;
    } catch (error) {
      console.error('Error fetching GHL users:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GHL users: ${error.message}`);
    }
  }

  // Get phone numbers assigned in GHL
 // Get phone numbers in GHL (LC Phone System)
async getPhoneNumbers() {
  try {
    // This matches the URL you use in the browser:
    // https://services.leadconnectorhq.com/phone-system/numbers/location/{locationId}
    const response = await this.client.get(
      `/phone-system/numbers/location/${this.locationId}`
    );

    // Log once while testing so we see the exact shape
    console.log('GHL phone numbers raw:', response.data);

    // Adjust this line once we know the exact structure, but for now:
    // - if it's { numbers: [...] } use that
    // - else if it's { data: [...] } use that
    // - else return the whole data
    const data = response.data;
    return data.numbers || data.phoneNumbers || data.data || data;
  } catch (error) {
    console.error(
      'Error fetching GHL phone numbers:',
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to fetch GHL phone numbers: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}


  // Add/Update phone number in GHL
  async addPhoneNumber(phoneNumber, name = null) {
    try {
      const response = await this.client.post(`/locations/${this.locationId}/phone-numbers`, {
        phoneNumber: phoneNumber,
        name: name || phoneNumber
      });
      
      return response.data;
    } catch (error) {
      console.error('Error adding phone number to GHL:', error.response?.data || error.message);
      throw new Error(`Failed to add phone number to GHL: ${error.message}`);
    }
  }

  // Delete phone number from GHL
  async deletePhoneNumber(phoneNumberId) {
    try {
      await this.client.delete(`/locations/${this.locationId}/phone-numbers/${phoneNumberId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting phone number from GHL:', error.response?.data || error.message);
      throw new Error(`Failed to delete phone number from GHL: ${error.message}`);
    }
  }

  // Get user details
  async getUser(userId) {
    try {
      const response = await this.client.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching GHL user:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GHL user: ${error.message}`);
    }
  }

  // Assign phone number to user (this might need to be done through GHL UI or different endpoint)
  async assignNumberToUser(phoneNumber, userId) {
    // Note: GHL might not have a direct API for this
    // This is a placeholder for future implementation
    console.log(`Assignment requested: ${phoneNumber} to ${userId}`);
    return { 
      message: 'Assignment tracking in local DB. Manual assignment in GHL UI may be required.',
      phoneNumber,
      userId 
    };
  }

  // Add method to compare Twilio vs GHL numbers
  async compareWithTwilio(twilioNumbers) {
    try {
      const ghlNumbers = await this.getPhoneNumbers();
      
      // Extract phone numbers from GHL (format might vary)
      const ghlNumberSet = new Set(
        ghlNumbers.map(n => this.normalizePhone(n.phoneNumber || n.number))
      );
      
      // Compare and return enriched data
      return twilioNumbers.map(twilioNum => ({
        ...twilioNum,
        inGHL: ghlNumberSet.has(this.normalizePhone(twilioNum.phoneNumber)),
        ghlData: ghlNumbers.find(g => 
          this.normalizePhone(g.phoneNumber || g.number) === 
          this.normalizePhone(twilioNum.phoneNumber)
        )
      }));
    } catch (error) {
      console.error('Error comparing numbers:', error);
      throw error;
    }
  }

  normalizePhone(phone) {
    // Remove all non-digits
    return phone.replace(/\D/g, '');
  }

  // Get opportunities (booked appointments) from GHL
  async getOpportunities(startDate = null, endDate = null) {
    try {
      const params = {
        location_id: this.locationId,
        limit: 100
      };

      if (startDate) {
        params.startAfter = new Date(startDate).getTime();
      }
      if (endDate) {
        params.endBefore = new Date(endDate).getTime();
      }

      const response = await this.client.get(`/opportunities/search`, { params });
      
      console.log('[GHL] Fetched opportunities:', response.data);
      return response.data.opportunities || response.data.data || [];
    } catch (error) {
      console.error('[GHL] Error fetching opportunities:', error.response?.data || error.message);
      // Don't throw - just return empty array if opportunities not available
      return [];
    }
  }
}

export default new GHLService();