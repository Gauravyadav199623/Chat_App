// const multer = require('multer');
// const upload = multer({ storage: storage });

// app.post('/uploadImage', upload.single('image'), (req, res) => {
//     // Process the uploaded image and return the media URL
//     const imageUrl ="imageUrl" /* Process and get the URL */;
//     res.json({ mediaUrl: imageUrl });
// });
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
module.exports = {
  multer: upload
}
