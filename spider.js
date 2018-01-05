window.onload = function() {
  window.gSortes = "TPCK";
  window.gValeurs = "1234567890VDR";
  window.gPaquet = brasser(nouveauPaquet().concat(nouveauPaquet()));
  window.gTalon = null;
  window.gMaisons = [];
  window.gColonnes = [];
  window.gUndo = [];
  window.gPref = {
    afficherPossibilites:false,
    distanceColonne:15,
    animTalon:0,
    animColonne:0,
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
  placerJeu(gPaquet);
}
function placerJeu(paquet) {
  gMaisons = [];
  gColonnes = [];
  gUndo = [];
  placerTrous();
  placerBoutons(76,5);
  gTalon = placerPile("talon", paquet, 5, 5, {left:0, top:0});
  gTalon.addEventListener(MOUSEDOWN, distribuer10cartes, false); //***
  for (var i=0; i<8; i++) {
    gMaisons.push(placerPile("maison"+i, [], i*15+170, 5, {left:0, top:0}));
  }
  for (var i=0; i<10; i++) {
    gColonnes.push(placerPile("colonne"+i, [], i*30+5, 67, {left:0, top:15}));
  }
  var delai = 0;

  var cartes = [];
  for (var i=0; i<6; i++) {
    for (var j=0; j<10; j++) {
        var tourner = ((j>=4 && i==4)||(j<4 && i==5));
        if (tourner) {
          activation(gTalon.lastChild, deplacerColonne, true);
        }
        var carte = transfererCarte(positionAbsolue(gTalon.lastChild), gColonnes[j], i*gColonnes[j].decalage.left, i*gColonnes[j].decalage.top, tourner, gPref.animTalon, delai);
        cartes.push(carte);
        delai += 100;
        if (j>=3 && i==5) break;
    }
  }
  //tourner les premières cartes
  transition2(cartes, function() {afficherJouables()});
  return;
}
function viderEcran() {
  while(document.body.firstChild) document.body.removeChild(document.body.firstChild);
}
function distribuer10cartes() {
  masquerJouables();
  if (gTalon.lastChild){
    gUndo.push({type:'distribuer'});
    var cartes = [];
    for (var i=0; i<10; i++) {
      if (gTalon.lastChild) {
        var colonne = gColonnes[i];
        var carte = gTalon.lastChild;
        activation(carte, deplacerColonne, true);
        var carte2 = transfererCarte(positionAbsolue(carte), colonne, colonne.decalage.left*colonne.childNodes.length, colonne.decalage.top*colonne.childNodes.length, true, gPref.animTalon, i*100);
        cartes.push(carte2);
      }
    }
    transition2(cartes, function() {afficherJouables()});
  }
}
function placerTrous() {
  var trou = document.body.appendChild(document.createElement("div"));
  trou.className = "carte trou";
  trou.style.left = "5px";
  trou.style.top = "5px";
  for (var i=0; i<8; i++) {
    var trou = document.body.appendChild(document.createElement("div"));
    trou.className = "carte trou";
    trou.style.left = (i*15+170)+"px";
    trou.style.top = "5px";
  }
  for (var i=0; i<7; i++) {
    var trou = document.body.appendChild(document.createElement("div"));
    trou.className = "carte trou";
    trou.style.left = (i*45+5)+"px";
    trou.style.top = "67px";
  }
}
function placerBoutons(left, top) {
  var bouton = document.body.appendChild(document.createElement("div"));
  bouton.innerHTML = "&#x27F2;";
  bouton.className = "bouton";
  bouton.style.left = left+"px";
  bouton.style.top = top+"px";
  bouton.addEventListener('click', evtRecommencer, false); //***
  var bouton = document.body.appendChild(document.createElement("div"));
  bouton.innerHTML = "&#x27f4;";
  bouton.className = "bouton";
  bouton.style.left = left+34+"px";
  bouton.style.top = "5px";
  bouton.addEventListener('click', evtNllePartie, false); //***
  var bouton = document.body.appendChild(document.createElement("div"));
  bouton.innerHTML = "&#x293e;";
  bouton.className = "bouton";
  bouton.style.left = left+"px";
  bouton.style.top = top+30+"px";
  bouton.style.width = "63px";
  bouton.addEventListener('click', evtUndo, false); //***
  return;
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
    this.deplacement.possibilites = trouverPossibilites(this);
    var pile = grouperColonne(this);
    if (gPref.afficherPossibilites) afficherPossibilites(this.deplacement.possibilites);
    return;
  }else if ((e.type==MOUSEMOVE || e.type==MOUSEOUT) && this.deplacement) {
    this.parentNode.style.left = touche.clientX-this.deplacement.offsetX+"px";
    this.parentNode.style.top = touche.clientY-this.deplacement.offsetY+"px";
    return;
  }else if (e.type==MOUSEUP && this.deplacement) {
    var poss = null;
    var touche = trouverTouche(this, this.deplacement.possibilites);
    if (touche.length) {
      var poss = touche[calculerDistance(this.parentNode, touche)];
    }else {
      for (var noPoss=0; noPoss<this.deplacement.possibilites.length; noPoss++) {
        if (this.deplacement.possibilites[noPoss].length) {
          var poss = this.deplacement.possibilites[noPoss][calculerDistance(this.parentNode, this.deplacement.possibilites[noPoss])];
          break;
        }
      }
    }
    if (poss) { // Si on peut placer la colonne qq part
      var tourne = (this.deplacement.parent.lastChild && this.deplacement.parent.lastChild.className=="carte" )
      gUndo.push({type:'pile', objet:this, origine:this.deplacement.parent, tourne:tourne});
      var marginTop = poss.childNodes.length * poss.decalage.top;
      var marginLeft = poss.childNodes.length * poss.decalage.left;

      var pile = transfererPile(this.parentNode, poss, marginLeft, marginTop, gPref.animColonne);
      if (this.deplacement.parent.lastChild) {
        if (this.deplacement.parent.lastChild.className == "carte") {
          retourner(this.deplacement.parent.lastChild);
          activation(this.deplacement.parent.lastChild, deplacerColonne, true);
        }
      }
    }else{ // On la retourne au point de depart
      var pile = transfererPile(this.parentNode, this.deplacement.parent, this.deplacement.marginLeft, this.deplacement.marginTop, gPref.animColonne);
    }
    transition2(pile, function(){afficherJouables()});
    if (gPref.afficherPossibilites) masquerPossibilites(this.deplacement.possibilites);
    delete this.deplacement;
    return;
  }
}
function trouverPossibilites(carte) { //+++
  var resultat = [[],[],[],[]];
  if (!estDeplacable(carte)) return resultat;
  var sorte = getSorte(carte);
  var valeur = getValeur(carte);
  if (valeur == 12) {
    var ptr = carte;
    while (ptr.nextSibling) ptr = ptr.nextSibling;
    if (getValeur(ptr) == 0) {
      for (var i=0; i<gMaisons.length; i++) {
        var maison = gMaisons[i];
        if (!maison.firstChild) {
          resultat[0].push(maison);
          break;
        }
      }
    }
  }
  for (var i=0; i<gColonnes.length; i++) {
    var colonne = gColonnes[i];
    if (colonne.lastChild) {
      if (colonne.lastChild.className=="carte ouverte" && valeur == getValeur(colonne.lastChild)-1 && sorte == getSorte(colonne.lastChild)){
        resultat[1].push(colonne);
      }else if (colonne.lastChild.className=="carte ouverte" && valeur == getValeur(colonne.lastChild)-1){
        resultat[2].push(colonne);
      }
    }else{
      resultat[3].push(colonne);
    }
  }
  return resultat;
}
function estJouable(carte) {  //+++
  if (!estDeplacable(carte)) return false;
  var sorte = getSorte(carte);
  var couleur = getCouleur(carte);
  var valeur = getValeur(carte);
  for (var i=0; i<gColonnes.length; i++) {
    var colonne = gColonnes[i];
    if (colonne.id == carte.parentNode.id) continue;
    if (colonne.lastChild) {
      if (colonne.lastChild.className=="carte ouverte" && valeur == getValeur(colonne.lastChild)-1){
        return true;
      }
    }else{
      return true;
    }
  }
  return false;
}
function estDeplacable(carte) { //+++
  if (carte.className != "carte ouverte") return false;
  if (carte.nextSibling && getSorte(carte) != getSorte(carte.nextSibling)) return false;
  if (carte.nextSibling && getValeur(carte) != getValeur(carte.nextSibling)+1) return false;
  if (carte.nextSibling && !estDeplacable(carte.nextSibling)) return false;
  return true;
}
function afficherPossibilites(possibilites) {
  for (var j=0; j<possibilites.length; j++) {
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
  for (var j=0; j<possibilites.length; j++) {
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
function trouverTouche(carte, possibilites) {
  var poss = [];
  for (var i=0; i<possibilites.length; i++) {
    poss = poss.concat(possibilites[i]);
  }
  var resultat = [];
  var coords1 = coordAbs(carte);
  for (var i=0; i<poss.length; i++) {
    if (poss[i].lastChild) {
      var obj = poss[i].lastChild;
    }else{
      var obj = poss[i];
    }
    var coords2 = coordAbs(obj);
    if (coords1.left>coords2.left+obj.clientWidth || coords2.left>coords1.left+obj.clientWidth || coords1.top>coords2.top+obj.clientHeight || coords2.top>coords1.top+obj.clientHeight) continue;
    resultat.push(poss[i]);

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
function evtUndo() {
  if (gUndo.length) {
    masquerJouables();
    var undo = gUndo.splice(gUndo.length-1,1);
    undo=undo[0];
    switch (undo.type) {
      case 'pile':
        if (undo.tourne) {
          retourner(undo.origine.lastChild);
        }
        var pile = grouperColonne(undo.objet);
        unirPiles(pile, undo.origine);
      break;
      case 'distribuer':
        for (var i=9; i>=0; i--) {
          var carte = gColonnes[i].lastChild;
          retourner(carte);
          activation(carte, deplacerColonne, true);
          var pile = grouperColonne(carte);
          unirPiles(pile, gTalon);
        }
      break;
    }
    afficherJouables();
  }
  return;
}
function evtRecommencer() {
  if (confirm('Recommencer la partie ?')) {
    viderEcran();
    placerJeu(gPaquet);
  }
}
function evtNllePartie() {
  if (confirm('Nouvelle la partie ?')) {
    gPaquet = brasser(nouveauPaquet().concat(nouveauPaquet()));
    viderEcran();
    placerJeu(gPaquet);
  }
}
