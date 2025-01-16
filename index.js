const Ip = '172.22.240.85'; //IP OFICINA OFICIAL
//const Ip = '192.168.1.10'; //IP CASA

// ------------------- PETICIONES AL SERVIDOR ----------------------------
// AJAX FUNCION GLOBAL
const ajax = (options) => { //función ajax para que sea mas dinamico
    let { url, method, success, error, data } = options; //estructura que debe tener el options
    // url = string, method = string, success = funcion, error = funcion, data = objeto
    const xhr = new XMLHttpRequest(); //Objeto httprequest
    
    xhr.addEventListener("readystatechange", e => {  //listener cuando detecte un cambio
        if (xhr.readyState !== 4) return;
    
        if (xhr.status >= 200 && xhr.status < 300) {
            let json = JSON.parse(xhr.responseText); // comvertir a formato js a JSON
            success(json); // pasamos a la funcion succes la variable o formato comvertido  
        } else {
            let message = xhr.statusText || "Ocurrio un error";
            error(`Error ${xhr.status}:${message}`);
        }
    });
    xhr.open(method || "GET", url);
    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8"); //enviar al servidor en el post indicando que se envia la info en formato Json de lo contrario seria texto plano
    xhr.send(JSON.stringify(data)) //comvertir el objeto js data a cadena de texto 
    }


// ------------------- FUNCIONES INDEX -------------------
const sendDensidades = () => {
    
    showOverlay(); //Mostrar Loader 

    const campoIp = document.getElementById('input-Ip').value;
    const select = document.getElementById('mi-select-densidad');
    const campoDensidad = select.options[select.selectedIndex].text;
    const select2 = document.getElementById('mi-select-modelo');
    const campoModelo = select2.options[select2.selectedIndex].text;

    if (campoIp.trim() === '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Debes ingresar la dirección IP','info');
        return;
    }
    // Generar un ID único para este cliente
    const clientId = Date.now().toString();
    const data = {
        ip: campoIp,
        densidad: campoDensidad,
        modelo: campoModelo,
        clientId: clientId
    };
    
    // Iniciar la conexión SSE para recibir los eventos
    receiveEvents(clientId);
    ajax({
        method: "POST",
        url: `http://${Ip}:3000/enviar-ip-densidad-modelo`,
        data: data,
        success: (response) => {
            hideOverlay(); //Ocultar Loader
            console.log("Información enviada exitosamente", response);
            
            switch (response.message) {
                case "Configuración de densidad exitosa":
                    showMessage(response.message, "success");
                    break;
                case "Error al configurar la densidad":
                    showMessage("Error al configurar la densidad:\nPosibles Causas:\n1. La IP es incorrecta o no existe.\n2. La impresora se encuentra apagada o no está en red", "warning");
                    break;
                default:
                    showMessage(response.message, "alert");
                    break;
            }
        },
        error: (err) => {
            hideOverlay(); //Ocultar Loader

            console.error("Error al enviar la información:", err);
            showMessage("Error al enviar la información no hay conexión con el servidor","alert");
        }
    });
};

const sendInfo = () => {
    
    showOverlay(); //Mostrar Loader 
    const campoIp = document.getElementById('input-Ip').value;
    const campoNamePrint = document.getElementById('input-name-print').value;
    const campoLocation = document.getElementById('input-location-print').value;
    const select2 = document.getElementById('mi-select-modelo');
    const campoModelo = select2.options[select2.selectedIndex].text;

    if (campoIp.trim() === '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Debes ingresar la dirección IP','info');
        return;
    }

    if (campoNamePrint.trim() === '' || campoLocation.trim() == '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Ingresar nombre y ubicación de la impresora','info');
        return;
    }
    // Generar un ID único para este cliente
    const clientId = Date.now().toString();
    const data = {
        ip: campoIp,
        modelo: campoModelo,
        name : campoNamePrint,
        location : campoLocation,
        clientId: clientId // Enviar el ID del cliente al servidor
    };
    // Iniciar la conexión SSE para recibir los eventos
    receiveEvents(clientId);
    ajax({
        method: "POST",
        url: `http://${Ip}:3000/enviar-ip-modelo-namePrint-location`,
        data: data,
        success: (response) => {
            hideOverlay(); //Ocultar Loader
            console.log("Información enviada exitosamente", response);
            
            
            switch (response.message) {
                case "Información Actualizada":
                    showMessage(response.message, "success");
                    break;
                case "Error al configurar información":
                    showMessage("Error al configurar la información:\nPosibles Causas:\n1. La IP es incorrecta o no existe.\n2. La impresora se encuentra apagada o no está en red", "warning");
                    break;
                default:
                    showMessage(response.message, "alert");
                    break;
            }
        },
        error: (err) => {
            hideOverlay(); //Ocultar Loader
            console.error("Error al enviar la información:", err);
            showMessage("Error al enviar la información no hay conexión con el servidor","alert");
        }
    });
};

const sendCredenciales = () => {
    
    showOverlay(); //Mostrar Loader 
    const campoIp = document.getElementById('input-Ip').value;
    const select2 = document.getElementById('mi-select-modelo');
    const campoModelo = select2.options[select2.selectedIndex].text;

    if (campoIp.trim() === '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Debes ingresar la dirección IP','info');
        return;
    }

    // Generar un ID único para este cliente
    const clientId = Date.now().toString();
    const data = {
        ip: campoIp,
        modelo: campoModelo,
        clientId: clientId // Enviar el ID del cliente al servidor

    };
    // Iniciar la conexión SSE para recibir los eventos
    receiveEvents(clientId);

    ajax({
        method: "POST",
        url: `http://${Ip}:3000/configCredenciales`,
        data: data,
        success: (response) => {
            hideOverlay(); //Ocultar Loader
            console.log("Información enviada exitosamente", response);
            // Iniciar conexión con SSE para recibir los eventos
            
            switch (response.message) {
                case "Configuración de credenciales exitosa":
                    showMessage(response.message, "success");
                    break;
                case "Impresora Ya configurada con credenciales correctas.":
                    showMessage(response.message, "success");
                    break;
                case "Error al configurar credenciales":
                    showMessage("Error al configurar credenciales:\nPosibles Causas:\n1. La IP es incorrecta o no existe.\n2. La impresora se encuentra apagada o no está en red", "warning");
                    break;
                default:
                    showMessage(response.message, "alert");
                    break;
            }
        },
        error: (err) => {
            hideOverlay(); //Ocultar Loader
            console.error("Error al enviar la información:", err);
            showMessage("Error al enviar la información no hay conexión con el servidor","alert");
        }
    });
};

const sendCorreo = () => {
    
    showOverlay(); //Mostrar Loader 
    const campoIp = document.getElementById('input-Ip').value;
    const select2 = document.getElementById('mi-select-modelo');
    const campoModelo = select2.options[select2.selectedIndex].text;

    if (campoIp.trim() === '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Debes ingresar la dirección IP','info');
        return;
    }
    const data = {
        ip: campoIp,
        modelo: campoModelo,
    };

    ajax({
        method: "POST",
        url: `http://${Ip}:3000/configCorreo`,
        data: data,
        success: (response) => {
            hideOverlay(); //Ocultar Loader
            console.log("Información enviada exitosamente", response);
            // Iniciar conexión con SSE para recibir los eventos
            //receiveEvents();
            
            switch (response.message) {
                case "Configuración email exitosa":
                    showMessage(response.message, "success");
                    break;
                case "Error al configurar email":
                    showMessage("Error al configurar Email:\nPosibles Causas:\n1. La IP es incorrecta o no existe.\n2. La impresora se encuentra apagada o no está en red", "warning");
                    break;
                default:
                    showMessage(response.message, "alert");
                    break;
            }
        },
        error: (err) => {
            hideOverlay(); //Ocultar Loader
            console.error("Error al enviar la información:", err);
            showMessage("Error al enviar la información no hay conexión con el servidor","alert");
        }
    });
};

// Función para recibir eventos SSE en tiempo real y mostrar en una nueva ventana
const receiveEvents = (clientId) => {
    // Crear una nueva ventana donde se mostrarán los mensajes
    const newWindow = window.open('', 'Eventos en tiempo real', 'width=500,height=400');
    
    // Si la ventana no se abre, muestra un error
    if (!newWindow) {
        console.error('No se pudo abrir la nueva ventana');
        return;
    }

    // Iniciar conexión SSE
    const eventSource = new EventSource(`http://${Ip}:3000/events/${clientId}`);
    // Configurar el evento para recibir los mensajes del servidor
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log("Evento recibido:", data.message);

        // Mostrar el mensaje en la consola de la nueva ventana
        newWindow.document.write(`<p>${data.message}</p>`);
        // Muestra los mensajes en la interfaz según llegan
        //showMessage(data.message, "info");

    };

    // Manejar errores de conexión
    eventSource.onerror = function() {
        console.error('Error en la conexión con el servidor');
        newWindow.document.write('<p>Error en la conexión con el servidor</p>');
        eventSource.close();
    };

    // Cuando el proceso termine, cierra la ventana automáticamente (opcional)
    eventSource.addEventListener('end', () => {
        newWindow.document.write('<p>Conexión finalizada. Cerrando ventana...</p>');
        newWindow.close();  // Cerrar la ventana
    });
};

const sendContactos = () => {
    
    showOverlay(); //Mostrar Loader 
    const campoIp = document.getElementById('input-Ip').value;
    const select2 = document.getElementById('mi-select-modelo');
    const campoModelo = select2.options[select2.selectedIndex].text;

    if (campoIp.trim() === '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Debes ingresar la dirección IP','info');
        return;
    }
    const data = {
        ip: campoIp,
        modelo: campoModelo,
    };

    ajax({
        method: "POST",
        url: `http://${Ip}:3000/configContactos`,
        data: data,
        success: (response) => {
            hideOverlay(); //Ocultar Loader
            console.log("Información enviada exitosamente", response);
            const responseObject = JSON.parse(response); // Analiza la respuesta JSON
            
            switch (responseObject.message) {
                case "Configuración contactos exitosa":
                    showMessage(responseObject.message, "success");
                    break;
                case "Error al configurar contactos":
                    showMessage("Error al configurar Email:\nPosibles Causas:\n1. La IP es incorrecta o no existe.\n2. La impresora se encuentra apagada o no está en red", "warning");
                    break;
                default:
                    showMessage(responseObject.message, "alert");
                    break;
            }
        },
        error: (err) => {
            hideOverlay(); //Ocultar Loader
            console.error("Error al enviar la información:", err);
            showMessage("Error al enviar la información no hay conexión con el servidor","alert");
        }
    });
};

const sendConfigRed = () => {
    
    showOverlay(); //Mostrar Loader 
    const campoIp = document.getElementById('input-Ip').value;
    const select2 = document.getElementById('mi-select-modelo');
    const campoModelo = select2.options[select2.selectedIndex].text;

    if (campoIp.trim() === '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Debes ingresar la dirección IP','info');
        return;
    }
    const data = {
        ip: campoIp,
        modelo: campoModelo,
    };


    ajax({
        method: "POST",
        url: `http://${Ip}:3000/configRed`,
        data: data,
        success: (response) => {
            hideOverlay(); //Ocultar Loader
            console.log("Información enviada exitosamente", response);
            const responseObject = JSON.parse(response); // Analiza la respuesta JSON
            
            switch (responseObject.message) {
                case "Configuración RED exitosa":
                    showMessage(responseObject.message, "success");
                    break;
                case "Error al configurar RED":
                    showMessage("Error al configurar Identificación de red:\nPosibles Causas:\n1. La IP es incorrecta o no existe.\n2. La impresora se encuentra apagada o no está en red", "warning");
                    break;
                default:
                    showMessage(responseObject.message, "alert");
                    break;
            }
        },
        error: (err) => {
            hideOverlay(); //Ocultar Loader
            console.error("Error al enviar la información:", err);
            showMessage("Error al enviar la información no hay conexión con el servidor","alert");
        }
    });
};

const sendConfigRedSNMP = () => {
    
    showOverlay(); //Mostrar Loader 
    const campoIp = document.getElementById('input-Ip').value;
    const select2 = document.getElementById('mi-select-modelo');
    const campoModelo = select2.options[select2.selectedIndex].text;

    if (campoIp.trim() === '') {
        hideOverlay(); //Ocultar Loader
        showMessage('Debes ingresar la dirección IP','info');
        return;
    }
    const data = {
        ip: campoIp,
        modelo: campoModelo,
    };
    ajax({
        method: "POST",
        url: `http://${Ip}:3000/configRedSNMP`,
        data: data,
        success: (response) => {
            hideOverlay(); //Ocultar Loader
            console.log("Información enviada exitosamente", response);
            
            switch (response.message) {
                case "Configuración RED SNMP exitosa":
                    showMessage(response.message, "success");
                    break;
                case "Error al configurar RED SNMP":
                    showMessage("Error al configurar Identificación de red:\nPosibles Causas:\n1. La IP es incorrecta o no existe.\n2. La impresora se encuentra apagada o no está en red", "warning");
                    break;
                default:
                    showMessage(response.message, "alert");
                    break;
            }
        },
        error: (err) => {
            hideOverlay(); //Ocultar Loader
            console.error("Error al enviar la información:", err);
            showMessage("Error al enviar la información no hay conexión con el servidor","alert");
        }
    });
};


//FUNCIONES GLOBALES

// COMVERTIR EL NUMERO DE EXCEL EN FECHA
function excelDateToJSDate(serial) {
    const excelEpoch = new Date(1899, 11, 30); // Fecha base de Excel (30 de diciembre de 1899)
    const days = Math.floor(serial) + 1; // Obtener la parte entera del número (días)
    const millisecondsPerDay = 24 * 60 * 60 * 1000; // Milisegundos en un día
    const date = new Date(excelEpoch.getTime() + days * millisecondsPerDay);
    return date;
}

// FUNCIÓN CERRAR VENTANA
function closed() { 
    window.open('','_parent',''); 
    window.close(); 
 }