/*jslint browser:true, esnext:true*/
/*exported g,distance,nouveauPaquet,brasser,getSorte,retournerCarte,empiler,depiler, dessusPile,coordonnees,coordonneesCentre, html_pile, html_carte, afficherJouables, masquerJouables, afficherPossibilites, masquerPossibilites,getCartesObj*/
/*global trouverJouables, Carte */
//'use strict';

var g = {};

/**
 * Initialisation des variables globales. Est exécuré lors du "load" de la page.
 */
function main() {
	g.sortes = "CTKP";
	g.valeurs = "1234567890VDR";
	g.pref = {};
	g.MOUSEDOWN = 'mousedown';
	g.MOUSEUP = 'mouseup';
	g.MOUSEMOVE = 'mousemove';
	g.MOUSEOUT = 'mouseout';
}

/**
 * Retourne un nouveau paquet de cartes en fonction des variables globales. Les cartes sont les désignations sous forme de chaine.
 * @returns {[string]} Le tableau
 */
function nouveauPaquet() {
	var resultat, s, v;
	resultat = [];
	for (s = 0; s < g.sortes.length; s += 1) {
		for (v = 0; v < g.valeurs.length; v += 1) {
			resultat.push(new Carte(s, v));
		}
	}
	return resultat;
}

/**
 * Retourne un tableau mélangé
 * @param   {Array} paquet Le tableau à mélanger
 * @returns {Array} une copie du tableau
 */
function brasser(paquet) {
	var resultat, copie, carte, pos;
	copie = paquet.slice();
//	autre version :
//	copie.sort( function () { return Math.random() < 0.5; });
//	return copie;
	resultat = [];
	while (copie.length > 0) {
		pos = Math.floor(Math.random() * copie.length);
		carte = copie[pos];
		copie.splice(pos, 1);
		resultat.push(carte);
	}
	return resultat;
}

/**
 * Retourne un élément html représentant une pile vide.
 * @param   {string}      id     Le id à donner à la pile
 * @returns {HTMLElement} Un élément div.pile#id
 */
function html_pile() {
	var resultat;
	resultat = document.createElement("div");
	resultat.classList.add("pile");
	return resultat;
}
/**
 * Rend visible (ou non) la face carte.
 * @param   {HTMLElement} carte L'élément HTML représentant la carte
 * @param   {boolean}     etat  L'état final de la carte. Par défaut, on inverse l'état actuel.
 * @returns {HTMLElement} La carte ainsi changée
 */
function retournerCarte(carte, etat) {
	carte.obj = etat;
	return carte;
}

/**
 * Transfere la carte donnée vers une autre pile
 * @param   {HTMLElement} destination La pile qui recoit
 * @param   {HTMLElement} pile        La pile ou carte à mettre par-dessus
 * @returns undefined
 * @todo RÉVISER
 */
function empiler(destination, pile) {
	destination = destination.closest(".pile");
	if (pile.parentNode) {
		pile.parentNode.removeChild(pile);
	}
	destination.appendChild(pile);
	pile.style.removeProperty("top");
	pile.style.removeProperty("left");
}
function depiler(pile) {
	var pos;
	pos = coordonnees(pile);
	document.body.appendChild(pile);
	pile.style.left = pos.x + "px";
	pile.style.top = pos.y + "px";
	return pile;
}

function dessusPile(pile) {
	var resultat;
	resultat = pile.querySelector(".carte:only-child");
	if (resultat === null) {
		return pile.obj;
	}
	resultat = resultat.closest(".pile");
	return resultat.obj;
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
function distance(p1, p2) {
	var dx, dy;
	dx = p1.x - p2.x;
	dy = p1.y - p2.y;
	return Math.sqrt(dx*dx + dy*dy);
}

/**
 * Retourne l'indice de la sorte de la carte passée en paramètre.
 * @todo Réviser
 * @param   {object Carte} carte La carte.
 * @returns {number} L'indice de la valeur de la carte. Un nombre entre 0 et 3 en fonction de g.sortes
 */
function getSorte(carte) {
	return carte.dom.sorte;
}

function afficherJouables() {
	var jouables, i;
	jouables = trouverJouables();
	for (i = 0; i < jouables.length; i += 1) {
		jouables[i].dom.classList.add("jouable");
	}
}
function getCartesObj(selector, filter, map) {
    var cartes;
    cartes = Array.from(document.querySelectorAll(selector));
    cartes = cartes.map(carte => carte.obj);
    if (filter) {
        cartes = cartes.filter(filter);
    }
    if (map) {
        cartes = cartes.map(map);
    }
    return cartes;
}
function masquerJouables() {
	var jouables = document.querySelectorAll(".jouable");
	jouables.forEach(function (jouable) {
		jouable.classList.remove("jouable");
    });
	return jouables;
}
function afficherPossibilites(possibilites) {
	var i;
	if (possibilites instanceof Array) {
		for (i = 0; i < possibilites.length; i += 1) {
			possibilites[i].classList.add("possibilite");
		}
	} else {
		for (i in possibilites) {
			afficherPossibilites(possibilites[i]);
		}
	}
}
function masquerPossibilites() {
	var possibilites = document.querySelectorAll(".possibilite");
	possibilites.forEach(function (possibilite) {
		possibilite.classList.remove("possibilite");
    });
	return possibilites;
}

window.addEventListener("load", main);
