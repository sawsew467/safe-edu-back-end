import {
	DeleteObjectCommand,
	GetObjectCommand,
	GetObjectCommandInput,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mime from 'mime-types';

import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import type { IFile } from '../interfaces/file.interface';
import { GeneratorProvider } from 'src/shared/helpers/generator.provider';
import { getKeyS3 } from 'src/shared/utils/get-key-s3.util';

import { GeneratorService } from './generator.service';
import * as archiver from 'archiver';
import { PassThrough } from 'stream';

@Injectable()
export class AwsS3Service implements OnModuleInit {
	private s3Client: S3Client;
	private bucketName: string;
	private bucketEndpoint: string;
	private expiresIn: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly generatorService: GeneratorService,
	) {
		this.expiresIn = 36_000;
	}

	onModuleInit() {
		// Get AWS S3 configurations from environment variables using ConfigService
		const accessKeyId = this.configService.get<string>('AWS_S3_ACCESS_KEY_ID');
		const secretAccessKey = this.configService.get<string>(
			'AWS_S3_SECRET_ACCESS_KEY',
		);

		const region = this.configService.get<string>('AWS_S3_BUCKET_REGION');
		this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
		this.bucketEndpoint = this.configService.get<string>(
			'AWS_S3_BUCKET_ENDPOINT',
		);

		this.s3Client = new S3Client({
			region: region,
			credentials: {
				accessKeyId: accessKeyId,
				secretAccessKey: secretAccessKey,
			},
		});
	}

	async uploadImage(file: IFile): Promise<string> {
		const extension = mime.extension(file.mimetype);

		if (!extension) {
			throw new Error(`Unsupported mimetype: ${file.mimetype}`);
		}

		const fileName = this.generatorService.fileName(<string>extension);
		const key = `images/${fileName}`;

		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Body: file.buffer,
					ContentType: file.mimetype,
					Key: key,
				}),
			);
		} catch (error) {
			console.error('Failed to upload image:', error);
			throw new Error(`Failed to upload image: ${error.message}`);
		}

		return `${this.bucketEndpoint}${key}`;
	}

	async uploadImageFromBuffer(buffer: Buffer, mimetype: string): Promise<string> {
		if (!buffer || !mimetype) {
			throw new Error('Buffer and mimetype are required');
		}

		const extension = mime.extension(mimetype);
		if (!extension || !['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
			throw new Error(`Unsupported image type: ${mimetype}`);
		}

		const fileName = this.generatorService.fileName(extension);
		const key = `images/${fileName}`;

		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Key: key,
					Body: buffer,
					ContentType: mimetype,
				}),
			);
		} catch (error) {
			console.error('Failed to upload buffer image:', error);
			throw new Error(`Failed to upload image: ${error.message}`);
		}

		return `${this.bucketEndpoint}${key}`;
	}

	async uploadDocument(file: IFile): Promise<string> {
		const extension = mime.extension(file.mimetype);

		if (!extension || !['pdf', 'doc', 'docx'].includes(extension)) {
			throw new Error(`Unsupported document type: ${file.mimetype}`);
		}

		const fileName = this.generatorService.fileName(extension);
		const key = `documents/${fileName}`;

		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Body: file.buffer,
					ContentType: file.mimetype,
					Key: key,
				}),
			);
		} catch (error) {
			console.error('Failed to upload document:', error);
			throw new Error(`Failed to upload document: ${error.message}`);
		}

		return `${this.bucketEndpoint}${key}`;
	}


	async deleteObject(key: string) {
		if (this.validateRemovedImage(key)) {
			await this.s3Client.send(
				new DeleteObjectCommand({
					Bucket: this.bucketName,
					Key: key,
				}),
			);
		}
	}

	async deleteObjects(keys: string[]) {
		const promiseDelete = keys.map((item) => {
			const oldKey = GeneratorProvider.getS3Key(item);

			if (oldKey && this.validateRemovedImage(oldKey)) {
				return this.s3Client.send(
					new DeleteObjectCommand({
						Bucket: this.bucketName,
						Key: oldKey,
					}),
				);
			}
		});

		await Promise.all(promiseDelete);
	}

	validateRemovedImage(key: string) {
		return !key.includes('templates/');
	}

	async uploadVideoFromPath(filePath: string): Promise<string> {
		if (!fs.existsSync(filePath)) {
			throw new Error('File does not exist on the server');
		}

		const extension = path.extname(filePath).slice(1).toLowerCase();
		if (!extension) {
			throw new Error('Invalid file extension');
		}

		const contentType = mime.lookup(extension) || 'application/octet-stream';

		const fileName = `videos/${Date.now()}-${path.basename(filePath)}`;
		const fileStream = fs.createReadStream(filePath);

		const uploader = new Upload({
			client: this.s3Client,
			params: {
				Bucket: this.bucketName,
				Key: fileName,
				Body: fileStream,
				ContentType: contentType,
				ACL: 'public-read',
			},
		});

		await uploader.done();

		return `${this.bucketEndpoint}${fileName}`;
	}

	async getVideoDownloadLink(urlS3: string, title: string): Promise<string> {
		const key = getKeyS3(urlS3);
		const params: GetObjectCommandInput = {
			Bucket: this.bucketName,
			Key: key,
			ResponseContentDisposition: `attachment; filename="${title}${path.extname(key)}"`,
		};

		const command = new GetObjectCommand(params);
		const url = await getSignedUrl(this.s3Client, command, {
			expiresIn: this.expiresIn,
		});

		return url;
	}
	getSignedUrl(key: string): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		return getSignedUrl(this.s3Client, command, {
			expiresIn: this.expiresIn,
		});
	}

	async downloadMultiFiles(urlS3: string[]) {
		const archive = archiver('zip', { zlib: { level: 5 } });
		const passthrough = new PassThrough();

		archive.on('error', (err) => {
			console.error('Archive error:', err);
			passthrough.destroy(err);
		});

		archive.pipe(passthrough);

		for (const url of urlS3) {
			const key = getKeyS3(url);
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			try {
				const response = await this.s3Client.send(command);

				if (response.Body) {
					const filename = path.basename(url);
					const partName = filename.split('-')[2];
					archive.append(response.Body as NodeJS.ReadableStream, {
						name: partName,
					});
				}
			} catch (error) {
				console.error(`Error fetching ${key} from S3`, error);
			}
		}

		archive.finalize();

		return passthrough;
	}
}
