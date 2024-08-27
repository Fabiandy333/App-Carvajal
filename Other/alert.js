var timeouts = {};
var timeoutLength = 2000;

// Función para mostrar un mensaje
function showMessage(message, type) {
    var timestamp = Date.now();
    var html = messageHtml(message, type, timestamp);
    $('.messages').append(html);
    messageTimeout(timestamp);
}
function messageHtml(message, type, timestamp) {
    return `<div class="message message--${type} message--${timestamp}" data-timestamp="${timestamp}" role="alert">${message}<div class="message__status">${spinnerHtml()}</div></div>`;
}

function spinnerHtml() {
    return `<div class="pie__wrapper">
    <div class="pie pie__spinner"></div>
    <div class="pie pie__filler"></div>
    <div class="pie__mask"></div>
    </div>`;
}

function removeMessage(timestamp) {
    var $message = $('.message--' + timestamp);
    if ($message.length) {
        $message.addClass('message--removing');
        setTimeout(function() {
            $message.remove();
        }, 200);
    }
}

function messageTimeout(timestamp) {
    timeouts[timestamp] = setTimeout(function() {
        removeMessage(timestamp);
    }, timeoutLength);
}

// LOADER
// Muestra la superposición
function showOverlay() {
    document.querySelector('.overlay').style.display = 'flex';
}

// Oculta la superposición
function hideOverlay() {
    document.querySelector('.overlay').style.display = 'none';
}

