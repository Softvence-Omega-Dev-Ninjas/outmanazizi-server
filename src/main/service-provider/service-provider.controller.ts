import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ServiceProviderBidDto } from './dto/service-provider-bid.dto';
import { storageConfig } from 'src/utils/common/file/fileUploads';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadDocumentsDto } from './dto/uploadDocuments.dto';

@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) { }

  @Post('create-service-provider')
  @UseGuards(AuthenticationGuard)
  async create(
    @Body() createServiceProviderDto: CreateServiceProviderDto,
    @Req() req: Request,
  ) {
    return await this.serviceProviderService.create(
      req['userid'] as string,
      createServiceProviderDto,
    );
  }
  @Get("current-service-provider")
  @UseGuards(AuthenticationGuard)
  async currentServiceProvider(@Req() req: Request) {
    return await this.serviceProviderService.currentServiceProvider(req['userid'] as string);
  }
  // patch document upload
  @Patch('upload-documents')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Upload service provider documents' })
  // upload documents in file formate
  @ApiBody({ type: UploadDocumentsDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('documents', 10, { storage: storageConfig() }),
  )
  async uploadDocuments(@Req() req: Request) {
    interface UploadedFile {
      filename: string;
      [key: string]: any;
    }

    interface CustomRequest extends Request {
      files?: UploadedFile[];
      userid?: string;
    }

    const documents =
      (req as CustomRequest)['files']
        ?.map(
          (f: UploadedFile) => `${process.env.DOMAIN}/uploads/${f.filename}`,
        )
        .toString() || '';
    return await this.serviceProviderService.uploadDocuments(
      req['userid'] as string,
      documents,
    );
  }
  @Get()
  @ApiOperation({ summary: 'Get all service providers' })
  async findAll() {
    return await this.serviceProviderService.findAll();
  }

  @Post('makes-bid/:id')
  @UseGuards(AuthenticationGuard)
  async makeBid(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: ServiceProviderBidDto,
  ) {
    return await this.serviceProviderService.makeBid(req['userid'] as string, id, body);
  }

  @Get('my-bids')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Get my bids' })
  @UseGuards(AuthenticationGuard)
  async myBids(@Req() req: Request) {
    return await this.serviceProviderService.myBids(req['userid'] as string);
  }

  @Patch('work-coplete/:serviceId')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Work Complete from service provider..' })
  async updateBid(@Param('serviceId') serviceId: string, @Req() req: Request) {
    return await this.serviceProviderService.workComplete(
      req['userid'] as string,
      serviceId,
    );
  }
  @Get('my-all-bids')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Get my all bids' })
  @UseGuards(AuthenticationGuard)
  async myAllBids(@Req() req: Request) {
    return await this.serviceProviderService.myAllBids(req['userid'] as string);
  }
  @Get('my-completed-bids')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({
    summary:
      'Get my completed bids also complete from service provider and consumer ',
  })
  @UseGuards(AuthenticationGuard)
  async myCompletedBids(@Req() req: Request) {
    return await this.serviceProviderService.myAcceptedBids(req['userid'] as string);
  }
}
