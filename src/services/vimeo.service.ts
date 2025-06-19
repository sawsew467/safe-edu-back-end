// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import axios from 'axios';
// import { I18nService } from 'nestjs-i18n';
// import { ERRORS_DICTIONARY } from '../constraints/error-dictionary.constraint';
// import { ApiConfigService } from './api-config.service';

// @Injectable()
// export class VimeoService {
//   private readonly accessToken: string;
//   private readonly apiUrl: string;
//   constructor(
//     public configService: ApiConfigService,
//     private readonly i18n: I18nService,
//   ) {
//     const { accessTokenVimeo, apiUrlVimeo } = this.configService.vimeoConfig;
//     this.accessToken = accessTokenVimeo;
//     this.apiUrl = apiUrlVimeo;
//   }

//   async createUploadSession(fileSize: number) {
//     try {
//       const response = await axios.post(
//         `${this.apiUrl}/me/videos`,
//         {
//           upload: {
//             approach: 'tus',
//             size: `${fileSize}`,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.accessToken}`,
//             'Content-Type': 'application/json',
//             Accept: 'application/vnd.vimeo.*+json;version=3.4',
//           },
//         },
//       );

//       const upload = response.data;
//       return {
//         linkUpLoad: upload.upload.upload_link,
//         linkVideo: upload.uri,
//       };
//     } catch (error) {
//       throw new BadRequestException({
//         message: ERRORS_DICTIONARY.UPLOAD_VIDEO_FAIL,
//       });
//     }
//   }

//   async getVideoDetails(url: string): Promise<any> {
//     try {
//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${this.accessToken}`,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw new NotFoundException({
//         message: this.i18n.t('exceptions.video.NOT_FOUND_VIDEO'),
//       });
//     }
//   }

//   async delete(url: string): Promise<any> {
//     try {
//       const response = await axios.delete(url, {
//         headers: {
//           Authorization: `Bearer ${this.accessToken}`,
//         },
//       });

//       return response.status;
//     } catch (error) {
//       throw new NotFoundException({
//         message: this.i18n.t('exceptions.video.NOT_FOUND_VIDEO'),
//       });
//     }
//   }

//   async getVideoLength(url: string): Promise<any> {
//     try {
//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${this.accessToken}`,
//         },
//       });

//       // console.log(response.data);
//       return response.data.duration;
//     } catch (error) {
//       throw new NotFoundException({
//         message: this.i18n.t('exceptions.video.NOT_FOUND_VIDEO'),
//       });
//     }
//   }
// }
