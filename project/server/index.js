import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import AWS from 'aws-sdk';
import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize AWS Rekognition
AWS.config.update({ 
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const rekognition = new AWS.Rekognition();

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// API endpoint for identity verification
app.post('/api/verify-identity', async (req, res) => {
  try {
    const { selfie, idDocument, userId } = req.body;
    
    if (!selfie || !idDocument) {
      return res.status(400).json({ 
        status: 'rejected', 
        reason: 'Missing required images' 
      });
    }

    // 1. Extract face from ID document
    const idBuffer = Buffer.from(idDocument, 'base64');
    const detectResp = await rekognition.detectFaces({
      Image: { Bytes: idBuffer },
      Attributes: ['DEFAULT']
    }).promise();

    if (!detectResp.FaceDetails.length) {
      return res.json({ 
        status: 'rejected', 
        reason: 'No face detected in ID document' 
      });
    }

    // Extract the face from the ID document
    const box = detectResp.FaceDetails[0].BoundingBox;
    const img = await Jimp.read(idBuffer);
    const { width, height } = img.bitmap;
    const cropX = Math.floor(box.Left * width);
    const cropY = Math.floor(box.Top * height);
    const cropW = Math.floor(box.Width * width);
    const cropH = Math.floor(box.Height * height);
    img.crop(cropX, cropY, cropW, cropH);
    const faceBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);

    // 2. Compare ID face with selfie
    const selfieBuffer = Buffer.from(selfie, 'base64');
    const compareSelfie = await rekognition.compareFaces({
      SourceImage: { Bytes: faceBuffer },
      TargetImage: { Bytes: selfieBuffer },
      SimilarityThreshold: 80.0
    }).promise();

    if (!compareSelfie.FaceMatches.length) {
      return res.json({ 
        status: 'rejected', 
        reason: 'Selfie does not match ID document face', 
        similaritySelfie: 0 
      });
    }
    const selfieMatch = compareSelfie.FaceMatches[0].Similarity;

    // 3. Compare ID face with reference photo (optional)
    let dbMatch = 0;
    try {
      if (process.env.S3_BUCKET) {
        const compareRef = await rekognition.compareFaces({
          SourceImage: { Bytes: faceBuffer },
          TargetImage: { 
            S3Object: { 
              Bucket: process.env.S3_BUCKET, 
              Name: `references/${userId}.jpg` 
            } 
          },
          SimilarityThreshold: 80.0
        }).promise();
        
        if (compareRef.FaceMatches.length) {
          dbMatch = compareRef.FaceMatches[0].Similarity;
        }
      }
    } catch (err) {
      console.warn('Reference photo comparison failed:', err.message);
      // Continue without reference photo verification
    }

    // Determine verification result
    const verificationPassed = selfieMatch >= 90 && (dbMatch === 0 || dbMatch >= 80);
    
    return res.json({
      status: verificationPassed ? 'approved' : 'rejected',
      similaritySelfie: selfieMatch,
      similarityDB: dbMatch,
      reason: verificationPassed ? null : 'Insufficient match confidence'
    });
    
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ 
      status: 'error', 
      reason: 'Server error during verification',
      message: err.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔒 Identity verification server running on port ${PORT}`);
});