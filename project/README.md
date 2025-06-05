

## Archivos de Modelos Requeridos

Para la detección facial, se necesitan los siguientes archivos de modelos de face-api.js en la carpeta `public/models`:

-   `tiny_face_detector_model-weights_manifest.json`
-   `tiny_face_detector_model-shard1`
-   `face_landmark_68_model-weights_manifest.json`
-   `face_landmark_68_model-shard1`



    ```bash
    npm install face-api.js lucide-react tesseract.js
    ```

3.  Asegurarse de que los archivos de modelos listados arriba estén en la carpeta `public/models`.

## Componentes Principales

### FaceLivenessDetector

El componente principal que maneja la detección facial y la captura de imágenes.

