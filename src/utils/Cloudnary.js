import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
// import { ApiResponse } from './ApiResponse';
import { ApiError } from './ApiError.js';




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});





const uploadOnCloudinary = async (localfilePath) => {

    try {
        if (!localfilePath) return null
        //  Upload the file to Cloudinary

        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto',
        })

        fs.unlinkSync(localfilePath) // remove the locally saved temporary file after successful upload

        // file has been uploaded on cloudinary successfully
        // console.log('file uploaded successfully:', response.url);
        return response

    }

    catch (error) {

        fs.unlinkSync(localfilePath) // remove the locally saved temporary file as the upload process got failed
        return null


    }



}



const destroyOnCloudinary = async (publicId) => {

    try {

        if (!publicId) return null


        const response = await cloudinary.uploader.destroy(publicId)
        console.log(response)

        return response





    }

    catch (error) {

   console.log(error)

    }


}




export { uploadOnCloudinary, destroyOnCloudinary }



