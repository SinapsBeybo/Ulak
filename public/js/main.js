const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const ikon = document.getElementById('ikon').href;
const dosyaSec = document.getElementById('dosya');
const $kalin = document.getElementById('bold');
const $italik = document.getElementById('italik');
//const fs = require('fs');
var boldMu = false;
var italikMi = false;
let mesajSahibi;
let foc = true;
focusMu();
//gor();
let tarih = new Date();
let saatFormat = tarih.toLocaleTimeString();
//var keyStore = ["wireless", "pc", "elektrik", "tarih", "priz", "firefox", "ekran", "dokunmatik", "titreme", "mavi", "kirmizi", "windows", "android", "sketch", "sifre", "ad", "barkod"];
var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
link.type = 'image/x-icon';
link.rel = 'shortcut icon';
document.getElementsByTagName('head')[0].appendChild(link);
let intv = undefined;

// Get username and room from URL
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();
window.onerror = function(error) {
    console.log("Hata:" + error);
    //location.href="https://120.120.16.151:3000/";
};
window.addEventListener("focus", winFocus);

function winFocus() {
    clearInterval(intv);
    document.title = "Sinaps Ulak";
    link.href = '/img/ulakLogo.png';
    console.log("focuss");
    intv = undefined;
    socket.emit(
        'goz',
        "Görüldü"
    );
};


// Join chatroom
socket.emit('joinRoom', {
    username,
    room
});

// Get room and users
socket.on('roomUsers', ({
    room,
    users
}) => {
    outputRoomName(room);
    outputUsers(users);
    console.log(users);
});

// Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //gorulduMu();
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('gorme', arg => {
    let eye = document.getElementsByClassName("fa-eye");
    for (var i = 0; i < eye.length; i++) {
        eye[i].style.color = "blue";
    }
})


// Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!socket.connected) alert("Disconnect oldunuz");
    // Get message text
    let el = document.getElementById("msg");
    let msg = el.value;
    msg = formatKontrol(msg);
    keySorgula(msg);

});

function outputMessage(message) {
    let tarih = new Date();
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('meta');

    mesajSahibi = message.username;
    //console.log("Mesajın:" + message.text);
    //console.log("ms: " + mesajSahibi);
    if (messageOwnerControl(mesajSahibi)) {
        div.classList.add('alici');
        div.innerHTML = '<p class="meta"><i class="fas fa-eye" style="color:white"></i> ' + message.username + ' <span> ' + message.time + ' </span></p><p class="text"> ' + message.text + ' </p>';
    } else {
        div.innerHTML = '<p class="meta"> ' + message.username + ' <span> ' + message.time + ' </span></p><p class="text"> ' + message.text + ' </p>';
    }
    document.querySelector('.chat-messages').appendChild(div);
    let myData = {
        sender: message.username,
        zaman: message.time,
        icerik: message.text,
        vakit: tarih,
        birimAdi: room
    };
    if (localStorage.getItem("eskiMesaj") == null) {
        let arrayData = new Array(myData);
        localStorage.setItem("eskiMesaj", JSON.stringify(arrayData));
    } else {
        let newData = JSON.parse(localStorage.getItem("eskiMesaj"));
        newData.push(myData);
        localStorage.setItem("eskiMesaj", JSON.stringify(newData));
    }
    if (!focusMu() && !messageOwnerControl(message.username)) {

        a = true;
        if (intv == undefined) intv = setInterval(() => {

            a ? link.href = '/img/transmitterLogo.png' : link.href = '/img/ulakLogo.png';
            a ? document.title = "Yeni Mesajınız var" : document.title = "Sinaps Ulak";

            a = !a;
        }, 500);
    };
    boldMu = false;
    italikMi = false;
    if (focusMu()) {
        socket.emit(
            'goz',
            "Görüldü"
        );
    }
}
localdenGetir();

function localdenGetir() {
    let bot = "Sinaps Ulak";
    let eskiMesaj = localStorage.getItem("eskiMesaj");
    eskiMesaj = JSON.parse(eskiMesaj);
    let bugun = new Date();
    if (eskiMesaj == null) return;
    if (eskiMesaj.length > 0) {
        let silinecekler = [];
        for (var i = 0; i < eskiMesaj.length; i++) {
            const div = document.createElement('div');
            div.classList.add('message');
            div.classList.add('meta');
            let eskiMesajSender = eskiMesaj[i].sender;
            let eskiMesajZaman = eskiMesaj[i].zaman;
            let eskiMesajIcerik = eskiMesaj[i].icerik;
            let eskiMesajTarih = new Date(eskiMesaj[i].vakit);
            let eskiMesajBirim = eskiMesaj[i].birimAdi;
            if (room == eskiMesajBirim) {
                if (bugun.getTime() <= eskiMesajTarih.getTime() + (7 * 24 * 3600 * 1000)) {
                    if (messageOwnerControl(eskiMesaj[i].sender)) {
                        div.classList.add('alici');
                        div.innerHTML = '<p class="meta"> ' + eskiMesajSender + ' <span> ' + eskiMesajZaman + ' </span></p><p class="text"> ' + eskiMesajIcerik + ' </p>';
                        document.querySelector('.chat-messages').appendChild(div);
                    } else if (eskiMesaj[i].sender == bot) {} else {
                        div.innerHTML = '<p class="meta"> ' + eskiMesajSender + ' <span> ' + eskiMesajZaman + ' </span></p><p class="text"> ' + eskiMesajIcerik + ' </p>';
                        document.querySelector('.chat-messages').appendChild(div);
                    }
                } else if (bugun.getTime() > eskiMesajTarih.getTime() + (7 * 24 * 3600 * 1000)) {

                    silinecekler.push(eskiMesaj[i]);

                }
            }
        }
        for (var j = silinecekler.length - 1; j >= 0; j--) {
            //remove item selected, second parameter is the number of items to delete 
            eskiMesaj.splice(silinecekler[j], 1);
        }
        // Put the object into storage
        localStorage.setItem('eskiMesaj', JSON.stringify(eskiMesaj));
        const hr = document.createElement('hr');
        hr.style.height = "10px";
        document.querySelector('.chat-messages').appendChild(hr);
        // Scroll down
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function focusMu() {
    if (document.hasFocus()) {
        foc = true;

    } else {
        foc = false;
    }
    return foc;
}

function messageOwnerControl(mUsername) {
    if (username == mUsername) {
        return true;
    } else {
        return false;
    }
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

function baglantiKontrol() {
    if (!socket.connected) {
        alert("Lütfen Sayfayı Yenileyin");
        document.getElementById("msg").disabled = true;
        document.getElementById("dosya").disabled = true;
        document.getElementById("btnStart").disabled = true;
    }
}

function titleDegistir() {
    document.getElementById('title').text = "Sinaps Ulak";
}

window.onoffline = (event) => {
    alert("internet gitti");
    document.getElementById("msg").disabled = true;
    document.getElementById("dosya").disabled = true;
    document.getElementById("btnStart").disabled = true;
};

window.ononline = (event) => {
    location.reload();
};

/////Geri Notification dönüş noktası

/**
 * Check Browser Notification Permission
 * @type window.Notification|Window.Notification|window.webkitNotification|Window.webkitNotification|Window.mozNotification|window.mozNotification
 */
var Notification = window.Notification || window.mozNotification || window.webkitNotification;
Notification.requestPermission(function(permission) {});
socket.on('show_notification', function(data) {
    if (username != data.title && userList.textContent.includes(data.title) && !focusMu()) {
        if (data.message.includes("<img")) {
            showDesktopNotification(data.title, "1 Yeni Resim Alındı", data.icon);
        } else if (data.message.includes("<video")) {
            showDesktopNotification(data.title, "1 Yeni Video Alındı", data.icon);
        } else if (data.message.includes("<a")) {
            showDesktopNotification(data.title, "1 Yeni Dosya Alındı", data.icon);
        } else {
            showDesktopNotification(data.title, data.message, data.icon);
        }
    }
});
/**
 * Set Notification Request
 * @type type
 */
function setNotification() {
    showDesktopNotification('Lokesh', 'Desktop Notification..!', '/index.jpeg');
    sendNodeNotification('Lokesh', 'Browser Notification..!', '/index.jpeg');
}

/**
 * Request Browser Notification Permission 
 * @type Arguments
 */
function requestNotificationPermissions() {
    if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {});
    }
}
/**
 * Show Desktop Notification If Notification Allow
 * @param {type} title
 * @param {type} message
 * @param {type} icon
 * @returns {undefined}
 */
function showDesktopNotification(message, body, icon, sound, timeout) {
    if (!timeout) {
        timeout = 4000000;
    }
    console.log("Kull:" + message + "Mesaj:" + body);
    requestNotificationPermissions();
    var instance = new Notification(
        message, {
            body: body,
            icon: ikon,
            sound: sound
        }
    );
    instance.onclick = function() {

    };
    instance.onerror = function() {
        // Something to do
    };
    instance.onshow = function() {
        // Something to do
    };
    instance.onclose = function() {
        // Something to do
    };
    if (sound) {
        instance.sound;
    }
    setTimeout(instance.close.bind(instance), timeout);
    //document.getElementById('title').text="Yeni Mesajınız Var..";
    return false;
}
/**
 * Send Node Notification
 * @param {type} title
 * @param {type} message
 * @param {type} icon
 * @returns {undefined}
 */
function sendNodeNotification(title, message, icon) {

    socket.emit('chatMessage', {
        message: message,
        title: title,
        icon: icon,
    });

}

dosyaSec.onchange = e => {
    var file = e.target.files[0];
    var dosyaAdi = file.name;
    var dosyaTipi = file.type;
    var dosyaUzantisi = dosyaAdi.substring(dosyaAdi.length, dosyaAdi.length - 3);
    var dosyaBoyutu = file.size;
    console.log("dosya Uzantisi:" + dosyaUzantisi);
    if (dosyaBoyutu < 10485760) {
        // setting up the reader
        var reader = new FileReader();
        reader.readAsDataURL(file); // this is reading as data url

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            if (dosyaUzantisi == "svg" || dosyaUzantisi == "png" || dosyaUzantisi == "jpg" || dosyaUzantisi == "gif") {
                msg = '<img class="img-fluid" alt="Görüntü Yüklenemedi" src="' + content + '">';
            } else if (dosyaUzantisi == "mp4" || dosyaUzantisi == "avi") {
                msg = '<video class="img-fluid" alt="Görüntü Yüklenemedi" src="' + content + '">';
            } else {
                msg = '<a class="img-fluid" download="' + dosyaAdi + '" target="_blank" href="' + content + '">' + dosyaAdi + '</a>';
            }

            // Emit message to server
            socket.emit('chatMessage', msg);
        }
    } else {
        alert("Seçtiğiniz Dosyanın Boyutu 10 MB'dan Büyük. Gönderilemiyor. ");
    }
}

function toggleBold() {
    if (boldMu == false) {
        $kalin.style.backgroundColor = "teal";
        $kalin.style.color = "white";
        boldMu = true;
    } else if (boldMu == true) {
        $kalin.style.backgroundColor = "white";
        $kalin.style.color = "teal";
        boldMu = false;
    }
}

function toggleItalik(message) {
    if (italikMi == false) {
        $italik.style.backgroundColor = "teal";
        $italik.style.color = "white";
        italikMi = true;
    } else if (italikMi == true) {
        $italik.style.backgroundColor = "white";
        $italik.style.color = "teal";
        italikMi = false;
    }
}

function formatKontrol(argument) {
    if (boldMu) {
        argument = "<b>" + argument + "</b>";
        toggleBold();
    }
    if (italikMi) {
        argument = "<i>" + argument + "</i>";
        toggleItalik();
    }
    return argument;

}

var sonuc;

function keySorgula(arg) {
    var input = document.getElementById("msg"), //e.target
        list = input.getAttribute('list'),
        options = document.querySelectorAll('#' + list + ' option'),
        sonuc,
        label = input.value;

    //GERİ DÖNÜŞ NOKTASI
    for (var k = 0; k < options.length; k++) {
        var option = options[k];
        var bulunduMu = false;
        if (option.innerText === label) {
            bulunduMu = true;
            sonuc = option.getAttribute('data-keys');
            arg = { username: "Sinaps Ulak", text: 'Sorununuz için aşağıdaki çözümü deneyebilirsiniz.<br><a target="_blank" href="sorun-cozum.html#' + sonuc + '">Çözüm İçin Tıklayınız</a>', time: saatFormat }
            outputMessage(arg);
            // Clear input
            input.value = '';
            input.focus();
            // Scroll down
            chatMessages.scrollTop = chatMessages.scrollHeight;
            break;
        }
    }
    if (!bulunduMu) {
        // Emit message to server
        socket.emit('chatMessage', arg);

        // Clear input
        input.value = '';
        input.focus();
        sonuc = false;
    }
    return;
}
/*gecmisiGoster();

 function gecmisiGoster()
{
var odaAdi=roomName.innerText;
    const tarih = new Date();
        const ay = tarih.getMonth() + 1;
    /*var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "", false);
    console.log("Oda Adı:"+room);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                
            }
        }
    }
    rawFile.send(null);


$.ajax({
    url: "log/log_file_"+room + "-" + tarih.getDate() + "-" + ay + "-" + tarih.getFullYear()+".txt",
    type: 'GET'
})
.done(function(response) {
    alert(response);
})
.fail(function() {
    console.log("error");
})
.always(function() {
    console.log("complete");
});
}
*/