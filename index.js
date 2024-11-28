const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const path = require('path');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

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

io.on('connection', (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on('share-file', (fileData) => {
    socket.broadcast.emit('receive-file', fileData);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected", socket.id);
  });
});


const PORT = 3000;
server.listen(PORT, ()=> {
    console.log(`App is listning on PORT ${PORT}`)
}
)