/*jslint browser:true, esnext:true*/
/*globals g, placerJeu, placerTrous, distribuer3cartes, afficherJouables, masquerJouables,
replacerDefausse, trouverPossibilites, afficherPossibilites, masquerPossibilites,
retournerCarte, html_pile, empiler, dessusPile, coordonneesCentre, distance,
depiler, getCartesObj*/
/*globals nouveauPaquet,brasser*/
/*exported placerJeu, distribuer3cartes, replacerDefausse, placerTrous, trouverPossibilites, afficherPossibilites, masquerPossibilites, trouverJouables*/
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
		debugger;
        retournerCarte(carte.firstChild.obj);
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
	var resultat, pile;
	resultat = html_pile();
	resultat.setAttribute("id", "talon");
	resultat.classList.add("talon");
	cartes.forEach(function (carte) {
		pile = html_pile();
		empiler(pile, carte.dom);
		empiler(resultat, pile);
    }, this);
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
	var pile, carte, origine, possibilites;
	if (e.target === g.talon) {
		replacerTalon();
		return;
	}
	if (e.target.closest("#talon")) {
		distribuer3cartes();
		return;
	}
	carte = e.target.closest(".visible");
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
	possibilites = trouverPossibilites(carte.obj);
	afficherPossibilites(possibilites);
	possibilites = possibilites.maisons.concat(possibilites.colonnes);
	depiler(pile);
	pile.decalage = {x: e.offsetX, y: e.offsetY};
	function dragmove(e) {
		pile.style.left = e.clientX - pile.decalage.x + "px";
		pile.style.top = e.clientY - pile.decalage.y + "px";
	}
	function drop() {
		deposerCarte(pile, possibilites, origine);
		dragstop();
	}
	function dragcancel() {
		empiler(origine, pile);
		pile.classList.remove("prise");
		dragstop();
	}
	function dragstop() {
		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
		masquerPossibilites();
		afficherJouables();
	}
	document.body.addEventListener("mousemove", dragmove);
	document.body.addEventListener("mouseleave", dragcancel);
	document.body.addEventListener("mouseup", drop);
}
function deposerCarte(pile, possibilites, origine) {
	var position, choix;
	position = coordonneesCentre(pile);
	choix = {
		element: null,
		distance: Infinity
	};
	possibilites.forEach(function (possibilite) {
		var d = distance(position, coordonneesCentre(possibilite));
		if (d < choix.distance) {
			choix.element = possibilite;
			choix.distance = d;
		}
    });
	if (choix.element) {
		if (choix.element.classList.contains("maison")) {
			empiler(choix.element, pile);
		} else {
			empiler(choix.element, pile);
		}
//		var cartes = document.querySelectorAll("#tableau .pile:not(.visible) > .carte:only-child");
        var cartes = getCartesObj("#tableau .pile:not(.visible) > .carte:only-child");
		cartes.forEach(function (carte) {
			retournerCarte(carte);
        });
	} else {
		empiler(origine, pile);
	}
	pile.classList.remove("prise");
	return pile;
}

function distribuer3cartes() {
	var carte;
	masquerJouables();
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
	var cartes;
	masquerJouables();
//	cartes = document.querySelectorAll("#defausse .pile");
	cartes = getCartesObj("#defausse .pile");
    cartes.forEach(function (carte) {
		retournerCarte(carte);
		empiler(g.talon, carte);
    });
	afficherJouables();
	return;
}
function dessusDefausse() {
	var resultat;
	resultat = document.querySelector("#defausse > .pile:last-child .carte:only-child");
	if (resultat) {
		return resultat.parentNode.obj;
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
	var sorte, valeur, resultat, dessus;
	sorte = carte.sorte;
	valeur = carte.valeur;
	resultat = [];

	if (carte.nextSibling) {
		return [];
	}
	if (valeur === 0) {
		resultat.push(g.maisons[sorte]);
		return resultat;
	}
	dessus = g.maisons[sorte].lastChild;
	if (dessus && valeur === dessus.obj.valeur + 1) {
		resultat.push(g.maisons[sorte]);
	}
	return resultat;
}
function trouverPossibilitesColonne(carte) {
	var resultat, valeur, couleur;
	resultat = [];
	valeur = carte.valeur;
	couleur = carte.couleur;
	if (valeur === 12) {
//		var colonnes = document.querySelectorAll(".colonne:empty");
		var colonnes = getCartesObj(".colonne:empty");
		resultat = resultat.concat(colonnes);
		return resultat;
	}
//	var cartes = document.querySelectorAll(".colonne .carte:only-child");
	var cartes = getCartesObj(
        ".colonne .carte:only-child",
        (carte)=>(couleur !== carte.couleur && valeur === carte.valeur - 1),
        (carte)=>(carte.dom.parentNode.obj)
    );
    resultat = resultat.concat(cartes);
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
	var valeur, sorte, couleur, dessus;
	if (carte.dom.nextSibling) {
		return false;
	}
	valeur = carte.valeur;
	sorte = carte.sorte;
	couleur = carte.couleur;
	if (valeur === 0 && document.querySelector(".maison:empty")) {
		return true;
	}
    var resultat = g.maisons.find(function (maison) {
		dessus = maison.lastChild;
		if (dessus) {
			if (sorte === dessus.obj.sorte && valeur === dessus.obj.valeur + 1) {
				return true;
			}
		}
    }, this);
	return resultat;
}
function estJouableColonne(carte) {
	var resultat, valeur, couleur, cartes;
	valeur = carte.valeur;
	couleur = carte.couleur;
	if (valeur === 12 && document.body.querySelector(".colonne:empty")) {
		return true;
	}
	cartes = getCartesObj(".colonne .carte:only-child");

    resultat = cartes.find((carte)=>(couleur !== carte.couleur && valeur === carte.valeur - 1));
    return resultat;
}
function trouverJouables() {
	var defausse, carte, piles;
	defausse = [];
	carte = dessusDefausse();
	if (estJouable(carte)) {
		defausse.push(carte);
	}

//    piles = Array.from(document.querySelectorAll("#tableau .pile.visible"));
//    piles = piles.map(pile => pile.obj);
//    piles = piles.filter((pile) => estJouable(pile));
    piles = getCartesObj("#tableau .pile.visible", estJouable);

	return [].concat(defausse, piles);
}
window.addEventListener("load", klondike_main);
