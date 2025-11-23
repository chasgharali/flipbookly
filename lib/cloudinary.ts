import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
    public_id?: string
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'flipbookly',
      resource_type: options.resource_type || 'auto',
      ...(options.public_id && { public_id: options.public_id }),
    }

    if (typeof file === 'string') {
      // Upload from URL
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve(result.secure_url)
        } else {
          reject(new Error('Upload failed: No result returned'))
        }
      })
    } else {
      // Upload from buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error)
          } else if (result) {
            resolve(result.secure_url)
          } else {
            reject(new Error('Upload failed: No result returned'))
          }
        }
      )

      uploadStream.end(file)
    }
  })
}

