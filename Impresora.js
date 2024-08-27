// Función para obtener los parámetros de la URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        serial: params.get('serial')
    };
}

// Obtener el serial desde la URL
const params = getQueryParams();
const serial = params.serial;
console.log(serial);
serial.toString();
// Verificar si el serial existe en la URL
if (serial) {
    // Hacer una petición AJAX para obtener los datos del serial
    ajax({
        url: `http://${Ip}:3000/inventario-data/${serial}`, // URL con el serial
        method: "GET",
        success: (res) => {
            // Llenar la información en el HTML

            document.getElementById('print_img').src = `http://${Ip}:3000/${res["Foto Dispositivo"]}`;
            document.getElementById('print_img').alt = res["Foto Dispositivo"] || "Foto del dispositivo";
            document.getElementById('serial').textContent = res['SERIAL'];
            document.getElementById('tipo-ci').textContent = res['TIPO DE CI'];
            document.getElementById('nombre-dispositivo').textContent = res['NOMBRE DISPOSITIVO'];
            document.getElementById('nombre-dispositivo-2').textContent = res['NOMBRE DISPOSITIVO'];
            document.getElementById('tipo-conexion').textContent = res['Tipo de conexión'];            
            document.getElementById('direccion-ip').textContent = res['IP'];
            document.getElementById('sede').textContent = res['SEDE'];
            document.getElementById('edificio').textContent = res['EDIFICIO'];
            document.getElementById('area').textContent = res['AREA'];
            document.getElementById('mac').textContent = res['MAC'];
            document.getElementById('gateway').textContent = res['Pasarela'];
            document.getElementById('mascara').textContent = res['Mascara'];
            document.getElementById('firmware').textContent = res['Firmware'];
            document.getElementById('asignacion').textContent = res['Asignación'];            
            document.getElementById('marca').textContent = res['Marca'];        
            document.getElementById('modelo').textContent = res['Modelo'];            
            document.getElementById('color-bn').textContent = res['COLOR/BN'];
            document.getElementById('estado-ci').textContent = res['Estado del CI'];
            document.getElementById('departamento').textContent = res['Departamento'];            
            document.getElementById('ciudad').textContent = res['Ciudad'];
            document.getElementById('direccion').textContent = res['Dirección Actual'];
            document.getElementById('observacion').textContent = res['OBSERVACION'];

            const serialDate = res['Ultima Fecha Confirmacion'];
            const jsDate = excelDateToJSDate(serialDate);
            document.getElementById('ultima-fecha-confirmacion').textContent = jsDate.toLocaleDateString();
            
            document.getElementById('analista').textContent = res['Analista'];
            
            let varDensidad = res['DENSIDAD TONER'];
            if(varDensidad == "N/A" || varDensidad == "N/D" || varDensidad == ""){
                document.getElementById('densidad-toner').textContent = varDensidad;
            } else {
                document.getElementById('densidad-toner').textContent = `${varDensidad * 100}%`;
            }

            document.getElementById('observacion-densidad').textContent = res['OBSERVACION TONER'];
        },
        error: (err) => {
            console.error('Error al obtener los datos:', err);
            // Mostrar el error en la interfaz, por ejemplo, en un elemento específico
            document.querySelector('.print_contenido').insertAdjacentHTML("afterend", `<p><b>${err}</b></p>`);
        }
    });
} else {
    console.error('Serial no encontrado en la URL');
    // Mostrar un mensaje de error en la interfaz si el serial no está en la URL
    document.querySelector('.print_contenido').insertAdjacentHTML("afterend", `<p><b>Serial no encontrado en la URL</b></p>`);
}

