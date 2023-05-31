var res;
var results;
var select;

var res_produits;
var results_produits;
var select_produits;

window.onload = function () {
    document.getElementById("input").value = "";
    document.getElementById("input-produit").value = "";
    results = document.getElementById("results");
    results_produits = document.getElementById("results-produits");
}

let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5.5,
        center: { lat: 46.232192999999995, lng: 2.209666999999996 },
        zoomControl: true,
        scaleControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
    });
}


window.initMap = initMap;

function updateResults() {
    var value = document.getElementById("input").value;

    if (value.length >= 3) {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                res = JSON.parse(this.responseText).items;

                results.innerHTML = "";
                var pos = 0;

                res.forEach(el => {
                    results.innerHTML += `<p onclick="selectCity(this)" class="${pos}">${el.name}</p>`;
                    pos++;
                });
            }
        });

        xhr.open("GET", `https://api-prod-24hinfo.hacquet.com/cities/search?q=${value}`);

        xhr.send();
    } else {
        results.innerHTML = "";
    }
}

async function getCollectPoints(lat, lng) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                resolve(JSON.parse(this.responseText));

            }
        });

        xhr.open("GET", `https://api-prod-24hinfo.hacquet.com/find?lat=${lat}&lng=${lng}`);

        xhr.send();
    });
}

function selectCity(el) {
    select = res[el.className];
    results.innerHTML = "";
    document.getElementById("input").value = select.name;
    map.setCenter({ lat: select.lat, lng: select.lon });
    map.setZoom(13);
    getCollectPoints(select.lat, select.lon).then((res) => {
        res.forEach(el => {
            var marker = new google.maps.Marker({
                position: { lat: el.latitude, lng: el.longitude },
                map: map,
                title: el.name
            });

            var infowindow = new google.maps.InfoWindow({
                content: `<h3>${el.name}</h3><p>${el.address}</p>`
            });

            marker.addListener("click", () => {
                infowindow.open(map, marker);
            });

            marker.setMap(map);
        });
    }).catch((err) => {
        console.log(err);
    })
}

function updateProduits() {
    var value = document.getElementById("input-produit").value;

    if (value.length >= 3) {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                res_produits = JSON.parse(this.responseText).results;

                results_produits.innerHTML = "";
                var pos = 0;

                res_produits.forEach(el => {
                    results_produits.innerHTML += `<p onclick="selectProduit(this)" class="${pos}">${el.name}</p>`;
                    pos++;
                });
            }
        });

        xhr.open("GET", `https://api-prod-24hinfo.hacquet.com/products/search?q=${value}`);

        xhr.send();
    } else {
        results_produits.innerHTML = "";
    }
}

function selectProduit(el) {
    if(!res){
        alert("Veuillez sélectionner une ville avant de choisir un produit");
        return;
    };
    select_produits = res_produits[el.className];
    results_produits.innerHTML = "";
    document.getElementById("input-produit").value = select_produits.name;
    document.getElementById("d").style.display = "unset";
    getProduitInCity();

    document.getElementById("titre-produit").innerHTML = select_produits.name;
}

function getProduitInCity() {
    var xhr = new XMLHttpRequest();

    var rowProduct = document.getElementById("rowProduct");

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            res_produits = JSON.parse(this.responseText);
            rowProduct.innerHTML = '';
            for (let i = 0; i < res_produits.results.length; i++){
                if (res_produits.results[i].material == "O" && !(res_produits.results[i].name.toLowerCase().includes("plastique"))){
                    rowProduct.innerHTML += `<div class="product-cart ${res_produits.results[i].material}"><h2>${res_produits.results[i].name}</h2><p>Cet objet doit être traité particulièrement ! Veuillez le jeter dans une poubelle spéciale.</p></div>`
                } else if (res_produits.results[i].gesture == "À TRIER"){
                    if (res_produits.results[i].material == "V"){
                        rowProduct.innerHTML += `<div class="product-cart trier ${res_produits.results[i].material}"><h2>${res_produits.results[i].name}</h2><p>Cet objet doit être trié ! Veuillez le jeter dans le contenaire à verre.</p></div>`
                    } else {
                        rowProduct.innerHTML += `<div class="product-cart trier ${res_produits.results[i].material}"><h2>${res_produits.results[i].name}</h2><p>Cet objet doit être trié ! Veuillez le jeter dans la poubelle jaune.</p></div>`
                    }
                } else {
                    rowProduct.innerHTML += `<div class="product-cart jeter"><h2>${res_produits.results[i].name}</h2><p>Cet objet doit être jeté ! Veuillez le jeter dans la poubelle verte.</p></div>`
                }
            }
            
        }
    });

    xhr.open("GET", `https://api-prod-24hinfo.hacquet.com/cities/${select.inseeCode}/${select_produits.slug}`);

    xhr.send();
}