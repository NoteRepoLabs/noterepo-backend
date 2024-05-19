import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(
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
            resource_type: 'auto',
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
  async deleteFile(fileName: string) {
    return await v2.uploader.destroy(fileName, (error, result) => {
      if (error) {
        console.log(error);
        return error;
      }

      return result;
    });
  }

  //Delete multiple files from the user folder
  async deleteFiles(public_ids: string[]) {
    return await v2.api.delete_resources(public_ids, (error, result) => {
      if (error) {
        console.log(error);
        return error;
      }

      return result;
    });
  }

  //Delete User's Empty Folder
  async deleteUserFolder(folderName: string) {
    return await v2.api.delete_folder(
      `Users/${folderName}`,
      (error: Error, result) => {
        if (error) {
          console.log(error);
          return error;
        }

        return result;
      },
    );
  }
}
