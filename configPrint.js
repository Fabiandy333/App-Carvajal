const puppeteer = require("puppeteer");



const configDensidad = async(ip,modelo)=>{

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
    console.log("Crea la pagina");

        try{
            const header = randomUseragent.getRandom();
            await page.setUserAgent(header);
            await page.setViewport({ width: 1920, height: 1080 });
            await page.goto(
              ip,
              { timeout: 3000 }
            );

            console.log("Carga Navegador");
        
            //validar espera
            await page.waitForSelector("#PasswordTextBox", { timeout: 1000 });
            console.log("Encuentra el PasswordTextBox");
            const ipInput = await page.waitForSelector("#PasswordTextBox", {
                timeout: 15000,
              });
        
            //click
            let pass = "CarvajalPrint1";
            await page.click("#EwsLogin");
            await page.click("#PasswordTextBox");
            await ipInput.type(pass.toString());
            await page.click("#signInOk");
            await page.waitForSelector("#menuTabs", { timeout: 1000 });
            await page.click("#PrintPages");
            await page.click("#PrintQualityGroup");
            //Enviar densidad



            console.log("La página se cargó correctamente.");
            }catch(error){
                console.error("Error la pagina no se cargo correctamente. ");
                await browser.close();
            }

    return;
    }else{
        console.log("Error al ingresar a la pagina");
    }


}


function iniciar(ip,modelo){
    console.log("Ingresa 1");
    configDensidad(ip,modelo);
    console.log("Ingresa FIN");
}

iniciar("172.22.255.36","MFP E62555")







