//import { HfInference } from '@huggingface/inference'
//const hf = new HfInference('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')

const fs = require('fs');
const { HfInference } = require('@huggingface/inference');
const path = require('path');

const hf = new HfInference('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');


const imgPath = 'uploads/Notas-14.png';

async function extracNumberGuide() {
    try {
        if (!fs.existsSync(imgPath)) {
            console.error(`El archivo no existe en la ruta especificada: ${imgPath}`);
            return;
        }
        const imgBuffer = fs.readFileSync(imgPath);

        const result = await hf.documentQuestionAnswering({
            model: 'impira/layoutlm-document-qa',
            inputs: {
                question: '¿cual es el numero de Guía?', //¿cual es el contacto? - 
                image: await (await fetch('https://i.postimg.cc/DydphK6M/Prueba-Guia.png')).blob(),
            }
        })

        console.log(result);
    } catch (error) {
        console.error('Error al extraer texto de la imagen:', error);
    }

}

extracNumberGuide();





/*
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const poppler = require('pdf-poppler');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const path = require('path');
const os = require('os');

async function extractTextFromPDF(pdfPath) {
    try {
        if (!fs.existsSync(pdfPath)) {
            console.error(`El archivo no existe en la ruta especificada: ${pdfPath}`);
            return;
        }

        const absolutePdfPath = path.resolve(pdfPath);
        const pdfBuffer = fs.readFileSync(absolutePdfPath);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
            const options = {
                format: 'png',
                out_dir: path.dirname(absolutePdfPath),
                out_prefix: path.basename(absolutePdfPath, path.extname(absolutePdfPath)),
                page: i + 1
            };

            const imagePath = `${options.out_dir}/${options.out_prefix}-${i + 1}.png`;
            const tempImagePath = path.join(os.tmpdir(), `${options.out_prefix}-${i + 1}.png`);

            await poppler.convert(absolutePdfPath, options);

            // Verifica si la imagen fue generada correctamente
            if (!fs.existsSync(imagePath)) {
                console.error(`La imagen no se generó correctamente: ${imagePath}`);
                continue;
            }

            // Aumentar la resolución de la imagen y guardarla en un archivo temporal
            await sharp(imagePath)
                .resize({ width: 2000 }) // Ajusta el ancho según sea necesario
                .toFile(tempImagePath);

            Tesseract.recognize(
                tempImagePath,
                'eng',
                {
                    logger: m => console.log(m)
                }
            ).then(({ data: { text } }) => {
                console.log(`Texto de la página ${i + 1}:`, text);
            }).catch(err => {
                console.error(`Error al reconocer la página ${i + 1}:`, err);
            });
        }
    } catch (err) {
        console.error('Error al procesar el PDF:', err);
    }
}


extractTextFromPDF('uploads/Notas.pdf').catch(err => {
    console.error('Error en la función principal:', err);
});
*/

