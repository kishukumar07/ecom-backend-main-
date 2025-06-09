import cloudinary from "../../config/cloudinaryConfig.js";
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath) => {
  try {
      if(!localFilePath) return null;
      const result = await cloudinary.uploader.upload(localFilePath , {
          resource_type: 'auto',
          folder:'giftginnie',
      });
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return result;
  } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return null;
  }
};

export default uploadOnCloudinary;