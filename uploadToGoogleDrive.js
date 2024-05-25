const {google} = require('googleapis')
require("dotenv").config();
const path = require('path')
const fs = require('fs')

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
)

oauth2Client.setCredentials({refresh_token: process.env.GOOGLE_REFRESH_TOKEN})

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

const filePath = path.join(__dirname, 'video.mp4')

async function uploadFile(){
    try{

        console.log(fs.createReadStream(filePath))

        const response = await drive.files.create({
            requestBody:{
                name: 'video.mp4',
                mimeType: 'video/mp4'
            },
            media:{
                mimeType: 'image/png',
                body: fs.createReadStream(filePath)
            }
        })

        console.log(response.data)
        const id = response.data.id
        generateURL(id)

    }catch(e){
        console.log(e)
    }
}


async function generateURL(id){
    try {
        const fileId = "1DDkzMOO-RNAbucCEz5XEWwe5DzarBWlj"
        await drive.permissions.create({
            fileId: fileId,
            requestBody:{
                role: 'reader',
                type: 'anyone'
            }
        })
        
        const result = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink, exportLinks, mimeType, thumbnailLink, videoMediaMetadata'
        })
        
        console.log(result.data)
    } catch (error) {
        console.log(error)
    }
}

// generateURL()
uploadFile()