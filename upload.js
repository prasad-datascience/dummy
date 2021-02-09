require('dotenv').config()
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

function uploadToS3(file, name, type) {
  const s3bucket = new AWS.S3({
    accessKeyId:process.env.AWS_ACESS_KEY,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    Bucket:process.env.BUCKET_NAME
  });
  const params = {
    Bucket:process.env.BUCKET_NAME,
    Key: name,
    Body: file,
    ACL: 'public-read',
    ContentType: 'text/html',
  };
  s3bucket.upload(params, (err, data) => {
    if (err) throw err;
  });
}

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = `${dir}/${file}`;
    if (['.gitkeep', '.Trash-0', 'assets'].indexOf(file) === -1) {
      if (fs.statSync(filePath).isDirectory()) {
        getFiles(filePath, fileList);
      } else {
        const obj = {
          path: filePath,
          name: file,
          type: file.split('.')[1],
        }
        fileList.push(obj);
      }
    }
  });
  return fileList;
}

function uploadReport() {
  const reportsDir = path.join(__dirname, '.', 'reports');
  const report = getFiles(reportsDir, [])[0];
  fs.readFile(report.path, (err, data) => {
    if (err) {
      console.error('error', err)
    } else {
      console.info('Report Uploading...')
    }
    uploadToS3(data, report.name, report.type);
  });
}

module.exports = {
  uploadReport
}