const puppeteer = require("puppeteer");
const randomUseragent = require("random-useragent");



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

iniciar("172.22.255.36","MFP E62555","3")






