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
const validateAWSConfig = () => {
  const requiredEnvVars = {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
  }

  // Validar formato de región
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
    'sa-east-1'
  ];

  if (!validRegions.includes(process.env.AWS_REGION)) {
    throw new Error(`Región AWS inválida: ${process.env.AWS_REGION}. Debe ser una de: ${validRegions.join(', ')}`);
  }
};

try {
  validateAWSConfig();
  console.log('✅ Configuración de AWS válida');
  console.log('Region:', process.env.AWS_REGION);
  console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Configurado' : 'No configurado');
  console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Configurado' : 'No configurado');

  AWS.config.update({ 
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
} catch (error) {
  console.error('❌ Error en la configuración de AWS:', error.message);
  process.exit(1);
}

const rekognition = new AWS.Rekognition();

const app = express();

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// Función para verificar la identidad
const verifyIdentity = async (data) => {
  try {
    console.log('Iniciando verificación de identidad...');
    const { selfie, idDocument } = data;

    if (!selfie || !idDocument) {
      console.log('Error: Imágenes faltantes');
      return {
        success: false,
        reason: 'Faltan las imágenes requeridas',
        details: {
          recommendations: [
            'Por favor, suba tanto la selfie como el documento de identidad',
            'Asegúrese de que las imágenes sean claras y legibles'
          ]
        }
      };
    }

    console.log('Procesando documento de identidad...');
    // Convertir base64 a Buffer
    const idBuffer = Buffer.from(idDocument, 'base64');
    const selfieBuffer = Buffer.from(selfie, 'base64');

    console.log('Tamaño del buffer del documento:', idBuffer.length);
    console.log('Tamaño del buffer de la selfie:', selfieBuffer.length);

    // 1. Verificar documento
    const detectFacesResponse = await rekognition.detectFaces({
      Image: { Bytes: idBuffer },
      Attributes: ['DEFAULT']
    }).promise();

    console.log('Respuesta de detección facial:', JSON.stringify(detectFacesResponse, null, 2));

    // Verificar si se detectó exactamente un rostro con alta confianza
    if (!detectFacesResponse.FaceDetails || 
        detectFacesResponse.FaceDetails.length !== 1 || 
        detectFacesResponse.FaceDetails[0].Confidence < 99) {
      console.log('No se detectó un rostro válido en el documento');
      return {
        success: false,
        reason: 'No se detectó un rostro válido en el documento. Por favor, intente nuevamente.',
        details: {
          imageType: 'documento',
          recommendations: [
            'Asegúrese de que el documento sea legible',
            'Mantenga el documento bien iluminado',
            'Evite reflejos y sombras',
            'Mantenga el documento centrado en la imagen'
          ]
        }
      };
    }

    // Verificar la calidad del rostro
    const faceQuality = detectFacesResponse.FaceDetails[0].Quality;
    console.log('📊 Métricas de calidad del documento:', {
      brightness: faceQuality.Brightness.toFixed(2),
      sharpness: faceQuality.Sharpness.toFixed(2),
      confidence: detectFacesResponse.FaceDetails[0].Confidence.toFixed(2)
    });

    // Reducir aún más los umbrales de calidad
    if (faceQuality.Brightness < 10 || faceQuality.Sharpness < 3) {
      console.log('⚠️ La calidad de la imagen del documento no es óptima');
      return {
        success: false,
        reason: 'La calidad de la imagen del documento no es óptima. Por favor, asegúrese de que la imagen esté bien iluminada y enfocada.',
        details: {
          imageType: 'documento',
          brightness: faceQuality.Brightness.toFixed(2),
          sharpness: faceQuality.Sharpness.toFixed(2),
          confidence: detectFacesResponse.FaceDetails[0].Confidence.toFixed(2),
          recommendations: [
            'Asegúrese de que haya buena iluminación',
            'Mantenga la cámara estable',
            'Evite reflejos y sombras en el rostro',
            'Mantenga el rostro centrado en la imagen'
          ]
        }
      };
    }

    // Verificar la pose del rostro
    const facePose = detectFacesResponse.FaceDetails[0].Pose;
    console.log('📊 Métricas de pose del documento:', {
      roll: facePose.Roll.toFixed(2),
      yaw: facePose.Yaw.toFixed(2),
      pitch: facePose.Pitch.toFixed(2)
    });

    // Aumentar la tolerancia de pose
    if (Math.abs(facePose.Roll) > 30 || Math.abs(facePose.Yaw) > 30 || Math.abs(facePose.Pitch) > 30) {
      console.log('⚠️ La pose del rostro en el documento no es adecuada');
      return {
        success: false,
        reason: 'La pose del rostro en el documento no es adecuada. Por favor, mantenga el rostro centrado y mirando al frente.',
        details: {
          imageType: 'documento',
          roll: facePose.Roll.toFixed(2),
          yaw: facePose.Yaw.toFixed(2),
          pitch: facePose.Pitch.toFixed(2),
          recommendations: [
            'Mire directamente a la cámara',
            'Mantenga el rostro nivelado',
            'Evite inclinar la cabeza',
            'Mantenga una distancia adecuada de la cámara'
          ]
        }
      };
    }

    // 2. Comparar con selfie
    console.log('📸 Comparando con selfie...');
    const compareFacesResponse = await rekognition.compareFaces({
      SourceImage: { Bytes: selfieBuffer },
      TargetImage: { Bytes: idBuffer },
      SimilarityThreshold: 70
    }).promise();

    // Verificar si hay coincidencias faciales
    if (!compareFacesResponse.FaceMatches || compareFacesResponse.FaceMatches.length === 0) {
      console.log('❌ No se encontraron coincidencias faciales');
      return {
        success: false,
        reason: 'No se pudo verificar la coincidencia facial',
        details: {
          imageType: 'ambas',
          recommendations: [
            'Asegúrese de que la selfie sea reciente y clara',
            'Mantenga una expresión facial neutral',
            'Evite usar accesorios que cubran el rostro',
            'Asegúrese de que la iluminación sea similar a la del documento',
            'Mantenga el rostro centrado y mirando al frente'
          ]
        }
      };
    }

    const similarity = compareFacesResponse.FaceMatches[0].Similarity;
    console.log(`✅ Porcentaje de coincidencia: ${similarity.toFixed(2)}%`);

    // Verificación más estricta para coincidencias
    if (similarity < 70) {
      console.log('❌ Similitud facial insuficiente');
      return {
        success: false,
        reason: 'La similitud facial no es suficiente para verificar tu identidad',
        details: {
          imageType: 'ambas',
          similarity: similarity.toFixed(2),
          recommendations: [
            'Asegúrese de que la selfie sea reciente y clara',
            'Mantenga una expresión facial neutral',
            'Evite usar accesorios que cubran el rostro',
            'Asegúrese de que la iluminación sea similar a la del documento',
            'Mantenga el rostro centrado y mirando al frente'
          ]
        }
      };
    }

    // Si llegamos aquí, la verificación fue exitosa
    return {
      success: true,
      reason: 'Verificación exitosa',
      details: {
        similarity: similarity.toFixed(2),
        recommendations: ['Tu identidad ha sido verificada correctamente']
      }
    };
  } catch (error) {
    console.error('Error en verificación:', error);
    return {
      success: false,
      reason: 'Error al procesar la verificación',
      details: {
        recommendations: [
          'Asegúrese de que las imágenes sean claras',
          'Verifique su conexión a internet',
          'Intente nuevamente en unos momentos'
        ]
      }
    };
  }
};

// API endpoint for identity verification
app.post('/api/verify-identity', async (req, res) => {
  try {
    const result = await verifyIdentity(req.body);
    console.log(result.success ? '✅ Verificación exitosa' : '❌ Verificación fallida:', result.reason);
    res.json(result);
  } catch (error) {
    console.error('Error en la ruta de verificación:', error);
    res.status(500).json({
      success: false,
      reason: 'Error interno del servidor',
      details: {
        recommendations: [
          'Por favor, intente nuevamente',
          'Si el problema persiste, contacte a soporte'
        ]
      }
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log('📝 Endpoints disponibles:');
  console.log(`   POST http://localhost:${PORT}/api/verify-identity`);
});