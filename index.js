require("dotenv").config();
const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const { getBucket } = require("./lib/googleCloudStorage");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const app = express();
const PORT = process.env.PORT || 5000;

app.post("/reel", upload.single("video"), async function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  const bucket = await getBucket();
  const file = bucket.file(
    req.file.fieldname + Date.now() + "-" + req.file.originalname
  );
  await streamifier.createReadStream(req.file.buffer).pipe(
    file.createWriteStream({
      resumable: false,
      gzip: true,
    })
  );
  const publicUrl = file.publicUrl();
  res.status(200).send({ error: null, result: publicUrl });
});

app.post("/images", upload.array("photos", 5), async function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  const allPublicUrls = [];
  for (const item of req.files) {
    const bucket = await getBucket();
    const file = bucket.file(
      item.fieldname + Date.now() + "-" + item.originalname
    );
    await streamifier.createReadStream(item.buffer).pipe(
      file.createWriteStream({
        resumable: false,
        gzip: true,
      })
    );
    const publicUrl = file.publicUrl();
    allPublicUrls.push(publicUrl);
  }
  res.status(200).send({ error: null, result: allPublicUrls });
});

app.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
