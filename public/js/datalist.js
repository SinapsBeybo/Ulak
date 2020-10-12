httpGet();

function httpGet() {
    var url = "https://120.120.16.148:8443/beyboWS/personel";
    fetch(url)
        .then(response => response.json())
        .then(data => $(data).each(function() {
            kisi = "<option value=\"" + this.ad + " " + this.soyad + "\">" + this.ad + " " + this.soyad + "</option>";
            $('#kisiList').append(kisi);
        }));
}