navigator.serviceWorker.register('service-worker.js');
const content = document.getElementById("content");
const btnToggleMenu = document.getElementById("btnToggleMenu");
const menu = document.getElementById("menu");
const contentTitel = document.getElementById("contentTitel");
const fab = document.getElementById("fab");
const options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };
const loaderGif = `<img class="loadergGif" src="images/loading.gif">`;
fab.addEventListener('click', backNavigation);
btnToggleMenu.addEventListener('click', toggleMenu);
const btnCloseMe  = document.getElementById("btnCloseMe");
btnCloseMe.addEventListener('click', toggleMenu);
var turnierListeHtml = "";
var pruefungsListeHtml = "";
var startListeHtml = "";
var ergebnisListeHtml = "";
var divIdL0, divIdL1;
var turnierName = "";
var pruefungsName = "";
var thisUrl = window.location.href;
const apiProxy = "https://sj-sam.de/apps/ewu-app/proxy2.php";
const navigation = [
    { "title": "Alle Turnier", "view": "turnierListeHtml", "fab": "hidden" },
    { "title": "Turnier", "view": "pruefungsListeHtml", "fab": "visible" },
    { "title": "Pruefung", "view": "turnierlisteHtml", "fab": "visible" },
];
//menu.style.visibility = "hidden";
console.log(menu.style.visibility);
var navigationLevel = 0;
let deferredPrompt;
// const btnInstall = document.getElementById("btnInstall");
// window.addEventListener('beforeinstallprompt', (e) => {
//     // Prevent Chrome 67 and earlier from automatically showing the prompt
//     e.preventDefault();
//     // Stash the event so it can be triggered later.
//     deferredPrompt = e;
//     // Update UI to notify the user they can add to home screen
//     addBtn.style.display = 'block';
  
//     btnInstall.addEventListener('click', (e) => {
//       // hide our user interface that shows our A2HS button
//       //addBtn.style.display = 'none';
//       // Show the prompt
//       console.log("clicked!!");
//       deferredPrompt.prompt();
//       // Wait for the user to respond to the prompt
//       deferredPrompt.userChoice.then((choiceResult) => {
//           if (choiceResult.outcome === 'accepted') {
//             console.log('User accepted the A2HS prompt');
//           } else {
//             console.log('User dismissed the A2HS prompt');
//           }
//           deferredPrompt = null;
//         });
//     });
//   });

getTurnierListe('Turniere/Aktuell');

function sendToWhatsapp(){
  window.location = "whatsapp://send?text="+thisUrl;
  closeMenu();
}

function showAppInfo(){
  closeMenu();
  navigationLevel = 1;//show FAB
  fab.style.visibility = navigation[navigationLevel].fab;
  content.innerHTML = loaderGif;
  contentTitel.innerHTML = "Info zur App";
  fetch('info.html')
  .then(function(response){
    return response.text();
  })
  .then(function(text){
    content.innerHTML = text;
  })
  // content.src = "info.html";
}

function showQR() {
  closeMenu();
  navigationLevel = 1;//show FAB
  fab.style.visibility = navigation[navigationLevel].fab;
  contentTitel.innerHTML = "QR-Code";
  content.innerHTML = "";
  let qrcodeDiv = document.createElement("div");
  qrcodeDiv.id = "qrcode";
  content.appendChild(qrcodeDiv);
  new QRCode(document.getElementById("qrcode"), {width: 200, height: 200, text:thisUrl});
}

function toggleMenu(){
  if(menu.style.visibility == "hidden" || menu.style.visibility == ""){
      menu.style.visibility = "visible";
  }else{
      menu.style.visibility = "hidden";
  }
}

function closeMenu(){
  if(menu.style.visibility == "visible"){
    menu.style.visibility = "hidden";
  }
}
//------------------------------------------------------------------------
async function getTurnierListe(what) {
    navigationLevel = 0;
    fab.style.visibility = navigation[navigationLevel].fab;
    contentTitel.innerHTML = "";
    try{
        content.innerHTML = `<img class="loadingGif" src="images/loading.gif">`;
        content.innerHTML = loaderGif;
        //let response = await fetch(`${apiProxy}?a=${what}`);
        let response = await fetch("Aktuell.json");//for testing
        let myJson = await response.json();
        let turnierListe = myJson.turnierLightList;
        turnierListe.sort(function (a, b) { return b.anfang.localeCompare(a.anfang) });
        turnierListeHtml = turnierListe.map(drawTurniere).join('\n');
        content.innerHTML = turnierListeHtml;
        contentTitel.innerHTML = "Alle Turniere";
    }catch{
        content.innerHTML = "Es ist ein Fehler aufgetreten. Bitte probiere es später nocheinmal";
    }

}//-------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
async function getZeitplan(turnierNr) {
    navigationLevel = 1;
    divIdL0 = turnierNr;
    fab.style.visibility = navigation[navigationLevel].fab;
    contentTitel.innerHTML = "";
    try{
        content.innerHTML = loaderGif;
        let response = await fetch(`${apiProxy}?a=Turniere/Zeitplan/${turnierNr}`);
        //let response = await fetch("Zeitplan.json");
        
        let myJson = await response.json();
        turnierName = myJson.tunierbezeichnung;
        contentTitel.innerHTML = turnierName;
        let zeitplan = myJson.zeitplan;
        pruefungsListeHtml = zeitplan.map(drawPruefungen).join('\n');
        content.innerHTML = pruefungsListeHtml;
    }catch{
        content.innerHTML = "kein Zeitplan vorhanden";
    }

}//------------------------------------------------------------------------------------------------------

async function getNewsListe(turnierNr) {
    navigationLevel = 1;
    divIdL0 = turnierNr;
    fab.style.visibility = navigation[navigationLevel].fab;
    contentTitel.innerHTML = "";
    try{
        content.innerHTML = loaderGif;
        let response = await fetch(`${apiProxy}?a=Turniere/News/${turnierNr}`);
        //let response = await fetch("News.json");
        let myJson = await response.json();
        contentTitel.innerHTML = "News";
        let news = myJson.newsList;
        newsListeHtml = news.map(drawNews).join('\n');
        content.innerHTML = newsListeHtml;
    }catch{
        content.innerHTML = "keine News vorhanden";
    }

}//------------------------------------------------------------------------------------------------------

async function getKontaktListe(turnierNr) {
    navigationLevel = 1;
    divIdL0 = turnierNr;
    fab.style.visibility = navigation[navigationLevel].fab;
    contentTitel.innerHTML = "";
    try{

        content.innerHTML = loaderGif;
        let response = await fetch(`${apiProxy}?a=Turniere/Kontakt/${turnierNr}`);
        //let response = await fetch("Kontakt.json");
        let myJson = await response.json();
        contentTitel.innerHTML = "Kontakt";
        let list = myJson.contactList;
        kontaktListeHtml = list.map(drawKontaktListe).join('\n');
        content.innerHTML = kontaktListeHtml;
    }catch{
        content.innerHTML = "keine Kontaktliste vorhanden";
    }

}//------------------------------------------------------------------------------------------------------

async function getStartListe(pruefungsNr) {
    navigationLevel = 2;
    divIdL1 = pruefungsNr;
    fab.style.visibility = navigation[navigationLevel].fab;
    contentTitel.innerHTML = "";
    try{
        content.innerHTML = loaderGif;
        let response = await fetch(`${apiProxy}?a=Turniere/Startliste/${pruefungsNr}`);
        //let response = await fetch("Startliste.json");
        let myJson = await response.json();
        let startListe = myJson.reiterList;
        pruefungsName = myJson.pruefungKurz;
        contentTitel.innerHTML = pruefungsName;
        startListeHtml = startListe.map(drawStartliste).join('\n');
        content.innerHTML = startListeHtml;
    }catch{
        content.innerHTML = "keine Startliste vorhanden";
    }
}

async function getErgebnisListe(pruefungsNr) {
    navigationLevel = 2;
    divIdL1 = pruefungsNr;
    fab.style.visibility = navigation[navigationLevel].fab;
    contentTitel.innerHTML = "";
    try{
        content.innerHTML = loaderGif;
        let response = await fetch(`${apiProxy}?a=Turniere/Ergebnis/${pruefungsNr}`);
        //let response = await fetch("Ergebnisliste.json");
        let myJson = await response.json();
        let ergebnisListe = myJson.reiterList;
        ergebnisListe.sort(function (a, b) { return a.position - b.position; });
        pruefungsName = myJson.pruefungKurz;
        contentTitel.innerHTML = pruefungsName;
        ergebnisListeHtml = ergebnisListe.map(drawErgebnisliste).join('\n');
        content.innerHTML = ergebnisListeHtml;
    }catch{
        content.innerHTML = "keine Ergebnisliste vorhanden";
    }
}

async function getPattern(pruefungsNr){
    navigationLevel = 2;
    divIdL1 = pruefungsNr;
    fab.style.visibility = navigation[navigationLevel].fab;
    contentTitel.innerHTML = "";
    try{
        content.innerHTML = loaderGif;
        let response = await fetch(`${apiProxy}?a=Turniere/Pattern/${pruefungsNr}`);
        let myJson = await response.json();
        var i64 = myJson.patternImage;
        content.innerHTML=`<img src="data:image/jpg;base64, ${i64}" width=100%>`;
    }catch{
        content.innerHTML = "keine Pattern vorhanden";
    }
            

}
//-------------------------------------------------------------------------------------------
function drawTurniere(element) {
    let anfang = new Date(element.anfang).toLocaleDateString('de-DE', options);
    let nennschluss = new Date(element.nennschluss).toLocaleDateString('de-DE', options);

    return `<div class="card" id="${element.turnierNr}">
    <b>${element.name}</b><br>
    <b>${anfang}</b><br>
    
    ${element.ort}<br>
    <i>Nennschluss: ${nennschluss}</i><br>
    <button class="linkButton" onclick="getZeitplan(${element.turnierNr})">Zeitplan</button>
    <button class="linkButton" onClick="getNewsListe(${element.turnierNr})">News</button>
    <button class="linkButton" onclick="getKontaktListe(${element.turnierNr})">Kontakt</button>
    </div>`;
}//------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
function drawPruefungen(element) {
    var pruefungsNr = element.id;
    var eintrag = element.eintrag;
    var reitplatz = element.reitplatz;
    var tagDatum = new Date(element.tagDatum);
    var startZeit = element.startZeit.substring(0, 5);
    tagDatum = tagDatum.toLocaleDateString('de-DE', options);
    var wochenTag = tagDatum.substring(0, 2);
    var anzahlNennungen = element.anzahlNennungen;
    return `<div class="card" id="${element.id}">
    <b>${wochenTag}, ${startZeit} ${eintrag}</b><br>
        <b>${reitplatz}</b>,  Nennungen: ${anzahlNennungen}<br>
        <button class="linkButton" onclick="getStartListe(${pruefungsNr})">Startliste</button>
        <button class="linkButton" onclick="getPattern(${pruefungsNr})">Pattern</button>
        <button class="linkButton" onclick="getErgebnisListe(${pruefungsNr})">Ergebnis</button>
    </div>`;
}//-----------------------------------------------------------------------------------------------------

function drawNews(element) {
    let datum = new Date(element.timestamp);
    datum = datum.toLocaleTimeString('de-DE', options);
    return `<div class="card" id="${element.id}">
    ${datum}<br>
    ${element.plainText}</div>`;
}
//-----------------------------------------------------------------------------------------------------

function drawKontaktListe(element) {
    return `<div class="card" id="${element.id}">
    ${element.name}<br>
    ${element.function}<br>

    ${element.mobile}</div>`;
}
//-----------------------------------------------------------------------------------------------------

function drawStartliste(element) {
    return `<div class="card">
    <b>${element.position} | ${element.reiter} (${element.startNr}) - ${element.pferd}</b>
    </div>`;
}
//--------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------
function drawErgebnisliste(element) {
    return `<div class="card">
    <b>${element.position} | ${element.reiter} | ${element.score} - ${element.pferd}</b>
    </div>`;
}
//--------------------------------------------------------------------------------------------------------

function backToAktuell(turnierNr) {
    backArrow.innerHTML = "";
    contentTitel.innerHTML = "Alle Turniere";
    content.innerHTML = turnierListeHtml;
    document.getElementById(turnierNr).scrollIntoView();

}

function backNavigation() {

    switch (navigationLevel) {
        case 1:
            contentTitel.innerHTML = "Alle Turniere";
            content.innerHTML = turnierListeHtml;
            navigationLevel = 0;
            fab.style.visibility = navigation[navigationLevel].fab;
            document.getElementById(divIdL0).scrollIntoView();
            break;

        case 2:
            contentTitel.innerHTML = turnierName;
            content.innerHTML = pruefungsListeHtml;
            navigationLevel = 1;
            fab.style.visibility = navigation[navigationLevel].fab;
            document.getElementById(divIdL1).scrollIntoView();
            break;

    }
}

