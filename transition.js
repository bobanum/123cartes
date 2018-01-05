/* transition : Initie la transition de certaines propriétés d'un objet
    objet (element HTML) : objet sur lequel effectuer une transition
    arrivee (objet générique) : etat final de l'objet sous forme d'objet contenant les proprietes CSS à modifier ex.: {color:#123456}
    duree (int) : nombre de millisecondes que doit durer la transition (à 20 fps)
    finale (function) : fonction à executer à la fin de la transition
    depart (objet générique) : etat initial de l'objet sous forme d'objet contenant les proprietes CSS à modifier ex.: {color:#123456} Par défaut on utilisera objet.style
    delais (int) : Retarde l'exécution de la transition de ce nombre de millisecondes
    return (element HTML) : l'objet mis en transition
*/function transition(objet, arrivee, duree, finale, depart, delai) {
  delai = delai || 0;
  depart = depart || objet.style;
  if (typeof arrivee == "object") {
    if (objet.transition) return;
    initialiserTransition(objet, arrivee, duree, finale, depart, delai);
    objet.transition.interval = setInterval(function(){transition(objet)}, 20)
  }else{
    var time = new Date().getTime();
    if (time >= objet.transition.fin) {
      clearInterval(objet.transition.interval);
      appliquerProprietes(objet, "arrivee");
      if (objet.transition.finale) objet.transition.finale(objet);
      delete objet.transition;
    } else {
      calculerEtape(objet, time);
      appliquerProprietes(objet, "etape");
    }
  }
  return objet
}
/* initialiserTransition : Prépare un objet pour une transition en lui donnant certaines propriétés
    objet (element HTML) : objet sur lequel effectuer une transition
    arrivee (objet générique) : etat final de l'objet sous forme d'objet contenant les proprietes CSS à modifier ex.: {color:#123456}
    duree (int) : nombre de millisecondes que doit durer la transition (à 20 fps)
    finale (function) : fonction à executer à la fin de la transition
    depart (objet générique) : etat initial de l'objet sous forme d'objet contenant les proprietes CSS à modifier ex.: {color:#123456} Par défaut on utilisera objet.style
    delais (int) : Retarde l'exécution de la transition de ce nombre de millisecondes
    return (element HTML) : l'objet initialisé
*/function initialiserTransition(objet, arrivee, duree, finale, depart, delai) {
  delai = delai || 0;
  var resultat = {};
  resultat.debut = new Date().getTime()+delai;
  resultat.duree = duree;
  resultat.fin = resultat.debut+resultat.duree;
  resultat.finale = finale;
  var proprietes = {};
  for (var i in arrivee) {
    var propriete = {unite:[], depart:[], etape:[], arrivee:[], delta:[]};
    var elementsArrivee = arrivee[i].replace(/, /g,",").split(" ");
    var elementsDepart = depart[i].replace(/, /g,",").split(" ");
    for (var j=0; j<elementsArrivee.length; j++) {
      var unite = trouverUnite(elementsArrivee[j]);
      propriete.unite.push(unite);
      propriete.arrivee[j] = normaliserValeur(elementsArrivee[j]);
      propriete.depart[j] = normaliserValeur(elementsDepart[j]);
      propriete.etape[j] = normaliserValeur(elementsDepart[j]);
      propriete.delta[j] = soustraire(propriete.arrivee[j], propriete.depart[j]);
    }
    proprietes[i] = propriete;
  }
  resultat.proprietes = proprietes;
  objet.transition = resultat;
  appliquerProprietes(objet, "depart");

  return resultat;
}
/* calculerEtape
*/function calculerEtape(objet, time) {
  var t = objet.transition
  var proprietes = t.proprietes;
  if (time > t.fin) time = t.fin;
  if (time < t.debut) time = t.debut;
  var fraction = (time-t.debut)/t.duree;
  for (var j in proprietes) {
    var elements = [];
    var propriete = proprietes[j];
    for (var i=0; i<propriete.unite.length; i++) {
      if (propriete.unite[i] == "rgb") {
        propriete.etape[i][0] = Math.floor(propriete.depart[i][0]+(propriete.delta[i][0]*fraction));
        propriete.etape[i][1] = Math.floor(propriete.depart[i][1]+(propriete.delta[i][1]*fraction));
        propriete.etape[i][2] = Math.floor(propriete.depart[i][2]+(propriete.delta[i][2]*fraction));
      }else if (propriete.unite[i] == "") {
        propriete.etape[i] = (fraction < 0.5) ? propriete.depart[i] : propriete.arrivee[i];
      }else{
        propriete.etape[i] = propriete.depart[i]+(propriete.delta[i]*fraction);
      }
    }
  }
}
function soustraire(val1, val2){
  if (typeof val1 == "object" && typeof val2 == "object") {
    resultat = [];
    var M = Math.max(val1.length, val2.length);
    for (var i=0; i<M; i++) {
      resultat[i] = val1[i%val1.length]-val2[i%val2.length];
    }
  }else if (typeof val1 == "object"){
    resultat = [];
    var M = val1.length;
    for (var i=0; i<M; i++) {
      resultat[i] = val1[i]-val2;
    }
  }else if (typeof val2 == "object"){
    resultat = val1;
    var M = val2.length;
    for (var i=0; i<M; i++) {
      resultat -= val2[i];
    }
  }else{
    resultat = val1-val2;
  }
  return resultat;
}
function normaliserValeur(valeur) {
  if ("px|em|in|cm|mm|ex".indexOf(unite=valeur.substr(-2)) >= 0 || valeur.substr(-1) == "%"){
    return parseInt(valeur);
  }else if (valeur.substr(0,4) == "rgb("){
    valeur = valeur.substr(4);
    valeur = valeur.substr(0,valeur.length-1);
    var vals = valeur.split(",");
    var resultat = [];
    for (var i=0; i<3; i++) {
      resultat.push(parseInt(vals[i]));
    }
    return resultat;
  }else if (valeur.substr(0,1)=="#") {
    if (valeur.length > 4) {
      var r = parseInt(valeur[1]+valeur[2], 16);
      var g = parseInt(valeur[3]+valeur[4], 16);
      var b = parseInt(valeur[5]+valeur[6], 16);
    }else{
      var r = parseInt(valeur[1]+valeur[1], 16);
      var g = parseInt(valeur[2]+valeur[2], 16);
      var b = parseInt(valeur[3]+valeur[3], 16);
    }
    return [r,g,b];
  }
  return valeur;
}
function trouverUnite(valeur) {
  if ("px|em|in|cm|mm|ex".indexOf(unite=valeur.substr(-2))>=0){
    return unite;
  }else if (valeur.substr(-1) == "%"){
    return "%";
  }else if (valeur.substr(0,4) == "rgb(" || valeur.substr(0,1) == "#"){
    return "rgb";
  }
  return "";
}
function appliquerProprietes(objet, soussection) {
  var proprietes = objet.transition.proprietes;
  for (var j in proprietes) {
    var elements = [];
    var propriete = proprietes[j];
    var valeurs = propriete[soussection];
    for (var i=0; i<propriete.unite.length; i++) {
      if (propriete.unite[i] == "rgb") {
        elements.push("rgb("+valeurs[i].join(",")+")");
      }else if (propriete.unite[i] == "") {
        elements.push(valeurs[i]);
      }else{
        elements.push(valeurs[i]+propriete.unite[i]);
      }
    }
    objet.style[j] = elements.join(" ");
  }
}
function transition2(objets, finale, delai){
  if (!objets) {
    objets = [];
  }else if (objets.length == undefined){
    objets = [objets];
  }
  var terminer = true;
  var time = new Date().getTime();
  if (!objets.interval) {
    //var interval = setInterval(function(interval){transition2(objets, finale, delai,interval)}, 20);
    delai = delai || 0;
    objets.finale = finale;
    objets.delai = delai;
    objets.interval = setInterval(transition2, 20, objets);
    return;
  }
  for (var i=0; i<objets.length; i++) {
    var objet = objets[i];
    if (objet && objet.transition) {
      if (time >= objet.transition.fin) {
        appliquerProprietes(objet, "arrivee");
        if (objet.transition.finale) objet.transition.finale(objet);
        delete objet.transition;
      } else {
        terminer = false;
        calculerEtape(objet, time);
        appliquerProprietes(objet, "etape");
      }
    }
  }
  if (terminer) {
    clearInterval(objets.interval);
    if (objets.finale) objets.finale();
  }
}
