const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const ikon = document.getElementById('ikon').href;
const dosyaSec = document.getElementById('dosya');
const $kalin = document.getElementById('bold');
const $italik = document.getElementById('italik');
var boldMu = false;
var italikMi = false;
let mesajSahibi;
let saatFormat;
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
window.onfocus = function() {
    clearInterval(intv);
    document.title = "Sinaps Ulak";
    link.href = '/img/ulakLogo.png';
    intv = undefined;
    //socket.emit('chatMessage', "Görüldü");
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

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


// Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!socket.connected) alert("Disconnect oldunuz");
    // Get message text
    //let msg = e.target.elements.msg.value;
    let el = document.getElementById("msg");
    let msg = el.value;
    msg = formatKontrol(msg);
    keySorgula(msg);
    /* //Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    el.value = '';
    el.focus();*/

});

/*socket.on('error',function(){
  location.href="https://120.120.16.151:3000/";
})*/
// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('meta');
    mesajSahibi = message.username;
    console.log("Mesajın:" + message.text);
    //message.text=toggleItalik(message.text);
    console.log("ms: " + mesajSahibi);
    if (messageOwnerControl(mesajSahibi)) {
        div.classList.add('alici');
        div.innerHTML = '<p class="meta" style="text-align:right">' + message.username + '<span style="text-align:right">' + message.time + '</span></p><p class="text" style="text-align:right">' +
            message.text + '</p>';
    } else {
        div.innerHTML = '<p class="meta">' + message.username + '<span>' + message.time + '</span></p><p class="text">' + message.text + '</p>';
    }
    document.querySelector('.chat-messages').appendChild(div);
    if (!document.hasFocus() && !messageOwnerControl(message.username)) {
        a = true;
        if (intv == undefined) intv = setInterval(() => {

            a ? link.href = '/img/transmitterLogo.png' : link.href = '/img/ulakLogo.png';
            a ? document.title = "Yeni Mesajınız var" : document.title = "Sinaps Ulak";

            a = !a;
        }, 500);
    };
    boldMu = false;
    italikMi = false;
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
    if (username != data.title && userList.textContent.includes(data.title)) {
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
        // Something to do
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
    //document.querySelector('input[list]').addEventListener('input', function(e) {
    var input = document.getElementById("msg"), //e.target
        list = input.getAttribute('list'),
        options = document.querySelectorAll('#' + list + ' option'),
        sonuc,
        label = input.value;

    //GERİ DÖNÜŞ NOKTASI
    for (var k = 0; k < options.length; k++) {
        var option = options[k];
        var bulunduMu=false;
        if (option.innerText === label) {
            bulunduMu=true;
            sonuc = option.getAttribute('data-keys');

            swal({
                    title: "Yükleniyor...",
                    text: "Doğrudan Çözüm Sayfasına Gitmek İçin Lütfen Tamam'a basın",
                    imageUrl: '/img/loading.gif',
                    imageWidth: 200,
                    imageHeight: 200,
                    imageAlt: 'Sinaps Ulak',
                    animation: true,
                    showCancelButton: true,
                    confirmButtonColor: "#0c8383",
                    confirmButtonText: "Tamam",
                    cancelButtonText: "İptal",
                    closeOnConfirm: false,
                    closeOnCancel: true
                },
                function(inputValue) {
                    //Use the "Strict Equality Comparison" to accept the user's input "false" as string)
                    if (inputValue === true) {
                        setTimeout(() => { location.href = "sorun-cozum.html#" + sonuc; }, 0);
                    } else {
                        // Emit message to server
                        socket.emit('chatMessage', arg);

                        // Clear input
                        input.value = '';
                        input.focus();
                    }
                });
            break;
        } 
   } 
   if(!bulunduMu){
            // Emit message to server
            socket.emit('chatMessage', arg);

            // Clear input
            input.value = '';
            input.focus();
            sonuc = false;
            }
return;
}

//Yeni DÖNÜŞ NOKTASI
/*

var count = 1;
var group = document.getElementById('slg');
var list_group = group.querySelector('li ul');
var list_array = group.querySelectorAll('li ul li');
var search = group.getElementsByTagName('input')[0];

search.addEventListener('input', function(e) {
    for (var i = 0; i < list_array.length; i++) {
        matching(list_array[i])
    }
    show_list(list_group);
    key_up_down();
});

search.addEventListener('click', function(e) {
    init_list();
    show_list(list_group);
    key_up_down();
});

search.addEventListener('keypress', function(e) {
    if (e.keyCode == 13) {
        e.target.value = list_group.querySelector('[data-highlight="true"]').innerHTML
    }
    hide_list(list_group)
    init_list();
});

function matching(item) {
    var str = new RegExp(search.value, 'gi');
    if (item.innerHTML.match(str)) {
        item.dataset.display = 'true'
    } else {
        item.dataset.display = 'false';
        item.dataset.highlight = 'false';
        count = 0
    }
}

function init_list() {
    count = 0;
    for (var i = 0; i < list_array.length; i++) {
        init_item(list_array[i]);
        list_array[i].addEventListener('click', copy_paste);
    }
}

function init_item(item) {
    item.dataset.display = 'true';
    item.dataset.highlight = 'false';
}

function copy_paste() {
    search.value = this.innerHTML;
    // todo : check match of list text and input value for .current 
    init_list();
    hide_list(list_group);
}

function hide_list(ele) {
    ele.dataset.toggle = 'false'
}

function show_list(ele) {
    ele.dataset.toggle = 'true'
}

function key_up_down() {

    var items = group.querySelectorAll('li[data-display="true"]');
    var last = items[items.length - 1];
    var first = items[0];

    search.onkeydown = function(e) {

        if (e.keyCode === 38) {
            count--;
            count = count <= 0 ? items.length : count;
            items[count - 1].dataset.highlight = items[count - 1] ? 'true' : 'false';
            if (items[count]) {
                items[count].dataset.highlight = 'false';
            } else {
                first.dataset.highlight = 'false';
            }
        }

        if (e.keyCode === 40) {
            items[count].dataset.highlight = items[count] ? 'true' : 'false';
            if (items[count - 1]) {
                items[count - 1].dataset.highlight = 'false';
            } else {
                last.dataset.highlight = 'false';
            }
            count++;
            count = count >= items.length ? 0 : count;
        }
    };
}

group.addEventListener('mouseleave', function(event) {
    if (event.target != list_group && event.target.parentNode != list_group) {
        list_group.dataset.toggle = 'false'
    }
});

*/



/*
hiddenInput.value = label;

for (var k = 0; k < options.length; k++) {
    var option = options[k];

    if (option.innerText === label) {
        hiddenInput.value = option.getAttribute('data-keys');

        for (var i = 0; i < keyStore.length; i++) {
            if (hiddenInput.value.includes(keyStore[i])) {
                sonuc = keyStore[i];
                swal({
                        title: "Yükleniyor...",
                        text: "Doğrudan Çözüm Sayfasına Gitmek İçin Lütfen Tamam'a basın",
                        imageUrl: '/img/loading.gif',
                        imageWidth: 200,
                        imageHeight: 200,
                        imageAlt: 'Sinaps Ulak',
                        animation: true,
                        showCancelButton: true,
                        confirmButtonColor: "#0c8383",
                        confirmButtonText: "Tamam",
                        cancelButtonText: "İptal",
                        closeOnConfirm: false,
                        closeOnCancel: true
                    },
                    function(inputValue) {
                        //Use the "Strict Equality Comparison" to accept the user's input "false" as string)
                        if (inputValue === true) {
                            setTimeout(() => { location.href = "sorun-cozum.html#" + sonuc; }, 0);
                        } else {
                            // Emit message to server
                            socket.emit('chatMessage', arg);

                            // Clear input
                            input.value = '';
                            input.focus();
                        }
                    });
                break;
            } else {
                // Emit message to server
                socket.emit('chatMessage', arg);

                // Clear input
                input.value = '';
                input.focus();
                sonuc = false;
            }
        }

    }
}
return sonuc;
});*/