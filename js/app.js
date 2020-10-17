/**
 * Derniere version fonctionnelle 07/05/2020.
 */
jQuery(document).ready(function($) {
	window.jours_desactiver = [];
	if (window.wbu_lundi_disable) {
		window.jours_desactiver.push(1);
	}
	if (window.wbu_mardi_disable) {
		window.jours_desactiver.push(2);
	}
	if (window.wbu_mercredi_disable) {
		window.jours_desactiver.push(3);
	}
	if (window.wbu_jeudi_disable) {
		window.jours_desactiver.push(4);
	}
	if (window.wbu_vendredi_disable) {
		window.jours_desactiver.push(5);
	}
	if (window.wbu_samedi_disable) {
		window.jours_desactiver.push(6);
	}
	if (window.wbu_dimanche_disable) {
		window.jours_desactiver.push(0);
	}
	const jour_desactiver = window.jours_desactiver;

	// Delai de traitement en jour.
	const free_delai = window.wbu_free_delai ? window.wbu_free_delai : 8;
	const plus_delai = window.wbu_plus_delai ? window.wbu_plus_delai : 2;
	const express_delai = window.wbu_express_delai ? window.wbu_express_delai : 1;
	//
	const free_horaire = 60;
	const blocks_type_livraisons = [
		{
			titre: "GRATUIT",
			body: [
				"Créneau horaire de 60 min",
				"Délai de traitement de 72 heures",
				"Minimum de commande : 15,00€"
			],
			montant: 0,
			type: "free",
			creneau: free_horaire,
			delai: free_delai,
			id: 31058498125884,
			active: false
		},
		{
			titre: "PLUS",
			body: [
				"Créneau horaire de 60 min",
				"Délai de traitement de 48 heures",
				"Minimum de commande : 15,00€"
			],
			montant: 9.99,
			type: "plus",
			creneau: 60,
			delai: plus_delai,
			id: 31058498158652,
			active: false
		},
		{
			titre: "EXPRESS",
			body: [
				"Créneau horaire de 30 min",
				"Délai de traitement de 24 heures",
				"Minimum de commande : 15,00€"
			],
			montant: 19.99,
			type: "express",
			creneau: 30,
			delai: express_delai,
			id: 31058498191420,
			active: false
		}
	];

	Vue.component('crenneau-selection', CrenSelect);

	window.S_Horaires = new Vue({
		el: '#selectionCrenneau',
		data: {
			jour_desactiver: jour_desactiver,
			blocks_type_livraisons: blocks_type_livraisons,
		}
	});
});
