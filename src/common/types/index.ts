import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  PAST = 'PAST',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  SOLD_OUT = 'SOLD_OUT',
  ARCHIVED = 'ARCHIVED',
}

export enum SubmissionStatus {
  NEW = 'NEW',
  REVIEWED = 'REVIEWED',
  ARCHIVED = 'ARCHIVED',
}

export enum SubmissionType {
  GENERAL = 'GENERAL',
  ARTIST = 'ARTIST',
  DJ = 'DJ',
  DESIGNER = 'DESIGNER',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export enum MusicPlatform {
  SPOTIFY = 'SPOTIFY',
  APPLE_MUSIC = 'APPLE_MUSIC',
  SOUNDCLOUD = 'SOUNDCLOUD',
  YOUTUBE = 'YOUTUBE',
}

export enum SubscriptionSource {
  HOMEPAGE = 'HOMEPAGE',
  FOOTER = 'FOOTER',
  POPUP = 'POPUP',
  EVENT = 'EVENT',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}
