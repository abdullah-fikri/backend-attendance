import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_ADDRESS'),
        pass: this.configService.get<string>('GOOGLE_APP_PASSWORD'),
      },
    });
  }

  private compileTemplate(templateName: string, context: any): string {
    const templatePath = path.join(
      __dirname,
      '../../common/templates/email',
      `${templateName}.hbs`,
    );
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);
    return template(context);
  }

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<boolean> {
    try {
      const html = this.compileTemplate(template, context);

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_ADDRESS'),
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }

  async sendAbsenceApprovedEmail(data: {
    email: string;
    userName: string;
    absenceType: string;
    startDate: string;
    endDate: string;
    duration: number;
    reason: string;
    remainingBalance: number;
  }): Promise<boolean> {
    return this.sendEmail(
      data.email,
      '✓ Your Absence Request Has Been Approved',
      'absence-approved',
      data,
    );
  }

  async sendAbsenceRejectedEmail(data: {
    email: string;
    userName: string;
    absenceType: string;
    startDate: string;
    endDate: string;
    duration: number;
    reason: string;
    rejectionReason?: string;
  }): Promise<boolean> {
    return this.sendEmail(
      data.email,
      '✗ Your Absence Request Has Been Rejected',
      'absence-rejected',
      data,
    );
  }
}
