require('dotenv').config();
const express = require('express');

const mongoose = require('mongoose');

const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const MongoClient = require('mongodb').MongoClient;

const multer = require('multer');
const bodyParser = require('body-parser');


const cors = require('cors');
const path = require('path');
const { rmSync } = require('fs');


const app = express();
const PORT = process.env.PORT || 3000;


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const mongoUrl = `${process.env.MONGODB_URI}/file_uploads`; // Add the database name in the URI

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('Failed to connect to MongoDB', err));



const fileSchema = new mongoose.Schema({
    fileContent: Buffer,
    contentType: String,
    fileName: String,
    metaData: Object
}, { collection: 'files' }); 


const UploadedFile = mongoose.model('UploadedFile', fileSchema);



app.use(bodyParser.urlencoded({ extended: true }));

// Specify the folder where your static files are located
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {


    res.sendFile(path.join(__dirname, 'public/index.html'));
});



app.post('/upload', upload.single('file'), (req, res) => {

    const file = req.file;
    const meta = req.body;


    const newFile = new UploadedFile({
        fileContent: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname,
        metaData: meta
    });



    newFile.save()
        .then(() => res.status(200).send("File uploaded successfully."))
        .catch(err => res.status(500).send("File upload failed."));

});



// Route to download a file by ID
app.get('/download/:id', async (req, res) => {
    
    try {

        const file = await UploadedFile.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }
        res.set({
            'Content-Type': file.contentType,
            'Content-Disposition': `attachment; filename="${file.fileName}"`
        });
        res.send(file.fileContent);
    } catch (error) {
        console.error('Error retrieving file:', error);
    }
});


// Route to get a list of files
app.get('/files', async (req, res) => {
    




    try {
        const files = await UploadedFile.find({}, 'fileName _id').lean();
        res.json(files);
    } catch (error) {
        console.error('Failed to retrieve files:', error);
        res.status(500).send('Error fetching file list');
    }




});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})



