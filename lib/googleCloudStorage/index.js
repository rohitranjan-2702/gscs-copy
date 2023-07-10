const { Storage } = require("@google-cloud/storage");

const getBucket = async () => {
  const storage = new Storage({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY),
    projectId: process.env.GCS_PROJECT_ID,
  });
  const bucket = await storage.bucket(process.env.GOOGLE_BUCKET_NAME);
  return bucket;
};

module.exports = {
  getBucket,
};
