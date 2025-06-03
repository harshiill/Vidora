 import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

    
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
   } )
    
   const uploadOnCloudinary= async (localFilePath) => {
    try {
        if(!localFilePath) {
            throw new Error('No file path provided');
        }
        // upload file to Cloudinary
        const response=await cloudinary.uploader.upload(localFilePath ,{
            resource_type: 'auto',
        })
        //file uploaded successfully
        // console.log('File uploaded successfully',response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved tempary file as the upoad operation failed
        return null;
    }
   }

   const DeleteFromCloudinary = async(PublicId) => {
await cloudinary.uploader
  .destroy(PublicId,{
    resource_type: "image",
    
  })
  .then(result => console.log(result));
   }

   export { uploadOnCloudinary,DeleteFromCloudinary };
