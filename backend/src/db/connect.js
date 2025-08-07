import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const connInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(process.env.MONGODB_URI);

    console.log(
      "Mongo DB Connected.. -> DB Host: " + connInstance.connection.host
    );
  } catch (error) {
    console.log("Mongo DB Connection Failed..  " + error.message);
    process.exit(1);
  }
};

export default connectDB;
