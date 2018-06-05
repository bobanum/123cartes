/*jslint browser:true, esnext:true*/
/*globals g, placerTrous, distribuer10cartes, evtRecommencer, evtNllePartie,
trouverPossibilites, afficherPossibilites, retournerCarte, masquerPossibilites,
estDeplacable, html_pile, empiler, dessusPile, coordonnees,
coordonneesCentre, distance, afficherJouables, masquerJouables, getCartesObj*/
/*globals nouveauPaquet,brasser*/
/*exported distribuer10cartes, placerTrous, trouverPossibilites, estDeplacable, afficherPossibilites, masquerPossibilites, evtRecommencer, evtNllePartie, trouverJouables*/
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
	var resultat, pile;
	resultat = html_pile();
	resultat.setAttribute("id", "talon");
	resultat.classList.add("talon");
    cartes.forEach(function (carte) {
		pile = html_pile();
		empiler(pile, carte);
		empiler(resultat, pile);

    }, this);
	resultat.setAttribute("data-n", resultat.childElementCount);
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
			g.talon.setAttribute("data-n", g.talon.childElementCount);
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
	possibilites = trouverPossibilites(pile.obj);
	if (pile.obj.valeur === 12) {
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
//			var cartes = document.querySelectorAll("#tableau .pile:not(.visible) > .carte:only-child");
			var cartes = getCartesObj("#tableau .pile:not(.visible) > .carte:only-child");
			cartes.forEach(retournerCarte);
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
			g.talon.setAttribute("data-n", g.talon.childElementCount);
		}
	}
	afficherJouables();
}
function trouverJouables() {
	var resultat, dessus, deplacables;
	resultat = [];
	dessus = trouverDessus();
	deplacables = trouverDeplacables();
	deplacables.filter(function (deplacable) {
		var possibilites = trouverPossibilites(deplacable.obj, dessus.obj);
        return (possibilites.length > 0);
    });
	return resultat;
}
function trouverPossibilites(pile, dessus) {
	var trous, empilables;
	trous = getTrous();
	if (dessus === undefined) {
		dessus = trouverDessus();
	}
    empilables = dessus.reduce(function (r, d) {
		if (estEmpilable(d, pile)) {
			r.push(d);
		}
    }, [], this);
	return [].concat(trous, empilables);
}
function getTrous() {
    return getCartesObj("#tableau .colonne:empty");
}
function trouverDessus() {
	return getCartesObj(
        "#tableau .pile.visible .carte:only-child",
        null,
        (carte)=>(carte.parentNode.obj)
    );
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
	if (estEmpilable(pile.obj, suivant.obj, true)) {
		pile.classList.add("deplacable");
		return true;
	}
	return false;
}
function estEmpilable(dessous, dessus, strict) {
	if (dessous.obj.valeur !== dessus.obj.valeur + 1) {
		return false;
	}
	if (!strict) {
		return true;
	}
	if (dessous.obj.sorte === dessus.obj.sorte) {
		return true;
	}
	return false;
}
function trouverDeplacables() {
	return getCartesObj("#tableau .pile.visible", estDeplacable);
}
function demarquerDeplacables() {
	var deplacables = document.querySelectorAll(".deplacable");
	deplacables.forEach(function (deplacable) {
		deplacable.classList.remove("deplacable");
    });
	return;
}
window.addEventListener("load", spider_main);
