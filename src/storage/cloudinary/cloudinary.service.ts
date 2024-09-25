import { MultipartFile } from "@fastify/multipart";
import { Injectable } from "@nestjs/common";
import { UploadApiResponse, v2 } from "cloudinary";

@Injectable()
export class CloudinaryService {
	async saveFileToStorage(
		file: MultipartFile,
		fileName: string,
		folderName: string,
	): Promise<UploadApiResponse> {
		//Load file buffer
		const fileBuffer = await file.toBuffer();

		//Upload file as buffer stream
		return await new Promise((resolve, reject) => {
			v2.uploader
				.upload_stream(
					{
						public_id: fileName,
						resource_type: "auto",
						folder: `Users/${folderName}`,
					},
					(error, result) => {
						if (error) {
							console.log(error);
							return reject(error);
						}
						return resolve(result);
					},
				)
				.end(fileBuffer);
		});
	}

	//Delete a file from the user folder
	async deleteFileFromStorage(
		public_id: string,
		resource_type: "raw" | "image",
	) {
		return await v2.uploader.destroy(
			public_id,
			{ resource_type: resource_type },
			(error, result) => {
				if (error) {
					console.log(error);
					return error;
				}

				console.log(result);

				return result;
			},
		);
	}

	//Delete multiple files from the user folder
	async deleteFilesFromStorage(
		public_ids: string[],
		resource_type: "raw" | "image",
	) {
		return await v2.api.delete_resources(
			public_ids,
			{ resource_type },
			(error, result) => {
				if (error) {
					console.log(error);
					return error;
				}

				return result;
			},
		);
	}

	//Delete multiple files from the user folder
	async deleteAllUserFilesFromStorage(
		folderName: string,
		resource_type: "raw" | "image",
	) {
		return await v2.api.delete_resources_by_prefix(
			`Users/${folderName}/`,
			{ resource_type: resource_type },
			(error, result) => {
				if (error) {
					console.log(error);
					return error;
				}

				return result;
			},
		);
	}

	//Delete User's Empty Folder
	async deleteUserFolderFromStorage(folderName: string) {
		return await v2.api.delete_folder(
			`Users/${folderName}`,
			(error: Error, result: any) => {
				if (error) {
					console.log(error);
					return error;
				}

				return result;
			},
		);
	}
}
