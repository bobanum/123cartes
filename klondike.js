window.onload = function() {
  window.gVoyons = [];
  window.gSortes = "TPCK";
  window.gValeurs = "1234567890VDR";
  window.gPaquet = brasser(nouveauPaquet());
  window.gPref = {
    distanceColonne:15,
    distanceDefausse:10,
  }
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
  window.gTalon;
  window.gDefausse;
  window.gMaisons = [];
  window.gColonnes = [];
  placerTrous();
  gTalon = placerPile("talon", gPaquet, 5, 5, {left:0, top:0});
  gTalon.addEventListener(MOUSEDOWN, distribuer3cartes, false);
  gDefausse = placerPile("defausse", [], 50, 5, {left:10, top:0});
  for (var i=0; i<4; i++) {
    gMaisons.push(placerPile("maison"+i, [], i*45+140, 5, {left:0, top:0}));
  }
  for (var i=0; i<7; i++) {
    gColonnes.push(placerPile("colonne"+i, [], i*45+5, 67, {left:0, top:15}));
  }
  var delai = 0;

  var cartes = [];
  for (var i=0; i<7; i++) {
    for (var j=i; j<7; j++) {
      var tourner = (i==j);
      if (tourner) {
        activation(gTalon.lastChild, deplacerColonne, true);
      }
      var carte = transfererCarte(positionAbsolue(gTalon.lastChild), gColonnes[j], i*gColonnes[j].decalage.left, i*gColonnes[j].decalage.top, tourner, 200, delai);
      cartes.push(carte);
      delai += 100;
    }
  }
  transition2(cartes, function() {afficherJouables()});
  return;
}
function distribuer3cartes() {
  masquerJouables();
  if (gTalon.lastChild){
    replacerDefausse();
    var cartes = [];
    for (var i=0; i<3; i++) {
      if (gTalon.lastChild) {
        var carte = gTalon.lastChild;
        var carte2 = transfererCarte(positionAbsolue(carte), gDefausse, i*gDefausse.decalage.left, i*gDefausse.decalage.top, true, 100, i*100);
        cartes.push(carte2);
      }
    }
    transition2(cartes, function() {afficherJouables()});
    activation(carte, deplacerDefausse, true);
  }else{
    replacerDefausse();
    var cartes = [];
    while (gDefausse.lastChild) {
      var carte = transfererCarte(positionAbsolue(gDefausse.lastChild), gTalon, 0, 0, true, 0);
      cartes.push(carte);
    }
    transition2(cartes, function() {afficherJouables()});
  }
}
function replacerDefausse() {
  if (gDefausse.lastChild) {
    activation(gDefausse.lastChild, deplacerDefausse, false);
    var c = gDefausse.lastChild;
    c.style.marginLeft = c.style.marginTop = "0px";
    if (c.previousSibling) {
      var c = c.previousSibling;
      c.style.marginLeft = c.style.marginTop = "0px";
    }
  }
}
function placerTrous() {
  var trou = document.body.appendChild(document.createElement("div"));
  trou.className = "carte trou";
  trou.style.left = "5px";
  trou.style.top = "5px";
  for (var i=0; i<4; i++) {
    var trou = document.body.appendChild(document.createElement("div"));
    trou.className = "carte trou";
    trou.style.left = (i*45+140)+"px";
    trou.style.top = "5px";
  }
  for (var i=0; i<7; i++) {
    var trou = document.body.appendChild(document.createElement("div"));
    trou.className = "carte trou";
    trou.style.left = (i*45+5)+"px";
    trou.style.top = "67px";
  }
}
function deplacerDefausse(e) {
  e.preventDefault();
  if (gIPod) {
    touche = e.touches[0];
  }else{
    touche = e;
  }
  if (e.type==MOUSEDOWN && !this.deplacement) {
    masquerJouables();
    this.deplacement = {};
    this.deplacement.parent = this.parentNode;
    this.deplacement.marginLeft = parseInt(this.style.marginLeft) || 0;
    this.deplacement.marginTop = parseInt(this.style.marginTop) || 0;
    positionAbsolue(this);
    this.deplacement.offsetX = touche.clientX-parseFloat(this.style.left);
    this.deplacement.offsetY = touche.clientY-parseFloat(this.style.top);
    this.deplacement.possibilites = trouverPossibilites(this);
    afficherPossibilites(this.deplacement.possibilites);
  }else if ((e.type==MOUSEMOVE || e.type==MOUSEOUT) && this.deplacement) {
    this.style.left = touche.clientX-this.deplacement.offsetX+"px";
    this.style.top = touche.clientY-this.deplacement.offsetY+"px";
  }else if (e.type==MOUSEUP && this.deplacement) {
    var poss = null;
    if (this.deplacement.possibilites['maisons'].length) {
      var poss = this.deplacement.possibilites['maisons'][calculerDistance(this.parentNode, this.deplacement.possibilites['maisons'])];
    }else if (this.deplacement.possibilites['colonnes'].length) {
      var poss = this.deplacement.possibilites['colonnes'][calculerDistance(this.parentNode, this.deplacement.possibilites['colonnes'])];
    }
    if (poss) {
      var marginTop = poss.childNodes.length * poss.decalage.top;
      var marginLeft = poss.childNodes.length * poss.decalage.left;
      var carte = transfererCarte(this, poss, marginLeft, marginTop, false, 200);
      activation(this, deplacerDefausse, false);
      activation(this, deplacerColonne, true);
      activation(gDefausse.lastChild, deplacerDefausse, true);
    }else{
      var carte = transfererCarte(this, this.deplacement.parent, this.deplacement.marginLeft, this.deplacement.marginTop, false, 200);
      activation(this, deplacerColonne, false);
    }
    transition2(carte, function(){afficherJouables()});
    masquerPossibilites(this.deplacement.possibilites);
    delete this.deplacement;
  }
}
function deplacerColonne(e) {
  e.preventDefault();
  if (gIPod) {
    touche = e.touches[0];
  }else{
    touche = e;
  }
  if (e.type==MOUSEDOWN && !this.deplacement) {
    masquerJouables();
    this.deplacement = {};
    this.deplacement.parent = this.parentNode;
    this.deplacement.marginLeft = parseInt(this.style.marginLeft) || 0;
    this.deplacement.marginTop = parseInt(this.style.marginTop) || 0;
    var coords = coordAbs(this);
    this.deplacement.offsetX = touche.clientX-coords.left;
    this.deplacement.offsetY = touche.clientY-coords.top;
    var pile = grouperColonne(this);
    this.deplacement.possibilites = trouverPossibilites(this);
    afficherPossibilites(this.deplacement.possibilites);
    return;
  }else if ((e.type==MOUSEMOVE || e.type==MOUSEOUT) && this.deplacement) {
    this.parentNode.style.left = touche.clientX-this.deplacement.offsetX+"px";
    this.parentNode.style.top = touche.clientY-this.deplacement.offsetY+"px";
    return;
  }else if (e.type==MOUSEUP && this.deplacement) {
    var poss = null;
    if (this.deplacement.possibilites['maisons'].length) {
      var poss = this.deplacement.possibilites['maisons'][calculerDistance(this.parentNode, this.deplacement.possibilites['maisons'])];
    }else if (this.deplacement.possibilites['colonnes'].length) {
      var poss = this.deplacement.possibilites['colonnes'][calculerDistance(this.parentNode, this.deplacement.possibilites['colonnes'])];
    }
    if (poss) { // Si on peut placer la colonne qq part
      var marginTop = poss.childNodes.length * poss.decalage.top;
      var marginLeft = poss.childNodes.length * poss.decalage.left;

      var pile = transfererPile(this.parentNode, poss, marginLeft, marginTop, 200);
      if (this.deplacement.parent.lastChild) {
        if (this.deplacement.parent.lastChild.className == "carte") {
          retourner(this.deplacement.parent.lastChild);
          activation(this.deplacement.parent.lastChild, deplacerColonne, true);
        }
      }
    }else{ // On la retourne au point de depart
      var pile = transfererPile(this.parentNode, this.deplacement.parent, this.deplacement.marginLeft, this.deplacement.marginTop, false, 200);
    }
    transition2(pile, function(){afficherJouables()});
    masquerPossibilites(this.deplacement.possibilites);
    delete this.deplacement;
    return;
  }
}
function trouverPossibilites(carte) {
  var sorte = getSorte(carte);
  var valeur = getValeur(carte);
  var couleur = getCouleur(carte);
  var resultat = {maisons:[], colonnes:[]};
  if (!carte.nextSibling) {
    for (var i=0; i<gMaisons.length; i++) {
      var maison = gMaisons[i];
      if (maison.lastChild) {
        if (sorte==getSorte(maison.lastChild) && valeur==getValeur(maison.lastChild)+1){
          resultat.maisons.push(maison);
        }
      }else{
        if (carte.carte[1]=="1"){
          resultat.maisons.push(maison);
        }
      }
    }
  }
  for (var i=0; i<gColonnes.length; i++) {
    var colonne = gColonnes[i];
    if (colonne.lastChild) {
      if (colonne.lastChild.className=="carte ouverte" && couleur!=getCouleur(colonne.lastChild) && valeur==getValeur(colonne.lastChild)-1){
        resultat.colonnes.push(colonne);
      }
    }else{
      if (carte.carte[1]=="R"){
        resultat.colonnes.push(colonne);
      }
    }
  }
  return resultat;
}
function estJouable(carte) {
  var valeur = getValeur(carte);
  var sorte = getSorte(carte);
  var couleur = getCouleur(carte);
  if (!carte.nextSibling) {
    for (var i=0; i<gMaisons.length; i++) {
      var maison = gMaisons[i];
      if (maison.lastChild) {
        if (sorte==getSorte(maison.lastChild) && valeur==getValeur(maison.lastChild)+1){
          return true;
        }
      }else{
        if (carte.carte[1]=="1"){
          return true;
        }
      }
    }
  }
  for (var i=0; i<gColonnes.length; i++) {
    var colonne = gColonnes[i];
    if (colonne.id == carte.parentNode.id) continue;
    if (colonne.lastChild) {
      if (colonne.lastChild.className=="carte ouverte" && couleur!=getCouleur(colonne.lastChild) && valeur==getValeur(colonne.lastChild)-1){
        return true;
      }
    }else{
      if (carte.carte[1]=="R"){
        return true;
      }
    }
  }
  return false;
}
function afficherPossibilites(possibilites) {
  for (var j in possibilites) {
    for (var i=0; i<possibilites[j].length; i++) {
      if (possibilites[j][i].lastChild) {
        possibilites[j][i].lastChild.style.backgroundColor = "cyan";
      }else{
        possibilites[j][i].style.backgroundColor = "cyan";
      }
    }
  }
}
function masquerPossibilites(possibilites) {
  for (var j in possibilites) {
    for (var i=0; i<possibilites[j].length; i++) {
      if (possibilites[j][i].lastChild) {
        possibilites[j][i].lastChild.style.backgroundColor = "";
      }else{
        possibilites[j][i].style.backgroundColor = "";
      }
    }
  }
}
function trouverJouables() {
  var resultat = []
  if (gDefausse.lastChild && estJouable(gDefausse.lastChild)){
    resultat.push(gDefausse.lastChild);
  }
  for (var i=0; i<gColonnes.length; i++) {
    var colonne = gColonnes[i];
    if (colonne.lastChild) {
      var carte = colonne.lastChild;
      while (carte && carte.className == "carte ouverte"){
        if (estJouable(carte)){
          resultat.push(carte);
        }
        var carte = carte.previousSibling;
      }
    }
  }
  return resultat;
}
function afficherJouables(jouables) {
  jouables = jouables || trouverJouables();
  for (var i=0; i<jouables.length; i++) {
    jouables[i].style.backgroundColor = "yellow";
  }
}
function masquerJouables() {
  var resultat = []
  if (gDefausse.lastChild){
    gDefausse.lastChild.style.backgroundColor = "";
  }
  for (var i=0; i<gColonnes.length; i++) {
    var colonne = gColonnes[i];
    if (colonne.lastChild) {
      var carte = colonne.lastChild;
      while (carte && carte.className == "carte ouverte"){
        carte.style.backgroundColor = "";
        var carte = carte.previousSibling;
      }
    }
  }
  return resultat;
}
function calculerDistance(carte, possibilites) {
  var resultat = -1;
  var coords1 = coordAbs(carte);
  var distance = 99999999999999999999999;
  for (var i=0; i<possibilites.length; i++) {
    if (possibilites[i].lastChild) {
      var coords2 = coordAbs(possibilites[i].lastChild);
    }else{
      var coords2 = coordAbs(possibilites[i]);
    }
    var left = coords1.left-coords2.left;
    var top = coords1.top-coords2.top;
    var d = Math.pow(left,2)+Math.pow(top,2);
    if (d < distance){
      distance = d;
      resultat = i;
    }
  }
  return resultat;
}
function grouperColonne(carte) {
  var decalage = parseInt(carte.style.marginTop);
  var coords = coordAbs(carte);
  var pile = placerPile("transport", [], coords.left, coords.top);
  while (carte) {
    var proc = carte.nextSibling;
    carte.style.marginTop = parseInt(carte.style.marginTop)-decalage+"px";
    pile.appendChild(carte.parentNode.removeChild(carte));
    carte = proc;
  }
  return pile;
}
