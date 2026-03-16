const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({

  storage,

  fileFilter: (req, file, cb) => {
 
    const allowedExt = /zip|png|jpg|jpeg|txt|pdf/;

    const allowedMime = /zip|png|jpg|jpeg|txt|pdf/;
 
    const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());

    const mimetype = allowedMime.test(file.mimetype);
 
    if (extname && mimetype) {

      return cb(null, true);

    } else {

      cb(new Error("File type not allowed"));

    }
 
  }

});
 

module.exports = upload;
