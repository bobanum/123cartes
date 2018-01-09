/*jslint browser:true, forin:true*/
/*globals g, coordAbs, placerJeu, placerTrous, distribuer3cartes, afficherJouables, masquerJouables, replacerDefausse, trouverPossibilites, afficherPossibilites, calculerDistance, masquerPossibilites, retournerCarte, html_pile, empiler, html_carte*/
/*globals nouveauPaquet,brasser,getValeur,getSorte,getCouleur*/
/*exported placerJeu, distribuer3cartes, replacerDefausse, placerTrous, trouverPossibilites, afficherPossibilites, masquerPossibilites, afficherJouables, masquerJouables, calculerDistance*/
//'use strict';

function klondike_main() {
	g.paquet = brasser(nouveauPaquet());
	g.talon = null;
	g.defausse = null;
	g.maisons = [];
	g.colonnes = [];
	g.plateau = null;
	placerJeu();
	return;
}

function placerJeu() {
	var i, j, carte;
	g.plateau = document.createElement("div");
	g.plateau.setAttribute("id", "plateau");
	document.body.appendChild(g.plateau);

	g.talon = html_talon(g.paquet);
	g.plateau.appendChild(g.talon);
	g.defausse = html_defausse(g.paquet);
	g.plateau.appendChild(g.defausse);
	g.fondation = html_fondation(g.paquet);
	g.plateau.appendChild(g.fondation);
	g.tableau = html_tableau(g.paquet);
	g.plateau.appendChild(g.tableau);

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
	console.log("c'est parti", e.type);
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
function dessusPile(pile) {
	var resultat;
	resultat = pile.querySelector(".carte:only-child");
	if (resultat === null) {
		return pile;
	}
	return resultat.closest(".pile");
}
function coordonnees(element, ref) {
	if (ref === undefined) {
		ref = document.body;
	}
	var resultat = {x: 0, y: 0};
	while (element !== ref && element !== document.body) {
		resultat.x += element.offsetLeft;
		resultat.y += element.offsetTop;
		element = element.parentNode;
	}
	return resultat;
}
function coordonneesCentre(element, ref) {
	if (ref === undefined) {
		ref = document.body;
	}
	var resultat = coordonnees(element, ref);
	resultat.x += element.offsetWidth / 2;
	resultat.y += element.offsetHeight / 2;
	return resultat;
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

window.addEventListener("load", klondike_main);
