/*jslint browser:true*/
/*globals g, coordAbs, unirPiles, placerJeu, placerTrous, placerBoutons, distribuer10cartes, afficherJouables, masquerJouables, evtRecommencer, evtNllePartie, evtUndo, trouverPossibilites, grouperColonne, afficherPossibilites, trouverTouche, calculerDistance, retournerCarte, masquerPossibilites, estDeplacable, confirm, html_pile, html_carte, empiler, dessusPile, coordonnees, coordonneesCentre*/
/*globals nouveauPaquet,brasser,placerPile,unirPiles,getValeur,getSorte*/
/*exported distribuer10cartes, placerTrous, placerBoutons, trouverPossibilites, estDeplacable, afficherPossibilites, masquerPossibilites, calculerDistance, trouverTouche, evtUndo, evtRecommencer, evtNllePartie*/
//'use strict';

function spider_main() {
	g.paquet = brasser(nouveauPaquet().concat(nouveauPaquet()));
	g.talon = null;
	g.maisons = [];
	g.colonnes = [];
	g.undo = [];
	g.pref.afficherPossibilites = false;
	g.plateau = html_plateau();
	document.body.appendChild(g.plateau);
	placerBoutons(7, 1);
	commencerJeu();
}
function html_plateau() {
	var resultat;
	resultat = document.createElement("div");
	resultat.setAttribute("id", "plateau");

	g.talon = html_talon(g.paquet);
	resultat.appendChild(g.talon);
	g.fondation = html_fondation();
	resultat.appendChild(g.fondation);
	g.tableau = html_tableau();
	resultat.appendChild(g.tableau);
	return resultat;
}
function html_talon(cartes) {
	var resultat, pile, i, carte;
	resultat = html_pile();
	resultat.setAttribute("id", "talon");
	resultat.classList.add("talon");
	for (i = 0; i < cartes.length; i += 1) {
		carte = html_carte(cartes[i]);
		pile = html_pile();
		empiler(pile, carte);
		empiler(resultat, pile);
	}
	return resultat;
}
function html_fondation() {
	var resultat, i, maison;
	resultat = html_pile();
	resultat.setAttribute("id", "fondation");
	for (i = 0; i < 8; i += 1) {
		maison = html_maison(i);
		g.maisons.push(maison);
		resultat.appendChild(maison);
	}
	return resultat;
}
function html_maison(no) {
	var resultat;
	resultat = html_pile();
	resultat.setAttribute("id", "maison" + no);
	resultat.classList.add("maison");
	return resultat;
}
function html_tableau() {
	var resultat, i, colonne;
	resultat = html_pile();
	resultat.setAttribute("id", "tableau");
	for (i = 0; i < 10; i += 1) {
		colonne = html_colonne(i);
		g.colonnes.push(colonne);
		resultat.appendChild(colonne);
	}
	return resultat;
}
function html_colonne(no) {
	var resultat;
	resultat = html_pile();
	resultat.setAttribute("id", "colonne" + no);
	resultat.classList.add("colonne");
	return resultat;
}
function commencerJeu() {
	var carte, i, j;
	for (i = 0; i < 6; i += 1) {
		for (j = 0; j < 10; j += 1) {
			if (i === 5 && j > 3) {
				break;
			}
			carte = g.talon.lastChild;
			empiler(dessusPile(g.colonnes[j]), carte);
		}
	}
	//tourner les premières cartes
	for (j = 0; j < 10; j += 1) {
		carte = dessusPile(g.colonnes[j]);
		retournerCarte(carte);
	}
	document.body.addEventListener("mousedown", dragstart);
	afficherJouables();
	return;
}
function dragstart(e) {
	var pile, origine, possibilites, pos;
	if (e.target.closest("#talon")) {
		if (document.querySelector("#tableau > .colonne:empty")) {
			return;
		}
		if (g.talon.childElementCount === 0) {
			return;
		}
		distribuer10cartes();
		return;
	}
	pile = e.target.closest(".deplacable");
	if (!pile) {
		return;
	}
//	pile = carte.closest(".pile");
//	if (pile.classList.contains("maison")) {
//		return;
//	}
	pile.classList.add("prise");
	masquerJouables();
	demarquerDeplacables();
	origine = pile.parentNode;
	possibilites = trouverPossibilites(pile);
	if (getValeur(pile) === 12) {
		possibilites.push(document.querySelector("#fondation > .maison:empty"));
	}
	afficherPossibilites(possibilites);
	pos = coordonnees(pile);
	document.body.appendChild(pile);
	pile.style.left = pos.x + "px";
	pile.style.top = pos.y + "px";
	pile.decalage = {x: e.offsetX, y: e.offsetY};
	console.log("c'est parti", e.type);
//	debugger;
//	if (true) return;
	function dragmove(e) {
		//console.log("déplacer la carte", e.type);
		pile.style.left = e.clientX - pile.decalage.x + "px";
		pile.style.top = e.clientY - pile.decalage.y + "px";
	}
	function drop(e) {
		var position = coordonneesCentre(pile);
		var choix = null;
		var distance = null;
		possibilites.forEach(function(p) {
			var c = coordonneesCentre(p);
			var dx = c.x - position.x;
			var dy = c.y - position.y;
			var d = Math.sqrt(dx*dx + dy*dy);
			if (distance === null || d < distance) {
				distance = d;
				choix = p;
			}
		});
		if (choix) {
			if (choix.classList.contains("maison")) {
				empiler(dessusPile(choix), pile);
			} else {
				empiler(choix, pile);
			}
			var cartes = document.querySelectorAll("#tableau .pile:not(.ouverte) > .carte:only-child");
			for (var i = 0; i < cartes.length; i += 1) {
				retournerCarte(cartes[i]);
			}
		} else {
			empiler(origine, pile);
		}
		pile.classList.remove("prise");

		console.log("Rendu ???", e.type);
		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
		afficherJouables();
		masquerPossibilites();
	}
	function dragcancel(e) {
		console.log("Fini!", e.type, e.eventPhase);
		empiler(origine, pile);
		pile.classList.remove("prise");
		afficherJouables();
		masquerPossibilites();
		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
	}
	document.body.addEventListener("mousemove", dragmove);
	document.body.addEventListener("mouseleave", dragcancel);
	document.body.addEventListener("mouseup", drop);
	document.body.addEventListener("mousedown", dragstart);
}
function viderEcran() {
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
}
function distribuer10cartes() {
	var i, colonne, carte;
	masquerJouables();
	demarquerDeplacables();
	if (g.talon.lastChild) {
		g.undo.push({
			type: 'distribuer'
		});
		for (i = 0; i < 10; i += 1) {
			colonne = g.colonnes[i];
			carte = g.talon.lastChild;
			retournerCarte(carte);
			empiler(dessusPile(colonne), carte);
		}
	}
	afficherJouables();
}
function placerBoutons(left, top) {
	var bouton;
	bouton = g.plateau.appendChild(document.createElement("div"));
	bouton.innerHTML = "&#x27F2;";
	bouton.classList.add("bouton");
	bouton.style.left = left + "em";
	bouton.style.top = top + 1 + "em";
	bouton.addEventListener('click', evtRecommencer, false); //***
	bouton = g.plateau.appendChild(document.createElement("div"));
	bouton.innerHTML = "&#x27f4;";
	bouton.classList.add("bouton");
	bouton.style.left = left + 3 + "em";
	bouton.style.top = top + 1 + "em";
	bouton.addEventListener('click', evtNllePartie, false); //***
	bouton = g.plateau.appendChild(document.createElement("div"));
	bouton.innerHTML = "&#x293e;";
	bouton.classList.add("bouton");
	bouton.style.left = left + "em";
	bouton.style.top = top + 4 + "em";
	bouton.style.width = 5 + "em";
	bouton.addEventListener('click', evtUndo, false); //***
	return;
}
function afficherPossibilites(possibilites) {
	var i;
	for (i = 0; i < possibilites.length; i += 1) {
		possibilites[i].classList.add("possibilite");
	}
	return possibilites;
}
function masquerPossibilites() {
	var possibilites, i;
	possibilites = document.querySelectorAll(".possibilite");
	for (i = 0; i < possibilites.length; i += 1) {
		possibilites[i].classList.remove("possibilite");
	}
}
function trouverJouables() {
	var resultat, i, dessus, deplacables, possibilites;
	resultat = [];
	dessus = trouverDessus();
	deplacables = trouverDeplacables();
	for (i = 0; i < deplacables.length; i += 1) {
		possibilites = trouverPossibilites(deplacables[i], dessus);
		if (possibilites.length > 0) {
			resultat.push(deplacables[i]);
		}
	}
	return resultat;
}
function trouverPossibilites(pile, dessus) {
	var resultat, i, trous;
	resultat = [];
	trous = document.querySelectorAll("#tableau .colonne:empty");
	for (i = 0; i < trous.length; i += 1) {
		resultat.push(trous[i]);
	}
	if (dessus === undefined) {
		dessus = trouverDessus();
	}
	for (i = 0; i < dessus.length; i += 1) {
		if (estEmpilable(dessus[i], pile)) {
			resultat.push(dessus[i]);
		}
	}
	return resultat;
}
function trouverDessus() {
	var resultat, cartes, i;
	resultat = [];
	cartes = document.querySelectorAll("#tableau .pile.ouverte .carte:only-child");
	for (i = 0; i < cartes.length; i += 1) {
		resultat.push(cartes[i].parentNode);
	}
	return resultat;
}
function estDeplacable(pile) {
	if (pile.classList.contains("deplacable")) {
		return true;
	}
	if (pile.children.length === 1) {
		pile.classList.add("deplacable");
		return true;
	}
	var suivant = pile.children[1];
	if (!estDeplacable(suivant)) {
		return false;
	}
	if (estEmpilable(pile, suivant, true)) {
		pile.classList.add("deplacable");
		return true;
	}
	return false;
}
function estEmpilable(dessous, dessus, strict) {
	if (getValeur(dessous) !== getValeur(dessus) + 1) {
		return false;
	}
	if (!strict) {
		return true;
	}
	if (getSorte(dessous) === getSorte(dessus)) {
		return true;
	}
	return false;
}
function trouverDeplacables() {
	var resultat, piles, i;
	resultat = [];
	piles = document.querySelectorAll("#tableau .pile.ouverte");
	for (i = 0; i < piles.length; i += 1) {
		if (estDeplacable(piles[i])) {
			resultat.push(piles[i]);
		}
	}
	return resultat;
}
function afficherJouables() {
	var i;
	var jouables = trouverJouables();
	for (i = 0; i < jouables.length; i += 1) {
		jouables[i].classList.add("jouable");
	}
}
function demarquerDeplacables() {
	var deplacables, i;
	deplacables = document.querySelectorAll(".deplacable");
	for (i = 0; i < deplacables.length; i += 1) {
		deplacables[i].classList.remove("deplacable");
	}
	return;
}
function masquerJouables() {
	var jouables, i;
	jouables = document.querySelectorAll(".jouable");
	for (i = 0; i < jouables.length; i += 1) {
		jouables[i].classList.remove("jouable");
	}
	return;
}
function calculerDistance(carte, possibilites) {
	var resultat, coords1, distance, i, coords2, left, top, d;
	resultat = -1;
	coords1 = coordAbs(carte);
	distance = 99999999999999999999999;
	for (i = 0; i < possibilites.length; i += 1) {
		if (possibilites[i].lastChild) {
			coords2 = coordAbs(possibilites[i].lastChild);
		} else {
			coords2 = coordAbs(possibilites[i]);
		}
		left = coords1.left - coords2.left;
		top = coords1.top - coords2.top;
		d = Math.pow(left, 2) + Math.pow(top, 2);
		if (d < distance) {
			distance = d;
			resultat = i;
		}
	}
	return resultat;
}
function trouverTouche(carte, possibilites) {
	var poss, i, resultat, coords1, obj, coords2;
	poss = [];
	for (i = 0; i < possibilites.length; i += 1) {
		poss = poss.concat(possibilites[i]);
	}
	resultat = [];
	coords1 = coordAbs(carte);
	for (i = 0; i < poss.length; i += 1) {
		if (poss[i].lastChild) {
			obj = poss[i].lastChild;
		} else {
			obj = poss[i];
		}
		coords2 = coordAbs(obj);
		if (coords1.left <= coords2.left + obj.clientWidth && coords2.left <= coords1.left + obj.clientWidth && coords1.top <= coords2.top + obj.clientHeight && coords2.top <= coords1.top + obj.clientHeight) {
			resultat.push(poss[i]);
		}
	}
	return resultat;
}
function grouperColonne(carte) {
	var decalage, coords, pile, proc;
	decalage = parseInt(carte.style.marginTop, 10);
	coords = coordAbs(carte);
	pile = placerPile("transport", [], coords.left, coords.top);
	while (carte) {
		proc = carte.nextSibling;
		carte.style.marginTop = parseInt(carte.style.marginTop, 10) - decalage + "px";
		pile.appendChild(carte.parentNode.removeChild(carte));
		carte = proc;
	}
	return pile;
}
function evtUndo() {
	var undo, i, carte, pile;
	if (g.undo.length) {
		masquerJouables();
		undo = g.undo.splice(g.undo.length - 1, 1);
		undo = undo[0];
		if (undo.type === 'pile') {
			if (undo.tourne) {
				retournerCarte(undo.origine.lastChild);
			}
			pile = grouperColonne(undo.objet);
			unirPiles(pile, undo.origine);
		} else if (undo.type === 'distribuer') {
			for (i = 9; i >= 0; i -= 1) {
				carte = g.colonnes[i].lastChild;
				retournerCarte(carte);
				pile = grouperColonne(carte);
				unirPiles(pile, g.talon);
			}
		}
		afficherJouables();
	}
	return;
}
function evtRecommencer() {
	if (confirm('Recommencer la partie ?')) {
		viderEcran();
		placerJeu(g.paquet);
	}
}
function evtNllePartie() {
	if (confirm('Nouvelle la partie ?')) {
		g.paquet = brasser(nouveauPaquet().concat(nouveauPaquet()));
		viderEcran();
		placerJeu(g.paquet);
	}
}
window.addEventListener("load", spider_main);
