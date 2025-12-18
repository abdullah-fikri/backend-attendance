import { Controller, Get, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('notification')
export class NotificationController {
    constructor( 
        private readonly notificationService: NotificationService,
    ) {}


  @Get()
  @Roles("ADMIN")
  @ResponseMessage('Get unread count successfully')
  async getUnreadCount(@Req() req: any) {
    return this.notificationService.getUnreadCount();
  }
}
