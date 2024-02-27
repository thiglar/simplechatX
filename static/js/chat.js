

let dialog = document.getElementById("myDialog");
let btnOptions = document.getElementById("btnOptions");
let btnLogin = document.getElementById("btnLogin");
let btnSendMessage = document.getElementById("btnSendMessage");
let inputTextMessage = document.getElementById("inputTextMessage");
let inputUsername = document.getElementById("inputUsername");
let messagesList = document.querySelector(".messages-list");
var username = "";
btnOptions.onclick = function() {
    dialog.style.display = "block";
}

btnLogin.onclick = function() {
    const url = '/login';

    const data = {
        username: inputUsername.value
    };

    const request = new Request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                console.log('Login was successful. Status code: 200 OK');
                dialog.style.display = "none";
                location.reload();
            } else {
                console.log(`Login failed with status code: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
        });

}

function scrollToBottom() {
    messagesList.scrollTo({
        top: messagesList.scrollHeight,
        behavior: 'smooth',
      })
}

function isScrolledDown() {
    return Math.ceil(messagesList.scrollHeight - messagesList.scrollTop) <= messagesList.clientHeight + messagesList.lastChild.clientHeight;
}


function createMessageElement(messageText, messageAuthor = undefined, messageType = "", messageCenter = false) {
    if (messageText.trim() !== "") {
        let messageContainer = document.createElement("div");

        if (messageCenter)
            messageContainer.className = "message-container center";
        else
            messageContainer.className = "message-container";

        let message = document.createElement("div");
        message.className = "message " + messageType;

        if (messageAuthor !== undefined) {
            let messageAuthorElement = document.createElement("p");
            messageAuthorElement.className = "message-author";
            messageAuthorElement.textContent = messageAuthor;
            message.appendChild(messageAuthorElement);
        }

        let messageTextElement = document.createElement("p");
        messageTextElement.className = "message-text";
        messageTextElement.textContent = messageText;

        message.appendChild(messageTextElement);

        messageContainer.appendChild(message);
        messagesList.appendChild(messageContainer);
    }
}

function joinRoom() {
    socket.emit('join', room_id);
}

function sendMessage(){
    let messageText = inputTextMessage.value;
    let scrolledDown = isScrolledDown();
    if (messageText.trim() !== "") {

        socket.emit('send_message', { 'room': room_id, 'text': messageText });

        inputTextMessage.value = "";

        createMessageElement(messageText, undefined, "left");

        if (scrolledDown) {
            scrollToBottom();
        }

    }
}

btnSendMessage.addEventListener("click", sendMessage);

inputTextMessage.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendMessage();
    }
});

var socket = io();

socket.on('server', function(msg) {
    createMessageElement(msg, undefined, "info", true);
});

socket.on('joined', function(data) {
    createMessageElement(data + ' joined', undefined, "info", true);
});

socket.on('left', function(data) {
    createMessageElement(data + ' left', undefined, "info", true);
});

socket.on('message', function(data) {
    let scrolledDown = isScrolledDown();
    console.log(username + " === " + data.author);

    if (!(username === data.author)) {
    {
        createMessageElement(data.text, data.author);
    }

    if (scrolledDown) {
        scrollToBottom();
    }
});


fetch("/profile")
    .then(response => {
        if (response.status === 200) {
            return response.json();
        }
        else
        {
            dialog.style.display = "block";
        }
    })
    .then (data=> {
        username = data.username;
        console.log(username);
        joinRoom();
    })
    .catch(error => {
        console.error('Error:', error);
    });

