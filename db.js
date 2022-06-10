const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const path = require("path");

Grid.mongo = mongoose.mongo;

const connection_url = "mongodb://localhost/social-app";



const connection = mongoose.createConnection(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let gfs, GridFSBucket;

connection.once("open", () => {
  console.log("DB Connected");
  gridfsBucket = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: "images",
  });
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("images");
});

const storage = new GridFsStorage({
  url: connection_url,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
      const fileInfo = {
        filename: filename,
        bucketName: "images",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

mongoose.connect(
  connection_url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log(`connected to ${connection_url}`);
  }
);
