import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';




cloudinary.config({
    cloud_name: PROCESS.env.CLOUDINARY_CLOUD_NAME,
    api_key: PROCESS.env.CLOUDINARY_API_KEY,
    api_secret: PROCESS.env.CLOUDINARY_API_SECRET
});




const uploadOnCloudinary = async (localfilePath) => {

    try {
        if (!localfilePath) return null
        //  Upload the file to Cloudinary

        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto',
        })

        // file has been uploaded on cloudinary successfully
        console.log('file uploaded successfully:', response.url);
        return response

    }

    catch (error) {

        fs.unlinkSync(localfilePath) // remove the locally saved temporary file as the upload process got failed
        return null


    }



}










