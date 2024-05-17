
const puppeteer = require("puppeteer");
const randomUseragent = require("random-useragent");
const express = require('express');
const app = express();
const { Socket } = require("dgram");



// CORS permisos
const cors = require('cors');

app.use(cors()) //TODO el mundo puede ingresar Permiso

// Middleware para manejar solicitudes JSON
app.use(express.json());

// FUNCIÓN CONFIG DENSIDAD

const configDensidad = async(ip,modelo,densidad)=>{

    if(modelo== "MFP E62555"){
        console.log("Ingresa al condicional");
    //Navegador
    const browser = await puppeteer.launch({
        executablePath:
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        headless: false,
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

        try{
            const header = randomUseragent.getRandom();
            await page.setUserAgent(header);
            await page.setViewport({ width: 1920, height: 1080 });
            console.log("Crea la ventana");
            await page.goto(
                "https://"+ip+"/hp/device/SignIn/Index",
              { timeout: 10000 }
            );
        
            //validar espera

            const ipInput = await page.waitForSelector("#PasswordTextBox", {
                timeout: 15000,
              });
        
            //click
            let pass = "CarvajalPrint1";
            await page.click("#PasswordTextBox");
            await ipInput.type(pass.toString());
            await page.click("#signInOk");
            await page.waitForSelector("#menuTabs", { timeout: 1000 });
            await page.click("#PrintPages");
            await page.waitForSelector("#localMenu", { timeout: 1000 });
            await page.click("#PrintQualityGroup");
            await page.waitForSelector("#content", { timeout: 1000 });
            //Enviar densidad
            
            //OBTENER DENSIDAD
            // Encuentra el elemento <select> por su ID
            const selectElement = await page.$('#TonerDensityBlack');
            // Obtiene el valor seleccionado
            const selectedValue = await selectElement.evaluate(el => el.value);

            console.log(`El número seleccionado es: ${selectedValue}`);
            //FIN OBTENER DENSIDAD
            
            //DAR UN VALOR DENSIDAD
            await selectElement.select(densidad);

            await page.waitForTimeout(2000);
            await page.click("#FormButtonSubmit");
            console.log('Valor establecido y aplicado correctamente.');
            //FIN DAR UN VALOR DENSIDAD

            console.log("La página se cargó correctamente.");
            await browser.close();
            
            }catch(error){
                console.error("Error la pagina no se cargo correctamente. ");
                await browser.close();
            }

    return;
    }else{
        console.log("Error al ingresar a la pagina");
    }


}

function iniciar(ip,modelo,densidad){
    console.log("Ingresa 1");
    configDensidad(ip,modelo,densidad);
    console.log("Ingresa FIN");
}

// Ruta para recibir la dirección IP
app.post('/enviar-ip', (req, res) => {
    const ip = req.body.ip; // Obtiene la dirección IP del cuerpo de la solicitud

    // Ejecuta la función deseada con la dirección IP
    console.log("la driección ip recibida es: "+ip);
    iniciar(ip,"MFP E62555","3");

    // Responde con éxito al cliente
    res.status(200).json({ message: 'Dirección IP recibida exitosamente' });
});


// Inicia el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor Express escuchando en el puerto 3000...');
});



