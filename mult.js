window.onload = function() {
  window.gCompil = [];
  window.gTimestamp = 0;
  window.gNumero = 0;
  window.gNombre = 10;
  if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    window.gIPod = true;
    window.MOUSEDOWN = 'touchstart';
    window.MOUSEUP = 'touchend';
    window.MOUSEMOVE = 'touchmove';
    window.MOUSEOUT = 'mouseout';
  }else{
    window.gIPod = false;
    window.MOUSEDOWN = 'mousedown';
    window.MOUSEUP = 'mouseup';
    window.MOUSEMOVE = 'mousemove';
    window.MOUSEOUT = 'mouseout';
  }
  var div = document.body.appendChild(pageQuiz());
  return;
}
function pageQuiz() {
  var page = document.createElement("DIV");
  var div = page.appendChild(composerOperation());
  var dial = page.appendChild(document.createElement("TABLE"));
  dial.align="center";
  var tbody = dial.appendChild(document.createElement("TBODY"));
  var tr = tbody.appendChild(document.createElement("TR"));
  var th = tr.appendChild(creerCellDial(1));
  var th = tr.appendChild(creerCellDial(2));
  var th = tr.appendChild(creerCellDial(3));
  var tr = tbody.appendChild(document.createElement("TR"));
  var th = tr.appendChild(creerCellDial(4));
  var th = tr.appendChild(creerCellDial(5));
  var th = tr.appendChild(creerCellDial(6));
  var tr = tbody.appendChild(document.createElement("TR"));
  var th = tr.appendChild(creerCellDial(7));
  var th = tr.appendChild(creerCellDial(8));
  var th = tr.appendChild(creerCellDial(9));
  var tr = tbody.appendChild(document.createElement("TR"));
  var th = tr.appendChild(document.createElement("TH"));
  th.className = "bouton annuler";
  th.innerHTML = "&#x2718;";
  th.addEventListener(MOUSEDOWN, toucheAnnuler, false);
  var th = tr.appendChild(creerCellDial(0));
  var th = tr.appendChild(document.createElement("TH"));
  th.className = "bouton ok";
  th.innerHTML = "&#x2714;";
  th.addEventListener(MOUSEDOWN, toucheOk, false);
  return page;
}
function creerCellDial(chiffre) {
  var th = document.createElement("TH");
  th.className = "chiffre";
  th.innerHTML = chiffre;
  th.addEventListener(MOUSEDOWN, toucheChiffre, false);

  return th;
}
function toucheChiffre(e) {
  var reponse = document.getElementById("reponse");
  if (reponse.innerHTML == "?") {
    reponse.innerHTML = this.innerHTML;
  }else if(reponse.innerHTML.length < 3) {
    reponse.innerHTML += this.innerHTML;
  }
  return
}
function toucheAnnuler(e) {
  var reponse = document.getElementById("reponse");
  reponse.innerHTML = "?";
  return
}
function toucheOk(e) {
  var operation = document.getElementById("operation");
  var duree = (new Date().getTime() - gTimestamp)/1000;
  var reponse = document.getElementById("reponse");
  if (operation.reponse == reponse.innerHTML*1){
    var reussi = true;
    operation.style.backgroundColor = "green";
  }else{
    var reussi = false;
    operation.style.backgroundColor = "red";
    duree+=10;
  }
  gCompil.push({operation:operation.operation, duree:duree, reussi:reussi});
  setTimeout(changerOperation,500);
  return
}
function composerOperation(){
  var n1 = Math.floor(Math.random()*12)+1;
  var n2 = Math.floor(Math.random()*12)+1;
  var pos = Math.floor(Math.random()*3);
  var div = document.createElement("DIV");
  div.operation = n1+"\u00D7"+n2+"="+n1*n2;
  div.id = "operation";
  var t1 = document.createTextNode(n1);
  var t2 = document.createTextNode(n2);
  var t3 = document.createTextNode(n1*n2);
  var reponse = document.createElement("span");
  reponse.id = "reponse";
  reponse.appendChild(document.createTextNode("?"));
  switch (pos) {
    case 0:
      div.appendChild(t1);
      div.appendChild(document.createTextNode("\u00D7"));
      div.appendChild(t2);
      div.appendChild(document.createTextNode("="));
      div.appendChild(reponse);
      div.reponse = n1*n2;
    break;
    case 1:
      div.appendChild(t1);
      div.appendChild(document.createTextNode("\u00D7"));
      div.appendChild(reponse);
      div.appendChild(document.createTextNode("="));
      div.appendChild(t3);
      div.reponse = n2;
    break;
    case 2:
      div.appendChild(reponse);
      div.appendChild(document.createTextNode("\u00D7"));
      div.appendChild(t2);
      div.appendChild(document.createTextNode("="));
      div.appendChild(t3);
      div.reponse = n1;
    break;
  }
  gTimestamp = new Date().getTime();
  return div;
}
function changerOperation(){
  gNumero++;
  if (gNumero < gNombre) {
    var operation = document.getElementById("operation");
    operation.parentNode.replaceChild(composerOperation(), operation);
  }else{
    afficherCompil();
  }
}
function afficherCompil() {
  while (document.body.firstChild) {document.body.removeChild(document.body.firstChild)};
  document.body.appendChild(composerCompil(gCompil));
}
function composerCompil(compil) {
  var page = document.createElement("DIV");
  var table = page.appendChild(document.createElement("TABLE"));
  table.cellSpacing = "0";
  table.align="center";
  table.className = "compil";
  var tbody = table.appendChild(document.createElement("TBODY"));
  var total = 0;
  for (var i=0; i<compil.length; i++) {
    var tr = tbody.appendChild(document.createElement("TR"));
    if (compil[i].reussi){
      tr.style.backgroundColor="green";
    }else{
      tr.style.backgroundColor="red";
    }
    var th = tr.appendChild(document.createElement("TH"));
    th.innerHTML = (compil[i].operation);
    var td = tr.appendChild(document.createElement("TD"));
    total += compil[i].duree;
    td.innerHTML = (compil[i].duree).toFixed(1).replace(".",",");
  }
  var tr = tbody.appendChild(document.createElement("TR"));
  var th = tr.appendChild(document.createElement("TH"));
  th.innerHTML = "Total";
  var td = tr.appendChild(document.createElement("TD"));
  td.innerHTML = total.toFixed(1).replace(".",",");

  return page;

}
