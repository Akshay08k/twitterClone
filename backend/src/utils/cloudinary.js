import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dbwt5yere",
  api_key: "394971689252886",
  api_secret: "gxFKwC6GovBmmTRt_Mpxgo8yU5g",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    // console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response.url;
  } catch (error) {
    console.log(error);

    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
