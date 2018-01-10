/*jslint browser:true*/
/*globals g, placerTrous, distribuer10cartes, evtRecommencer, evtNllePartie, trouverPossibilites, afficherPossibilites, retournerCarte, masquerPossibilites, estDeplacable, html_pile, html_carte, empiler, dessusPile, coordonnees, coordonneesCentre, distance*/
/*globals nouveauPaquet,brasser,getValeur,getSorte*/
/*exported distribuer10cartes, placerTrous, trouverPossibilites, estDeplacable, afficherPossibilites, masquerPossibilites, evtRecommencer, evtNllePartie*/
//'use strict';

function spider_main() {
	g.paquet = brasser(nouveauPaquet().concat(nouveauPaquet()));
	g.talon = null;
	g.maisons = [];
	g.colonnes = [];
	g.pref.afficherPossibilites = false;
	g.plateau = html_plateau();
	document.body.appendChild(g.plateau);
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
	function dragmove(e) {
		pile.style.left = e.clientX - pile.decalage.x + "px";
		pile.style.top = e.clientY - pile.decalage.y + "px";
	}
	function drop() {
		var choix, position, i, possibilite, d;
		choix = {
			element: null,
			distance: Infinity
		};
		position = coordonneesCentre(pile);
		for (i = 0; i < possibilites.length; i += 1) {
			possibilite = possibilites[i];
			d = distance(position, coordonneesCentre(possibilite));
			if (d < choix.distance) {
				choix.element = possibilite;
				choix.distance = d;
			}
		}
		if (choix.element) {
			if (choix.element.classList.contains("maison")) {
				empiler(dessusPile(choix.element), pile);
			} else {
				empiler(choix.element, pile);
			}
			var cartes = document.querySelectorAll("#tableau .pile:not(.ouverte) > .carte:only-child");
			for (i = 0; i < cartes.length; i += 1) {
				retournerCarte(cartes[i]);
			}
		} else {
			empiler(origine, pile);
		}
		pile.classList.remove("prise");

		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
		afficherJouables();
		masquerPossibilites();
	}
	function dragcancel() {
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
function distribuer10cartes() {
	var i, colonne, carte;
	masquerJouables();
	demarquerDeplacables();
	if (g.talon.lastChild) {
		for (i = 0; i < 10; i += 1) {
			colonne = g.colonnes[i];
			carte = g.talon.lastChild;
			retournerCarte(carte);
			empiler(dessusPile(colonne), carte);
		}
	}
	afficherJouables();
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
window.addEventListener("load", spider_main);
