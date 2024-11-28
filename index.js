const express = require('express')

const bodyparser = require('body-parser')

const path = require('path')

const multer = require('multer')

const app=express()

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use(bodyparser.urlencoded({extended:false}))

app.use(bodyparser.json())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads")
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname+ "-"+ Date.now() + path.extname(file.originalname)
      );
    },
  });

  const upload = multer({storage:storage}).single('file')

app.set('view engine', "ejs")


app.get('/', (req, res)=>{
    res.render('index')
})


app.post('/uploadfile', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("File upload failed");
        } else {
            console.log(req.file.path);
            res.status(200).json({ path: req.file.path });
        }
    });
});


const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> {
    console.log("App is listning on PORT 5000")
}
)