import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { SubmissionType, SubmissionStatus } from '../../common/types';
import { emailService } from '../../common/utils/email.util';

interface ContactSubmissionData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  submissionType?: SubmissionType;
}

interface ArtistSubmissionData {
  name: string;
  email: string;
  role: string;
  bio?: string;
  portfolioLinks?: any;
  socialMedia?: any;
  pitchMessage: string;
  attachments?: string[];
}

export class SubmissionsService {
  /**
   * Create contact submission
   */
  async createContactSubmission(data: ContactSubmissionData) {
    const submission = await prisma.contactSubmission.create({
      data: {
        ...data,
        submissionType: data.submissionType || SubmissionType.GENERAL,
      },
    });

    // Send email notifications asynchronously (don't block the response)
    Promise.all([
      emailService.sendContactNotification({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
      emailService.sendSubmissionConfirmation(data.email, data.name, 'contact'),
    ]).catch(error => {
      console.error('Failed to send contact submission emails:', error);
    });

    return submission;
  }

  /**
   * Get all contact submissions (Admin)
   */
  async getAllContactSubmissions(page: number, limit: number, status?: SubmissionStatus) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    return { submissions, total };
  }

  /**
   * Get contact submission by ID
   */
  async getContactSubmissionById(id: string) {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    return submission;
  }

  /**
   * Update contact submission status
   */
  async updateContactSubmissionStatus(id: string, status: SubmissionStatus) {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });

    return updated;
  }

  /**
   * Delete contact submission
   */
  async deleteContactSubmission(id: string) {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    await prisma.contactSubmission.delete({
      where: { id },
    });

    return { message: 'Submission deleted successfully' };
  }

  // Artist Submissions

  /**
   * Create artist submission
   */
  async createArtistSubmission(data: ArtistSubmissionData) {
    const submission = await prisma.artistSubmission.create({
      data: {
        ...data,
        attachments: data.attachments || [],
      },
    });

    // Send email notifications asynchronously (don't block the response)
    Promise.all([
      emailService.sendArtistSubmissionNotification({
        name: data.name,
        email: data.email,
        role: data.role,
        pitchMessage: data.pitchMessage,
      }),
      emailService.sendSubmissionConfirmation(data.email, data.name, 'artist'),
    ]).catch(error => {
      console.error('Failed to send artist submission emails:', error);
    });

    return submission;
  }

  /**
   * Get all artist submissions (Admin)
   */
  async getAllArtistSubmissions(page: number, limit: number, status?: SubmissionStatus, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [submissions, total] = await Promise.all([
      prisma.artistSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.artistSubmission.count({ where }),
    ]);

    return { submissions, total };
  }

  /**
   * Get artist submission by ID
   */
  async getArtistSubmissionById(id: string) {
    const submission = await prisma.artistSubmission.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    return submission;
  }

  /**
   * Update artist submission status
   */
  async updateArtistSubmissionStatus(id: string, status: SubmissionStatus, reviewerId: string) {
    const submission = await prisma.artistSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    const updated = await prisma.artistSubmission.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete artist submission
   */
  async deleteArtistSubmission(id: string) {
    const submission = await prisma.artistSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    await prisma.artistSubmission.delete({
      where: { id },
    });

    return { message: 'Submission deleted successfully' };
  }

  /**
   * Get submission stats
   */
  async getStats() {
    const [contactTotal, contactNew, artistTotal, artistNew] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: SubmissionStatus.NEW } }),
      prisma.artistSubmission.count(),
      prisma.artistSubmission.count({ where: { status: SubmissionStatus.NEW } }),
    ]);

    return {
      contact: {
        total: contactTotal,
        new: contactNew,
      },
      artist: {
        total: artistTotal,
        new: artistNew,
      },
    };
  }
}
