//Crear servidor
const net = require('net');
const Server = net.createServer();
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
//Manejar Excel
const XlsxPopulate = require("xlsx-populate");
// Middleware para manejar solicitudes JSON
app.use(express.json());
// CORS permisos
const cors = require('cors');
const { get } = require('http');
const { Console } = require('console');
app.use(cors()) //TODO el mundo puede ingresar Permiso
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
// PATH RUTA IMAGE AND FILE EXCEL OFFICE
let pathImg = 'C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\INVENTARIOTQ_Images';
let pathFileExel = 'C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\Información de Impresoras TQ.xlsx';
// PATH RUTA IMAGE AND FILE EXCEL HOSUSE
//let pathImg = 'C:\\Users\\Fabiandy\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\INVENTARIOTQ_Images';
//let pathFileExel = 'C:\\Users\\Fabiandy\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\Información de Impresoras TQ.xlsx';

// Middleware para servir archivos estáticos
// app.use('/INVENTARIOTQ_Images', express.static(path.join(__dirname, 'INVENTARIOTQ_Images')));
// app.use('/Registro Movimientos_Images', express.static(path.join(__dirname, 'Registro Movimientos_Images')));
app.use('/INVENTARIOTQ_Images', express.static(pathImg));
// app.use('/Registro Movimientos_Images', express.static(path.join(__dirname, 'C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\Registro Movimientos_Images')));
//app.use('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\Registro Movimientos_Images', express.static('Registro Movimientos_Images'));


let remesaData = [];


let fechaProcessRemesa = "";
let pass = "CarvajalPrint1";


////////////////////////////////////////////////////////////////////////////////////////////
//Función Obtener Fecha y Hora
function obtenerFechaYHora() {
  let fecha = new Date();
  let fechaFormateada = fecha.toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' });
  let hora = fecha.getHours();
  let minutos = fecha.getMinutes();
  let segundos = fecha.getSeconds();
  let ampm = hora >= 12 ? 'PM' : 'AM';
  hora = (hora % 12) || 12;
  let horaFormateada = `${hora}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')} ${ampm}`;
  return `${fechaFormateada} ${horaFormateada}`;
}

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

    //const getURL = req.protocol + '://' + req.get('host') + req.originalUrl; 
    const getURL = await page.url();

    fechaProcessRemesa = obtenerFechaYHora();

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
      getObservacion,
      " ",
      fechaProcessRemesa,
      " ",
      getURL
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
      getObservacion,
      fechaProcessRemesa,
      getURL
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

// FUNCIÓN CONFIG DENSIDAD
const configDensidad = async (ip, modelo, densidad) => {
  if (modelo == "MFP E62555" || "MFP E62655" || "Laser E60155" || "Color MFP E67550" || "Color MFP E67650") {
    //Navegador
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: false,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");

      await page.goto(
        "https://" + ip + "/hp/device/PrintQuality/Index",
        { timeout: 15000 }
      );

      const selectorExiste = await page.$("#errorPage"); //Validación

      console.log(selectorExiste);

      if (selectorExiste) {
        await page.goto(
          "https://" + ip + "/hp/device/DefaultPrintOptions/Index", // firmawre 5.7.12
          { timeout: 15000 }
        );
      }

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click
      await page.click("#PasswordTextBox");
      await ipInput.type(pass.toString());
      await page.click("#signInOk");
      await page.waitForSelector("#menuTabs", { timeout: 15000 });

      //OBTENER DENSIDAD
      // Encuentra el elemento <select> por su ID  

      await page.waitForTimeout(3000);

      const selectElement = await page.$('#TonerDensityBlack');
      // Obtiene el valor seleccionado
      const selectedValue = await selectElement.evaluate(el => el.value);
      console.log(`El número seleccionado es: ${selectedValue}`);
      //FIN OBTENER DENSIDAD

      //DAR UN VALOR DENSIDAD
      let densidadAjustar = "1"
      //CASE

      switch (densidad) {
        case "0":
          densidadAjustar = "1";
          break;
        case "25":
          densidadAjustar = "2";
          break;
        case "50":
          densidadAjustar = "3";
          break;
        case "75":
          densidadAjustar = "4";
          break;
        default:
          densidadAjustar = "5";
          break;
      }

      await selectElement.select(densidadAjustar);

      await page.waitForTimeout(2000);
      await page.click("#FormButtonSubmit");
      console.log('Valor establecido y aplicado correctamente.');
      //FIN DAR UN VALOR DENSIDAD

      console.log("La página se cargó correctamente.");
      await browser.close();
      return "Configuración de densidad exitosa";

    } catch (error) {
      console.error("Error la pagina no se cargo correctamente. " + error.message);
      await browser.close();
      return "Error al configurar la densidad";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};

// FUNCIÓN CONFIG INFO
const configInfo = async (ip, modelo, namePrint, printLocation) => {
  if (modelo == "MFP E62555" || "MFP E62655" || "Laser E60155" || "Color MFP E67550" || "Color MFP E67650") {
    //Navegador
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: true,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");
      await page.goto(
        "https://" + ip + "/hp/device/DeviceInformation/Index",
        { timeout: 20000 }
      );

      //validar espera

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click
      let nombreEmpresa = "Tecnoquimicas S.A";
      let personContac = "1800 Opc 1";

      await page.waitForSelector("#content", { timeout: 2000 });
      await page.click("#PasswordTextBox");
      await ipInput.type(pass.toString());
      await page.click("#signInOk");
      await page.waitForSelector("#menuTabs", { timeout: 2000 });


      await page.click("#DeviceName");
      // Selecciona el elemento de entrada
      const inputElement = await page.$('#DeviceName');
      // Borra el valor actual (si lo hay)
      await inputElement.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement.press('Backspace'); // Borra el texto
      await page.type('#DeviceName', namePrint.toString());

      await page.click("#DeviceLocation");
      const inputElement1 = await page.$('#DeviceLocation');
      await inputElement1.click({ clickCount: 3 });
      await inputElement1.press('Backspace');
      await page.type('#DeviceLocation', printLocation.toString());

      //Extrar el numero de serie
      const element = await page.$('#DeviceSerialNumber');
      // Obtiene el valor seleccionado

      const textContent = await element.getProperty('textContent');
      const serialNumber = await textContent.jsonValue();


      await page.click("#AssetNumber");
      const inputElement2 = await page.$('#AssetNumber');
      await inputElement2.click({ clickCount: 3 });
      await inputElement2.press('Backspace');
      await page.type('#AssetNumber', serialNumber.toString());

      await page.click("#CompanyName");
      const inputElement3 = await page.$('#CompanyName');
      await inputElement3.click({ clickCount: 3 });
      await inputElement3.press('Backspace');
      await page.type('#CompanyName', nombreEmpresa.toString());

      await page.click("#ContactPerson");
      const inputElement4 = await page.$('#ContactPerson');
      await inputElement4.click({ clickCount: 3 });
      await inputElement4.press('Backspace');
      await page.type('#ContactPerson', personContac.toString());

      //Guardar
      await page.click("#FormButtonSubmit");

      console.log("La página se cargó correctamente.");
      await browser.close();
      return "Información Actualizada";

    } catch (error) {
      console.error("Error la pagina no se cargo correctamente. " + error.message);
      await browser.close();
      return "Error al configurar información";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};

// FUNCIÓN CONFIG INFO
const configCredenciales = async (ip, modelo) => {
  if (modelo == "MFP E62555" || "MFP E62655" || "Laser E60155" || "Color MFP E67550" || "Color MFP E67650") {
    //Navegador
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: false,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");
      await page.goto(
        "https://" + ip + "/hp/device/SignIn/Index",
        //172.22.255.66/hp/device/GeneralSecurity/Index -> Pendiente calidar y colocar nueva URL
        { timeout: 20000 }
      );

      //validar espera

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click

      //CONFIGURAR CREDENCIALES
      await page.click("#signInOk");
      await page.waitForSelector("#menuTabs", { timeout: 1000 });

      await page.click("#SecurityPages"); // seguridad
      await page.waitForSelector("#content", { timeout: 1000 });
      await page.click("#newPassword");
      await page.type('#newPassword', pass.toString());
      await page.click("#verifyPassword");
      await page.type('#verifyPassword', pass.toString());
      await page.click("#FormButtonSubmit");
      //FIN CONFIGURAR CREDENCIALES

      console.log("La página se cargó correctamente.");
      await browser.close();
      return "Configuración de credenciales exitosa";

    } catch (error) {
      console.error("Error al configurar credenciales. " + error.message);
      await browser.close();
      return "Error al configurar credenciales";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};

// FUNCIÓN CONFIG  CORREO
const configCorreo = async (ip, modelo) => {
  if (modelo == "MFP E62555" || "MFP E62655" || "Laser E60155" || "Color MFP E67550" || "Color MFP E67650") {
    //Navegador
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: false,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");
      await page.goto(
        "https://" + ip + "/hp/device/SignIn/Index",
        //172.22.255.66/hp/device/BasicSend/Index -> VALIDAR PARA AGREGAR DIRECCIÓN
        { timeout: 20000 }
      );

      //validar espera

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click
      await page.click("#PasswordTextBox");
      await ipInput.type(pass.toString());
      await page.click("#signInOk");
      await page.waitForSelector("#menuTabs", { timeout: 2000 });
      await page.click("#SendPages");

      let servidor = 'mailer.tecnoquimicas.com';
      let mail = 'soporteimpresion@tecnoquimicas.com';
      let nameprede = 'Soporte impresión';
      let asunto = 'Documento Digitalizado';

      await page.waitForSelector("#FormButtonAddSmtpServer", { timeout: 3000 });
      const checkbox = await page.$('#EmailEnabled');
      //await checkbox.click();
      const isChecked = await page.evaluate(el => el.checked, checkbox);

      if (isChecked) {

      } else {
        await checkbox.click();
      }
      console.log('¿El checkbox está activado?', isChecked);

      await page.waitForTimeout(1500);
      await page.click("#FormButtonAddSmtpServer");

      await page.waitForSelector("#SmtpServerName", { timeout: 3000 });
      await page.click("#SmtpServerName");
      // Selecciona el elemento de entrada
      const inputElement = await page.$('#SmtpServerName');
      // Borra el valor actual (si lo hay)
      await inputElement.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement.press('Backspace'); // Borra el texto
      await page.waitForTimeout(1500);
      await page.type('#SmtpServerName', servidor.toString(), { timeout: 3000 });
      await page.click('#FormButtonFinish');

      await page.waitForSelector("#EmailFromAddress", { timeout: 3000 });
      await page.click('#EmailFromAddress');

      const inputElement1 = await page.$('#EmailFromAddress');
      // Borra el valor actual (si lo hay)
      await inputElement1.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement1.press('Backspace'); // Borra el texto
      await page.waitForTimeout(1500);
      await page.type('#EmailFromAddress', mail.toString(), { timeout: 3000 });

      await page.click('#EmailFromDisplayName');
      const inputElement2 = await page.$('#EmailFromDisplayName');
      await inputElement2.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement2.press('Backspace'); // Borra el texto
      await page.type('#EmailFromDisplayName', nameprede.toString(), { timeout: 3000 });

      await page.click('#EmailSubject');
      const inputElement3 = await page.$('#EmailSubject');
      await inputElement3.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement3.press('Backspace'); // Borra el texto
      await page.type('#EmailSubject', asunto.toString(), { timeout: 3000 });

      //Aplicar
      await page.click('#FormButtonSubmit');
      await page.waitForTimeout(3000);

      //FIN CONFIG CORREO
      console.log("La página se cargó correctamente.");
      await browser.close();
      return "Configuración email exitosa";

    } catch (error) {
      console.error("Error la pagina no se cargo correctamente. " + error.message);
      await browser.close();
      return "Error al configurar email";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};

// FUNCIÓN CONFIG  CONTACTOS  -> SEGUIR VERIFANDO POR QUE NO DA CLICK EN EL CHECK BOX (class="checked")
const configContactos = async (ip, modelo) => {
  if (modelo == "MFP E62555" || "MFP E62655" || "Laser E60155" || "Color MFP E67550" || "Color MFP E67650") {
    //Navegador
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: false,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");
      await page.goto(
        "https://" + ip + "/hp/device/SignIn/Index",
        { timeout: 20000 }
      );

      //validar espera

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click
      await page.click("#PasswordTextBox");
      await ipInput.type(pass.toString());
      await page.click("#signInOk");
      await page.waitForSelector("#menuTabs", { timeout: 2000 });
      await page.click("#SendPages");
      await page.waitForSelector("#AddressBook", { timeout: 3000 });
      await page.click("#AddressBook");
      await page.waitForTimeout(2000);
      await page.waitForSelector("#SeachMethod_0", { timeout: 3000 });
      await page.click("#SeachMethod_0");

      let ipServidor = '172.22.4.100';
      let nameUser = 'CN=Impresion Carvajal,OU=Cuentas Servicio,DC=tecnoquimicas,DC=com';
      let passELDAP = 'Tl3Jz7afWVcE8fWJ5ssaJHx8rNo';
      let rutaBaseDN = 'DC=tecnoquimicas,DC=com';
      let destinatario = 'sAMAccountName';
      let mail = 'mail';
      let fax = 'facsimileTelephoneNumber';
      document.querySelector

      await page.waitForSelector("#LdapServerCheckBox", { timeout: 3000 });
      const checkbox = await page.$('#LdapServerCheckBox');
      //await checkbox.click();
      const isChecked = await page.evaluate(el => el.checked, checkbox);
      //await page.waitForTimeout(2000);
      if (isChecked) {
        // await page.click('#LdapServerCheckBox');

      } else {
        const label = document.querySelector('label[for="LdapServerCheckBox"]');
        label.classList.add('checked');

        const div = document.querySelector('#ready_ldap_servers');
        div.classList.add('group-under-check');
        div.style = ''; // Limpiar el estilo existente
      }

      console.log('¿El checkbox está activado?', isChecked);
      // HAY QUE VALIDAR SI YA ESTA ACTIVADA LO MAS POSIBLE ES QUE YA TENGA CONFIGURADA SERIA ACTUALIZAR

      await page.waitForSelector("#ready_ldap_servers", { timeout: 4000 });
      await page.click("#FormLdapAdd");
      await page.waitForTimeout(1500);
      console.log("hace click en añadir servidor ELDAP");

      await page.waitForSelector("#LdapServerAddressText", { timeout: 3000 });
      await page.click("#LdapServerAddressText");

      // Selecciona el elemento de entrada
      const inputElement = await page.$('#LdapServerAddressText');
      // Borra el valor actual (si lo hay)
      await inputElement.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement.press('Backspace'); // Borra el texto
      await page.waitForTimeout(1500);
      await page.type('#LdapServerAddressText', ipServidor.toString(), { timeout: 3000 });
      await page.waitForSelector("#authentication_1", { timeout: 3000 });
      await page.click('#authentication_1');

      await page.waitForSelector("#requiredAuth", { timeout: 3000 });
      const selectElement = await page.$('#credential_option');
      await selectElement.select("3"); // selecciona credenciales sencillas
      await page.waitForSelector("#SimpleUserNameText", { timeout: 3000 });
      await page.click("#SimpleUserNameText");
      const inputElement1 = await page.$('#SimpleUserNameText');
      await inputElement1.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement1.press('Backspace'); // Borra el texto
      await page.type('#SimpleUserNameText', nameUser.toString(), { timeout: 3000 });

      await page.click("#SimplePasswordText");
      const inputElement2 = await page.$('#SimplePasswordText');
      await inputElement2.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement2.press('Backspace'); // Borra el texto
      await page.type('#SimplePasswordText', passELDAP.toString(), { timeout: 3000 });

      await page.click("#searchRoot");
      const inputElement3 = await page.$('#searchRoot');
      await inputElement3.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement3.press('Backspace'); // Borra el texto
      await page.type('#searchRoot', rutaBaseDN.toString(), { timeout: 3000 });

      await page.click("#AttributesRadioList_2");

      await page.click("#SearchNameAttributeText");
      const inputElement4 = await page.$('#SearchNameAttributeText');
      await inputElement4.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement4.press('Backspace'); // Borra el texto
      await page.type('#SearchNameAttributeText', destinatario.toString(), { timeout: 3000 });

      await page.click("#SearchEmailAttribueText");
      const inputElement5 = await page.$('#SearchEmailAttribueText');
      await inputElement5.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement5.press('Backspace'); // Borra el texto
      await page.type('#SearchEmailAttribueText', mail.toString(), { timeout: 3000 });

      await page.click("#SearchFaxAttributeText");
      const inputElement6 = await page.$('#SearchFaxAttributeText');
      await inputElement6.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement6.press('Backspace'); // Borra el texto
      await page.type('#SearchFaxAttributeText', fax.toString(), { timeout: 3000 });

      await page.waitForTimeout(1500);

      //Aplicar
      await page.click('#FormButtonSubmit');
      await page.waitForTimeout(3000);
      //Aplicar
      await page.click('#FormButtonSubmit');
      await page.waitForTimeout(3000);

      //FIN CONFIG CORREO
      console.log("La página se cargó correctamente.");
      //await browser.close();
      return "Configuración contactos exitosa";

    } catch (error) {
      console.error("Error la pagina no se cargo correctamente. " + error.message);
      //await browser.close();
      return "Error al configurar contactos";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};

// FUNCIÓN CONFIG  RED IPV4  
const configRed = async (ip, modelo) => {
  if (modelo == "MFP E62555" || "MFP E62655" || "Laser E60155" || "Color MFP E67550" || "Color MFP E67650") {
    //Navegador
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: false,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");
      await page.goto(
        "https://" + ip + "/network_id.htm",
        { timeout: 20000 }
      );

      //validar espera

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click
      await page.click("#PasswordTextBox");
      await ipInput.type(pass.toString());
      await page.click("#signInOk");
      await page.waitForSelector("#content", { timeout: 2000 });
      //Hasta aqui ingresa en modo administrador a la impresora

      //Extrar el nombre de la impresora
      const element = await page.$('#HomeDeviceName');
      // Obtiene el valor seleccionado del nombre de la impresora y la coloca en host
      const textContent = await element.getProperty('textContent');
      const nombreImpresora = await textContent.jsonValue();
      await page.click("#IPv4_HostName");
      const inputEleme = await page.$('#IPv4_HostName');
      await inputEleme.click({ clickCount: 3 });
      await inputEleme.press('Backspace');
      await page.type('#IPv4_HostName', nombreImpresora.toString());

      let nameDominio = 'tecnoquimicas.com';
      let dnsPrimarioV4 = '172.22.4.100';
      let dnsSecundarioV4 = '172.22.4.73';

      const inputEleme1 = await page.$('#IPv4_DomainName');
      await page.click("#IPv4_DomainName");
      await page.waitForTimeout(1500);
      await inputEleme1.click({ clickCount: 3 });
      await inputEleme1.press('Backspace');
      await page.type('#IPv4_DomainName', nameDominio.toString(), { timeout: 3000 });

      const inputEleme2 = await page.$('#IPv4_DnsServerId');
      await page.click("#IPv4_DnsServerId");
      await page.waitForTimeout(1500);
      await inputEleme2.click({ clickCount: 3 });
      await inputEleme2.press('Backspace');
      await page.type('#IPv4_DnsServerId', dnsPrimarioV4.toString(), { timeout: 3000 });

      const inputEleme3 = await page.$('#IPv4_Sec_DnsServerId');
      await page.click("#IPv4_Sec_DnsServerId");
      await page.waitForTimeout(1500);
      await inputEleme3.click({ clickCount: 3 });
      await inputEleme3.press('Backspace');
      await page.type('#IPv4_Sec_DnsServerId', dnsSecundarioV4.toString(), { timeout: 3000 });

      await page.waitForTimeout(1500);

      //Aplicar
      await page.click('#Apply');
      await page.waitForTimeout(3000);

      //FIN CONFIG RED
      console.log("La página se cargó correctamente.");
      //await browser.close();
      return "Configuración RED exitosa";

    } catch (error) {
      console.error("Error la pagina no se cargo correctamente. " + error.message);
      //await browser.close();
      return "Error al configurar RED";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};

// FUNCIÓN CONFIG SNMP RED IPV4  
const configRedSNMP = async (ip, modelo) => {
  if (modelo == "MFP E62555" || "MFP E62655" || "Laser E60155" || "Color MFP E67550" || "Color MFP E67650") {
    //Navegador
    let pssSNMP = 'tqprint';
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: false,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");
      await page.goto(
        "https://" + ip + "/snmp_creds.html",
        { timeout: 20000 }
      );

      //validar espera

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click
      await page.click("#PasswordTextBox");
      await ipInput.type(pass.toString());
      await page.click("#signInOk");

      await page.waitForSelector("#content", { timeout: 2000 });
      //Hasta aqui ingresa en modo administrador a la impresora

      //Dar click en "Habilitar acceso SNMPv1/v2 de lectura/escritura"
      await page.click('#snmpv1RW');



      const element = await page.$('#HomeDeviceName');

      // Obtiene el valor seleccionado del nombre de la impresora y la coloca en host

      await page.click("#setcomm");
      const inputEleme = await page.$('#setcomm');
      await inputEleme.click({ clickCount: 3 });
      await inputEleme.press('Backspace');
      await page.type('#setcomm', pssSNMP.toString(), { timeout: 3000 });

      await page.click("#confsetcomm");
      const inputEleme1 = await page.$('#confsetcomm');
      await inputEleme1.click({ clickCount: 3 });
      await inputEleme1.press('Backspace');
      await page.type('#confsetcomm', pssSNMP.toString(), { timeout: 3000 });

      await page.click("#getcomm");
      const inputEleme2 = await page.$('#getcomm');
      await inputEleme2.click({ clickCount: 3 });
      await inputEleme2.press('Backspace');
      await page.type('#getcomm', pssSNMP.toString(), { timeout: 3000 });

      await page.click("#confgetcomm");
      const inputEleme3 = await page.$('#confgetcomm');
      await inputEleme3.click({ clickCount: 3 });
      await inputEleme3.press('Backspace');
      await page.type('#confgetcomm', pssSNMP.toString(), { timeout: 3000 });

      //Verificar si el cheklist esta habilitado
      const checkbox = await page.$('#dispublic');

      const isChecked = await page.evaluate(el => el.checked, checkbox);

      if (isChecked) {
        // await page.click('#LdapServerCheckBox');
      } else {
        const label = document.querySelector('label[for="dispublic"]');
        label.classList.add('checked');
      }

      console.log('¿El checkbox está activado?', isChecked);

      await page.waitForTimeout(1500);



      //Aplicar
      await page.click('#Apply');
      await page.waitForTimeout(3000);

      //FIN CONFIG RED
      console.log("La página se cargó correctamente.");
      //await browser.close();
      return "Configuración RED SNMP exitosa";

    } catch (error) {
      console.error("Error la pagina no se cargo correctamente. " + error.message);
      //await browser.close();
      return "Error al configurar RED SNMP";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};

// FUNCIÓN IMPRIMIR DOCUMENTOS  EN IMPRESORA 
const printDocumentos = async (ip, modelo, acta, copias) => {

  if ("1" == "1") { // Despues validar el modelo de la impresora
    //Navegador
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: true,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    try {
      const header = randomUseragent.getRandom();
      await page.setUserAgent(header);
      await page.setViewport({ width: 1920, height: 1080 });
      console.log("Crea la ventana");
      await page.goto(
        "https://" + ip + "/hp/device/Print/Index",
        { timeout: 20000 }
      );

      //validar espera

      const ipInput = await page.waitForSelector("#PasswordTextBox", {
        timeout: 15000,
      });

      //click
      await page.click("#PasswordTextBox");
      await ipInput.type(pass.toString());
      await page.click("#signInOk");
      await page.waitForSelector("#content", { timeout: 2000 });
      //Hasta aqui ingresa en modo administrador a la impresora

      //validar espera
      const inputFile = await page.waitForSelector("#fileUploadFields", {
        timeout: 15000,
      });

      //PAGINA PRINCIPAL DE IMRPESIÓN
      const fileInput = await page.$('input[type="file"]'); // Selecciona el input de tipo file

      switch (acta) {
        case 'Instalacion':
          fileInput.uploadFile('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\4. App Actas\\Formatos\\Acta Instalación - Retiros.pdf'); // Ruta del acta instalación

          break;
        case 'Mantenimiento':
          fileInput.uploadFile('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\4. App Actas\\Formatos\\Acta de Mantenimiento Preventivo o Correctivo.pdf'); // Ruta del acta mantenimiento
          break;
        case 'Suministro':
          fileInput.uploadFile('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\4. App Actas\\Formatos\\Acta de Entrega de Suministros.pdf'); // Ruta del acta de entrega
          break;
        case 'SalidaVarias':
          fileInput.uploadFile('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\4. App Actas\\Formatos\\Autorización salidas varias.pdf'); // Ruta del acta de entrega
          break;
        default:
          console.log("Entro por defecto en el Breack");
          break;
      }

      await page.click("#NumberOfCopies");
      // Selecciona el elemento de entrada
      const inputElement = await page.$('#NumberOfCopies');
      // Borra el valor actual (si lo hay)
      await inputElement.click({ clickCount: 3 }); // Selecciona todo el texto
      await inputElement.press('Backspace'); // Borra el texto
      await page.type('#NumberOfCopies', copias.toString());


      //Imprimir
      try {
        await page.click('#FormButtonSubmit');
        console.log("tiene versión anterior a la 5.7.1 firmaware");
      } catch (error) {
        await page.click('#FormButtonPrint');
        console.log("tiene versión 5.7.1 firmaware");
      }

      // Esperar a que aparezca el mensaje de éxito (o un tiempo límite)
      try {
        await page.waitForSelector('#Summary.message-success', { timeout: 10000 }); // Espera hasta 5 segundos por el mensaje de éxito
        // Verifica si el mensaje específico aparece
        const successMessage = await page.$eval('#Summary .content h2', el => el.textContent);

        if (successMessage.includes("La operación ha finalizado correctamente.")) {
          //console.log("Impresión exitosa: Documento enviado correctamente.");
          return "Impresión exitosa: Documento enviado correctamente.";
        } else {
          //console.log("Impresión fallida: El mensaje de éxito no coincide.");
          return "Impresión fallida: El mensaje de éxito no coincide.";
        }

      } catch (e) {
        console.log("Impresión fallida: No se encontró el mensaje de éxito se demoro en responder la pagina.");
      }
      //FIN IMPRIMIR DOCUMENTO
      console.log("La página se cargó correctamente.");
      await browser.close();

    } catch (error) {
      //console.error("Error la pagina no se cargo correctamente. " + error.message);
      await browser.close();
      return "Error la pagina no se cargo correctamente.";
    }
  } else {
    console.log("Error al ingresar a la pagina");
    return "Modelo no válido";
  }
};


// FUNCIÓN EXTRAER CONTADORES
const contadores = async (arregloIps, tipoPrint) => {
  const dataContadores = []; // Para almacenar los resultados de todas las impresoras

  // Navegador
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: false,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  try {
    for (const ip of arregloIps) {
      // Variables generales para almacenar datos
      let nombre = '';
      let modelo = '';
      let serial = '';
      let contadorBN = '';
      let contadorColor = '';
      let contadorBNColor = '';

      if (tipoPrint === 'BN') {
        // Impresora en Blanco y Negro
        try {
          const header = randomUseragent.getRandom();
          await page.setUserAgent(header);
          await page.setViewport({ width: 1920, height: 1080 });
          
          const url = "https://" + ip + "/hp/device/InternalPages/Index?id=UsagePage"; // Única URL
          await page.goto(url, { timeout: 15000 });
          await page.waitForSelector('#UsagePage\\.DeviceInformation\\.DeviceSerialNumber');

          // Selectores generales (válidos para BN)
          const nombreSelector = '#UsagePage\\.DeviceInformation\\.DeviceName';
          const modeloSelector = '#UsagePage\\.DeviceInformation\\.ProductName';
          const serialSelector = '#UsagePage\\.DeviceInformation\\.DeviceSerialNumber';

          nombre = await page.$eval(nombreSelector, el => el.textContent.trim());
          modelo = await page.$eval(modeloSelector, el => el.textContent.trim());
          serial = await page.$eval(serialSelector, el => el.textContent.trim());

          let data = {
            ip,
            nombre,
            modelo,
            serial,
          };

          // Selector para contador BN
          contadorBN = '0';
          try {
            // Intentar con el primer selector
            contadorBN = await page.$eval('#UsagePage\\.EquivalentImpressionsTable\\.Total\\.Total', el => el.textContent.trim());
          } catch (error) {
            try {
              // Intentar con el segundo selector si el primero falla
              contadorBN = await page.$eval('#UsagePage\\.EquivalentImpressionsTable\\.Print\\.Total', el => el.textContent.trim());
            } catch (innerError) {
              console.error('No se pudo encontrar el selector para contador BN:', innerError);
            }
          }
          // Agregar al objeto
          data.contadorBN = contadorBN;
          console.log(`Extracción exitosa para la IP ${ip} (BN). Contador BN: ${contadorBN}`);
          // Guardar datos en el array
          dataContadores.push(data);
        } catch (error) {
          console.error("Error al extraer datos de la IP: " + ip + ". Error: " + error.message);
          // Solo agregar los datos de "Sin conexión" si hay error
          let data = {
            ip,
            nombre: nombre || 'Sin conexión',
            modelo: modelo || 'Sin conexión',
            serial: serial || 'Sin conexión',
            contadorBN: contadorBN || '0',
          };
          dataContadores.push(data);
        }
      } else if (tipoPrint === 'Color') {
        
        // Impresora a Color: Intentar con URL -> MFP SERIE E
        let url = "https://" + ip + "/hp/device/InternalPages/Index?id=UsagePage";
        try {
          const header = randomUseragent.getRandom();
          await page.setUserAgent(header);
          await page.setViewport({ width: 1920, height: 1080 });
          await page.goto(url, { timeout: 15000 });
          console.log(`Accediendo a la primera URL para la IP ${ip}`);

          // Selectores específicos de esta primera URL
          const nombreSelector = '#UsagePage\\.DeviceInformation\\.DeviceName';
          const modeloSelector = '#UsagePage\\.DeviceInformation\\.ProductName';
          const serialSelector = '#UsagePage\\.DeviceInformation\\.DeviceSerialNumber';
          const contadorColorSelector = '#UsagePage\\.EquivalentImpressionsTable\\.Color\\.Total';
          const contadorBNColorSelector = '#UsagePage\\.EquivalentImpressionsTable\\.Monochrome\\.Total';

          nombre = await page.$eval(nombreSelector, el => el.textContent.trim());
          modelo = await page.$eval(modeloSelector, el => el.textContent.trim());
          serial = await page.$eval(serialSelector, el => el.textContent.trim());

          try {
            contadorColor = await page.$eval(contadorColorSelector, el => el.textContent.trim());
            contadorBNColor = await page.$eval(contadorBNColorSelector, el => el.textContent.trim());
          } catch (colorError) {
            console.error(`Error al extraer los contadores de color para la IP ${ip}:`, colorError);
          }

          dataContadores.push({ ip, nombre, modelo, serial, contadorColor, contadorBNColor });
          continue; // Si esta URL cargó correctamente, saltamos a la siguiente IP
        } catch (error) {
          console.error(`Fallo la primera URL para la IP ${ip}:`, error);
        }

        // Intentar con la segunda URL -> PRO477
        url = "https://" + ip + "/#hId-pgNetworkSummary";
        
        try {
          await page.goto(url, { timeout: 150000 });
          console.log(`Accediendo a la segunda URL para la IP ${ip}`);
          // Selectores específicos de esta segunda URL
          await page.waitForXPath('//*[@id="nS-wD-HostName"]');

          const [element2] = await page.$x('//*[@id="nS-wD-HostName"]');
          const nombre = await page.evaluate(el => el.textContent, element2);

          
          url = "https://" + ip + "/#hId-pgDevInfo";
          await page.goto(url, { timeout: 150000 });
          await page.waitForXPath('//*[@id="appDevInfo-printerInfo-tbl-Tbl"]/tbody/tr[1]/td[2]');

          // Extrae el texto del elemento
          const [element] = await page.$x('//*[@id="appDevInfo-printerInfo-tbl-Tbl"]/tbody/tr[1]/td[2]');
          const modelo = await page.evaluate(el => el.textContent, element);

          const [element3] = await page.$x('//*[@id="appDevInfo-printerInfo-tbl-Tbl"]/tbody/tr[3]/td[2]');
          const serial = await page.evaluate(el => el.textContent, element3);

          console.log(modelo+' '+nombre+' '+serial);
          // Navegar a la otra URL para los contadores
          url = "http://" + ip + "/#hId-pgUsageReport";

            await page.goto(url,{ timeout: 15000 });  

            await page.waitForXPath('//*[@id="appUsageReport-media-type-ph-Tbl"]/tbody/tr[3]/td[2]');

            // Extrae el texto del elemento
            const [element4] = await page.$x('//*[@id="appUsageReport-media-type-ph-Tbl"]/tbody/tr[4]/td[2]');
            const contadorColor = await page.evaluate(el => el.textContent, element4);

            const [element5] = await page.$x('//*[@id="appUsageReport-media-type-ph-Tbl"]/tbody/tr[3]/td[2]');
            const contadorBNColor = await page.evaluate(el => el.textContent, element5);

          dataContadores.push({ ip, nombre, modelo, serial, contadorColor, contadorBNColor });
          continue; // Si esta URL cargó correctamente, saltamos a la siguiente IP
        } catch (error) {
          console.error(`Fallo la segunda URL para la IP ${ip}:`, error);
        }

        // Intentar con la tercera URL -> PRO477 LASER
        url = "https://" + ip + "/info_configuration.html?tab=Home&menu=DevConfig";
        try {
          await page.goto(url, { timeout: 150000 });
          console.log(`Accediendo a la segunda URL para la IP ${ip}`);
          // Selectores específicos de esta segunda URL
          await page.waitForXPath('/html/body/div[2]/table/tbody/tr[2]/td[2]/div[3]/table/tbody/tr[28]/td[2]');

          // Extrae el texto del elemento
          const [element2] = await page.$x('/html/body/div[2]/table/tbody/tr[2]/td[2]/div[3]/table/tbody/tr[28]/td[2]');
          const nombre = await page.evaluate(el => el.textContent, element2);

          const [element] = await page.$x('/html/body/div[2]/table/tbody/tr[2]/td[2]/div[3]/table/tbody/tr[1]/td[2]');
          const modelo = await page.evaluate(el => el.textContent, element);

          const [element3] = await page.$x('/html/body/div[2]/table/tbody/tr[2]/td[2]/div[3]/table/tbody/tr[3]/td[2]');
          const serial = await page.evaluate(el => el.textContent, element3);

          console.log(modelo+' '+nombre+' '+serial);

          // Extrae el texto del elemento
          const [element4] = await page.$x('/html/body/div[2]/table/tbody/tr[2]/td[2]/div[7]/table/tbody/tr[6]/td[2]');
          const contadorColor = await page.evaluate(el => el.textContent, element4);

          const [element5] = await page.$x('/html/body/div[2]/table/tbody/tr[2]/td[2]/div[7]/table/tbody/tr[5]/td[2]');
          const contadorBNColor = await page.evaluate(el => el.textContent, element5);

          dataContadores.push({ ip, nombre, modelo, serial, contadorColor, contadorBNColor });

        } catch (finalError) {
          console.error(`Fallo la tercera URL para la IP ${ip}:`, finalError);
          // Agregar impresora como "Sin conexión" si ninguna URL cargó correctamente
          dataContadores.push({
            ip,
            nombre: nombre || 'Sin conexión',
            modelo: modelo || 'Sin conexión',
            serial: serial || 'Sin conexión',
            contadorColor: contadorColor || '0',
            contadorBNColor: contadorBNColor || '0',
          });
        }//try catch
      } //else if
    } // /for
  } catch (error) {
    console.error("Error general en la extracción: " + error.message);
  } finally {
    await browser.close();
  }

  return dataContadores;
};

// FUNCIÓN OBTENER DATOS EXCEL
app.get('/inventario-data', async (req, res) => {
  try {
    const workbook = await XlsxPopulate.fromFileAsync(pathFileExel);
    const sheet = workbook.sheet('Inventario');
    const data = sheet.usedRange().value();

    // Eliminar el primer elemento (encabezados) del array
    const headers = data.shift();

    // Mapear los datos a objetos con nombres de propiedades basados en los encabezados
    const formattedData = data.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el archivo Excel' });
  }
});
// FUNCIÓN OBTENER DATOS DE UN SERIAL ESPECÍFICO
app.get('/inventario-data/:serial', async (req, res) => {
  try {
    const serial = req.params.serial;

    const workbook = await XlsxPopulate.fromFileAsync(pathFileExel);
    const sheet = workbook.sheet('Inventario');
    const data = sheet.usedRange().value();

    // Eliminar el primer elemento (encabezados) del array
    const headers = data.shift();

    // Mapear los datos a objetos con nombres de propiedades basados en los encabezados
    const formattedData = data.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    // Filtrar los datos por el serial
    console.log(serial);

    const result = formattedData.find(item => item['SERIAL'] == serial);

    console.log(result);

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Serial no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el archivo Excel' });
  }
});

// FUNCIONES INDEX
// APP GET LISTEN
app.get("/remesa-data", (req, res) => {
  res.json(remesaData);
});

// APP POST  GUARDAR ARCHIVO EXCEL
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

    const resultado = await busquedaSolis(filePath)
      .then(async (result) => {
        console.log("Números extraídos:", result);

        const browser = await puppeteer.launch({
          executablePath:
            "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          headless: true, //false to hide(Esconder)
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
    console.error("Error al ejecutar busquedaSolis", error);
    res.status(500).json({ error: 'Error en la búsqueda Servidor' });
  }
});

// APP POST EJECUTAR DENSIDAD
// Ruta para recibir la dirección IP-Densidad-modelo
app.post('/enviar-ip-densidad-modelo', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const densidad = req.body.densidad;
  const modelo = req.body.modelo;

  // Ejecuta la función deseada con la dirección IP
  console.log("la driección ip recibida es: " + ip);
  console.log("la densidad recibida es: " + densidad);
  console.log("el modelo recibido es: " + modelo);

  try {
    const resultado = await configDensidad(ip, modelo, densidad);
    console.log(resultado);
    res.status(200).json({ message: resultado });
  } catch (error) {
    console.error("Error al ejecutar configDensidad:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// APP POST EJECUTAR INFO
// Ruta para recibir la dirección ip-modelo-namePrint-location
app.post('/enviar-ip-modelo-namePrint-location', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const modelo = req.body.modelo;
  const namePrint = req.body.name;
  const printLocation = req.body.location;
  // Ejecuta la función deseada con la dirección IP
  console.log("la driección ip recibida es: " + ip);
  console.log("el modelo recibido es: " + modelo);
  console.log("Nombre Impresor recibida es: " + namePrint);
  console.log("Ubicación print recibida es: " + printLocation);
  try {
    const resultado = await configInfo(ip, modelo, namePrint, printLocation);
    console.log(resultado);
    res.status(200).json({ message: resultado });
  } catch (error) {
    console.error("Error al ejecutar configInfo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// APP POST EJECUTAR CREDENCIALES
// Ruta para recibir la dirección ip-modelo
app.post('/configCredenciales', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const modelo = req.body.modelo;

  // Ejecuta la función deseada con la dirección IP
  console.log("la driección ip recibida es: " + ip);
  console.log("el modelo recibido es: " + modelo);

  try {
    const resultado = await configCredenciales(ip, modelo);
    console.log(resultado);
    res.status(200).json({ message: resultado });
  } catch (error) {
    console.error("Error al ejecutar configCredenciales:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// APP POST EJECUTAR CONFIGURACIÓN CORREO
// Ruta para recibir la dirección IP-Densidad-modelo
app.post('/configCorreo', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const modelo = req.body.modelo;

  // Ejecuta la función deseada con la dirección IP
  console.log("la driección ip recibida es: " + ip);
  console.log("el modelo recibido es: " + modelo);

  try {
    const resultado = await configCorreo(ip, modelo);
    console.log(resultado);
    res.status(200).json({ message: resultado });
  } catch (error) {
    console.error("Error al ejecutar configCorreo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// APP POST EJECUTAR CONFIGURACIÓN CONTACTOS
// Ruta para recibir la dirección IP-Densidad-modelo
app.post('/configContactos', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const modelo = req.body.modelo;

  // Ejecuta la función deseada con la dirección IP
  console.log("la driección ip recibida es: " + ip);
  console.log("el modelo recibido es: " + modelo);

  try {
    const resultado = await configContactos(ip, modelo);
    console.log(resultado);
    res.status(200).json({ message: resultado });
  } catch (error) {
    console.error("Error al ejecutar configContactos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// APP POST EJECUTAR CONFIGURACIÓN RED IPV4
// Ruta para recibir la dirección IP-Densidad-modelo
app.post('/configRed', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const modelo = req.body.modelo;

  // Ejecuta la función deseada con la dirección IP
  console.log("la dirección ip recibida es: " + ip);
  console.log("el modelo recibido es: " + modelo);

  try {

    const resultado = await configRed(ip, modelo);
    console.log(resultado);
    res.status(200).json({ message: resultado });

  } catch (error) {

    console.error("Error al ejecutar configRed:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }

});

// APP POST EJECUTAR CONFIGURACIÓN RED SNMP
// Ruta para recibir la dirección IP-Densidad-modelo
app.post('/configRedSNMP', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const modelo = req.body.modelo;

  // Ejecuta la función deseada con la dirección IP
  console.log("la dirección ip recibida es: " + ip);
  console.log("el modelo recibido es: " + modelo);

  try {

    const resultado = await configRedSNMP(ip, modelo);
    console.log(resultado);
    res.status(200).json({ message: resultado });

  } catch (error) {

    console.error("Error al ejecutar configRed:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }

});

//PUERTO DONDE ESTA CORRIENDO EL SERVIDOR
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// APP POST EJECUTAR IMPRIMIR ACTA MANTENIMIENTO, ACTA INSTALACIÓN, ACTA ENTREGA.
// Ruta para recibir la dirección IP-Densidad-modelo
app.post('/printDocument', async (req, res) => {
  const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud
  const modelo = req.body.modelo;
  const acta = req.body.acta;
  const copias = req.body.copias;

  // Ejecuta la función deseada con la dirección IP
  console.log("la dirección ip recibida es: " + ip);
  console.log("el modelo recibido es: " + modelo);
  console.log("el tipo de acta es: " + acta);
  console.log("el numero de copias es: " + copias);

  try {

    const resultado = await printDocumentos(ip, modelo, acta, copias);
    console.log(resultado);
    res.status(200).json({ message: resultado });

  } catch (error) {
    console.error("Error al ejecutar printDocumentos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }

});


// -------------------- EXCEL GUARDAR CONTADORES DATOS ----------------------------

// FUNCIÓN LEER DATOS EXCEL INVENTARIO
app.get('/report-contador', async (req, res) => {
  try {
    //const workbook = await XlsxPopulate.fromFileAsync('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\Información de Impresoras TQ PRUEBAS.xlsx');
    const workbook = await XlsxPopulate.fromFileAsync('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\1. Base de Datos Impresoras\\Información de Impresoras TQ.xlsx');
    const sheet = workbook.sheet('Inventario');
    const data = sheet.usedRange().value();

    // Eliminar el primer elemento (encabezados) del array
    const headers = data.shift();

    // Mapear los datos a objetos con nombres de propiedades basados en los encabezados
    const formattedData = data.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    // CREAR ARCHIVO EXCEL O REPORTE

    //Fecha Documento
    let now = new Date();
    let day = String(now.getDate()).padStart(2, '0');
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    let year = now.getFullYear();
    let formattedDate = `${day}-${month}-${year}`;

    // Filtrar las filas que están por red para extraer los contadores
    const filteredDataPrirRedBN = formattedData.filter(item =>
      (item['TIPO DE CI'] == "IMPRESORA LASER" || item['TIPO DE CI'] == "MFP") &&
      item['Tipo de conexión'] === "Red" &&
      item['COLOR/BN'] === "BN"
    );

    const filteredDataPrirRedCOLOR = formattedData.filter(item =>
      (item['TIPO DE CI'] === "IMPRESORA LASER" || item['TIPO DE CI'] === "MFP") &&
      item['Tipo de conexión'] == "Red" &&
      item['COLOR/BN'] == "Color"
    );
    const ipsBN = filteredDataPrirRedBN.map(item => item['IP']);
    console.log(ipsBN);

    const ipsCOLOR = filteredDataPrirRedCOLOR.map(item => item['IP']);
    console.log(ipsCOLOR);

    // Llamada para obtener los contadores de impresoras "BN"
    const contadoresBN = await contadores(ipsBN, "BN");
    console.log("Contadores BN obtenidos:", contadoresBN);
    // Llamada para obtener los contadores de impresoras "COLOR"
    const contadoresColor = await contadores(ipsCOLOR, "Color");
    console.log("Contadores COLOR obtenidos:", contadoresColor);
    // Unir ambos resultados en un solo arreglo
    const todosLosContadores = [...contadoresBN, ...contadoresColor];
    console.log("Todos los contadores unidos:", todosLosContadores);

    
    // Encabezados
    const facturacion = await XlsxPopulate.fromBlankAsync();

    facturacion.sheet(0).cell("A1").value('FECHA CORTE');
    facturacion.sheet(0).cell("B1").value('IP');
    facturacion.sheet(0).cell("C1").value('SERIAL');
    facturacion.sheet(0).cell("D1").value('MODELO');
    facturacion.sheet(0).cell("E1").value('SEDE');
    facturacion.sheet(0).cell("F1").value('COLOR/BN');
    facturacion.sheet(0).cell("G1").value('LOCALIZACION CIUDAD');
    facturacion.sheet(0).cell("H1").value('SUBLOCALIZACION/AREA');
    facturacion.sheet(0).cell("I1").value('CONTADOR INICIAL');
    facturacion.sheet(0).cell("J1").value('CONTADOR FINAL');
    facturacion.sheet(0).cell("K1").value('OBSERVACIONES');

    let rowIndex = 2;

    todosLosContadores.forEach((item) => {
      // Caso para impresoras SOLO de Blanco y Negro
      if (item.contadorBN) {
          facturacion.sheet(0).cell(`A${rowIndex}`).value(formattedDate); // Fecha de corte
          facturacion.sheet(0).cell(`B${rowIndex}`).value(item.ip); // IP
          facturacion.sheet(0).cell(`C${rowIndex}`).value(item.serial); // SERIAL
          facturacion.sheet(0).cell(`D${rowIndex}`).value(item.modelo); // MODELO
          facturacion.sheet(0).cell(`E${rowIndex}`).value('-'); // SEDE
          facturacion.sheet(0).cell(`F${rowIndex}`).value('B/N'); // Indicar que es BN
          facturacion.sheet(0).cell(`G${rowIndex}`).value('-'); // Localización Ciudad
          facturacion.sheet(0).cell(`H${rowIndex}`).value(item.nombre || '-'); // Sublocalización Area
          facturacion.sheet(0).cell(`I${rowIndex}`).value(item.contadorBN || '-'); // Contador BN
          facturacion.sheet(0).cell(`J${rowIndex}`).value(''); // Dejar vacío si no hay contador final
          facturacion.sheet(0).cell(`K${rowIndex}`).value(item['OBSERVACION'] || '-'); // Observaciones

          rowIndex += 1; // Incrementa para la siguiente fila
      // Caso para impresoras de Color, donde se agregan dos filas
      } else if (item.contadorColor && item.contadorBNColor) {
    
          // Fila para el contador BN de la impresora a Color
          facturacion.sheet(0).cell(`A${rowIndex}`).value(formattedDate); // Fecha de corte
          facturacion.sheet(0).cell(`B${rowIndex}`).value(item.ip); // IP
          facturacion.sheet(0).cell(`C${rowIndex}`).value(item.serial); // SERIAL
          facturacion.sheet(0).cell(`D${rowIndex}`).value(item.modelo); // MODELO
          facturacion.sheet(0).cell(`E${rowIndex}`).value('LLENA CON IF COLOR B/N'); // SEDE
          facturacion.sheet(0).cell(`F${rowIndex}`).value('B/N'); // Indicar que es BN
          facturacion.sheet(0).cell(`G${rowIndex}`).value('-'); // Localización Ciudad
          facturacion.sheet(0).cell(`H${rowIndex}`).value(item.nombre || '-'); // Sublocalización Area
          facturacion.sheet(0).cell(`I${rowIndex}`).value(item.contadorBNColor || '-'); // Contador BN (Color)
          facturacion.sheet(0).cell(`J${rowIndex}`).value(''); // Dejar vacío si no hay contador final
          facturacion.sheet(0).cell(`K${rowIndex}`).value(item['OBSERVACION'] || '-'); // Observaciones
    
          // Incrementar el índice para la siguiente fila de Color
          rowIndex += 1; // Incrementa para la siguiente fila
    
          // Fila para el contador de Color
          facturacion.sheet(0).cell(`A${rowIndex}`).value(formattedDate); // Fecha de corte
          facturacion.sheet(0).cell(`B${rowIndex}`).value(item.ip); // IP
          facturacion.sheet(0).cell(`C${rowIndex}`).value(item.serial); // SERIAL
          facturacion.sheet(0).cell(`D${rowIndex}`).value(item.modelo); // MODELO
          facturacion.sheet(0).cell(`E${rowIndex}`).value('LLENA CON IF COLOR COLOR'); // SEDE
          facturacion.sheet(0).cell(`F${rowIndex}`).value('Color'); // Indicar que es Color
          facturacion.sheet(0).cell(`G${rowIndex}`).value('-'); // Localización Ciudad
          facturacion.sheet(0).cell(`H${rowIndex}`).value(item.nombre || '-'); // Sublocalización Area
          facturacion.sheet(0).cell(`I${rowIndex}`).value(item.contadorColor || '-'); // Contador Color
          facturacion.sheet(0).cell(`J${rowIndex}`).value(''); // Dejar vacío si no hay contador final
          facturacion.sheet(0).cell(`K${rowIndex}`).value(item['OBSERVACION'] || '-'); // Observaciones
          rowIndex += 1; // Incrementa para la siguiente fila
      }
    });

    //Salida Documento
    await facturacion.toFileAsync('C:\\Users\\efacamayo.TQCLO01\\OneDrive - Carvajal S.A\\1. Operación Carvajal\\13. Facturación\\' + formattedDate + '.xlsx');

    //console.log(formattedData);
    res.json(todosLosContadores);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el archivo Excel' });
  }

});




















//leerExcel();