import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { SubscriptionSource, SubscriptionStatus } from '../../common/types';
import { mailchimpService } from '../../common/utils/mailchimp.util';
import { emailService } from '../../common/utils/email.util';

interface SubscribeData {
  email: string;
  name?: string;
  source?: SubscriptionSource;
  preferences?: any;
}

export class NewsletterService {
  /**
   * Subscribe to newsletter
   */
  async subscribe(data: SubscribeData) {
    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: data.email },
    });

    let subscriber;
    let isNewSubscriber = false;

    if (existing) {
      if (existing.status === SubscriptionStatus.ACTIVE) {
        throw new AppError('Email is already subscribed', 400);
      }

      // Resubscribe if previously unsubscribed
      subscriber = await prisma.newsletterSubscriber.update({
        where: { email: data.email },
        data: {
          status: SubscriptionStatus.ACTIVE,
          name: data.name || existing.name,
          source: data.source || existing.source,
          preferences: data.preferences || existing.preferences,
          unsubscribedAt: null,
        },
      });
    } else {
      // Create new subscriber
      subscriber = await prisma.newsletterSubscriber.create({
        data: {
          email: data.email,
          name: data.name,
          source: data.source || SubscriptionSource.HOMEPAGE,
          preferences: data.preferences,
        },
      });
      isNewSubscriber = true;
    }

    // Sync to Mailchimp (best effort - don't fail if Mailchimp is down)
    try {
      await mailchimpService.addSubscriber({
        email: data.email,
        name: data.name,
        source: data.source,
      });
    } catch (error) {
      console.error('Failed to sync subscriber to Mailchimp, but saved to database:', error);
    }

    // Send welcome email to new subscribers (best effort)
    if (isNewSubscriber) {
      try {
        await emailService.sendWelcomeEmail(data.email, data.name);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    return subscriber;
  }

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(email: string) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      throw new AppError('Email not found in subscription list', 404);
    }

    if (subscriber.status === SubscriptionStatus.UNSUBSCRIBED) {
      throw new AppError('Email is already unsubscribed', 400);
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        status: SubscriptionStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });

    // Sync to Mailchimp (best effort - don't fail if Mailchimp is down)
    try {
      await mailchimpService.unsubscribeSubscriber(email);
    } catch (error) {
      console.error('Failed to sync unsubscribe to Mailchimp, but updated database:', error);
    }

    return updated;
  }

  /**
   * Get all subscribers (Admin only)
   */
  async getAllSubscribers(page: number, limit: number, status?: SubscriptionStatus) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subscribedAt: 'desc' },
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return { subscribers, total };
  }

  /**
   * Get subscriber by email
   */
  async getSubscriberByEmail(email: string) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      throw new AppError('Subscriber not found', 404);
    }

    return subscriber;
  }

  /**
   * Get subscription stats
   */
  async getStats() {
    const [total, active, unsubscribed] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      prisma.newsletterSubscriber.count({
        where: { status: SubscriptionStatus.UNSUBSCRIBED },
      }),
    ]);

    return {
      total,
      active,
      unsubscribed,
    };
  }
}
