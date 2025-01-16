//FUNCIÓN INGRESAR EN MODO ADMINISTRADOR
const ingresoModAdmin = async(contraseña,)=>{
    try {
        const pass = await page.wait
    } catch (error) {
        
    }
};

//CREAR NAVEGADOR
const createBrowser = async(urlPage)=>{
    console.log("Ingresa a la función createBrowser");
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
          urlPage,
          { timeout: 20000 }
        );
        return page;        
        }catch(error){
            //console.error("Error la pagina no se cargo correctamente. " + error.message);
            await browser.close();
            console.log(error);
            return "Error la pagina no se cargo correctamente.";
    }
};

module.exports = { createBrowser };