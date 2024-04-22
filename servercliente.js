const net = require('net');
const readline = require('readline-sync') //modula para escribir en consola

const options = {
    port:4000,
    host: '127.0.0.1'
}

const client = net.createConnection(options)

client.on('connect', ()=>{
    console.log('Conecxión satisfactoria!!')
    //client.write('Hola servidorsito, de nuevo yo')
    enviarlinea() //enviando al servidor el msje
})

//recibe respuesta del servidor
client.on('data', (data)=>{
    console.log('el servidor responde: '+ data)
    enviarlinea() //enviando al servidor el msje
})


client.on('error',(err)=>{
    console.log(err.message)
})

function enviarlinea(){
    var line = readline.question('\ndigite alguna cosa\t')
    if (line == "0"){
        client.end()
    }else{
        client.write(line)
    }
}