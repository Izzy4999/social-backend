const express = require("express");
const router = express.Router()
const {Posts} = require('../models/postModel')

let gfs, GridFSBucket;

const upload = multer({ storage });

router.get("/", (req, res) => res.status(200).send("Hello TheWebDev"));

router.get("/images/single", (req, res) => {
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

  router.get('/posts',(req,res)=>{
    Posts.find((err,data)=>{
      if(err){
        return  res.status(500).send(err)
      }else{
        data.sort((b,a)=> a.timestamp - b.timestamp)
        res.status(201).send(data)
      }
    })
  })
  
  router.post("/upload/image", upload.single("file"), (req, res) => {
    res.status(201).send(req.file);
    console.log(`successful`);
  });

  router.post('/upload/post',(req,res)=>{
    const dbPost = req.body
    Posts.create(dbPost,(err,data)=>{
      if(err){
          return res.status(500).send(err)
      }else {
        return res.status(201).send(data)
      }
    })
  })
  
  module.exports = router;