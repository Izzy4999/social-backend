const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const bodyParser = require("body-parser");
const path = require("path");
const Pusher = require("pusher");
const {Posts} = require('./models/postModel')

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
Grid.mongo = mongoose.mongo;
const app = express();

const connection_url = "mongodb+srv://root:ment200@cluster0.b9obx4a.mongodb.net/?retryWrites=true&w=majority";

const connection = mongoose.createConnection(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const pusher = new Pusher({
  appId: "1418924",
  key: "8227430c30457f315993",
  secret: "c71e4110a7cc2532b2df",
  cluster: "ap2",
  useTLS: true
 });
 

const port = process.env.PORT || 9000;

app.use(bodyParser.json());
app.use(cors(corsOptions));


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

mongoose.connection.once('open', () => {
     const changeStream = mongoose.connection.collection('posts').watch()
   changeStream.on('change', change => {
  console.log(change)
  if(change.operationType === "insert") {

        pusher.trigger('posts','inserted', {
       change: change
  })
  } else {
      console.log('Error trigerring Pusher')
  }
  })
 })

app.get("/", (req, res) => res.status(200).send("Hello TheWebDev"));
app.get("/images/single", (req, res) => {
  gfs.files.findOne({ filename: req.query.name }, (err, file) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!file || file.length === 0) {
        res.status(404).json({ err: "file not found" });
      } else {
        const readStream = gridfsBucket.openDownloadStreamByName(file.filename);
        readStream.pipe(res);
      }
    }
  });
});
app.get('/posts',(req,res)=>{
  Posts.find((err,data)=>{
    if(err){
      return  res.status(500).send(err)
    }else{
      data.sort((b,a)=> a.timestamp - b.timestamp)
      res.status(201).send(data)
    }
  })
})

app.post("/upload/image", upload.single("file"), (req, res) => {
  res.status(201).send(req.file);
  console.log(`successful`);
});
app.post('/upload/post',(req,res)=>{
  const dbPost = req.body
  Posts.create(dbPost,(err,data)=>{
    if(err){
        return res.status(500).send(err)
    }else {
      return res.status(201).send(data)
    }
  })
})

app.listen(port, () => console.log(`Listening on localhost: ${port}`));
