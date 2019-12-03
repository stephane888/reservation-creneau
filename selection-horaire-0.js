	jQuery(document).ready(function($) {
		const blocks_type_livraisons = [
			{
				titre:'GRATUIT',
				body:[
					"Créneau horaire de 120 min",
					"Délai de traitement de 72 heures",
					"Minimum de commande : 15,00€",
				],
				montant:0,
				type:'free',
				creneau:120,
				delai:3,
				id:31058498125884,
				active:false,
			},
			{
				titre:'PLUS',
				body:[
					"Créneau horaire de 60 min",
					"Délai de traitement de 48 heures",
					"Minimum de commande : 15,00€",
				],
				montant:9.99,
				type:'plus',
				creneau:60,
				delai:2,
				id:31058498158652,
				active:false,
			},
			{
				titre:'EXPRESS',
				body:[
					"Créneau horaire de 30 min",
					"Délai de traitement de 24 heures",
					"Minimum de commande : 15,00€",
				],
				montant:19.99,
				type:'express',
				creneau:30,
				delai:1,
				id:31058498191420,
				active:false,
			}
		];
		
		
		Vue.component('type_livraison',{
			delimiters: ['${', '}'],
			template: '#template-types-de-livraison', 
			props: {
				datas:[Object, Array,String, Number],
				id_html:{type:String, default: '',},
				default_type : {type:[String,Number], default: 0},
			},
			data : function () {
				return {
					titre:'Types de livraison',
					types_livraison:[],
					show_adresse:false,
					adresse_name:'',
				}
			},
			mounted: function(){
				//console.log('contenu dans default_type, ', this.default_type);
				this.buildTypes(); 
				this.adresse_name = Cookies.get('wbu_localisation_map');
				if(this.adresse_name){this.show_adresse=true;}
			},
			watch: {
				default_type: function() {
					console.log('MAJ de default_type : ', this.default_type)
					this.buildTypes();
				},
			},
			methods: {
				select_type_tab: function(event, index){
					var self=this;
					$('.map-localisation-wbu .type-livraison li').removeClass('active');
					if(event.target.localName=='li'){
						$(event.target).addClass('active');
					}
					else if(event.target.localName=='small'){
						$(event.target).parent().parent().addClass('active');
					}
					else{
						$(event.target).parent().addClass('active');
					}
					if(this.types_livraison[index]){
						this.$emit('ev_change_type_livraison', this.types_livraison[index]);
					}else{
						console.log('error');
					}    		 
				},
				display_prise: function(price){
					if(price==0){
						return '+0€';//'FREE';
					}else {
						return '+'+price+'€';
					}
				},
				buildTypes: function(){
					var self=this;
					var types_livraison = blocks_type_livraisons;
					$.each(types_livraison, function(i, type){
						//console.log('Valeur seletionné pour type de livraison : ', self.default_type);
						if(type.type == self.default_type){
							types_livraison[i]['active']=true;
						}
					});
					//console.log('types_livraison', types_livraison);
					this.types_livraison = types_livraison;
				},
			},    
		});
		
		Vue.component('selection_horaire',{ 
			delimiters: ['${', '}'],
			template: '#templatehoraireselection', 
			props: {
				datas:[Object, Array],
				id_html:{type:String, default: '',},
				reload:{type:Number, default: 0,},
				reload_syn_date:{type:Number, default: 0,},
				date_recuperation:[Object, Array],
				type:{type:String, default: '',},
				default_select_hour:{type:[String,Number], default: null},
				default_select_date:{type:[String,Number], default: null},
				delai_traitement_en_jour:{type:[Number], default: 3},
				titre:{type:[String], default: 'Sélectionner les horaires de récupération'},
				custom_value:{type:[Number,Boolean], default: false},
				plage_mn:{type:[Number], default: 120},
				number_car:{type:[Number], default: 1},
			},
			data : function () {
				return {
					//titre:'Sélectionner les horaires de récupération',
					current_date: null,
					number_day: 2,
					dates_tabs: [],
					horaires: [],
					months: [],
					show_date:false,
					date_to_day:null,
					current_month:null,
					current_year:null,
					current_day:null,
					//plage_mn:120,
					periode_day_valide:21,
					date_select:{},
					//delai_traitement_en_jour:3,
					diff_day:0,
					show_texte:false,
					plage_heure:true,
					/**
					 * Ecouteurs de functions.
					 */
					// Detecte l'affichage de la plage d'heure.
					plage_heure_is_running:0,
					/**
					 * 
					 */
					number_car:1,
                    selection_metafields:window.selection_plage_heure,
                    date_debut_default:0,
                    /**
                     * Stocke les heures non utilisés.
                     */
                    remove_hours:{},
				}
			},
			watch: {
				reload: function() {
					console.log('Reload : ', this.reload, ' datas : ', this.datas, 'plage_mn : ', this.plage_mn, 'delai_traitement_en_jour : ', this.delai_traitement_en_jour);
					this.select_type_livraison();
				},
				reload_syn_date: function() {
					var self=this;
                    console.log( 'Synchro date : ', this.date_recuperation );
                    
					var current_date = this.date_recuperation.year+'-'+(parseInt(this.date_recuperation.month) +1)+'-'+this.date_recuperation.date;
					console.log(current_date);
					var delai = this.delai_traitement_en_jour ;
					var current_date2 = this.addDays( current_date, delai );
					this.dates_tabs = [];
					this.months=[];
					console.log( current_date2 );
					
					this.diff_day = this.get_diff_day(this.current_year+'-'+(this.current_month + 1)+'-'+this.date_to_day, current_date2);
					//console.log('diff_day : ', this.diff_day);
					
					this.buildCalendarMounth();
					this.show_date = false;
					this.build_dates_tabs( current_date2 );
					console.log('Day index : ',current_date2.getDay());
					self.horaires=[];
					this.buildPlageHeure(current_date2.getDay());
					$('#'+this.id_html+' .tabs li').removeClass('active');
					$('#'+this.id_html+' .tabs li:first-child').addClass('active');
					if( this.diff_day  >= ( this.periode_day_valide - delai ) ){      		
						this.plage_heure = false;
						this.show_texte = true;
					}else{
						this.plage_heure = true;
						this.show_texte = false;
					}
				},
				/*
				* selection par defaut.       
				plage_heure_is_running: function(){
					if(!this.custom_value){return false;}
					var self = this;
					console.log(' Plage heure affiché ou traité : ', this.plage_heure_is_running, 'type de block : ', this.type);
					//on selectionne la premiere page du tableau.
					console.log(this.horaires);
					setTimeout(function(){ 
						self.select_plage_heure(0);
					},200);
				},      
				/* */
			},
			mounted: function(){
				if(this.selection_metafields){
                    this.selection_metafields = JSON.parse(this.selection_metafields);
                    this.selection_metafields = this.selection_metafields.selection_plage_heure
                }
				if(window.wbu_date_now){
                    console.log('Date by shopify server');
                    this.current_date = new Date( window.wbu_date_now );
                }else{
                    this.current_date = new Date();
                }				
				if(this.current_date){
					this.date_to_day = this.current_date.getDate();
					this.current_month = parseInt(this.current_date.getMonth());
					this.current_year = this.current_date.getFullYear();
					this.current_day = this.current_date.getDay();
				}
				this.trigger_current_date();
				//this.build_dates_tabs();
				//this.buildPlageHeure(this.next_day(this.current_day));
				this.buildCalendarMounth();    
				this.appli_default_day();
			},
			methods: { 
				get_diff_day: function(date1, date2){
					var date1 = new Date(date1);
					var date2 = new Date(date2);
					var diffTime = Math.abs(date2 - date1);
					var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
					return parseInt(diffDays);
				},
				appli_default_day: function(){
					if(this.default_select_date && this.default_select_date !=''){
                        //console.log('Appli_default_day : use custom date');
						var date = new Date( this.default_select_date );
						var day = {
								date: date.getDate(),
								month: date.getMonth(),
								year: date.getFullYear(),
								day: date.getDay(),
						};
						this.select_date_day(day);
					}
					else{    
                        console.log('Appli_default_day : use default date', ' type : ',this.type, this.current_date );	
						if(this.type =='livraison'){
                            var date = this.addDays(this.current_date, this.delai_traitement_en_jour);
                            var day = {
                                    date: date.getDate(),
                                    month: date.getMonth(),
                                    year: date.getFullYear(),
                                    day: date.getDay(),
                            };
                        }else{
                            var date = this.addDays(this.current_date, this.date_debut_default);
                            var day = {
                                    date: date.getDate(),
                                    month: date.getMonth(),
                                    year: date.getFullYear(),
                                    day: date.getDay(),
                            };                            
                        }	
                        console.log('current day to apply : ',day, date);		
                        this.select_date_day(day);				
					}
                },
                display_errors_plage_heure: function(horaires){
                    if(horaires.length == 0 && !this.show_date){
                        return 'Aucune plage disponible pour cette journée'
                    }
                    return false;
                },
				trigger_current_date: function(){
					var date = this.addDays(this.current_date, this.date_debut_default);
					this.date_select={
							'date':date.getDate(),
							'month': date.getMonth(),
							'year': date.getFullYear()
						};
				},
				next_day: function(day_index){
					var day = day_index + this.date_debut_default;
					if(day_index == 7){day = 0;}
					return day;
				},
				select_type_livraison: function(){
					this.plage_mn = this.datas.creneau; console.log(this.datas);
					this.horaires=[];
					this.dates_tabs = [];
					this.show_date = false;
					//console.log('Day index : ',this.current_day);
					this.build_dates_tabs();
					this.buildPlageHeure(this.next_day(this.current_day));  
					this.trigger_current_date();
					this.delai_traitement_en_jour = parseInt(this.datas.delai);
				},
				build_dates_tabs: function(date=null){
					var self = this;
					var current_date = new Date(this.current_date);
					if(date){
						current_date = new Date(date);
						dafaul = 0;
					}
					for(var i=0; i < self.number_day; i++){
						var date = self.addDays(current_date, ( i + this.date_debut_default) ); 
						var day = date.getDay(); //console.log(day);
						var date_n = date.getDate(); //console.log(date_n + 1, self.date_to_day);
						if( date_n == (self.date_to_day + 1)){
							day = 'Demain';
                        }else if( date_n == (self.date_to_day )){
                            day = "Aujourd'hui";
                        }
                        else{
							//console.log('indice de la date : ', day);
							day = self.getDayFrench( day )
						}
						if(date_n == 1){
							date_n = '1er';
						}
						var tab = {
								'jour': day,
								'mois': date_n +' '+self.getMonthFrench( date.getMonth() ),
								'index':date.getDay(),
								'date':date.getDate(),
								'month':date.getMonth(),
								'year':date.getFullYear(),	
							};
						self.dates_tabs.push(tab);
						
						if(i==0){
							this.date_select = tab;
						}    			
					}
					self.dates_tabs.push({
						'jour': 'Plus de dates',
						'mois': 'afficher le calendrier',
						'index':'all',
					});
				},
				select_date_tab: function(event, index, tab){
					var self=this;
					self.horaires=[];    		
					$('#'+self.id_html+' .tabs li').removeClass('active');
					if(event.target.localName=='li'){
						$(event.target).addClass('active');
					}else{
						$(event.target).parent().addClass('active');
					}
					if(index=='all'){
						this.show_date = true;    			
					}else{   
						this.date_select = tab;
						this.show_date = false;
						this.buildPlageHeure(index);
					}    		
				},
				buildPlageHeure:function(index){
                    //console.log('buildPlageHeure index : ', index);
					var self=this;
					//console.log(' index du jour ', index);
					var plage = this.plage_heure_parjour(index, self.type);
					
					async function construct(plage){
						//console.log(' Execution de construct ', plage, self.type);
						/*
						if(plage.matinee){
							self.buildHoraire(parseInt(plage.matinee.ht_debut), parseInt(plage.matinee.ht_fin));
							setTimeout(function(){
								if(plage.soir){
									self.buildHoraire(parseInt(plage.soir.ht_debut), parseInt(plage.soir.ht_fin));
								}
							}, 150);
						}else{
							if(plage.soir){
								self.buildHoraire(parseInt(plage.soir.ht_debut), parseInt(plage.soir.ht_fin));
							}
						}
						*/
						if(plage.matinee){
							await plageMatine(plage);
						}
						if(plage.soir){
							await plageSoir(plage);
						}
						return self.horaires;
					}
					construct(plage).then(function(f__horaires){
						//console.log(' Execution de selectCurrentValue ', self.type);
						//console.log(f__horaires);
						setTimeout(async function(){
							selectCurrentValue();  
						},250);
					});
					
					/**
					 * apres la conscruction du tableau, on applique la selection encours.
					 */
					function selectCurrentValue(){
						//console.log('Plage heure par defaut ', self.default_select_hour, self.type);
						if(self.default_select_hour){
							var horaires = [];
							if( self.default_select_hour == 'first' ){
								$.each(self.horaires, function(i, val){
									if(i==0){    					
										val.active=true;    	
										self.$emit( 'ev_selection_tosave', {type:self.type, date:self.date_select, heure:val} ); 
									}
									horaires.push(val);
								});
							}else{
								var hr = self.default_select_hour.split(' - ');        			      			
								$.each(self.horaires, function(i, val){
									//console.log('Comaraison plage heure : ', val, hr);
									if(val.h1 == hr[0] && val.h2 == hr[1]){    					
										val.active=true;    					
									}
									horaires.push(val);
								});
							}      			
							/**/
							self.horaires = horaires;      			
							/**
							 * On demande au parent, d'effaccer sa date par defaut.
							 * @param plage
							 * @returns
							 */
							self.$emit( 'ev_delete_defaut_plage_horaire', {type:self.type} );
							//self.default_select_hour=null;
						}
					}
					
					function plageSoir(plage){
						if(!plage.soir){return false;}
						setTimeout(async function(){
							self.buildHoraire(plage.soir);
						},600);
					}
					
					function plageMatine(plage){
						if(!plage.matinee){return false;}
						self.buildHoraire(plage.matinee);
					}
				},
				addDays: function(date, days){
                    var result = new Date(date);
                    if( days == 0 ){ return result; }
					result.setDate(result.getDate() + days);
					return result;
				},
				getDayFrench: function(index){
					var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
					if(days[index]){
						return days[index];
					}
					return days[0];
				},
				getMonthFrench: function(index, type='all'){					
					var Months = ['Janvier', 'février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juiellet', 'Aout', 'Septembre','Octobre', 'Novembre', 'Decembre'];
					if(type=='small'){
						Months = ['jan.', 'fév.', 'Mar.', 'Avr.', 'Mai.', 'Jui.', 'Jui.', 'Aout.', 'Sep.', 'Oct.','Nov.', 'Dec.'];
					}
					if(Months[index]){
						return Months[index];
					}
					return Months[0];
				},
				buildHoraire: function( plage ){
                    //ht_debut=7, ht_fin=22
					console.log(plage);
					if( !plage.ht_debut || !plage.ht_fin ){
						//alert('Plage non definit');
						return false;
					}
					var ht_debut = parseInt( plage.ht_debut );
					var ht_fin = parseInt( plage.ht_fin );
					var mn_debut = parseInt( plage.mn_debut );
					var mn_fin = parseInt( plage.mn_fin );
					
					//console.log(ht_debut, ht_fin, plage_mn);
					var current_date = new Date(this.current_date);  		
					current_date.setMinutes(0);
					var self = this;
					var cc_debut = cc_fin = heure = date = null;  
					var semi=false;
					var plage_mn = parseInt(this.plage_mn); //creneau
					var remove_first = true;
					/**
					 *  javacript fonctionne comme suit avec les dates :
					 * 	- si on definit l'heure à 7h, puis on definie les minutes à 30
					 *  on otient : 7h:30
					 *  - Si ensuite on definit les minutes à 15
					 * 	on otient : 7h:15.
					 */
					
					function promisecustom ( etape=0, h){

						return new Promise( (resolve, reject) => {
							//console.log('promisecustom : ', etape, h, ' semi : ', semi, 'type : ', self.type, ' Creneau : ',plage_mn, 'mn_debut : ',mn_debut);
							var ct_bl = {}, c_hr = c_mn = null;
							
							var crt_debut = h + etape;
							//var crt_fin =  plage_mn;
                            var semi_time = 30;
                            var remove_hour=false;
							
							// plage 1        			
								current_date.setHours( crt_debut );//console.log(crt_debut);	
								if(semi){
									current_date.setMinutes( mn_debut + semi_time);
								}else{
									current_date.setMinutes( mn_debut );
								}							
								c_hr = current_date.getHours();	
                                c_mn = current_date.getMinutes();
                                /**
                                 * On verifie si l'heure doit etre rejecter
                                 */
                                if(self.remove_hours && self.remove_hours[c_hr] && self.remove_hours[c_hr]['mn'] == c_mn){
                                    //console.log('Heure resersée : ', c_hr);
                                    remove_hour=true;
                                }
								if(c_hr<10){
									c_hr = '0'+c_hr;
								}
								if(c_mn<10){
									c_mn = '0'+c_mn;
								}
								ct_bl.h1 = c_hr+':'+c_mn;
											
								/**
								 * Construction de la seconde plage.
								 */
								//
								current_date.setHours( crt_debut );
								if(semi){
									//console.log(' SEMI actif sum time mn : ', plage_mn, semi_time);
									//console.log(current_date.getHours(),':',current_date.getMinutes());
									current_date.setMinutes( plage_mn + semi_time + mn_debut);
									//console.log(current_date.getHours(),':',current_date.getMinutes());
								}else{
									//console.log(' SEMI OFF sum time mn : ', plage_mn);
									//console.log(current_date.getHours(),':',current_date.getMinutes());
									current_date.setMinutes( plage_mn + mn_debut );
									//console.log(current_date.getHours(),':',current_date.getMinutes());
								}        			
								c_hr = current_date.getHours();
								c_mn = current_date.getMinutes();
								if(c_hr<10){
									c_hr = '0'+c_hr;
								}
								if(c_mn<10){
									c_mn = '0'+c_mn;
								}
								
								/**
								 * 
								 */
								//console.log( parseInt(c_hr) , parseInt(c_mn) , parseInt(ht_fin), parseInt(mn_fin) );
								if(c_hr > ht_fin){
									//console.log('c_hr > ht_fin');
									//reject({etape:etape});
								}
								else if(parseInt(c_mn) == parseInt(mn_fin) && parseInt(c_hr) == parseInt(ht_fin)){
									//console.log('c_hr == ht_fin');
									ct_bl.h2 = c_hr+':'+c_mn;
									self.horaires.push( ct_bl );
									reject({etape:etape});
									
								}
								else if(c_hr == ht_fin && semi){
									//console.log('c_hr == ht_fin && semi');
									reject({etape:etape});
								}
								else{
									ct_bl.h2 = c_hr+':'+c_mn;
									/**
									 * On ignore le  premier element si le type de livraison est express.
									 */

									/*
									if( remove_first && self.datas && self.datas.type == 'express' ){
										remove_first=false;
									}else{
										self.horaires.push(ct_bl);
									}        
									*/  
									/**
                                     * on enleve les heures reservées deja reservé:
                                     */
                                    if(remove_hour){                                        
                                        //on n'ajoute pas l'heure.
                                    }else{
                                        self.horaires.push( ct_bl );
                                    }
									
									if(!semi){
										semi=true;
									}else{
										semi=false;
									}
									resolve({etape:etape, semi:semi});
                                }
                                 
						} );
					}
					
					function successCallback(value){
							//console.log('succes : ', value);
							if((value.etape + ht_debut ) < (ht_fin +1)) {
								if(value.semi){
									if((value.etape + ht_debut + 1) < (ht_fin +1)){
										promisecustom(value.etape, ht_debut).then(successCallback, failureCallback);
									}    			  		
								}else{
									promisecustom(value.etape + 1, ht_debut).then(successCallback, failureCallback);
								}    			  	
							}else{
								fin_construction();
							}
						}

						function failureCallback(error){
							//console.log('error : ', error);
							if((error.etape + ht_debut ) < ht_fin){
								fin_construction();  			  	
								//promisecustom(error.etape + 1, ht_debut, plage_mn).then(successCallback, failureCallback);
							}else{
								fin_construction();
							}
						}
						
						/**
						 * 
						 */
						function fin_construction (){
							/**
							 * L'execution de cette fonction traduit l'affichage de la plage d'heure
							 */
							//console.log('fin de la construction du tableau horaires :', self.type);
							//self.plage_heure_is_running= self.plage_heure_is_running + 1;
							
							if(self.type == 'livraison'){
								if(self.plage_heure_is_running <=2){
									//console.log(' (livraison) ')
									self.plage_heure_is_running= self.plage_heure_is_running + 1;
								}    			  		
							}else{
								self.plage_heure_is_running=1;
							}
						}
						
						const promise = promisecustom(0, ht_debut, plage_mn);
						promise.then(successCallback, failureCallback);
						//return true;
				},
				addTimestamp: function(h, mn){
					var current_date = new Date(this.current_date);
					current_date.setHours(h);
					current_date.setHours(mn);
					return { hour:current_date.getHours(), mn:current_date.getMinutes() }
				},
				select_plage_heure: function(index){
					//$('#'+this.id_html+' .list-dates .plage-heure').removeClass('active');
					//$(even.target).addClass('active');
					//console.log('selection de la plage heure', index);
					var self=this;
                    var horaires = [];
                    var creneau_selectionne = {};
					index = parseInt(index);
					$.each(self.horaires, function(i, hour){
						if(i == index){
                            hour['active']=true;
                            creneau_selectionne = hour;
							horaires.push(hour);
							self.$emit( 'ev_selection_tosave', {type:self.type, date:self.date_select, heure:hour} ); 
						}else{
							hour['active']=false;
							horaires.push(hour);
						}
					});
					self.horaires = horaires;
					//console.log(horaires);
					if(this.type == 'recuperation'){
                        this.date_select['creneaux'] = creneau_selectionne;
						this.$emit('ev_date_recuperation', this.date_select);  
					}  			  		
				},
				plage_heure_parjour: function(index, type='recuperation'){
                    var self = this;
                    self.remove_hours = {};
					var plages = [
						{},
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:21, mn_fin:30 }, soir:{}},
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:21, mn_fin:30 }, soir:{}},
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:21, mn_fin:30 }, soir:{}},
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:21, mn_fin:30 }, soir:{}},
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:21, mn_fin:30 }, soir:{}},
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:21, mn_fin:30 }}    			
					];
					
					
					if( plages[index] && ( type == 'recuperation' || type == 'livraison' ) ){    			
						plage_valide = plages[index];
					}else{
						plage_valide = plages[0];
					}		
                    
					if(
                        (this.date_select.year == this.current_year) &&
                        (this.date_select.month == this.current_month) &&
                        (this.date_select.date == this.date_to_day)
                    ){
                        var heure_now = this.current_date.getHours();
                        heure_now = parseInt(heure_now) + 4;
                        if(plage_valide.matinee && heure_now >= parseInt(plage_valide.matinee.ht_fin)){
                            //console.log('plage matinée delete ', heure_now);
                            delete plage_valide.matinee;
                        }else if(plage_valide.matinee ) {
                            //console.log('plage matinée update ', heure_now);
                            plage_valide.matinee.ht_debut = heure_now;
                        }

                        if(plage_valide.soir && heure_now >= parseInt(plage_valide.soir.ht_fin)){
                            //console.log('plage Soirée delete ');
                            delete plage_valide.matinee;
                        }else if( plage_valide.soir && heure_now < parseInt(plage_valide.soir.ht_fin) && heure_now > parseInt(plage_valide.soir.ht_debut)){
                            plage_valide.soir.ht_debut = heure_now;
                        }
                    }

                    /**
					 * Si la date encours de selection est egale à celle dans le metafield, 
					 * on enleve la plage.
                     * 
                     * Pour y parvenir on met dans une variable les heures à supprimer.
					 */    		
					var current_date_select = this.date_select;					
					//console.log('self.selection_metafields', self.selection_metafields);					
                    if( self.selection_metafields && self.selection_metafields.livraison && self.type == 'livraison'){
                        $.each( self.selection_metafields.livraison, function(i, k){
                            if(!k.mn_debut){
                                k.mn_debut = 0;
                            }
                            if(current_date_select && (k.date == current_date_select.date+'/'+(parseInt(current_date_select.month)+1)+'/'+current_date_select.year)){
                                if(plage_valide.matinee && (parseInt(k.ht_debut) < parseInt(plage_valide.matinee.ht_fin)) ){
                                    //plage_valide.matinee.ht_debut = k.ht_debut;
                                    //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
                                    self.remove_hours[k.ht_debut] = {hr:k.ht_debut, mn:k.mn_debut};
                                } 
                                else if(plage_valide.soir){
                                    //plage_valide.matinee.ht_debut = k.ht_debut;
                                    //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
                                    self.remove_hours[k.ht_debut] = {hr:k.ht_debut, mn:k.mn_debut};
                                }
                            }
                        });
                    }
                    if( self.selection_metafields && self.selection_metafields.recuperation && self.type == 'recuperation'){
                        $.each( self.selection_metafields.recuperation, function(i, k){
                            if(!k.mn_debut){
                                k.mn_debut = 0;
                            }
                            if(current_date_select && (k.date == current_date_select.date+'/'+(parseInt(current_date_select.month)+1)+'/'+current_date_select.year)){
                                if(plage_valide.matinee && (parseInt(k.ht_debut) < parseInt(plage_valide.matinee.ht_fin)) ){
                                   // plage_valide.matinee.ht_debut = k.ht_debut;
                                    //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
                                    self.remove_hours[k.ht_debut] = {hr:k.ht_debut, mn:k.mn_debut};
                                } 
                                else if(plage_valide.soir){
                                    //plage_valide.matinee.ht_debut = k.ht_debut;
                                    //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
                                    self.remove_hours[k.ht_debut] = {hr:k.ht_debut, mn:k.mn_debut};
                                }
                            }
                        });
                    }
                    /**
                     * on verifie la plage lors de la livraiosn
                     */
                    if(self.type == 'livraison' && this.date_recuperation && this.date_recuperation.creneaux && this.date_recuperation.creneaux.active){
                        console.log(' Livraison MAJ Plage debut ');
                        if(plage_valide.matinee ){
                            if(this.date_recuperation.creneaux.h2){
                                //plage_valide.matinee.ht_debut = this.date_recuperation.creneaux.h2;
                                //console.log('Jour de la recuperation ', this.date_recuperation);
                                //console.log('Jour de la livraison ', this.date_select);
                                //console.log('delai_traitement_en_jour ', this.delai_traitement_en_jour);
                                var jour_recuperation = new Date( this.date_recuperation.year+'-'+( parseInt( this.date_recuperation.month) + 1 )+'-'+this.date_recuperation.date );
                                var jour_livraison = new Date( this.date_select.year+'-'+( parseInt( this.date_select.month) + 1 )+'-'+this.date_select.date );
                                var diffTime = Math.abs( jour_livraison - jour_recuperation );
                                var diffDays = Math.ceil( diffTime / (1000 * 60 * 60 * 24) );
                                //console.log('Difference de jour ', diffDays);
                                if( this.delai_traitement_en_jour == diffDays ){
                                    var hrs = (this.date_recuperation.creneaux.h1).split(':');
                                    plage_valide.matinee.ht_debut = parseInt( hrs[0] ) + 1;
                                    plage_valide.matinee.mn_debut = parseInt( hrs[1] );
                                }
                            }
                        }                        
                    }
					//console.log('plage heure : ', plage_valide);
					return plage_valide;
				},
				buildCalendarMounth: function(){
					var self=this;
					var current_date = new Date( this.current_date );
					var day_index = current_date.getDay();
					var day_unavailable=null;
					if(day_index == 0){ day_unavailable = 7;}
					else{
						day_unavailable = day_index;
					}
					
					this.CalendarMounth(-day_unavailable, false);
					setTimeout(function(){
						self.CalendarMounth(31 - day_unavailable, true);
						//console.log('current date day 2',self.current_date.getDate())
					},100);
				},
				CalendarMounth: function(days=-25, status=true){
					var self = this;
					var date = new Date( this.current_date );
					//console.log('Current date day ',date.getDate(), 'type ', self.type);
                    var  i=1; 
                    
					if(days<0){
						i=-1;
						while (i >= days) {
							//console.log('negatif : ', i);
							self.months.push({
								status:status,
								date_french:date.getDate().toString().padStart(2, '0'),
								date:date.getDate(),
								day:date.getDay(),
								month:date.getMonth(),//date.getMonth().toString().padStart(2, '0'),
								month_french:self.getMonthFrench(date.getMonth(), 'small'),
								year:date.getFullYear(),
							});
							date.setDate(date.getDate() - 1);  			    
							i--;
						}
						self.months.shift();
						self.months.reverse();
					}else{
						i=1;
						var newDays = [];
						console.log('Difference de jour : ', self.diff_day);
						while (i <= days) {
							if(i == 1){
                                //Pour ne pas prendre en compte le premier jour.
                                //status=false;
                                //Pour  prendre en compte le premier jour.                                
                                status=true;
                                if(self.type=='livraison'){status=false;}
							}else{
								if( i <= self.diff_day ){
									status=false;
								}else{
									status=true;
								}
								if(i > self.periode_day_valide){
									status=false;
								}
							}    				
							
							newDays.push({
								status:status,
								date_french:date.getDate().toString().padStart(2, '0'),
								date:date.getDate(),
								day:date.getDay(),
								month:date.getMonth(),//date.getMonth().toString().padStart(2, '0'),
								month_french:self.getMonthFrench(date.getMonth(), 'small'),
								year:date.getFullYear(),     				
							});
							date.setDate(date.getDate() + 1);
							i++;
						}
						//newDays.shift();
						$.each(newDays, function(i,val){
							self.months.push(val);
						});
					}
					/* */ 	
				},
				select_date_day: function(day, status=true){
                    if(!status){
                        return false;
                    }
					var self = this;
					console.log('select_date_day: ',day);
					this.date_select = day;
					this.buildPlageHeure(day.day);
					this.show_date = false;
					this.dates_tabs = [];
					var date = parseInt(day.month) + 1;
					this.build_dates_tabs(day.year+'-'+ date +'-'+day.date);
					$('#'+this.id_html+' .tabs li').removeClass('active');
					$('#'+this.id_html+' .tabs li:first-child').addClass('active');
				}
			},
		});
		
		/**
		 * initialisation.
		 */
		new Vue({
			delimiters : [ '${', '}' ],
			el : '#selection_horaire',
			data : { 
				datas:{},
				reload:0,
				reload_syn_date:0,
				date_rec:{},
				show_selection:false,
				cart:{},
				loadding_cart:false,
				variants:{
					'31058498125884':{type:'free',id:31058498125884},
					'31058498158652':{type:'plus',id:31058498158652},
					'31058498191420':{type:'express',id:31058498191420},
				},
				variant_in_cart:false,
				/**
				 * utilise pour transmettre les données
				 */
				default_type:0,
				/**
				 * utilisé pour definir un type par defaut.
				 */
				default_type_static:'free',
				default_select_date:'',
				default_select_hour:'first',
				default_select_date_livraison:'',
				default_select_hour_livraison:'first',
				proccedpayement_livraison:false,
				proccedpayement_recuperation:false,
				delai_traitement_en_jour_livraison:3,
				check_adress_validate:false,
				/**
				 * 
				 */
				data_tosave_livraison:null,
				data_tosave_recuperation:null,
				/**
				 * permet de suivre la sauvegarde des données.
				 * null, valeur par defaut
				 * 1 = initialisation
				 * 2 = succes
				 * 3 = echec
				 */
				ajax_watch_attribute:null,
				/**
				 * 
				 */
				use_custom_value:false,
				custom_plage_mn:120,
				/**
				 * Map
				 */
				model_ref:'map-google-field',
			},
			mounted: function(){                
				this.selection_init();
				/**
				 * load cart
				 */
				this.loadcart();
				/**
				 * check localisation
				 */
                //this.get_localisation();
                // se fait dans selection_init.
                $('.map-localisation-wbu.container .element-visible').css('display','block');
			},
			watch: {
				ajax_watch_attribute: function() {
					if(this.ajax_watch_attribute == 1){
						console.log("Initialisation de l'envoit ", 'Url', this.url);
					}
					else if(this.ajax_watch_attribute == 2){
						console.log("Envoyer reussi ", 'Url', this.url);
						this.apply_checkout();
					}
					else if(this.ajax_watch_attribute == 2){
						console.log("Echec de l'envoit ", 'Url', this.url);
					}
				}
			},
			methods: {
				/**
				 * Changement du type de livraison.
				 */
				change_type_livraison: function(datas){
					console.log('change_type_livraison : ', datas);
					this.delai_traitement_en_jour_livraison = datas.delai;
					this.datas = datas;
					this.reload++;
					var selection = '.map-localisation-wbu';
					this.add_cover_wait(selection);
					/**
					 * met à jour les produits du panier.
					 */
					this.updateTypeLivraison(datas);
					/**
					 * Apres le changement du type de livraison, l'utilisateur doit selectionner de nouveaux.
					 */
					this.data_tosave_livraison = null;
                    this.data_tosave_recuperation = null;
                    this.proccedpayement_livraison = false;
					/**
					 * Change creneau parent
					 */
					this.custom_plage_mn =  datas.creneau;
				},
				dte_recuperation: function(date){
					console.log('date dans reservation : ', date)
					this.proccedpayement_livraison = false;
					this.proccedpayement_recuperation = false;
					this.date_rec = date;
					this.reload_syn_date++;
				},
				dte_livraison: function(date){
					//this.proccedpayement_livraison=false;
                },
                get_localisation: function(){
                    var wbu_localisation_map =  Cookies.get('wbu_localisation_map');
                    if(wbu_localisation_map){
                        var datas = {
                            attributes:{
                                localisation: wbu_localisation_map,
                            }
                        };
						this.url = '/cart/update';
                        this.save_attribute_cart(datas, false);                        
					    this.check_adress_validate=true;
				    }else{
                        this.check_adress_validate=false;
                    }
                    return true;
                },
				hidden_block: function(selection, action="continue"){
					var self = this;
					$(selection).addClass('wbu-block-opacity');
					if(action=="continue"){
						$(selection).animate( {opacity:0.5} , 1000, 'linear', function(){    			
                            self.show_selection=true;
                            $('.map-localisation-wbu.container .element-visible').css('display','block');
							$(selection).fadeOut(100, function(){
                                $('.map-localisation-wbu.container .element-visible').css('display','block');
								$(selection).removeClass('wbu-block-opacity'); 
							});
						});
					}else{
						$(selection).animate( {opacity:0.5} , 1000, 'linear', function(){   			
							self.show_selection=false;
							$('#id-cart-form').fadeIn(100, function(){      				
								$('#id-cart-form').css({opacity:1}); 
							});
						});
					} 
				},
				add_cover_wait: function(selection){
					$(selection).addClass('wbu-block-opacity');
				},
				remove_cover_wait: function(selection){
					$(selection).removeClass('wbu-block-opacity');
				},
				selection_init: function(){
                    var self = this;                    
					$('button[name="checkout"]').click(function(event){
                        $('.map-localisation-wbu.container .element-visible').css('display','block');
                        if(self.get_localisation()){
                            console.log('self.proccedpayement_livraison : ', self.proccedpayement_livraison,' self.show_selection : ',self.show_selection, ' self.check_adress_validate : ',self.check_adress_validate)
						    if( self.proccedpayement_livraison && self.show_selection && self.check_adress_validate ){
							
						    }else{
							    event.preventDefault();
							    console.log('Paiement trigger');
							    var selection ='#id-cart-form';
							    self.hidden_block(selection);
							//console.log("essaie de watch", self.default_type2);
							//self.default_type = self.default_type + 1;
						    }
                        }   			
					});
					/**
					 * 
					 */
					if( window.location.search == "?selection=date" ){
						$('button[name="checkout"]').trigger('click');
					}
				},
				back_to_cart: function(){
					var self = this;
					var selection ='.map-localisation-wbu';
					self.hidden_block(selection, "back");
				},
				procced_checkout: function(){
					var self = this;
                    console.log(' Go payement ');
                    //this.get_localisation();
					/**
					 * On verifie le contenu des champs.
					 */
					if(this.data_tosave_livraison && this.data_tosave_recuperation ){
						var selection = '.map-localisation-wbu';
						self.add_cover_wait(selection);
						var datas = {
								attributes:{ livraison : this.data_tosave_livraison, recuperation : this.data_tosave_recuperation }
						};
						var wbu_localisation_map = Cookies.get('wbu_localisation_map');
						if(wbu_localisation_map){
							datas.attributes['localisation'] = wbu_localisation_map;
						}    			
						this.url = '/cart/update';
						this.save_attribute_cart(datas);
                        self.proccedpayement_livraison=true;
                        if(!self.check_adress_validate){
                          self.open_map();  
                        }
					}
					else if( self.proccedpayement_livraison && self.show_selection && !self.check_adress_validate ){
						self.open_map();
					}
					else if( self.proccedpayement_livraison && self.show_selection && self.check_adress_validate ){
						this.apply_checkout();
					} 		
                },
                open_map: function(){
                        /**var 
						 * Ouverture de la map.
						 */
                        var self=this;
						console.log( 'self.check_adress_validate : ', self.check_adress_validate );
						$('#trigger-simple-map2'+self.model_ref).trigger( 'click' );  
                },
				apply_checkout: function(){
					$('button[name="checkout"]').trigger('click');
					this.proccedpayement_livraison=false;
				},
				loadcart: function(){
					var self = this;
					self.loadding_cart = false;
					jQuery.getJSON('/cart.js', function(cart) {
						console.log('Panier charger : ', cart);
						self.cart = cart;
						self.loadding_cart = true;
						console.log(self.cart);
						self.analyseCart();
					});
				},
				analyseCart: function(){
					var self=this;
                    var check_type_livraison=false;
                    var get_attribute_from_cart=false;
					/**
					 * on recherche si une variante de "type de livraison" existe deja
					 */
					if(self.cart && self.cart.items){
						var texte = [];
						/**
						 * recupere les données(livraison/recuperation) du panier.
						 */
						if(get_attribute_from_cart && self.cart.attributes && self.cart.attributes.livraison && self.cart.attributes.recuperation ){
							var livraison = self.cart.attributes.livraison.split('\r\n');
							var recuperation = self.cart.attributes.recuperation.split('\r\n');
							//console.log('recuperation :', recuperation);
							//console.log('livraison :', livraison);
							self.use_custom_value = true;
							$.each(recuperation, function(i, val){
								texte = val.split(' : ');
								if( texte[0] && (texte[0].indexOf('Date') !== -1) && texte[1] ){
									//console.log(texte[1]);
									var date = texte[1].split('/');
									self.default_select_date = date[2]+'-'+date[1]+'-'+date[0];    						
								}
								if( texte[0] && (texte[0].indexOf('Heure') !== -1) && texte[1] ){
									console.log(texte[1]);
									self.default_select_hour = texte[1];
								}
							});
							$.each(livraison, function(i, val){
								texte = val.split(' : ');
								if( texte[0] && (texte[0].indexOf('Date') !== -1) && texte[1] ){
									console.log(texte[1]);
									var date = texte[1].split('/');
									self.default_select_date_livraison = date[2]+'-'+date[1]+'-'+date[0];
								}
								if( texte[0] && (texte[0].indexOf('Heure') !== -1) && texte[1] ){
									console.log(texte[1]);
									self.default_select_hour_livraison = texte[1];
								}
							});
							self.proccedpayement_livraison = true;
							self.proccedpayement_recuperation = true;
						}
						/**
						 * 	check adress
						 */
						if( self.cart.attributes && self.cart.attributes.localisation  && self.cart.attributes.localisation != '' ){
							self.check_adress_validate = true;
						}
						/**
						 * type de livraison
						 */
						$.each(self.cart.items, function(i, product){
							if(self.variants[product.id]){
								check_type_livraison=true;
								self.variant_in_cart = product.id;
								console.log('Variante dans le panier : ', self.variant_in_cart);
								/**
								 * on applique le type de variation defini dans le panier.
								 */
								$.each(blocks_type_livraisons, function(k, variant){
									//console.log(variant, product);
									if(product.id == variant.id){
										/**
										 * change crenneau parent
										 */
										self.custom_plage_mn =  variant.creneau;
										//console.log('this.custom_plage_mn : ', this.custom_plage_mn);
										/**
										 * 
										 */
										self.delai_traitement_en_jour_livraison = variant.delai;
										self.default_type = variant.type;
										console.log('variante selectionner à partir du panier ',self.default_type, variant);
										self.datas = variant;    
										self.proccedpayement_livraison=true;
										self.reload++;
										
									}
								});  
								return false;
							}
						});
						
						/**
						 * si aucun type de selestion n'est definit alors on ajoute, celui de la valeur par defaut.
						 */
						if(!check_type_livraison){
							console.log('aucun type de Livraison dans la panier');
							$.each(self.variants, function(id, variant){
								if(variant.type == self.default_type_static){    						
									self.addProduct(id);
									self.default_type = self.default_type_static;
								}
							});
						}
					}
				},
				updateTypeLivraison: function(datas){
					var self=this;
					var new_type_livraison_variant=null;
					$.each(self.variants, function(i, variant){
						if(variant.type == datas.type){
							new_type_livraison_variant = variant.id;
						}
					});
					if(new_type_livraison_variant){    			
						if(self.variant_in_cart){
							self.deleteProduct(self.variant_in_cart, new_type_livraison_variant);
						}else{
							self.addProduct(new_type_livraison_variant);
						}
					}else{
						alert('Variante non definit');
					}
				},
				addProduct: function(id_product, qte=1){
					var self=this;
					jQuery.post( "/cart/add", { id: id_product, quantity: qte })
					.done(function( data ) {
						/**
						 * return html
						 */
						console.log(" Product add : ", id_product);
						self.variant_in_cart = id_product;
						var selection = '.map-localisation-wbu';
						self.remove_cover_wait(selection);
					}).fail(function() {
						alert( "error" );
					});    		
				},
				save_attribute_cart: function(datas, apply_callback=true){
					var self = this;
					this.ajax_watch_attribute = 1;    		
					jQuery.post(this.url, datas)
					.done(function( data ) {
						/**
						 * return html
						 */
						console.log(" MAJ des attributs : ", datas);
						var selection = '.map-localisation-wbu';
                        self.remove_cover_wait(selection);
                        if(apply_callback){
                            self.ajax_watch_attribute=2; 
                        }						 	    	
					}).fail(function() {
						//alert( "error" );
						self.ajax_watch_attribute=3;
					})
				},
				/**
				 * supprime un produit /ou supprime et ajoute un autre.( modifier la variante)
				 */
				deleteProduct: function(id_product, new_product=null){
					var self=this;
					var product={
							updates:{}
					};
					product.updates[id_product]=0;
					jQuery.post('/cart/update', product)
					.done(function( data ) {
						/**
						 * return html
						 */
						console.log(" Product remove : ", id_product);
						if(new_product){
							self.addProduct(new_product);
						}else{
							var selection = '.map-localisation-wbu';
							self.remove_cover_wait(selection);
						}
					}).fail(function() {
						alert( "error" );
					});
				},
				selection_tosave: function(datas){
					//console.log('Donnée à sauvergarder : ', datas);
					/**
					 * Construction des données à sauvergarder
					 */
					var texte = datas.type+'\r\n';
					var mois = parseInt(datas.date.month) + 1;
					texte += " Date : "+datas.date.date+'/'+mois+'/'+datas.date.year+'\r\n';
					texte += " Heure : "+datas.heure.h1+' - '+datas.heure.h2+'\r\n';
					texte += '\r\n';    		
					if(datas.type == 'livraison'){
						console.log(' proccedpayement_livraison : ', this.proccedpayement_livraison );
						this.data_tosave_livraison = texte;
						this.proccedpayement_livraison = true;
						this.proccedpayement_recuperation = true;
					}
					else if(datas.type == 'recuperation'){
						console.log(' proccedpayement_recuperation : ', this.proccedpayement_livraison );
						this.data_tosave_recuperation = texte;
						this.proccedpayement_livraison = false;
						this.proccedpayement_recuperation = true;
					}    		
				},
				delete_defaut_plage_horaire: function(date){    		
					if(date.type == 'livraison'){
						//console.log('Plage horaire null au niveau du parent :', date.type);
						this.default_select_hour_livraison=null;
					}
					else if(date.type == 'recuperation'){
						//console.log('Plage horaire null au niveau du parent :', date.type);
						this.default_select_hour=null;
					}    		
				}
			}
		});
	});