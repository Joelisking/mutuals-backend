import mailchimp from '@mailchimp/mailchimp_marketing';
import { env } from '../config/env.config';

interface SubscriberData {
  email: string;
  name?: string;
  source?: string;
}

class MailchimpService {
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Mailchimp client
   */
  private initialize(): void {
    if (!env.MAILCHIMP_API_KEY || !env.MAILCHIMP_SERVER_PREFIX) {
      console.warn('⚠️  Mailchimp not configured. Newsletter syncing will be skipped.');
      return;
    }

    try {
      mailchimp.setConfig({
        apiKey: env.MAILCHIMP_API_KEY,
        server: env.MAILCHIMP_SERVER_PREFIX,
      });
      this.initialized = true;
      console.log('✅ Mailchimp service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Mailchimp:', error);
    }
  }

  /**
   * Check if Mailchimp is properly configured
   */
  private isConfigured(): boolean {
    if (!this.initialized) {
      console.warn('⚠️  Mailchimp not initialized. Skipping operation.');
      return false;
    }
    if (!env.MAILCHIMP_LIST_ID) {
      console.warn('⚠️  Mailchimp list ID not configured. Skipping operation.');
      return false;
    }
    return true;
  }

  /**
   * Add subscriber to Mailchimp list
   */
  async addSubscriber(data: SubscriberData): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response: any = await mailchimp.lists.addListMember(env.MAILCHIMP_LIST_ID!, {
        email_address: data.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: data.name || '',
        },
        tags: data.source ? [data.source] : [],
      });

      console.log(`✅ Added subscriber to Mailchimp: ${data.email}`, {
        id: response.id,
        status: response.status,
      });

      return true;
    } catch (error: any) {
      // Handle specific Mailchimp errors
      if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
        console.log(`ℹ️  Subscriber already exists in Mailchimp: ${data.email}`);
        // Try to update instead
        return await this.updateSubscriber(data.email, 'subscribed', data);
      }

      console.error('❌ Failed to add subscriber to Mailchimp:', {
        email: data.email,
        error: error.response?.body || error.message,
      });

      return false;
    }
  }

  /**
   * Update subscriber status
   */
  async updateSubscriber(
    email: string,
    status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending',
    data?: SubscriberData
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      // Mailchimp uses MD5 hash of lowercase email as subscriber ID
      const subscriberHash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const updateData: any = {
        status,
      };

      if (data?.name) {
        updateData.merge_fields = {
          FNAME: data.name,
        };
      }

      await mailchimp.lists.updateListMember(
        env.MAILCHIMP_LIST_ID!,
        subscriberHash,
        updateData
      );

      console.log(`✅ Updated subscriber in Mailchimp: ${email} -> ${status}`);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to update subscriber in Mailchimp:', {
        email,
        error: error.response?.body || error.message,
      });
      return false;
    }
  }

  /**
   * Remove subscriber from list (unsubscribe)
   */
  async unsubscribeSubscriber(email: string): Promise<boolean> {
    return await this.updateSubscriber(email, 'unsubscribed');
  }

  /**
   * Delete subscriber permanently
   */
  async deleteSubscriber(email: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const subscriberHash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      await mailchimp.lists.deleteListMember(env.MAILCHIMP_LIST_ID!, subscriberHash);

      console.log(`✅ Permanently deleted subscriber from Mailchimp: ${email}`);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to delete subscriber from Mailchimp:', {
        email,
        error: error.response?.body || error.message,
      });
      return false;
    }
  }

  /**
   * Get subscriber info
   */
  async getSubscriber(email: string): Promise<any | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const subscriberHash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const response = await mailchimp.lists.getListMember(
        env.MAILCHIMP_LIST_ID!,
        subscriberHash
      );

      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return null; // Subscriber not found
      }

      console.error('❌ Failed to get subscriber from Mailchimp:', {
        email,
        error: error.response?.body || error.message,
      });
      return null;
    }
  }

  /**
   * Ping Mailchimp to test connection
   */
  async ping(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await mailchimp.ping.get();
      console.log('✅ Mailchimp ping successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Mailchimp ping failed:', error);
      return false;
    }
  }
}

export const mailchimpService = new MailchimpService();
