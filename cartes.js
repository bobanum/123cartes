function nouveauPaquet() {
  var resultat = [];
  for (var s=0; s<gSortes.length; s++) {
    for (var v=0; v<gValeurs.length; v++) {
      resultat.push(gSortes[s]+gValeurs[v]);
    }
  }
  return resultat;
}
function brasser(paquet) {
  paquet = paquet.concat();
  var resultat = [];
  while (paquet.length) {
    var carte = paquet.splice(Math.floor(Math.random()*paquet.length), 1)[0];
    resultat.push(carte);
  }
  return resultat
}
function placerPile(id, cartes, left, top, decalage){
  var pile = document.body.appendChild(document.createElement("div"));
  pile.id = id;
  pile.className = "pile";
  pile.decalage = decalage || {left:0, top:0};
  pile.style.left = left+"px";
  pile.style.top = top+"px";
  for (var i=0; i<cartes.length; i++) {
    var carte = pile.appendChild(document.createElement("div"));
    carte.className = "carte";
    carte.carte = cartes[i];
    carte.style.marginLeft = i*pile.decalage.left+"px";
    carte.style.marginTop = i*pile.decalage.top+"px";
    carte.style.backgroundPosition = (gValeurs.indexOf(carte.carte[1])*-40)+"px "+(gSortes.indexOf(carte.carte[0])*-52)+"px";
  }
  return pile;
}
function retourner(carte, etat) {
  if (etat == true) {
    carte.className = "carte ouverte";
  }else if(etat == false){
    carte.className = "carte";
  }else{
    if (carte.className == "carte ouverte"){
      carte.className = "carte";
    }else{
      carte.className = "carte ouverte";
    }
  }
  return carte;
}
function transfererCarte(carte, pile, left, top, tourner, duree, delai) {
  coords = coordAbs(pile);
  var deltaX = coords.left;
  var deltaY = coords.top;
  positionAbsolue(carte);
  if (tourner) {
    var fonction = function() {
      retourner(carte);
      positionRelative(carte, pile);
    }
  }else {
    var fonction = function() {
      positionRelative(carte, pile);
    }
  }
  if (carte.style.marginLeft == "") carte.style.marginLeft = "0px";
  if (carte.style.marginTop == "") carte.style.marginTop = "0px";
  if (duree==undefined) duree = 200;
  if (duree > 0) {
    initialiserTransition(carte, {left:deltaX+"px", top:deltaY+"px", marginLeft:left+"px", marginTop:top+"px"}, duree, fonction, carte.style, delai);
    return carte;
  }else{
    carte.style.left = deltaX+"px";
    carte.style.top = deltaY+"px";
    carte.style.marginLeft = left+"px";
    carte.style.marginTop = top+"px";
    positionRelative(carte, pile);
    if (tourner) {
      retourner(carte);
    }
  }
  return;
}
function transfererPile(pile1, pile2, left, top, duree, delai) {
  coords = coordAbs(pile2);
  var deltaX = coords.left;
  var deltaY = coords.top;

  var fonction = function() {
    unirPiles(pile1, pile2);
  }
  if (duree==undefined) duree = 200;
  if (duree > 0) {
    initialiserTransition(pile1, {left:deltaX+left+"px", top:deltaY+top+"px"}, duree, fonction, pile1.style, delai);
    return pile1;
  }else{
    pile1.style.left = deltaX+left+"px";
    pile1.style.top = deltaY+top+"px";
    unirPiles(pile1, pile2);
  }
  return;
}
function coordAbs(carte) {
  var left = 0;
  var top = 0;
  var ptr = carte;
  while (ptr.nodeName != "BODY") {
    left += ptr.offsetLeft;
    top += ptr.offsetTop;
    ptr = ptr.parentNode;
  }
  return {left:left,top:top}
}
function positionAbsolue(carte) {
  var coords = coordAbs(carte);
  if (carte.style.marginLeft != "") {
    carte.style.marginLeft = "0px";
  }
  if (carte.style.marginTop != "") {
    carte.style.marginTop = "0px";
  }
  carte.style.left = coords.left+"px";
  carte.style.top = coords.top+"px";
  document.body.appendChild(carte.parentNode.removeChild(carte));
  return carte;
}
function coordRel(carte, pile) {
  var left = 0;
  var top = 0;
  var ptr = pile;
  while (ptr.nodeName != "BODY") {
    left += ptr.offsetLeft;
    top += ptr.offsetTop;
    ptr = ptr.parentNode;
  }
  return {left:parseFloat(carte.style.left)-left, top:parseFloat(carte.style.top)-top}
}
function positionRelative(carte, pile) {
  var coords = coordRel(carte, pile);
  carte.style.left = coords.left+"px";
  carte.style.top = coords.top+"px";
  pile.appendChild(carte.parentNode.removeChild(carte));
  return carte;
}
function activation(carte, handler, actif){
  if (carte) {
    if (actif == true) {
      carte.addEventListener(MOUSEDOWN, handler, true)
      carte.addEventListener(MOUSEUP, handler, true)
      carte.addEventListener(MOUSEMOVE, handler, true)
      carte.addEventListener(MOUSEOUT, handler, true)
    }else{
      carte.removeEventListener(MOUSEDOWN, handler, true)
      carte.removeEventListener(MOUSEUP, handler, true)
      carte.removeEventListener(MOUSEMOVE, handler, true)
      carte.removeEventListener(MOUSEOUT, handler, true)
    }
  }
}
function unirPiles(pile1, pile2){
  var marginLeft = 0;
  var marginTop = 0;
  var carte = pile1.firstChild;
  while (carte) {
    carte.style.marginLeft = pile2.decalage.left * pile2.childNodes.length+"px";
    carte.style.marginTop = pile2.decalage.top * pile2.childNodes.length+"px";
    pile2.appendChild(carte.parentNode.removeChild(carte));
    carte = pile1.firstChild;
  }
  pile1.parentNode.removeChild(pile1);
}
function getValeur(carte) {
  return gValeurs.indexOf(carte.carte[1]);
}
function getSorte(carte) {
  return gSortes.indexOf(carte.carte[0]);
}
function getCouleur(carte) {
  return Math.floor(getSorte(carte)/2);
}



