/*jslint browser:true, forin:true*/
/*globals g, placerJeu, placerTrous, distribuer3cartes, afficherJouables, masquerJouables, replacerDefausse, trouverPossibilites, afficherPossibilites, masquerPossibilites, retournerCarte, html_pile, empiler, html_carte, dessusPile, coordonnees, coordonneesCentre, distance*/
/*globals nouveauPaquet,brasser,getValeur,getSorte,getCouleur*/
/*exported placerJeu, distribuer3cartes, replacerDefausse, placerTrous, trouverPossibilites, afficherPossibilites, masquerPossibilites, afficherJouables, masquerJouables*/
//'use strict';

function klondike_main() {
	g.paquet = brasser(nouveauPaquet());
	g.talon = null;
	g.defausse = null;
	g.maisons = [];
	g.colonnes = [];
	g.plateau = null;
	g.plateau = html_plateau();
	document.body.appendChild(g.plateau);
	commencerJeu();
	return;
}
function html_plateau() {
	var resultat;
	resultat = document.createElement("div");
	resultat.setAttribute("id", "plateau");

	g.talon = html_talon(g.paquet);
	resultat.appendChild(g.talon);
	g.defausse = html_defausse(g.paquet);
	resultat.appendChild(g.defausse);
	g.fondation = html_fondation(g.paquet);
	resultat.appendChild(g.fondation);
	g.tableau = html_tableau(g.paquet);
	resultat.appendChild(g.tableau);
	return resultat;
}
function commencerJeu() {
	var i, j, carte;

	for (i = 0; i < 7; i += 1) {
		carte = g.talon.lastChild;
		empiler(dessusPile(g.colonnes[i]), carte);
		retournerCarte(carte.firstChild	);
		for (j = i + 1; j < 7; j += 1) {
			carte = g.talon.lastChild;
			empiler(dessusPile(g.colonnes[j]), g.talon.lastChild);
		}
	}
	document.body.addEventListener("mousedown", dragstart);
	afficherJouables();
	return;
}
function html_fondation() {
	var resultat, i, maison;
	resultat = html_pile();
	resultat.setAttribute("id", "fondation");
	for (i = 0; i < 4; i += 1) {
		maison = html_maison(i);
		g.maisons.push(maison);
		resultat.appendChild(maison);
	}
	return resultat;
}
function html_tableau() {
	var resultat, i, colonne;
	resultat = html_pile();
	resultat.setAttribute("id", "tableau");
	for (i = 0; i < 7; i += 1) {
		colonne = html_colonne(i);
		g.colonnes.push(colonne);
		resultat.appendChild(colonne);
	}
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
function html_defausse() {
	var resultat;
	resultat = html_pile();
	resultat.setAttribute("id", "defausse");
	return resultat;
}
function html_maison(no) {
	var resultat;
	resultat = html_pile();
	resultat.setAttribute("id", "maison" + no);
	resultat.classList.add("maison");
	return resultat;
}
function html_colonne(no) {
	var resultat;
	resultat = html_pile();
	resultat.setAttribute("id", "colonne" + no);
	resultat.classList.add("colonne");
	return resultat;
}
function dragstart(e) {
	var pile, carte, origine, possibilites, pos;
	if (e.target === g.talon) {
		replacerTalon();
		return;
	}
	if (e.target.closest("#talon")) {
		distribuer3cartes();
		return;
	}
	carte = e.target.closest(".ouverte");
	if (!carte) {
		return;
	}
	pile = carte.closest(".pile");
	if (pile.classList.contains("maison")) {
		return;
	}
	pile.classList.add("prise");
	masquerJouables();
	origine = pile.parentNode;
	possibilites = trouverPossibilites(carte);
	afficherPossibilites(possibilites);
	possibilites = possibilites.maisons.concat(possibilites.colonnes);
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
		var position, choix, possibilite, d;
		position = coordonneesCentre(pile);
		choix = {
			element: null,
			distance: Infinity
		};
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
			for (var i = 0; i < cartes.length; i += 1) {
				retournerCarte(cartes[i]);
			}
		} else {
			empiler(origine, pile);
		}
		pile.classList.remove("prise");
		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
		masquerPossibilites();
		afficherJouables();
	}
	function dragcancel() {
		empiler(origine, pile);
		pile.classList.remove("prise");
		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
		masquerPossibilites();
		afficherJouables();
	}
	document.body.addEventListener("mousemove", dragmove);
	document.body.addEventListener("mouseleave", dragcancel);
	document.body.addEventListener("mouseup", drop);
	document.body.addEventListener("mousedown", dragstart);
}
function distribuer3cartes() {
//	var pile = html_pile(2,0);
	var carte;
	masquerJouables();
//	empiler(g.defausse, pile);
	var pile = g.defausse;
	for (var i = 0; i < 3 && g.talon.firstChild; i += 1) {
		carte = dessusPile(g.talon);
		retournerCarte(carte);
		empiler(pile, carte);
		pile = carte;
	}
	afficherJouables();
	return pile;
}
function replacerTalon() {
	var cartes, i;
	masquerJouables();
	cartes = document.querySelectorAll("#defausse .pile");
	for (i = 0; i < cartes.length; i += 1) {
		retournerCarte(cartes[i]);
		empiler(g.talon, cartes[i]);
	}
	afficherJouables();
	return;
}
function dessusDefausse() {
	var resultat;
	resultat = document.querySelector("#defausse > .pile:last-child .carte:only-child");
	if (resultat) {
		return resultat.parentNode;
	} else {
		return null;
	}
}
function trouverPossibilites(carte) {
	var resultat;
	resultat = {
		maisons: trouverPossibilitesMaison(carte),
		colonnes: trouverPossibilitesColonne(carte)
	};
	return resultat;
}
function trouverPossibilitesMaison(carte) {
	var sorte, valeur, resultat, i, dessus;
	sorte = getSorte(carte);
	valeur = getValeur(carte);
	resultat = [];

	if (carte.nextSibling) {
		return [];
	}
	if (valeur === 0) {
		var maisons = document.querySelectorAll(".maison:empty");
		for (i = 0; i < maisons.length; i += 1) {
			resultat.push(maisons[i]);
		}
		return resultat;
	}
	for (i = 0; i < g.maisons.length; i += 1) {
		dessus = g.maisons[i].lastChild;
		if (dessus) {
			if (sorte === getSorte(dessus) && valeur === getValeur(dessus) + 1) {
				resultat.push(g.maisons[i]);
			}
		}
	}
	return resultat;
}
function trouverPossibilitesColonne(carte) {
	var resultat, valeur, couleur, i;
	resultat = [];
	valeur = getValeur(carte);
	couleur = getCouleur(carte);
	if (valeur === 12) {
		var colonnes = document.querySelectorAll(".colonne:empty");
		for (i = 0; i < colonnes.length; i += 1) {
			resultat.push(colonnes[i]);
		}
		return resultat;
	}
	var cartes = document.querySelectorAll(".colonne .carte:only-child");
	for (i = 0; i < cartes.length; i += 1) {
		if (couleur !== getCouleur(cartes[i]) && valeur === getValeur(cartes[i]) - 1) {
			resultat.push(cartes[i]);
		}
	}
	return resultat;
}
function estJouable(carte) {
	if (!carte) {
		return false;
	}
	if (estJouableMaison(carte)) {
		return true;
	}
	if (estJouableColonne(carte)) {
		return true;
	}
	return false;
}
function estJouableMaison(carte) {
	var valeur, sorte, couleur, i, dessus;
	valeur = getValeur(carte);
	sorte = getSorte(carte);
	couleur = getCouleur(carte);
	if (carte.nextSibling) {
		return false;
	}
	if (valeur === 0 && document.querySelector(".maison:empty")) {
		return true;
	}
	for (i = 0; i < g.maisons.length; i += 1) {
		dessus = g.maisons[i].lastChild;
		if (dessus) {
			if (sorte === getSorte(dessus) && valeur === getValeur(dessus) + 1) {
				return true;
			}
		}
	}
	return false;
}
function estJouableColonne(carte) {
	var valeur, couleur, i;
	valeur = getValeur(carte);
	couleur = getCouleur(carte);
	if (valeur === 12 && document.body.querySelector(".colonne:empty")) {
		return true;
	}
	var cartes = document.querySelectorAll(".colonne .carte:only-child");
	for (i = 0; i < cartes.length; i += 1) {
		if (couleur !== getCouleur(cartes[i]) && valeur === getValeur(cartes[i]) - 1) {
			return true;
		}
	}
	return false;
}
function afficherPossibilites(possibilites) {
	var j, i, element;
	for (j in possibilites) {
		for (i = 0; i < possibilites[j].length; i += 1) {
			if (possibilites[j][i].lastChild) {
				element = possibilites[j][i].lastChild;
			} else {
				element = possibilites[j][i];
			}
			element.classList.add("possibilite");
		}
	}
}
function masquerPossibilites() {
	var i, elements;
	elements = document.querySelectorAll(".possibilite");
	for (i = 0; i < elements.length; i += 1) {
		elements[i].classList.remove("possibilite");
	}
	return elements;
}
function trouverJouables() {
	var resultat, i, carte, pile;
	resultat = [];
	carte = dessusDefausse();
	if (carte && estJouable(carte)) {
		resultat.push(carte);
	}
	var piles = document.querySelectorAll("#tableau .pile.ouverte");

	for (i = 0; i < piles.length; i += 1) {
		pile = piles[i];
		if (estJouable(pile)) {
			resultat.push(pile);
		}
	}

//	for (i = 0; i < g.colonnes.length; i += 1) {
//		colonne = g.colonnes[i];
//		if (colonne.lastChild) {
//			carte = dessusPile(colonne);
//		debugger;
//			while (carte && carte.classList.contains("ouverte")) {
//				if (estJouable(carte)) {
//					resultat.push(carte);
//				}
//				carte = carte.previousSibling;
//			}
//		}
//	}
	return resultat;
}
function afficherJouables(jouables) {
	var i;
	jouables = jouables || trouverJouables();
	for (i = 0; i < jouables.length; i += 1) {
		jouables[i].classList.add("jouable");
	}
}
function masquerJouables() {
	var i;
	var jouables = document.querySelectorAll(".jouable");
	for (i = 0; i < jouables.length; i += 1) {
		jouables[i].classList.remove("jouable");
	}
	return jouables;
}
window.addEventListener("load", klondike_main);
