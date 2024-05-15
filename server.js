//Crear servidor
const net = require('net');
const Server = net.createServer()
//Puppeteer para hacer la navegación
const puppeteer = require("puppeteer");
const randomUseragent = require("random-useragent");
const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const multer = require('multer');
const express = require("express");
const { Socket } = require("dgram");
const mime = require('mime-types');


const app = express();

// CORS permisos
const cors = require('cors');

app.use(cors()) //TODO el mundo puede ingresar Permiso



let remesaData = [];

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

////////////////////////////////////////////////////////////////////////////////////////////
// APP GET LISTEN
app.get("/remesa-data", (req, res) => {
  res.json(remesaData);
});

// Segunda Función // Extrae Los Datos Por Su Numero De Remesa El Cual Ingresa En La Función
const inputRemesaSolistica = async (browser, page, nRemesa, intentos = 0) => {
  if (intentos >= 3) {
    console.error("Se han agotado los intentos. La página no se ha cargado.");
    const data = {
      nRemesa,
    }; // agregado a un arreglo
    remesaData.push(data); //agregado remesaData

    return;
  }
  try {
    const header = randomUseragent.getRandom();
    await page.setUserAgent(header);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(
      "https://status.solistica.com/Status/consulta_remesa.aspx",
      { timeout: 3000 }
    );
    await page.waitForSelector("#vREMISION", { timeout: 1000 });
    // Código a ejecutar si la página se carga correctamente

    const remesaInput = await page.waitForSelector("#vREMISION", {
      timeout: 15000,
    });
    await page.evaluate(() => {
      document.querySelector("#vREMISION").value = ""; // Limpiar el campo de entrada antes de escribir
    });
    await new Promise((resolve) => setTimeout(resolve, 100)); // Retardo de 100 milisegundos

    console.log("NúmeroP2: ", nRemesa);
    await page.click("#vREMISION");

    await remesaInput.type(nRemesa.toString());

    await page.click("#IMAGE2"); // Click en el botón de buscar en la remesa
    await page.waitForSelector(".gx-tab-padding-fix-1", { timeout: 1000 });
    await page.waitForSelector("#TABLE23", { timeout: 1000 });

    // Extracción de datos de la página

    const objCiudad = await page.$("#span_vCIUNMBDST"); // Objeto Ciudad
    const getCiudad = await page.evaluate(
      (objCiudad) => objCiudad.innerText,
      objCiudad
    ); // Extraer el innerText
    const objDireccion = await page.$("#span_vRMSDSTDRC"); // Objeto Dirección
    const getDireccion = await page.evaluate(
      (objDireccion) => objDireccion.innerText,
      objDireccion
    ); // Extraer el innerText
    const objEstado = await page.$("#span_vESTADOPED"); // Objeto Estado
    const getEstado = await page.evaluate(
      (objEstado) => objEstado.innerText,
      objEstado
    ); // Extraer el innerText
    const objCajas = await page.$("#span_vRMSUNDTOT"); // Objeto Cajas
    const getCajas = await page.evaluate(
      (objCajas) => objCajas.innerText,
      objCajas
    );
    // Extraer el innerText
    const objFechaEntregada = await page.$("#span_vFECHAENT"); // Objeto Fecha Entregada
    const getFechaEntregada = await page.evaluate(
      (objFechaEntregada) => objFechaEntregada.innerText,
      objFechaEntregada
    ); // Extraer el innerText
    const objFechaAproxEntregada = await page.$("#span_vFECENTPROM"); // Objeto Fecha Aproximada Entregada
    const getFechaAproxEntregada = await page.evaluate(
      (objFechaAproxEntregada) => objFechaAproxEntregada.innerText,
      objFechaAproxEntregada
    ); // Extraer el innerText
    const objCausa = await page.$("#span_vCAUSA"); // Objeto Causa
    const getCausa = await page.evaluate(
      (objCausa) => objCausa.innerText,
      objCausa
    ); // Extraer el innerText
    const objNovedad = await page.$("#span_vRMSNOTA"); // Objeto Novedad
    const getNovedad = await page.evaluate(
      (objNovedad) => objNovedad.innerText,
      objNovedad
    ); // Extraer el innerText
    const objHora = await page.$("#span_vRMSHRENT"); // Objeto Hora
    const getHora = await page.evaluate(
      (objHora) => objHora.innerText,
      objHora
    ); // Extraer el innerText
    const objObservacion = await page.$("#span_vRMSOBV"); // Objeto Hora
    const getObservacion = await page.evaluate(
      (objObservacion) => objObservacion.innerText,
      objObservacion
    );

    console.log(
      "----->",
      nRemesa,
      " ",
      getCiudad,
      " ",
      getDireccion,
      " ",
      getEstado,
      " ",
      getCajas,
      " ",
      getFechaAproxEntregada,
      " ",
      getFechaEntregada,
      " ",
      getHora,
      " ",
      getCausa,
      " ",
      getNovedad,
      " ",
      getObservacion
    );

    const data = {
      nRemesa,
      getCiudad,
      getDireccion,
      getEstado,
      getCajas,
      getFechaAproxEntregada,
      getFechaEntregada,
      getHora,
      getCausa,
      getNovedad,
      getObservacion
    }; // agregado a un arreglo
    remesaData.push(data); //agregado remesaData
    console.log("La página se cargó correctamente.");
  } catch (error) {
    console.error("Error: La página no se cargó completamente.");
    intentos++;
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await inputRemesaSolistica(browser, page, nRemesa, intentos);
  }
};


// Primera Función // Leer el archivo de texto //Devuelve Un Array
/*
function busquedaSolis(filePath) {
  return new Promise((resolve, reject) => {
    // Patrón de búsqueda
    const pattern = /B\d{31}/g;

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject("Error al leer el archivo: " + err);
        return;
      }

      // Buscar coincidencias y extraer los últimos 12 dígitos
      const matches = data.match(pattern);
      const numerosExtraidos = matches.map((match) =>
        parseInt(match.substr(-12).trim())
      );

      resolve(numerosExtraidos);
    });
  });
}*/
// Segunda función
function busquedaSolis(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject("Error al leer el archivo: " + err);
        return;
      }

      // Dividir los datos en líneas y convertirlas a números únicos
      const lineas = data.trim().split('\n');
      const numerosUnicos = new Set();

      lineas.forEach(linea => {
        const numero = parseInt(linea);
        if (!isNaN(numero)) {
          numerosUnicos.add(numero);
        }
      });

      // Convertir el conjunto a un arreglo y luego a números
      const numeros = Array.from(numerosUnicos);

      resolve(numeros);
    });
  });
}

//GUARDAR ARCHIVO RECIBIDO
// Configuración de Multer para guardar los archivos en el directorio 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      const extension = mime.extension(file.mimetype);
      cb(null, file.fieldname + '.' + extension); 
      //cb(null, file.fieldname + '-' + Date.now() + '.' + extension); //archivo con un registro de time

      //ejecutar el script
      
  }
});

const upload = multer({ storage: storage });


// APP POST  GUARDAR ARCHIVO TXT
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('Archivo recibido y guardado correctamente.');
});

// APP POST EJECUTAR BUSQUEDASOLIS
app.post('/resumen', async (req, res) => {
  //vaciar el arreglo
  remesaData = [];
  try {
    const filePath = "./uploads/file.txt";
    //const filePath = req.body.filePath; // Asegúrate de obtener el valor correcto del cuerpo de la solicitud

    //llamado a la función  busquedaSolis(filePath)
    busquedaSolis(filePath)
      .then(async (result) => {
        console.log("Números extraídos:", result);

        const browser = await puppeteer.launch({
          executablePath:
            "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          headless: true, //False to hide(Esconder)
          ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage(); // Abrir pestaña

        for (let i = 0; i < result.length; i++) {
          await inputRemesaSolistica(browser, page, result[i]); //función ingresa un navegador una pagina y el array de numero de guias
        }
        await browser.close();
      })
      .catch((error) => {
        console.error(error);
      });

    const result = await busquedaSolis(filePath); // Llama a la función con el filePath

    // respuesta al cliente si es necesario
    res.status(200).json({ message: 'Búsqueda realizada correctamente Servidor', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la búsqueda Servidor' });
  }
});

//PUERTO DONDE ESTA CORRIENDO EL SERVIDOR
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });




