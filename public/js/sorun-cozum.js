var acc = document.getElementsByClassName("accordion");
    var i;
    var link = document.URL;
    var sorun = link.substring(link.length, link.lastIndexOf("#") + 1);
    var referrer =  document.referrer;
    console.log("sorun:" + sorun);
    sorunAl(sorun);
    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }

    function sorunAl(argument) {
        for (i = 0; i < acc.length; i++) {
            if (argument == acc[i].parentNode.id) {
                acc[i].classList.toggle("active");
                acc[i].style.backgroundColor = "#0C8383";
                var panel = acc[i].nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            }
        }
    }

    function geriDon(){
        location.href=referrer;
    }