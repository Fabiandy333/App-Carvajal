const d = document, //Variable "d" para simplificar escritura el DOM
$table = d.querySelector(".resultTable"), // Variable "table" para vaciar a la tabla
$template = d.getElementById("template").content, // Variable "template" estructura para vaciar dinamicamente la estructura
$fragment = d.createDocumentFragment(); //guardar en un fragmento y luego insertarla al DOM
$tbody = d.querySelector(".tbody");
//inputs = Array.from(d.querySelectorAll("thead input"));

const inputs = [
    d.getElementById("filtroFoto"),
    d.getElementById("filtroSerial"),
    d.getElementById("filtroTipoCI"),
    d.getElementById("filtroNombre"),
    d.getElementById("filtroTipoConexion"),
    d.getElementById("filtroDireccionIp"),
    d.getElementById("filtroSede"),
    d.getElementById("filtroEdificio"),
    d.getElementById("filtroPiso"),
    d.getElementById("filtroArea"),
    d.getElementById("filtroMac"),
    d.getElementById("filtroGateway"),
    d.getElementById("filtroMascara"),
    d.getElementById("filtroFirmaware"),
    d.getElementById("filtroAsignacion"),
    d.getElementById("filtroMarca"),
    d.getElementById("filtroModelo"),
    d.getElementById("filtroColor-BN"),
    d.getElementById("filtroEstadoCI"),
    d.getElementById("filtroDepartamento"),
    d.getElementById("filtroCiudad"),
    d.getElementById("filtroDireccion"),
    d.getElementById("filtroObservacion"),
    d.getElementById("filtroUltimaFechaConfirmacion"),
    d.getElementById("filtroAnalista"),
    d.getElementById("filtroDensidadToner"),
    d.getElementById("filtroObservacionDensidad"),
    d.getElementById("filtroTipoImpresion"),
];
const ListTipoCI = [""];
// Funcion getAllRemesas Tarer todas las remesas mediante la funcion AJAX creada le pasamos los parametros
const getAllBase = () => {
    // Verifica si ya existen datos en localStorage
    let data = localStorage.getItem('inventarioData');
    d.addEventListener("DOMContentLoaded", getAllBase);
    if (data) {
        // Si ya hay datos se carga a la tabla
        data = JSON.parse(data);
        renderTable(data);
        console.log("Tiene data por lo cual ingresa al IF");
    } else {
        console.log("NO Tiene data por lo hace petición al servidor");
        ajax({
            // method: "GET", omiti esta por defecto para GET
            url: `http://${Ip}:3000/inventario-data`,
            //Funcion en caso de exito en HTML 
            success: (res) => {
                //console.log("");
                localStorage.setItem('inventarioData', JSON.stringify(res));
                renderTable(res);
            },
            //Funcion en caso de error en HTML
            error: (err) => {
                console.log(err);
                $table.insertAdjacentHTML("afterend", `<p><b>${err}</b></p>`);
                showMessage("Error no hay conexión con el servidor...", "alert");
            }
            // data: null -> omiti data
        })

    }

}

//RENDER DATA TABLE INVENTARIO
const renderTable = (res) => {
    $tbody.innerHTML = ""; // Limpiar el contenido previo del tbody

    res.forEach(element => { //iterar por cada template que traiga o elemento
        
        // Crear la etiqueta <img> para la foto
        const img = document.createElement("img");
        img.src = `http://${Ip}:3000/${element["Foto Dispositivo"]}`; // Ajusta el path a tu estructura de directorios
        img.alt = element["Foto Dispositivo"] || "Foto del dispositivo";
        img.width = 70; // Puedes ajustar el tamaño según tus necesidades
        img.height = 70; // Puedes ajustar el tamaño según tus necesidades

        $template.querySelector(".Foto").innerHTML = ''; // Limpiar el contenido anterior
        $template.querySelector(".Foto").appendChild(img);

        const url = document.createElement("a");
        url.href = `http://${Ip}:5500/Impresora.html?serial=${encodeURIComponent(element.SERIAL)}`;
        url.textContent = element.SERIAL;
        url.target='_blank';
        $template.querySelector(".Serial").innerHTML = ''; // Limpiar el contenido anterior
        $template.querySelector(".Serial").appendChild(url);
        $template.querySelector(".TipoDeCI").textContent = element['TIPO DE CI'];
        let tipoCI = element['TIPO DE CI'];

        // Verificar si el tipoCI ya existe en ListTipoCI
    if (!ListTipoCI.includes(tipoCI)) {
        ListTipoCI.push(tipoCI);
    }
        $template.querySelector(".NombreDispositivo").textContent = element['NOMBRE DISPOSITIVO']; //dentro de la variable template busca el selector con la class .numeroGuia poner lo que viene en nRemesa
        $template.querySelector(".TipoDeConexion").textContent = element['Tipo de conexión'];
        $template.querySelector(".DireccionIp").textContent = element.IP;
        $template.querySelector(".Sede").textContent = element.SEDE;
        $template.querySelector(".Edificio").textContent = element.EDIFICIO;
        $template.querySelector(".Piso").textContent = element.PISO;
        $template.querySelector(".Area").textContent = element.AREA;
        $template.querySelector(".Mac").textContent = element.MAC;
        $template.querySelector(".Gateway").textContent = element.Pasarela;
        $template.querySelector(".Mascara").textContent = element.Mascara;
        $template.querySelector(".Firmware").textContent = element.Firmware;
        $template.querySelector(".Asignacion").textContent = element.Asignación;
        $template.querySelector(".Marca").textContent = element.Marca;
        $template.querySelector(".Modelo").textContent = element.Modelo;
        $template.querySelector(".ColorBN").textContent = element['COLOR/BN'];
        $template.querySelector(".EstadoDeCI").textContent = element['Estado del CI'];
        $template.querySelector(".Departamento").textContent = element.Departamento;
        $template.querySelector(".Ciudad").textContent = element.Ciudad;
        $template.querySelector(".Direccion").textContent = element['Dirección Actual'];
        $template.querySelector(".Observacion").textContent = element.OBSERVACION;

        const serialDate = element['Ultima Fecha Confirmacion'];
        const jsDate = excelDateToJSDate(serialDate);

        $template.querySelector(".UltimaFechaConfirmacion").textContent = jsDate.toLocaleDateString();
        $template.querySelector(".Analista").textContent = element.Analista;
        let varDensidad = element['DENSIDAD TONER']
        if(varDensidad=="N/A" || varDensidad=="N/D" || varDensidad==""){
            $template.querySelector(".DensidadToner").textContent = varDensidad;
        }else{
            $template.querySelector(".DensidadToner").textContent = `${varDensidad*100}%`;
        }
        $template.querySelector(".ObservacionDensidad").textContent = element['OBSERVACION TONER'];
        $template.querySelector(".TipoImpresion").textContent = element['Tipo Impresion'];

        //Clonar el template para que quede en memoria
        let $clone = d.importNode($template, true);
        $fragment.appendChild($clone);    // no afectar el rendimiento del DOM pegar el nodo Clonado al fragmento
        //location.reload();
    });
    $tbody.appendChild($fragment);
    // Referencia al elemento select
const select = document.getElementById("filtroTipoCI");

//AGREGAR LAS OPCIONES DE CI 
    console.log("NO ingresa al IF");
    ListTipoCI.forEach(opcion => {
        console.log("Ingresa agregar al select");
        const optionElement = document.createElement("option");
        //optionElement.value = opcion.toLowerCase().replace(" ", "_");
        optionElement.textContent = opcion;
        select.appendChild(optionElement);
    });

} 

//ACTUALIZAR INVENTARIO
const actualizarInventario = () => {
    // Forzar una nueva solicitud al servidor

    localStorage.removeItem('inventarioData');
    ListTipoCI.length = 0;
    getAllBase();
    location.reload();
}

//---------------------------- Busqueda -----------------------------------------------
const filterTable = () => {
    const filterValues = inputs.map(input => input.value.toLowerCase());
    const rows = $tbody.querySelectorAll("tr");

    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td"));
        let match = true;

        cells.forEach((cell, index) => {
            if (filterValues[index] && !cell.textContent.toLowerCase().includes(filterValues[index])) {
                match = false;
            }
        });

        if (match) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// DOCument
d.addEventListener("DOMContentLoaded", getAllBase);

// FUNCION LIMPIAR FILTROS

function sendLimpiarFiltros() {
    // Obtener todos los inputs dentro del thead
    const inputs = document.querySelectorAll('.thead input');
    
    // Limpiar el valor de cada input
    inputs.forEach(input => {
        input.value = '';
    });

    // Obtener el select y establecer su valor a la opción predeterminada
    const select = document.getElementById('filtroTipoCI');
    if (select) {
        select.selectedIndex = 0; // Establece el valor a la primera opción
    }
    // Llamar a la función que filtra la tabla para que se actualice la visualización sin filtros
    filterTable();
}

// FUNCIÓN EXPORTAR ARCHIVO XLSX
function exportReportToExcel() {
    let table = document.getElementsByID("template");
    TableToExcel.convert(table[0], {
      name: `file.xlsx`,
      sheet: {
        name: 'Sheet 1'
      }
    });
}

//RECARGA PAGINA PARA QUE ACTUALICE EL IVENTARIO
// Función para recargar la página
// function recargarPagina() {
//     location.reload();
//     console.log('Se recargo la pagina');
// }

// Convertir 5 horas a milisegundos (5 horas * 60 minutos * 60 segundos * 1000 milisegundos)
const cincoHorasEnMilisegundos = 5 * 60 * 60 * 1000;

// Usar setInterval para llamar a la función recargarPagina cada 5 horas
setInterval(actualizarInventario, cincoHorasEnMilisegundos);

//location.reload();