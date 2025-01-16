const d = document, //Variable "d" para simplificar escritura el DOM
$table = d.querySelector(".resultTable"), // Variable "table" para vaciar a la tabla
$template = d.getElementById("template").content, // Variable "template" estructura para vaciar dinamicamente la estructura
$fragment = d.createDocumentFragment(); //guardar en un fragmento y luego insertarla al DOM
$fecha = d.querySelector(".ultimaFecha");

// Funcion getAllRemesas Tarer todas las remesas mediante la funcion AJAX creada le pasamos los parametros
const getAllRemesas = () => {
ajax({
    // method: "GET", omiti esta por defecto para GET
    url: `http://${Ip}:3000/remesa-data`,
    //Funcion en caso de exito en HTML 
    success: (res) => {
        console.log(res);

        res.forEach(element => {

            // Crear enlace a la guia
            const verGuiaLink = document.createElement('a');
            const url = element.getURL; // Ajustar cuando la url del servidor
            verGuiaLink.textContent = 'Guía';
            verGuiaLink.href = url; // "https://www.google.com"
            verGuiaLink.target = "_blank"; // Establecer la propiedad target para abrir en una nueva pestaña

            //iterar por cada template que traiga o elemento
            $template.querySelector(".consulta").textContent = element.fechaProcessRemesa;
            $template.querySelector(".numeroGuia").textContent = element.nRemesa; //dentro de la variable template busca el selector con la class .numeroGuia poner lo que viene en nRemesa
            $template.querySelector(".ciudad").textContent = element.getCiudad;
            $template.querySelector(".direccion").textContent = element.getDireccion;
            $template.querySelector(".estado").textContent = element.getEstado;
            $template.querySelector(".nCajas").textContent = element.getCajas;
            $template.querySelector(".fechaAentrega").textContent = element.getFechaAproxEntregada;
            $template.querySelector(".fechaEntrega").textContent = element.getFechaEntregada;
            $template.querySelector(".hora").textContent = element.getHora;
            $template.querySelector(".causa").textContent = element.getCausa;
            $template.querySelector(".novedades").textContent = element.getNovedad;
            $template.querySelector(".observacion").textContent = element.getObservacion;
            $template.querySelector(".VerGuia").innerHTML = '';
            $template.querySelector(".VerGuia").appendChild(verGuiaLink);


            //Clonar el template para que quede en memoria
            let $clone = d.importNode($template, true);
            $fragment.appendChild($clone);    // no afectar el rendimiento del DOM pegar el nodo Clonado al fragmento
            //location.reload();
            $fecha.innerHTML = element.fechaProcessRemesa;
        });
            $table.querySelector("tbody").appendChild($fragment); // buscar la tabla y los nodos agregarlos al Tbody de la tabla
            aplicarEstilosSegunEstado();

        },


    //Funcion en caso de error en HTML
    error: (err) => {
        console.log(err);
        $table.insertAdjacentHTML("afterend", `<p><b>${err}</b></p>`);
        showMessage("Error no hay conexión con el servidor...","alert");
    }
    // data: null -> omiti data
})
}
// DOCument
d.addEventListener("DOMContentLoaded", getAllRemesas)

// FUNCIÓN APLICAR STYLOS
function aplicarEstilosSegunEstado() {
    const filas = document.querySelectorAll('.tbody tr');

    filas.forEach((fila) => {
        const estado = fila.querySelector('.estado').textContent.trim();
        if (estado === 'ENTREGADO') {
            // Aplicar estilos
            fila.style.backgroundColor = '#def3e2'; // Fondo verde
            //fila.style.color = '#FFFFFF'; // Texto blanco
        }
    });
}

//---------------------------------------------------------------------------------------------------------------
// Función para enviar el archivo al servidor
const sendFile = () => {
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0]; // Obtener el archivo seleccionado

if (!file) {
    showMessage("Seleccionar primero un archivo", "info");

    return;
}

const formData = new FormData();
formData.append('file', file); // Agregar el archivo al objeto FormData

// Función AJAX para enviar el archivo al servidor
const ajax = (options) => {
    let { url, method, success, error, data } = options;
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                success(xhr.responseText);
            } else {
                let message = xhr.statusText || "Ocurrió un error";
                error(`Error ${xhr.status}: ${message}`);
            }
        }
    });

    xhr.open(method || "POST", url);
    xhr.send(data); // Enviar los datos (FormData) al servidor
};

// Llamar a la función AJAX para enviar el archivo al servidor
ajax({
    method: "POST",
    url: `http://${Ip}:3000/upload`,
    data: formData,
    success: (response) => {
        console.log("Archivo subido exitosamente:", response);
        //lógica adicional después de subir el archivo
        showMessage("Archivo subido exitosamente", "success");
    },
    error: (err) => {
        console.error("Error al subir el archivo:", err);
        // manejar el error de subida del archivo
        showMessage("Error al subir el archivo, no hay conexión con el servidor...", "alert");
    }
});
};

// PROCESAR REMESAS
const sendProcces = () => {
showOverlay(); //mostrar loader
//AQUI VALIDAR LA SUBIDA DEL ULTIMO ARCHIVO


// Función AJAX para enviar el archivo al servidor
const ajax = (options) => {
    let { url, method, success, error, data } = options;
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                success(xhr.responseText);
            } else {
                let message = xhr.statusText || "Ocurrió un error";
                error(`Error ${xhr.status}: ${message}`);
            }
        }
    });

    xhr.open(method || "POST", url);
    xhr.send(data); // Enviar los datos (FormData) al servidor
};

// Llamar a la función AJAX para enviar el archivo al servidor
ajax({
    method: "POST",
    url: `http://${Ip}:3000/resumen`,
    data: "",
    success: (response) => {
        window.location.reload();
        hideOverlay(); //Ocultar Loader
        console.log("Procensando remesas", response);
        //lógica adicional después de subir el archivo
        showMessage("Procesando las remesas","success");
        

    },
    error: (err) => {
        hideOverlay(); //Ocultar Loader
        console.error("Erro al Procesar los archivos", err);
        // manejar el error de subida del archivo
        showMessage("Error al procesar los archivos, no hay conexión con el servidor...","alert");
    }
});
};

//Cambiar nombre personalizar subida del archivo txt

document.getElementById('fileInput').addEventListener('change', function(e) {
    var fileName = '';
    if (this.files && this.files.length > 1) {
        fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
    } else {
        fileName = e.target.value.split('\\').pop();
    }

    if (fileName) {
        this.nextElementSibling.querySelector('span').innerHTML = fileName;
    } else {
        this.nextElementSibling.querySelector('span').innerHTML = 'Seleccionar archivo';
    }
});
