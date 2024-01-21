const AWS = require('aws-sdk');
require('dotenv').config();

// Define your S3 bucket name and AWS credentials
const BUCKET_NAME = process.env.BUCKET_NAME;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

// Create a new instance of the AWS.S3 object with your AWS credentials
const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
});

const uploadToS3 = (data, fileName) => {
    // Define the parameters for the S3 upload operation
    const params = {
        Bucket: BUCKET_NAME,// The name of the bucket to upload to
        Key: fileName,//The name of the file to create on S3
        Body: data,// The data to upload
        ACL: 'public-read'//Sets the Access Control List to public read, making the file publicly accessible       
    };

    // Return a new promise that will be resolved or rejected based on the result of the S3 upload operation
    return new Promise((resolve, reject) => {
        //it needs to return promise otherwise js wont wait for file to be upload and moves forward because we wont be able to use await
        // Call the upload method of the S3 instance to upload the data to S3
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.error('Error uploading to S3:', err);
                reject(err);
            } else {
                console.log('Successfully uploaded to S3:', s3response);
                resolve(s3response.Location);
            }
        });
    });
};

module.exports = {
    uploadToS3
};
