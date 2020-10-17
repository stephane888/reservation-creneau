/**
 *
 */
jQuery(document).ready(function($) {
	const blocks_type_livraisons = [{
		titre: 'GRATUIT',
		body: [
			'Créneau horaire de 120 min',
			'Délai de traitement de 72 heures',
			'Minimum de commande : 15,00€',
		],
		montant: 0,
		type: 'free',
		creneau: 120,
		delai: 3,
		id: 31058498125884,
		active: false,
	}, {
		titre: 'PLUS',
		body: [
			'Créneau horaire de 60 min',
			'Délai de traitement de 48 heures',
			'Minimum de commande : 15,00€',
		],
		montant: 9.99,
		type: 'plus',
		creneau: 60,
		delai: 2,
		id: 31058498158652,
		active: false,
	}, {
		titre: 'EXPRESS',
		body: [
			'Créneau horaire de 30 min',
			'Délai de traitement de 24 heures',
			'Minimum de commande : 15,00€',
		],
		montant: 19.99,
		type: 'express',
		creneau: 30,
		delai: 1,
		id: 31058498191420,
		active: false,
	}];

	Vue.component('selection_horaire', {
		delimiters: ['${', '}'],
		template: '#templatehoraireselection',
		props: {
			id_html: {
				type: String,
				default: '',
			},
			titre: {
				type: [String],
				default: 'Sélectionner les horaires de récupération'
			},
			type: {
				type: String,
				default: '',
			},
			delai_traitement_en_jour: {
				type: [Number],
				default: 3
			},
			plage_mn: {
				type: [Number],
				default: 120
			},
			maj__date_select: {
				type: String,
				default: '',
			},
			default__creneau: {
				type: [String, Object],
				default: '',
			}, // pour
			// definir
			// une
			// valeur
			// par
			// defaut
			// pour
			// le
			// creneau
			// lors
			// de
			// conscrution
			// complete.
			creneau_update: {
				type: [String, Object],
				default: '',
			}, // pour
			// mettre
			// a
			// jour
			// le
			// creneau
			// de
			// livraison,
			// apres
			// la
			// selection
			// sur
			// selui
			// de la
			// recuperation.
			/**
			 * Permet de reconstruire tous les options, apres MAJ du type de
			 * livraison.
			 */
			re_construction_module: {
				type: [Number],
				default: 0
			},
			default_date: {
				type: [String, Object],
				default: '',
			},
		},
		data: function() {
			return {
				dates_tabs: [],
				horaires: [],
				months: [],
				/**
				 * La date du jour en cours.
				 */
				current_date: '',
				/**
				 * La date qui est selectionné
				 */
				date_select: '',
				/**
				 * date de debut de reservation.peut etre le jour en cours, le
				 * lendemain.
				 */
				date_debut_default: 0,
				/**
				 * nombre de jour sur la tab.
				 */
				number_day: 2,
				/**
				 * Utiliser par livraison, pour determiner le nombre de jour
				 * supplementaire qui seront masqués.
				 */
				diff_day: 0,
				/**
				 *
				 */
				periode_day_valide: 21,
				/**
				 * Decallage d'heure, permet de reserver à partir d'une heure,
				 * fonctionne sur la date en cour.
				 *
				 */
				decalage_heure: 1,
				/**
				 * La periodicite entre les creneaux, (8h-00 ...) (8h-30 ...)
				 * (9h-00 ...) (9h30 ...);
				 */
				periodicite: 30,
				/**
				 *
				 */
				update__creneau_livraison: '',
				/**
				 * Boolean
				 */
				plage_heure: true,
				show_date: false,
				show_texte_error: false,
				/**
				 * Permet d'ignorer certains comportement lors de la
				 * reconstruction des modules.
				 */
				update_builder_is_running: false,
				/**
				 * Permet d'ignorer certains comportement lors de la
				 * construction des modules.
				 */
				builder_is_running: false,
				/**
				 *
				 */
				selection_metafields: window.selection_plage_heure,
				/**
				 * Stocke les heures non utilisés.
				 */
				remove_hours: {},
				/**
				 * for test
				 */
				// maj__date_select2:''
			};
		},
		watch: {
			/**
			 * NB : les watcher ne s'execute pas au chargement. Permet de
			 * modifier la date_select. au format YY-mm-jj ou YY-mm-jjTh:mn
			 */
			perfom__date_select: function() {
				if (this.perfom__date_select) {
					this.update_date_livraiosn();
				}
			},
			perfom__creneau: function(val) {
				this.update_creneau_livraiosn();
			},
			re_construction_module: function() {
				this.re_builder();
			}

		},
		computed: {
			perfom__date_select: {
				/**
				 * La valeur de maj__date_select2 est MAJ chaque fois que
				 * maj__date_select est modifié. Donc, la fonction get est
				 * executé. NB : Ce systeme a besoin d'un rendu
				 * ${perfom__date_select} ou de disposer d'une methode, ou d'un
				 * watcher pour fonctionner , i.e pour suivre les modifications.
				 * elle s'execute avant mounted; Mais pour des raison d
				 * performance, il ne faut pas mettre de methode à l'interieur.
				 * (Analyse person).
				 */
				get: function() {
					return this.maj__date_select;
				}
			},
			/**
			 * Pour suivre la MISE à jour des creanaux lors des clics.
			 */
			perfom__creneau: {
				get: function() {
					return this.creneau_update;
				}
			}
			/* */
		},
		mounted: function() {
			/**
			 *
			 */
			if (this.selection_metafields) {
				this.selection_metafields = JSON.parse(this.selection_metafields);
				this.selection_metafields = this.selection_metafields.selection_plage_heure; // console.log(this.selection_metafields);

			}
			/**
			 * On definit la date et l'heure du jour.
			 */
			if (window.wbu_date_now) {
				this.current_date = new Date(this.get_date_for_old_browser(window.wbu_date_now));
			} else {
				this.current_date = new Date(this.get_date_for_old_browser());
			}
			/**
			 *
			 */
			this.builder();
		},
		methods: {
			/**
			 * MAJ des creneaux de livraison à partir d'une selection de date
			 * sur la selection de recuperation.
			 */
			update_date_livraiosn: function() {
				var self = this;
				if (this.type == 'livraison') {
					/**
					 * Pour eviter les chauvements on ajouter un waiter
					 */
					function waiter() {
						if (!self.update_builder_is_running && !self.builder_is_running) {
							var date_from_recuperation = new Date(self.get_date_for_old_browser(
								self.perfom__date_select));
							// console.log('update_date_livraiosn : ',
							// self.perfom__date_select,
							// date_from_recuperation);
							self.date_select = self.addDays(date_from_recuperation, (
								/*
								 * not
								 * use
								 * here :
								 * this.date_debut_default +
								 */
								self.delai_traitement_en_jour));
							self.date_select.setHours(self.current_date.getHours());
							self.date_select.setMinutes(self.current_date.getMinutes());
							self.date_select.setSeconds(self.current_date.getSeconds());
							/**
							 * MAJ de la date.
							 */
							self.send__date_select();
							self.diff_day = self.get_diff_day(self.current_date, self.date_select);
							self.builder_update();
							/**
							 * on remet les creneaux à l'initiale
							 */
							self.update__creneau_livraison = '';
						} else {
							setTimeout(function() {
								console.log('builder_update is waiting');
								waiter();
							}, 300);
						}
					}
					waiter();
				}
			},
			get_date_for_old_browser: function(date = null) {
				// console.log('get_date_for_old_browser : ', date);
				var date_show;
				if (!date) {
					return moment();
				}

				if (typeof date === 'string') {
					var ar1 = date.split('T');
					date_show = ar1[0].split('-');
					if (date_show[2]) {
						date_show[1] = date_show[1].toString().padStart(2, '0');
						date_show[2] = date_show[2].toString().padStart(2, '0');
						if (ar1[1]) {
							date_show = date_show[0] + '-' + date_show[1] + '-' + date_show[2] +
								'T' + ar1[1];
						} else {
							date_show = date_show[0] + '-' + date_show[1] + '-' + date_show[2];
						}
						return moment(date_show);
					}
				}

				date_show = moment(date);
				if (date_show.isValid()) {
					return date_show;
				} else {
					// console.log('date to split : ', date_show, '\n\n', date);
					if ('Invalid Date' == date) {
						alert('error : ' + this.type);
						return this.date_select;
					}
				}
				return moment(date);
			},
			update_creneau_livraiosn2: async function() {
				/**
				 * Est executé au chargement car le builder appelle la fonction
				 * send__date_select()
				 */
				if (this.type == 'livraison') {
					this.build_creneaux();
					/**
					 * Permet de selectionner le premier creneau lors de la
					 * selection manuel au niveau de la recuperation.
					 */
					this.select_plage_heure();
				}
			},
			update_creneau_livraiosn: async function() {
				/**
				 * Est executé au chargement car le builder appelle la fonction
				 * send__date_select()
				 */
				if (this.type == 'livraison') {
					await this.build_creneaux();
					/**
					 * Permet de selectionner le premier creneau lors de la
					 * selection manuel au niveau de la recuperation.
					 */
					await this.select_plage_heure();
				}
			},
			/**
			 * Permet de reconstruire entirement le module de selection.
			 * Executer par une action externe au module de selection, notament
			 * lors de la selection du type de livraison.
			 */
			re_builder: function() {
				var self = this;
				/**
				 * on remet les creneaux à l'initiale
				 */
				this.update__creneau_livraison = '';
				/**
				 * { Pour la version suivante, il faudra que lorsqu'on désactive
				 * this.builder(); que le resultat soit vide, actuelement les
				 * creneau s'affiche. D'ou l'ajout d"un waiter } Reconstruction
				 * du module
				 */
				function waiter() {
					if (!self.builder_is_running && !self.update_builder_is_running) {
						self.horaires = [];
						self.dates_tabs = [];
						self.months = [];
						self.builder();
					} else {
						setTimeout(function() {
							console.log(' Re_builder is waiting ');
							waiter();
						}, 300);
					}
				}
				waiter();
			},
			/**
			 * Permet de reconstruire partiellement le module de selection.
			 * Executer lors de la selection de date.
			 */
			builder_update: function() {
				var self = this;
				this.update_builder_is_running = true;

				function execution(etape) {
					return new Promise((resolve, reject) => {
						// console.log('Builder update etape : ', etape);
						if (etape == 1) {
							resolve({
								etape: etape,
								resul: self.build_tabs()
							});
						} else if (etape == 2) {
							resolve({
								etape: etape,
								resul: self.build_creneaux()
							});
						} else if (etape == 3) {
							resolve({
								etape: etape,
								resul: self.buildCalendarMounth()
							});
						} else {
							reject({
								etape: etape
							});
						}
					});
				}
				execution(1).then(nextExecution, stopExecution).catch(function(error) {
					console.log('Error builder catch : ', error);
				});

				function nextExecution(value) {
					execution(value.etape + 1).then(nextExecution, stopExecution).catch(
						function(error) {
							console.log('Error builder catch : ', error);
						});
				}

				function stopExecution(value) {
					self.update_builder_is_running = false;
					if (!value.etape)
						console.log('Error on builder stopExecution : ', value);
				}
			},
			display_errors_plage_heure: function(horaires) {
				if (horaires.length == 0 && !this.show_date) {
					return 'Aucune plage disponible pour cette journée';
				}
				return false;
			},
			/**
			 * Construit le module de selection tout en tennant compte des
			 * données par defaut.
			 */
			builder: async function() {
				var self = this;
				this.builder_is_running = true;
				var etape1 = awaitself.get_select_date();
				// console.log('%c Builder fin de etape : %s', 'background:
				// #ccc; color: #1a7b01;', etape1, ' type : ', self.type);
				var etape2 = awaitself.build_tabs();
				// console.log('%c Builder fin de etape : %s', 'background:
				// #ccc; color: #1a7b01; padding: 2px;', etape2, ' type : ',
				// self.type);
				var etape3 = awaitself.build_creneaux();
				// console.log('%c Builder fin de etape : %s', 'background:
				// #ccc; color: #1a7b01; padding: 2px;', etape3, ' type : ',
				// self.type);
				var etape4 = awaitself.buildCalendarMounth();
				// console.log('%c Builder fin de etape : %s', 'background:
				// #ccc; color: #1a7b01; padding: 2px;', etape4, ' type : ',
				// self.type);
				var etape5 = awaitself.send__date_select();
				// console.log('%c Builder fin de etape : %s', 'background:
				// #ccc; color: #1a7b01; padding: 2px;', etape5, ' type : ',
				// self.type);
				var etape6 = awaitself.select_plage_heure();
				// console.log('%c Builder fin de etape : %s', 'background:
				// #ccc; color: #1a7b01; padding: 2px;', etape6, ' type : ',
				// self.type);
				/**
				 *
				 */
				// console.log('%c Builder etape execution terminée %s',
				// 'background: #222; color: #01bd29; padding: 5px;', ' type :
				// ', self.type);
				this.builder_is_running = false;
				return false;
			},
			get_select_date: function() {
				// console.log('get_select_date debut, type ', this.type);
				if (this.type == 'recuperation') {
					if (this.builder_is_running && this.maj__date_select != '' && this.valid_default_date() >
						0) {
						this.date_select = new Date(this.get_date_for_old_browser(this.maj__date_select));
					} else {
						this.date_select = this.addDays(this.current_date, (this.date_debut_default));
					}
					this.diff_day = this.get_diff_day(this.current_date, this.date_select);
					// console.log('get_select_date FIN');
					return 'get_select_date'; // this.date_select;
				} else if (this.type == 'livraison') {
					if (this.builder_is_running && this.maj__date_select != '' && this.valid_default_date() >
						0) {
						this.date_select = new Date(this.get_date_for_old_browser(this.maj__date_select +
							'T00:00:00'));
						// console.log('TRI update__date_select : ',
						// this.date_select,'\n\n',
						// this.maj__date_select,'\n\n',
						// this.get_date_for_old_browser(this.maj__date_select +
						// 'T00:00:00'));
					} else {
						this.date_select = this.addDays(this.current_date, (this.date_debut_default +
							this.delai_traitement_en_jour));
					}
					this.diff_day = this.get_diff_day(this.current_date, this.date_select);
					// console.log('get_select_date FIN, type ', this.type);
					return 'get_select_date'; // this.date_select;
				}
			},
			valid_default_date: function() {
				var date_du_jour = this.current_date;
				date_du_jour.setHours(0);
				date_du_jour.setMinutes(0);
				date_du_jour.setSeconds(0);
				var diff = this.get_diff_day(date_du_jour, this.maj__date_select,
					false);
				// console.log('valid_default_date ', this.type, ' : ',diff)
				return diff;
			},
			send__date_select: function() {
				// console.log('Date selectionner pour le type ', this.type,' :
				// ', this.date_select);
				this.$emit('ev_date_to_save', {
					type: this.type,
					date: this.date_select
				});
				return 'send__date_select';
			},
			addDays: function(date, days) {
				// console.log('addDays : ', days);
				var result = new Date(this.get_date_for_old_browser(date));
				if (days == 0) {
					return result;
				}
				result.setDate(result.getDate() + days);
				// console.log('addDays : ', result, date);
				return result;
			},
			build_tabs: function() {
				// console.log('build_tabs debut, type ', this.type);
				var self = this;
				this.dates_tabs = [];
				var i = 0;
				var current_date = self.current_date;
				// console.log('Date exacte : ',current_date);
				while (i < self.number_day) {
					var date = self.addDays(self.date_select, i); // console.log('
					// build_tabs
					// ',
					// self.date_select);
					var day = date.getDay(); // console.log('Date du jour
					// suivant : ', date);
					var date_n = date.getDate();
					if (self.get_diff_day(current_date, date) == 0) {
						day = "Aujourd'hui";
					} else if (self.get_diff_day(current_date, date) == 1) {
						day = 'Demain';
					} else {
						// console.log('indice de la date : ', day, date);
						day = self.getDayFrench(day);
					}
					if (date_n == 1) {
						date_n = '1er';
					}
					var tab = {
						'jour': day,
						'mois': date_n + ' ' + self.getMonthFrench(date.getMonth()),
						'index': date.getDay(),
						'date': date.getDate(),
						'month': date.getMonth(),
						'year': date.getFullYear(),
						'active': (i == 0) ? true : false,
					};

					self.dates_tabs.push(tab);
					i++;
				}
				self.dates_tabs.push({
					'jour': 'Plus de dates',
					'mois': 'afficher le calendrier',
					'index': 'all',
				});
				// console.log('build_tabs fin, type ', this.type);
				return 'build_tabs';
			},
			getDayFrench: function(index) {
				var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi',
					'Vendredi', 'Samedi'
				];
				if (days[index]) {
					return days[index];
				}
				return days[0];
			},
			getMonthFrench: function(index, type = 'all') {
				var Months = ['Janvier', 'février', 'Mars', 'Avril', 'Mai', 'Juin',
					'Juiellet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
				];
				if (type == 'small') {
					Months = ['jan.', 'fév.', 'Mar.', 'Avr.', 'Mai.', 'Jui.', 'Jui.',
						'Aout.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
					];
				}
				if (Months[index]) {
					return Months[index];
				}
				return Months[0];
			},
			/**
			 *
			 * @param {*}
			 *            date1 //Date inferieur
			 * @param {*}
			 *            date2 // date superieur
			 * @param {int}
			 *            positive //true pour une valeur absolue
			 */
			get_diff_day: function(date1, date2, positive = true) {
				var date1 = new Date(this.get_date_for_old_browser(date1));
				var date2 = new Date(this.get_date_for_old_browser(date2));
				if (positive) {
					var diffTime = Math.abs(date2 - date1);
				} else {
					var diffTime = date2 - date1;
				}

				var diff_exact = diffTime / (1000 * 60 * 60 * 24);
				var diffDays = diff_exact;
				// var diffDays = Math.ceil(diff_exact);
				// console.log('Difference entre les deux date ', diffDays);
				return Math.round(diffDays);
			},
			select_date_tab: function(index) {
				var self = this;
				var dates_tabs = [];
				if (index == 'all') {
					this.plage_heure = false;
					this.show_date = true;
				} else {
					this.plage_heure = true;
					this.show_date = false;
				}
				$.each(this.dates_tabs, function(i, val) {
					if (val.index == index) {
						val.active = true;
						if (index != 'all') {
							self.update__date_select(self.translate_date_to_valid(val));
							/**
							 * Si le type est recuperation,alors on met à jour,
							 * livraison.
							 */
							if (self.type == 'recuperation') {
								self.$emit('ev_reload_livraison__date', val);
							}
						}
					} else {
						val.active = false;
					}
					dates_tabs.push(val);
				});
				this.dates_tabs = dates_tabs;
				/**
				 * On remet les creneaux à l'initiale.
				 */
				if (this.type == 'livraison') {
					this.update__creneau_livraison = '';
				}
			},
			translate_date_to_valid: function(day) {
				/**
				 * on retire day.month, car la valeur peut etre = 0(pour
				 * janvier)
				 */
				if (day.date && day.year) {
					var day_d = day.date;
					if (day.date < 10) {
						day_d = '0' + day.date;
					}
					var new_date = new Date(this.get_date_for_old_browser(day.year + '-' +
						(day.month + 1) + '-' + day_d));
					// console.log(day.year+'-'+(day.month+1)+'-'+day_d+'T00:00:00',
					// new_date);
					return new_date;
				}
				return this.date_select;
			},
			update__date_select: function(date, rebuild_tab = false) {
				this.date_select = date;
				this.date_select.setHours(this.current_date.getHours());
				this.date_select.setMinutes(this.current_date.getMinutes());
				this.date_select.setSeconds(this.current_date.getSeconds());
				this.diff_day = this.get_diff_day(this.current_date, this.date_select);
				/**
				 * MAJ de la date.
				 */
				this.send__date_select();
				this.build_creneaux();
				/**
				 * necessaire si l'utilisateur, selectionne une nouvelle date.
				 */
				if (rebuild_tab) {
					this.build_tabs();
				}
			},
			build_creneaux: async function() {
				var self = this;
				return new Promise(async function(resolve, reject) {
					// console.log('build_creneaux : ', self.date_select);
					self.horaires = [];
					var plage_all = self.creneau_parjour(self.date_select.getDay());
					await self.perfom_build_creneaux(plage_all);
					/**
					 * Les creneaux sont prioritaires, donc si on contruit les
					 * creneaux on les affichage.
					 */
					self.show_date = false;
					self.plage_heure = true;
					resolve('build_creneaux');
				});
			},
			perfom_build_creneaux: function(plage_all, etape = 'matinee') {
				var self = this;
				return new Promise(async function(resolve, reject) {
					var plage = plage_all;
					if (plage_all.matinee) {
						if (etape == 'matinee') {
							if (plage.matinee) {
								await self.buildHoraire(plage.matinee, etape, plage_all);
							}
						} else if (etape == 'soir') {
							if (plage.soir) {
								await self.buildHoraire(plage.soir, etape, plage_all);
							}
						}
					} else {
						if (plage.soir) {
							await self.buildHoraire(plage.soir, 'soir', plage_all);
						}
					}
					resolve('perfom_build_creneaux');
				});

			},
			buildHoraire: async function(plage, etape_construction, plage_all) {
				var self = this;
				// console.log('contruction des creneaux de type ',this.type, '
				// : ', plage);
				return new Promise(async function(resolve, reject) {
					if (!plage.ht_debut || !plage.ht_fin) {
						resolve('buildHoraire');
						return false;
					}
					var result = null;
					var ht_debut = parseInt(plage.ht_debut);
					var ht_fin = parseInt(plage.ht_fin);
					var mn_debut = parseInt(plage.mn_debut);
					var mn_fin = parseInt(plage.mn_fin);
					// console.log(ht_debut, ht_fin, plage_mn);
					var current_date = new Date(self.get_date_for_old_browser(self.date_select));
					// var semi=false;
					// var plage_mn = parseInt(this.plage_mn); //creneau
					/**
					 * javacript fonctionne comme suit avec les dates : - si on
					 * definit l'heure à 7h, puis on definie les minutes à 30 on
					 * otient : 7h:30 - Si ensuite on definit les minutes à 15
					 * on otient : 7h:15.
					 */
					function promisecustom(etape = 0, h, mn) {
						return new Promise((resolve, reject) => {
							// console.log('promisecustom : ', etape, h, ' semi
							// : ', semi, 'type : ', self.type, ' Creneau :
							// ',plage_mn, 'mn_debut : ',mn_debut);
							var ct_bl = {},
								c_hr = c_mn = null;

							var crt_debut = h + etape;
							var status = true;
							// var crt_fin = plage_mn;
							// var semi_time = self.periodicite;
							var remove_hour = false;

							/**
							 * block 1
							 */
							current_date.setHours(crt_debut);
							current_date.setMinutes(mn);
							c_hr = current_date.getHours();
							c_mn = current_date.getMinutes();
							if (self.remove_hours && self.remove_hours[c_hr + '-' + c_mn]) {
								remove_hour = true;
							}
							if (c_hr < 10) {
								c_hr = '0' + c_hr;
							}
							if (c_mn < 10) {
								c_mn = '0' + c_mn;
							}
							ct_bl.h1 = c_hr + ':' + c_mn;

							/**
							 * block 2
							 */
							current_date.setHours(crt_debut);
							current_date.setMinutes(mn + self.plage_mn);
							c_hr = current_date.getHours();
							c_mn = current_date.getMinutes();
							if (c_hr < 10) {
								c_hr = '0' + c_hr;
							}
							if (c_mn < 10) {
								c_mn = '0' + c_mn;
							}
							ct_bl.h2 = c_hr + ':' + c_mn;
							/**
							 *
							 */
							if (parseInt(c_hr) > ht_fin) {
								status = false;
							} else if (parseInt(c_hr) == ht_fin && parseInt(c_mn) > mn_fin) {
								status = false;
							}
							if (status) {
								if (!remove_hour) {
									addCrenaux(ct_bl);
								}
								resolve({
									etape: etape,
									'mn': mn
								});
							} else {
								reject({
									etape: etape,
									'mn': mn
								});
							}

							function addCrenaux(ct_bl) {
								/**
								 * On selectionne la valeur valeur par defaut (
								 * à verfier et noter)
								 */
								if (self.builder_is_running && self.perfom__creneau && self.perfom__creneau
									.h1) {
									if (self.perfom__creneau.h1 == ct_bl.h1 && self.perfom__creneau
										.h2 == ct_bl.h2) {
										ct_bl.active = true;
									}
								}
								self.horaires.push(ct_bl);
							}
						});
					}

					function successCallback(value) {
						// console.log('succes : ', value);
						// console.log('type ',self.type,' test : ',
						// (value.etape + ht_debut +
						// Math.round(self.plage_mn/60)), ht_fin);
						if ((value.etape + ht_debut + Math.round(self.plage_mn / 60)) <=
							ht_fin) {
							if (self.type == 'livraison') {
								// console.log(' build date : ', (value.etape +
								// ht_debut + Math.round(self.plage_mn/60)),
								// ht_fin,' value : ', value);
							}
							if (mn_debut == 0) {
								if ((value.mn + self.periodicite) < 60) {
									promisecustom(value.etape, ht_debut, (value.mn + self.periodicite))
										.then(successCallback, failureCallback);
								} else {
									promisecustom(value.etape + 1, ht_debut, mn_debut).then(
										successCallback, failureCallback);
								}
							}
							if (mn_debut != 0) {
								if ((value.mn + self.periodicite) <= 60) {
									promisecustom(value.etape, ht_debut, (value.mn + self.periodicite))
										.then(successCallback, failureCallback);
								} else {
									promisecustom(value.etape + 1, ht_debut, mn_debut).then(
										successCallback, failureCallback);
								}
							}
						} else {
							fin_construction();
						}
					}

					function failureCallback(error) {
						// console.log('error : ', error);
						if ((error.etape + ht_debut) < ht_fin) {
							fin_construction();
							// promisecustom(error.etape + 1, ht_debut,
							// plage_mn).then(successCallback, failureCallback);
						} else {
							fin_construction();
						}
					}

					/**
					 *
					 */
					async function fin_construction() {
						// console.log('Fin de la contruction de type
						// ',self.type, ' : ',etape_construction, plage_all);
						if (etape_construction == 'matinee') {
							await self.perfom_build_creneaux(plage_all, 'soir');
						}
						resolve('buildHoraire');
					}
					promisecustom(0, ht_debut, mn_debut).then(successCallback,
						failureCallback);
					return result;
				});
			},
			creneau_parjour: function(index) {
				var self = this;
				self.remove_hours = {};
				var plages = [{}, // dim
					{
						matinee: {
							ht_debut: 8,
							mn_debut: 0,
							ht_fin: 21,
							mn_fin: 30
						}
					}, // lin
					{
						matinee: {
							ht_debut: 8,
							mn_debut: 0,
							ht_fin: 21,
							mn_fin: 30
						}
					}, // mard
					{
						matinee: {
							ht_debut: 8,
							mn_debut: 0,
							ht_fin: 21,
							mn_fin: 30
						}
					}, // merc
					{
						matinee: {
							ht_debut: 8,
							mn_debut: 0,
							ht_fin: 21,
							mn_fin: 30
						}
					}, // jeudi
					{
						matinee: {
							ht_debut: 8,
							mn_debut: 0,
							ht_fin: 21,
							mn_fin: 30
						}
					}, // vendredi
					{
						matinee: {
							ht_debut: 8,
							mn_debut: 0,
							ht_fin: 21,
							mn_fin: 30
						}
					} // samedi
				];
				var plage_valide = {};
				/**
				 * selection de la plage
				 */
				if (plages[index]) {
					plage_valide = plages[index];
				} else {
					plage_valide = plages[0];
				}
				/**
				 * si la date du jour est egal à celle selectionner, respecter
				 * les heures de debuts. + Ajout du decallage sur les creneaux.
				 */
				// console.log('difference de jours pour le type ', this.type, '
				// : ', this.diff_day);
				if (
					(this.type == 'recuperation' && this.diff_day == this.date_debut_default) ||
					(this.type == 'livraison' && this.diff_day == (this.delai_traitement_en_jour +
						this.date_debut_default))
				) {
					var hour_now = this.current_date.getHours(),
						hour_final = 0;
					if (plage_valide.matinee && (plage_valide.matinee.ht_fin >= (hour_now +
							Math.round(this.plage_mn / 60) + this.decalage_heure))) {
						// + decallage
						hour_final = hour_now + this.decalage_heure;
						console.log('heure final : ', hour_now + this.decalage_heure, ' : ',
							hour_now, ' : ', this.decalage_heure, ': ', this.current_date.getHours(),
							' : ', hour_final);
						if (hour_final > plage_valide.matinee.ht_debut) {
							plage_valide.matinee.ht_debut = hour_final;
						}
					} else {
						delete plage_valide.matinee;
					}
					if (plage_valide.soir && (plage_valide.soir.ht_fin >= (hour_now +
							Math.round(this.plage_mn / 60) + this.decalage_heure))) {
						// + decallage
						hour_final = hour_now + this.decalage_heure;
						if (hour_final > plage_valide.soir.ht_debut) {
							plage_valide.soir.ht_debut = hour_final;
						}
					} else {
						delete plage_valide.soir;
					}
				}
				/**
				 * MAJ des creneaux en fonction de celui precedament
				 * selectionnée.
				 */
				if (this.type == 'livraison' && !this.update_builder_is_running) {
					// console.log('%c GET new creneau %s','background: #222;
					// color: #bada55',this.type,' \n\n Date de recuparation :
					// ', this.perfom__date_select , '\n\n Date from
					// recuperation : ',this.default_date, ' \n\n Date de
					// livraison : ', this.date_select, ' \n\n Date encours ou
					// date du jour : ',this.current_date );
					var date_livraison = this.date_select;
					date_livraison.setHours(0);
					date_livraison.setMinutes(0);
					date_livraison.setSeconds(0);
					/**
					 * Pour le comportement par defaut, aucune n'etant
					 * selectionné donc this.perfom__date_select est vide, on va
					 * deduire la date de recuperation.
					 */
					var date_from_recuperation = this.current_date;
					date_from_recuperation.setHours(0);
					date_from_recuperation.setMinutes(0);
					date_from_recuperation.setSeconds(0);
					if (this.default_date) {
						date_from_recuperation = this.default_date;
					} else if (this.perfom__date_select) {
						date_from_recuperation = this.perfom__date_select;
					}

					var diff_day = this.get_diff_day(date_livraison,
						date_from_recuperation);
					// console.log('\n\n date livraiosn : ', date_livraison, '
					// diff : ', diff_day, 'delai_traitement_en_jour : ',
					// this.delai_traitement_en_jour);
					if (diff_day == (this.delai_traitement_en_jour + this.date_debut_default)) {
						this.update__creneau_livraison = this.perfom__creneau;
					} else {
						this.update__creneau_livraison = '';
					}
					if (this.update__creneau_livraison && this.update__creneau_livraison.h1 &&
						this.update__creneau_livraison.h1 != '') {
						var hr_new = (this.update__creneau_livraison.h1).split(':');
						var current_date = this.date_select;
						hr_new[0] = parseInt(hr_new[0]);
						hr_new[1] = parseInt(hr_new[1]);
						if (plage_valide.matinee) {
							// console.log('Creneaux de recuperation matinee :
							// ', hr_new,' ht_debut : ',
							// plage_valide.matinee.ht_debut, ' ht_fin :
							// ',plage_valide.matinee.ht_fin);
							if (hr_new[0] && (plage_valide.matinee.ht_debut <= hr_new[0]) && (
									plage_valide.matinee.ht_fin > hr_new[0])) {
								current_date.setHours(hr_new[0]);
								current_date.setMinutes(hr_new[1] + this.periodicite); // console.log(current_date);
								plage_valide.matinee.ht_debut = current_date.getHours();
								plage_valide.matinee.mn_debut = current_date.getMinutes();
							} else if (hr_new[0]) {
								delete plage_valide.matinee;
							}
						}
						if (!plage_valide.matinee && plage_valide.soir) {
							// console.log('Creneaux de recuperation soir : ',
							// hr_new, ' ht_debut : ',
							// plage_valide.soir.ht_debut, ' ht_fin :
							// ',plage_valide.soir.ht_fin);
							if (hr_new[0] && (plage_valide.soir.ht_debut <= hr_new[0]) && (
									plage_valide.soir.ht_fin >= hr_new[0])) {
								current_date.setHours(hr_new[0]);
								current_date.setMinutes(hr_new[1] + this.periodicite);
								plage_valide.soir.ht_debut = current_date.getHours();
								plage_valide.soir.mn_debut = current_date.getMinutes();
							} else if (hr_new[0]) {
								delete plage_valide.soir;
							}
						}
					}
				}

				/**
				 * Si la date encours de selection est egale à celle dans le
				 * metafield, on enleve la plage.
				 *
				 * Pour y parvenir on met dans une variable les heures à
				 * supprimer.
				 */
				var current_date_select = this.date_select;
				// console.log('self.selection_metafields',
				// self.selection_metafields);
				if (self.selection_metafields && self.selection_metafields.livraison &&
					self.type == 'livraison') {
					$.each(self.selection_metafields.livraison, function(i, k) {
						if (!k.mn_debut) {
							k.mn_debut = 0;
						}
						if (current_date_select && (k.date == current_date_select.getDate() +
								'/' + (current_date_select.getMonth() + 1) + '/' +
								current_date_select.getFullYear())) {
							if (plage_valide.matinee && (k.ht_debut < plage_valide.matinee.ht_fin)) {
								// plage_valide.matinee.ht_debut = k.ht_debut;
								// plage_valide.matinee.ht_fin =
								// parseInt(k.ht_debut) + 2;
								self.remove_hours[k.ht_debut + '-' + k.mn_debut] = {
									hr: k.ht_debut,
									mn: k.mn_debut
								};
							} else if (plage_valide.soir) {
								// plage_valide.matinee.ht_debut = k.ht_debut;
								// plage_valide.matinee.ht_fin =
								// parseInt(k.ht_debut) + 2;
								self.remove_hours[k.ht_debut + '-' + k.mn_debut] = {
									hr: k.ht_debut,
									mn: k.mn_debut
								};
							}
						}
					});
				}
				if (self.selection_metafields && self.selection_metafields.recuperation &&
					self.type == 'recuperation') {
					$.each(self.selection_metafields.recuperation, function(i, k) {
						if (!k.mn_debut) {
							k.mn_debut = 0;
						}
						if (current_date_select && (k.date == current_date_select.getDate() +
								'/' + (current_date_select.getMonth() + 1) + '/' +
								current_date_select.getFullYear())) {
							if (plage_valide.matinee && (k.ht_debut < plage_valide.matinee.ht_fin)) {
								// plage_valide.matinee.ht_debut = k.ht_debut;
								// plage_valide.matinee.ht_fin =
								// parseInt(k.ht_debut) + 2;
								self.remove_hours[k.ht_debut + '-' + k.mn_debut] = {
									hr: k.ht_debut,
									mn: k.mn_debut
								};
							} else if (plage_valide.soir) {
								// plage_valide.matinee.ht_debut = k.ht_debut;
								// plage_valide.matinee.ht_fin =
								// parseInt(k.ht_debut) + 2;
								self.remove_hours[k.ht_debut + '-' + k.mn_debut] = {
									hr: k.ht_debut,
									mn: k.mn_debut
								};
							}
						}
					});
				}
				// console.log( 'self.remove_hours : ', self.remove_hours );
				// console.log(' plage_valide : ', plage_valide);
				return plage_valide;
			},
			buildCalendarMounth: function() {
				if (!this.valid_date()) {
					return false;
				}
				this.months = [];
				var current_date = this.current_date;
				var day_index = current_date.getDay();
				var day_unavailable = null;
				if (day_index == 0) {
					day_unavailable = 7;
				} else {
					day_unavailable = day_index;
				}
				this.buildCalendar(-day_unavailable, false);
				return 'buildCalendarMounth';
			},
			buildCalendar: function(days, status, etape = 1) {
				if (etape == 1) {
					this.CalendarMounth(days, status);
				} else if (etape == 2) {
					var day_unavailable = 31 + days;
					this.CalendarMounth(day_unavailable, true);
				}
			},
			CalendarMounth: function(days = -25, status = true) {
				var self = this;
				var date = new Date(this.get_date_for_old_browser(this.current_date));
				// console.log('Current date day ',date.getDate(), 'type ',
				// self.type);
				var i = 1;

				if (days < 0) {
					i = -1;
					while (i >= days) {
						// console.log('negatif : ', i);
						self.months.push({
							status: status,
							date_french: date.getDate().toString().padStart(2, '0'),
							date: date.getDate(),
							day: date.getDay(),
							month: date.getMonth(), // date.getMonth().toString().padStart(2,
							// '0'),
							month_french: self.getMonthFrench(date.getMonth(), 'small'),
							year: date.getFullYear(),
						});
						date.setDate(date.getDate() - 1);
						i--;
					}
					self.months.shift();
					self.months.reverse();
					this.buildCalendar(days, true, 2);
				} else {
					i = 1;
					var newDays = [];
					while (i <= days) {
						status = true;
						if (self.type == 'recuperation') {
							if (
								(i <= self.date_debut_default) ||
								(i > self.periode_day_valide)
							) {
								status = false;
							}
						} else if (self.type == 'livraison') {
							if (
								(i <= self.date_debut_default) ||
								(i <= self.diff_day) ||
								(i > self.periode_day_valide)
							) {
								status = false;
							}
						}
						newDays.push({
							status: status,
							date_french: date.getDate().toString().padStart(2, '0'),
							date: date.getDate(),
							day: date.getDay(),
							month: date.getMonth(), // date.getMonth().toString().padStart(2,
							// '0'),
							month_french: self.getMonthFrench(date.getMonth(), 'small'),
							year: date.getFullYear(),
						});
						date.setDate(date.getDate() + 1);
						i++;
					}
					// newDays.shift();
					$.each(newDays, function(i, val) {
						self.months.push(val);
					});
				}
				/* */
			},
			select_date_day: function(day) {
				if (day.status) {
					this.dates_tabs = [];
					this.update__date_select(this.translate_date_to_valid(day), true);
					this.plage_heure = true;
					this.show_date = false;
					/**
					 * Si le type est recuperation,alors on met à jour,
					 * livraison.
					 */
					if (this.type == 'recuperation') {
						this.$emit('ev_reload_livraison__date', day);
					}
					/**
					 * on remet les creneaux à l'initiale
					 */
					if (this.type == 'livraison') {
						this.update__creneau_livraison = '';
					}
				}
			},
			valid_date: function() {
				// console.log('validation_date : ', this.diff_day,
				// this.delai_traitement_en_jour, ' periode : ',
				// this.periode_day_valide);
				// var sm = this.diff_day + this.delai_traitement_en_jour;
				// console.log('validation_date : ', sm, ' periode : ',
				// this.periode_day_valide);
				if ((this.diff_day + this.delai_traitement_en_jour) > this.periode_day_valide) {
					this.show_texte_error = true;
					return false;
				} else {
					this.show_texte_error = false;
					return true;
				}
			},
			select_plage_heure: function(index = 0) {
				var self = this;
				var horaires = [];
				// console.log('select_plage_heure : ', this.type , '
				// perfom__creneau : ', this.perfom__creneau, ' default__creneau
				// : ', this.default__creneau);
				// console.log('self.builder_is_running : ',
				// self.builder_is_running, ' self.update_builder_is_running :
				// ', self.update_builder_is_running);
				var ct_bl = '';
				if (this.default__creneau && this.default__creneau != '' && this.builder_is_running) {
					ct_bl = (self.default__creneau).split('-');
					ct_bl[0] = ct_bl[0].trim();
					ct_bl[1] = ct_bl[1].trim();
					index = null;
					// console.log(ct_bl);
				} else if (self.perfom__creneau && self.perfom__creneau != '' && !self
					.perfom__creneau.h1) {
					ct_bl = (self.perfom__creneau).split('-');
					ct_bl[0] = ct_bl[0].trim();
					ct_bl[1] = ct_bl[1].trim();
					index = null;
					// console.log(ct_bl);
				}
				$.each(self.horaires, function(i, hour) {
					if ((ct_bl && ct_bl[0]) &&
						(ct_bl[0] == hour.h1 && ct_bl[1] == hour.h2)
					) {
						hour['active'] = true;
						horaires.push(hour);
						if (self.builder_is_running && self.type == 'livraison') {
							self.send__creneau(hour);
						}
					} else if (i == index) {
						hour['active'] = true;
						horaires.push(hour);
						self.send__creneau(hour);
					} else {
						hour['active'] = false;
						horaires.push(hour);
					}
				});
				self.horaires = horaires;
				return 'select_plage_heure';
			},
			send__creneau: function(creneau) {
				this.$emit('ev_date_et_creneau_to_save', {
					type: this.type,
					date: this.date_select,
					creneau: creneau
				});
				// if(!this.builder_is_running)
				{
					creneau.type = this.type;
					this.$emit('ev_reload_livraison__creneau', creneau);
				}
			}
		},

	});

	Vue.component('type_livraison', {
		delimiters: ['${', '}'],
		template: '#template-types-de-livraison',
		props: {
			datas: [Object, Array, String, Number],
			id_html: {
				type: String,
				default: '',
			},
			default_type: {
				type: [String, Number],
				default: 0
			},
		},
		data: function() {
			return {
				titre: 'Types de livraison',
				types_livraison: [],
				show_adresse: false,
				adresse_name: '',
			};
		},
		mounted: function() {
			// console.log('contenu dans default_type, ', this.default_type);
			this.buildTypes();
			this.adresse_name = Cookies.get('wbu_localisation_map');
			if (this.adresse_name) {
				this.show_adresse = true;
			}
		},
		watch: {
			default_type: function() {
				// console.log('MAJ de default_type : ', this.default_type)
				this.buildTypes();
			},
		},
		methods: {
			select_type_tab: function(event, index) {
				var self = this;
				$('.map-localisation-wbu .type-livraison li').removeClass('active');
				if (event.target.localName == 'li') {
					$(event.target).addClass('active');
				} else if (event.target.localName == 'small') {
					$(event.target).parent().parent().addClass('active');
				} else {
					$(event.target).parent().addClass('active');
				}
				if (this.types_livraison[index]) {
					this.$emit('ev_change_type_livraison', this.types_livraison[index]);
				} else {
					console.log('error');
				}
			},
			display_prise: function(price) {
				if (price == 0) {
					return '+0€'; // 'FREE';
				} else {
					return '+' + price + '€';
				}
			},
			buildTypes: function() {
				var self = this;
				var types_livraison = blocks_type_livraisons;
				$.each(types_livraison, function(i, type) {
					// console.log('Valeur seletionné pour type de livraison :
					// ', self.default_type);
					if (type.type == self.default_type) {
						types_livraison[i]['active'] = true;
					}
				});
				// console.log('types_livraison', types_livraison);
				this.types_livraison = types_livraison;
			},
		},
	});

	/**
	 * initialisation.
	 */
	new Vue({
		delimiters: ['${', '}'],
		el: '#selection_horaire',
		data: {
			show_selection: false,
			plage_heure: true,
			/**
			 * format 2019-12-5
			 */
			date_recuperation: '',
			default_creneau_recuperation: '',
			date_livraison: '',
			default_creneau_livraison: '',
			creneau_update_livraison: '',
			date_from_recuperation: '',
			/**
			 * Plage d'un creneau.
			 */
			plage_mn: 120,
			/**
			 * Pour reconstruire les modules de selections.
			 */
			re_construction_module: 0,
			/**
			 * Contient les données de la variante selectionné.
			 */
			datas: {},
			/**
			 *
			 */
			default_type: 0,
			/**
			 * utilisé pour definir un type par defaut.
			 */
			default_type_static: 'free',
			/**
			 * Plage du creneau.
			 */
			custom_plage_mn: 120,
			/**
			 *
			 */
			delai_traitement_en_jour: 3,
			/**
			 * Les variantes du produits.
			 */
			variants: {
				'31058498125884': {
					type: 'free',
					id: 31058498125884
				},
				'31058498158652': {
					type: 'plus',
					id: 31058498158652
				},
				'31058498191420': {
					type: 'express',
					id: 31058498191420
				},
			},
			/**
			 * Contient l'id de la variante selectionné.
			 */
			variant_in_cart: false,
			/**
			 * Données à sauvegarder.
			 */
			data_tosave_livraison: null,
			data_tosave_recuperation: null,
			/**
			 * verificateur avant le passage au checkout
			 */
			valid_creneau: false,
			valid_localisation: false,
			/**
			 * semi verificateur
			 */
			valid_creneau_livraison: false,
			valid_creneau_recuperation: false,
			/**
			 *
			 */
			default_select_date_recuperation: '',
			default_select_hour_recuperation: '',
			default_select_date_livraison: '',
			default_select_hour_livraison: '',
			/**
			 *
			 */
			cart: {},
			/**
			 * Identifiant pour la Map.
			 */
			model_ref: 'map-google-field',
			/**
			 * identifiant de selection de retour
			 */
			selection_back: '#id-cart-form'
		},
		mounted: function() {
			/**
			 * en local
			 */
			if (window.location.host == 'modulejs.kksa') {
				this.show_selection = true;
			}
			this.selection_init();
			/**
			 * Chargement du panier.
			 */
			this.loadcart();
			/*******************************************************************
			 * this.date_recuperation = '2019-12-13'; this.date_livraison =
			 * '2019-12-16'; this.date_from_recuperation =
			 * this.date_recuperation; this.re_construction_module++; /
			 ******************************************************************/
		},
		methods: {
			/**
			 * Ajout des dates à sauvergarder.
			 *
			 * @param {*}
			 *            datas
			 */
			date_to_save: function(datas) {
				// console.log('Date à sauvergarder : ', datas);
				/**
				 * Si l'utilisateur modifie une date, il faut verifier le type
				 * et le desactivé.
				 */
				if (datas.type == 'livraison') {
					this.valid_creneau_livraison = false;
				} else if (datas.type == 'recuperation') {
					this.valid_creneau_recuperation = false;
				}
				this.valid_creneau = false;
			},
			/**
			 * Ajout des dates à sauvergarder.
			 *
			 * @param {*}
			 *            datas
			 */
			date_et_creneau_to_save: function(datas) {
				// console.log('Date et creneau à sauvergarder : ', datas);
				var texte = datas.type + '\r\n';
				var date = new Date(this.get_date_for_old_browser(datas.date));
				texte += ' Date : ' + date.getDate() + '/' + (date.getMonth() + 1) +
					'/' + date.getFullYear() + '\r\n';
				texte += ' Heure : ' + datas.creneau.h1 + ' - ' + datas.creneau.h2 +
					'\r\n';
				if (datas.type == 'livraison' && date) {
					this.data_tosave_livraison = texte;
					this.valid_creneau_livraison = true;
				} else if (datas.type == 'recuperation' && date) {
					this.data_tosave_recuperation = texte;
					this.valid_creneau_recuperation = true;
					this.valid_creneau_livraison = false;
				}
				if (this.valid_creneau_recuperation && this.valid_creneau_livraison) {
					this.valid_creneau = true;
					console.log('\n\n Date et creneau à sauvergarder : \n', this.data_tosave_recuperation,
						this.data_tosave_livraison);
				} else {
					this.valid_creneau = false;
				}
			},
			change_type_livraison: function(datas) {
				// console.log('change_type_livraison : ', datas);
				/**
				 * met à jour les produits du panier.
				 */
				this.updateTypeLivraison(datas);
				/**
				 * Ajout le cover durant le processus
				 */
				var selection = '.map-localisation-wbu';
				this.add_cover_wait(selection);
				/**
				 * On definit de date_livraison à '', pour annuler la selection
				 * precedente.
				 */
				this.date_livraison = '';
				/**
				 * reconstruction des modules de selection.
				 */
				this.delai_traitement_en_jour = datas.delai;
				this.plage_mn = datas.creneau;
				this.re_construction_module++;
			},
			reload_livraison__date: function(day) {
				// console.log('Mise à jour de la date de livraison, action
				// déclenchée par celui de la recuperation. : ', day);
				this.date_from_recuperation = null;
				this.date_livraison = day.year + '-' + (day.month + 1) + '-' + day.date;
			},
			reload_livraison__creneau: function(creneau) {
				// console.log('Mise à jour du creneau de livraison, action
				// déclenchée par celui de la recuperation. : ', creneau);
				this.creneau_update_livraison = creneau;
			},
			loadcart: function() {
				var self = this;
				jQuery.getJSON('/cart.js', function(cart) {
					// console.log('Panier charger : ', cart);
					self.cart = cart;
					self.analyseCart();
				});
			},
			selection_init: function() {
				var self = this;
				/**
				 * display Message
				 */
				$('.map-localisation-wbu.container .element-visible').css('display',
					'block');
				$('button[name="checkout"], .creneau.open').click(function(event) {
					$('.map-localisation-wbu.container .element-visible').css('display',
						'block');
					if (self.get_localisation()) {
						if (self.valid_creneau && self.valid_localisation) {} else {
							event.preventDefault();
							/**
							 * get data selection.
							 */
							var selection = $(this).data('selection');
							if (selection && selection != '') {
								selection = '#' + selection;
								self.selection_back = selection;
							} else {
								selection = '#id-cart-form';
							}
							console.log(selection);
							self.hidden_block(selection);
							// console.log("essaie de watch",
							// self.default_type2);
							// self.default_type = self.default_type + 1;
						}
					}
				});
				/**
				 *
				 */
				if (window.location.search == '?selection=date') {
					$('button[name="checkout"]').trigger('click');
				}
			},
			apply_checkout: function() {
				$('button[name="checkout"]').trigger('click');
				this.valid_creneau = false;
			},
			procced_checkout: async function() {
				var self = this;
				if (!this.valid_creneau) {
					return false;
				}
				console.log(' Go payement ');
				// this.get_localisation();
				/**
				 * On verifie le contenu des champs.
				 */
				if (this.data_tosave_livraison && this.data_tosave_recuperation) {
					this.valid_creneau = true;
					var selection = '.map-localisation-wbu';
					self.add_cover_wait(selection);
					var datas = {
						attributes: {
							livraison: this.data_tosave_livraison,
							recuperation: this.data_tosave_recuperation
						}
					};
					var wbu_localisation_map = Cookies.get('wbu_localisation_map');
					if (wbu_localisation_map) {
						datas.attributes['localisation'] = wbu_localisation_map;
						self.valid_localisation = true;
					}
					/**
					 * open map
					 */
					if (!self.valid_localisation) {
						self.open_map();
					}
					this.url = '/cart/update';
					var saveAttribute = awaitthis.save_attribute_cart(datas);
					// console.log('Procced_checkout saveAttribute : ',
					// saveAttribute, ' localisation : ',
					// self.valid_localisation);
					if (self.valid_localisation && saveAttribute) {
						await this.apply_checkout();
					}
				}
			},
			analyseCart: function() {
				var self = this;
				var check_type_livraison = false;
				/**
				 * on recherche si une variante de "type de livraison" existe
				 * deja
				 */
				if (self.cart && self.cart.items) {

					/**
					 * recupere les données(livraison/recuperation) du panier.
					 */
					var getAttributes = function() {
						return new Promise(resolve => {
							// console.log('getAttributes debut');
							var texte = [];
							if (self.cart.attributes && self.cart.attributes.livraison &&
								self.cart.attributes.recuperation) {
								var livraison = self.cart.attributes.livraison.split('\r\n');
								var recuperation = self.cart.attributes.recuperation.split(
									'\r\n');
								$.each(recuperation, function(i, val) {
									texte = val.split(' : ');
									if (texte[0] && (texte[0].indexOf('Date') !== -1) && texte[1]) {
										// console.log(texte[1]);
										var date = texte[1].split('/');
										self.date_recuperation = date[2] + '-' + date[1] + '-' +
											date[0];
									}
									if (texte[0] && (texte[0].indexOf('Heure') !== -1) && texte[
											1]) {
										// console.log(texte[1]);
										self.default_creneau_recuperation = texte[1];
									}
								});
								$.each(livraison, function(i, val) {
									texte = val.split(' : ');
									if (texte[0] && (texte[0].indexOf('Date') !== -1) && texte[1]) {
										// console.log(texte[1]);
										var date = texte[1].split('/');
										self.date_livraison = date[2] + '-' + date[1] + '-' + date[
											0];
										self.date_from_recuperation = self.date_recuperation;
									}
									if (texte[0] && (texte[0].indexOf('Heure') !== -1) && texte[
											1]) {
										// console.log(texte[1]);
										self.default_creneau_livraison = texte[1];
									}
								});
								// console.log('Date recuperation from cart : ',
								// self.date_recuperation, '\n\n Creneau from
								// cart : ', self.default_creneau_recuperation);
								// console.log('livraison :', livraison);
								/**
								 * Reconstruction des modules de selection. (on
								 * reconstruit une seule fois)
								 */
								// self.re_construction_module++;
								/**
								 * La validation est fait par le retour. ou pas
								 */
								// self.valid_creneau = true;
								resolve('getAttributes');
							} else {
								resolve('getAttributes');
							}
						});
					};
					/**
					 * check adress
					 */
					function checkAdress() {
						if (self.cart.attributes && self.cart.attributes.localisation &&
							self.cart.attributes.localisation != '') {
							self.valid_localisation = true;
						}
					}
					/**
					 * type de livraison
					 */
					var CheckTypeLivraison = function() {
						return new Promise(resolve => {
							// console.log('CheckTypeLivraison debut');
							$.each(self.cart.items, function(i, product) {
								if (self.variants[product.id]) {
									check_type_livraison = true;
									self.variant_in_cart = product.id;
									// console.log('Variante dans le panier : ',
									// self.variant_in_cart);
									/**
									 * on applique le type de variation defini
									 * dans le panier.
									 */
									$.each(blocks_type_livraisons, function(k, variant) {
										// console.log(variant, product);
										if (product.id == variant.id) {
											self.default_type = variant.type;
											// console.log('variante
											// selectionner à partir du panier
											// ',self.default_type, variant);
											self.datas = variant;
											/**
											 * reconstruction des modules de
											 * selection. (on reconstruit une
											 * seule fois)
											 */
											self.delai_traitement_en_jour = variant.delai;
											self.plage_mn = variant.creneau;
											// self.re_construction_module++;
											/**
											 *
											 */
											resolve('CheckTypeLivraison');
											return true;
										}
									});
									return false;
								}
							});
							resolve('CheckTypeLivraison');
							return false;
						});
					};

					/**
					 * si aucun type de selestion n'est definit alors on ajoute,
					 * celui de la valeur par defaut.
					 */
					function addDefultTypeLivraison() {
						if (!check_type_livraison) {
							// console.log('aucun type de Livraison dans la
							// panier');
							$.each(self.variants, function(id, variant) {
								if (variant.type == self.default_type_static) {
									self.addProduct(id);
									self.default_type = self.default_type_static;
								}
							});
						}
					}

					var execution = async function() {
						// console.log('==Début analyse des données dans le
						// panier == \n\n');
						var etape1 = awaitCheckTypeLivraison();
						// console.log('fin de etape : ', etape1, ' \n\n ');
						// var etape2 = await getAttributes();
						// console.log('fin de etape : ', etape2, ' \n\n ');
						/**
						 * Si le type de livraison existe on reconstruit les
						 * modules.
						 */
						if (check_type_livraison) {
							// self.re_construction_module++;
						}
						var etape3 = awaitaddDefultTypeLivraison();
						// console.log('fin de etape : ', etape3, ' \n\n ');
						// var etape4 = await checkAdress();
						// console.log('fin de etape : ', etape4, ' \n\n ');
					};
					execution();
				}
			},
			open_map: function() {
				var self = this;
				$('#trigger-simple-map2' + self.model_ref).trigger('click');
			},
			updateTypeLivraison: function(datas) {
				var self = this;
				var new_type_livraison_variant = null;
				$.each(self.variants, function(i, variant) {
					if (variant.type == datas.type) {
						new_type_livraison_variant = variant.id;
					}
				});
				if (new_type_livraison_variant) {
					if (self.variant_in_cart) {
						self.deleteProduct(self.variant_in_cart, new_type_livraison_variant);
					} else {
						self.addProduct(new_type_livraison_variant);
					}
				} else {
					alert('Variante non definit');
				}
			},
			addProduct: function(id_product, qte = 1) {
				var self = this;
				jQuery.post('/cart/add', {
						id: id_product,
						quantity: qte
					})
					.done(function(data) {
						/**
						 * return html
						 */
						console.log(' Product add : ', id_product);
						self.variant_in_cart = id_product;
						var selection = '.map-localisation-wbu';
						self.remove_cover_wait(selection);
					}).fail(function() {
						if (window.location.host != 'modulejs.kksa') {
							alert('Votre panier est vide');
						}
						setTimeout(function() {
							var selection = '.map-localisation-wbu';
							self.remove_cover_wait(selection);
						}, 1000);
					});
			},
			save_attribute_cart: function(datas, apply_callback = true) {
				var self = this;
				return new Promise(resolve => {
					self.ajax_watch_attribute = 1;
					jQuery.post(self.url, datas)
						.done(function(data) {
							/**
							 * return html
							 */
							console.log(' MAJ des attributs : ', datas);
							var selection = '.map-localisation-wbu';
							self.remove_cover_wait(selection);
							if (apply_callback) {
								self.ajax_watch_attribute = 2;
							}
							resolve(true);
						}).fail(function() {
							// alert( "error" );
							self.ajax_watch_attribute = 3;
							resolve(false);
						});
				});
			},
			/**
			 * supprime un produit /ou supprime et ajoute un autre.( modifier la
			 * variante)
			 */
			deleteProduct: function(id_product, new_product = null) {
				var self = this;
				var product = {
					updates: {}
				};
				product.updates[id_product] = 0;
				jQuery.post('/cart/update', product)
					.done(function(data) {
						/**
						 * return html
						 */
						console.log(' Product remove : ', id_product);
						if (new_product) {
							self.addProduct(new_product);
						} else {
							var selection = '.map-localisation-wbu';
							self.remove_cover_wait(selection);
						}
					}).fail(function() {
						if (window.location.host != 'modulejs.kksa') {
							alert('Votre panier est vide');
						}
						setTimeout(function() {
							var selection = '.map-localisation-wbu';
							self.remove_cover_wait(selection);
						}, 1000);
					});
			},
			back_to_cart: function() {
				var self = this;
				var selection = '.map-localisation-wbu';
				self.hidden_block(selection, 'back');
			},
			get_localisation: function() {
				var wbu_localisation_map = Cookies.get('wbu_localisation_map');
				if (wbu_localisation_map) {
					var datas = {
						attributes: {
							localisation: wbu_localisation_map,
						}
					};
					this.url = '/cart/update';
					this.save_attribute_cart(datas, false);
					this.check_adress_validate = true;
				} else {
					this.check_adress_validate = false;
				}
				return true;
			},
			hidden_block: function(selection, action = 'continue') {
				var self = this;
				$(selection).addClass('wbu-block-opacity');
				if (action == 'continue') {
					$(selection).animate({
						opacity: 0.5
					}, 1000, 'linear', function() {
						self.show_selection = true;
						$('.map-localisation-wbu.container .element-visible').css(
							'display', 'block');
						$(selection).fadeOut(100, function() {
							$('.map-localisation-wbu.container .element-visible').css(
								'display', 'block');
							$(selection).removeClass('wbu-block-opacity');
						});
					});
				} else {
					$(selection).animate({
						opacity: 0.5
					}, 1000, 'linear', function() {
						self.show_selection = false;
						$(self.selection_back).fadeIn(100, function() {
							$(self.selection_back).css({
								opacity: 1
							});
							$(selection).css({
								opacity: 1
							});
						});
					});
				}
			},
			add_cover_wait: function(selection) {
				$(selection).addClass('wbu-block-opacity');
			},
			remove_cover_wait: function(selection) {
				$(selection).removeClass('wbu-block-opacity');
			},
			get_date_for_old_browser: function(date = null) {
				if (!date) {
					return moment();
				}
				var date_show = moment(date);
				if (date_show.isValid()) {
					return date_show;
				} else {
					date_show = date.split('-');
					if (date_show[2]) {
						date_show[1] = date_show[1].toString().padStart(2, '0');
						date_show[2] = date_show[2].toString().padStart(2, '0');
						return moment(date_show[0] + '-' + date_show[1] + '-' + date_show[2]);
					}
				}
				return moment(date);
			},
		}

	});
});
