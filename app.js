const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();




app.use(express.json());


// MongoDB connection

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))

.catch(err => console.log(err));



const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {

        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
});




const upload = multer({ storage: storage });


app.post('/upload', upload.single('file'), (req, res) => {


    res.send('File uploaded successfully');
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



