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
		
		Vue.component('selection_horaire',{ 
			delimiters: ['${', '}'],
            template: '#templatehoraireselection', 
            props: {
                id_html:{type:String, default: '',},
                titre:{type:[String], default: 'Sélectionner les horaires de récupération'},
                type:{type:String, default: '',},
                delai_traitement_en_jour:{type:[Number], default: 3},
                plage_mn:{type:[Number], default: 120},
                default__date_select:{type:String, default: '',},
                default__creneau:{type:[String,Object], default: '',},
            },
            data : function () {
				return {
                    dates_tabs: [],
                    horaires: [],
                    months:[],
                    /**
                     * La date du jour en cours.
                     */
                    current_date: "",
                    /**
                     * La date qui est selectionné
                     */
                    date_select: "",    
                    /**
                     * date de debut de reservation.peut etre le jour en cours, le lendemain.
                     */
                    date_debut_default:0,
                    /**
                     * nombre de jour sur la tab.
                     */
                    number_day: 5,
                    /**
                     * Utiliser par livraison, pour determiner le nombre de jour supplementaire qui seront masqués.
                     */
                    diff_day:0,
                    /**
                     * 
                     */
                    periode_day_valide:21,
                    /**
                     * Decallage d'heure, permet de reserver à partir d'une heure, fonctionne sur la date en cour. 
                     * 
                     */
                    decalage_heure: 2,
                    /**
                     * La periodicite entre les creneaux, (8h-00 ...) (8h-30 ...) (9h-00 ...) (9h30 ...);
                     */
                    periodicite:30,
                    /**
                     * 
                     */
                    default__creneau_livraison: '',
                    /**
                     * Boolean
                     */
                    plage_heure: true,
                    show_date: false,
                    show_texte_error: false,

                    /**
                     * for test
                     */
                    //default__date_select2:''
                }
            },
            watch: {
                /**
                 * NB : les watcher ne s'execute pas au chargement.
                 * Permet de modifier la date_select.
                 * au format YY-mm-jj ou YY-mm-jjTh:mn
                 */                
                perfom__date_select: function(val){
                    //console.log('Mise à jour de la date de Livraison : ', val);
                    this.update_date_livraiosn();
                },
                perfom__creneau: function(val){
                    //console.log('Mise à jour du creneau de Livraison : ', val);                    
                    this.update_creneau_livraiosn();
                }
                
            },
            computed: {                
                perfom__date_select: {
                    /**
                     * La valeur de default__date_select2 est MAJ chaque fois que default__date_select est modifié.
                     * Donc, la fonction get est executé.
                     * NB : Ce systeme a besoin d'un rendu ${perfom__date_select} ou de disposer d'une methode, ou d'un watcher pour fonctionner , i.e pour suivre les modifications.
                     * elle s'execute avant mounted;
                     * Mais pour des raison d performance, il ne faut pas mettre de methode à l'interieur. (Analyse person).
                     */
                    get: function () {                      
                        return this.default__date_select;
                    }                    
                },
                perfom__creneau: {                    
                    get: function () {                      
                        return this.default__creneau;
                    }
                }
                /* */
            },
            mounted: function(){
                /**
                 * On definit la date et l'heure du jour.
                 */
                if(window.wbu_date_now){
                    this.current_date = new Date( window.wbu_date_now );
                }else{
                    this.current_date = new Date();
                }
                /**
                 * 
                 */
                this.builder();
            },
            methods: {
                update_date_livraiosn: function(){                  
                    if( this.type == 'livraison' ){
                        this.date_recuperation = new Date(this.perfom__date_select);
                        this.date_select = this.addDays( this.date_recuperation, (  /* not use here : this.date_debut_default + */ this.delai_traitement_en_jour) );
                        this.date_select.setHours(this.current_date.getHours());
                        this.date_select.setMinutes(this.current_date.getMinutes());
                        this.date_select.setSeconds(this.current_date.getSeconds());
                        /**
                         * MAJ de la date.
                         */
                        this.send__date_select();
                        this.diff_day = this.get_diff_day(this.current_date, this.date_select );
                        this.builder_update();
                        /**
                         * on remet les creneaux à l'initiale
                         */
                        this.default__creneau_livraison =''
                    }
                },
                update_creneau_livraiosn: function(){
                    /**
                     * Est executé au chargement car le builder appelle la fonction send__date_select() 
                     */
                    if(this.type == 'livraison'){
                        // on met à jour le 
                        this.default__creneau_livraison = this.perfom__creneau;
                        this.build_creneaux();
                    }
                },
                builder_update: function(){
                    var self = this;
                    function execution(etape) {
                        return new Promise((resolve, reject) => {
                            console.log('Builder update etape : ', etape);
                            if(etape == 1){
                                resolve({etape:etape, resul:self.build_tabs()});
                            }
                            else if(etape == 2){ 
                                resolve({etape:etape, resul:self.build_creneaux()});
                            }
                            else if(etape == 3){ 
                                resolve({etape:etape, resul:self.buildCalendarMounth()});
                            }
                            else{
                               reject ({etape:etape});
                            }
                        });
                    }
                    execution(1).then(nextExecution, stopExecution).catch(function(error){console.log('Error builder catch : ', error);});
                    function nextExecution(value){ 
                        execution( value.etape + 1 ).then(nextExecution, stopExecution).catch(function(error){console.log('Error builder catch : ', error);});;
                    }
                    function stopExecution(value){
                        console.log('Error on builder stopExecution : ', value);
                    }
                },
                display_errors_plage_heure: function(horaires){
                    if(horaires.length == 0 && !this.show_date){
                        return 'Aucune plage disponible pour cette journée';
                    }
                    return false;
                },
                builder: function(){
                    var self = this;
                    function execution(etape) {
                        return new Promise((resolve, reject) => {
                            console.log('Builder etape : ', etape);
                            if(etape == 0){
                                resolve({etape:etape, resul:self.get_select_date()});
                            }
                            else if(etape == 1){
                                resolve({etape:etape, resul:self.build_tabs()});
                            }
                            else if(etape == 2){ 
                                resolve({etape:etape, resul:self.build_creneaux()});
                            }
                            else if(etape == 3){ 
                                resolve({etape:etape, resul:self.buildCalendarMounth()});
                            }
                            else if(etape == 4){ 
                                resolve({etape:etape, resul:self.send__date_select()});
                            }
                            else if(etape == 5){ 
                                /**
                                 * on selectionne le premier creneau.
                                 */
                                //resolve({etape:etape, resul:self.select_plage_heure(0)});
                                resolve({etape:etape});
                            }
                            else{
                               reject ({etape:etape});
                            }
                        });
                    }
                    execution(0).then(nextExecution, stopExecution).catch(function(error){console.log('Error builder catch : ', error);});
                    /**
                     * 
                     * @param {*} value 
                     */
                    function nextExecution(value){ 
                        execution( value.etape + 1 ).then(nextExecution, stopExecution).catch(function(error){console.log('Error builder catch : ', error);});;
                    }
                    /**
                     * 
                     * @param {*} value 
                     */
                    function stopExecution(value){
                        console.log('Error on builder stopExecution : ', value);
                    }
                },                
                get_select_date: function(){
                    if( this.type == 'recuperation' ){
                        this.date_select = this.addDays( this.current_date, (  this.date_debut_default) );
                        this.diff_day = this.get_diff_day(this.current_date, this.date_select );
                        return this.date_select;
                    }else if( this.type == 'livraison' ) {
                        this.date_select = this.addDays( this.current_date, (  this.date_debut_default + this.delai_traitement_en_jour) );
                        this.diff_day = this.get_diff_day(this.current_date, this.date_select );
                        return this.date_select;
                    }  
                },
                send__date_select: function(){
                    //console.log('Date selectionner pour le type ', this.type,' : ', this.date_select);
                    
                },
                addDays: function(date, days){
                    //console.log('addDays : ', days);
                    var result = new Date(date);
                    if( days == 0 ){ return result; }
                    result.setDate( result.getDate() + days );
                    //console.log('addDays : ', result, date);
					return result;
				},
                build_tabs: function(){
                    var self = this;
                    this.dates_tabs = [];
                    var i=0;
                    var current_date = self.current_date;
                    //console.log('Date exacte : ',current_date);
					while( i < self.number_day ){
						var date = self.addDays( self.date_select, i ); 
						var day = date.getDay(); //console.log('Date du jour suivant : ', date);
                        var date_n = date.getDate();
                        if( self.get_diff_day(current_date, date) == 0 ){
                            day = "Aujourd'hui";
                        }
                        else if( self.get_diff_day(current_date, date) == 1){
							day = 'Demain';
                        }
                        else{
							//console.log('indice de la date : ', day, date);
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
                                'active': (i==0)?true:false,
							};
						self.dates_tabs.push(tab);						  
                        i++;  			
					}
					self.dates_tabs.push({
						'jour': 'Plus de dates',
						'mois': 'afficher le calendrier',
						'index':'all',
					});
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
                get_diff_day: function(date1, date2){
					var date1 = new Date(date1);
					var date2 = new Date(date2);
                    var diffTime = Math.abs(date2 - date1);
                    var diff_exact = diffTime / (1000 * 60 * 60 * 24);      
                    var diffDays = diff_exact;                    
                    //var diffDays = Math.ceil(diff_exact);
                    //console.log('Difference entre les deux date ', diffDays);
                    return Math.round(diffDays);					
                },
                select_date_tab: function(index){
                    var self = this;
                    var dates_tabs=[];
                    if(index == 'all'){
                        this.plage_heure = false;
                        this.show_date = true;
                    }else{
                       this.plage_heure = true;
                        this.show_date = false; 
                    }
                    $.each(this.dates_tabs, function(i,val){
                        if(val.index == index){
                            val.active = true;
                            if(index != 'all'){
                                self.update__date_select(self.translate_date_to_valid(val));
                                /**
                                * Si le type est recuperation,alors on met à jour, livraison.
                                */
                                if(self.type == 'recuperation'){
                                    self.$emit( 'ev_reload_livraison__date', val ); 
                                }
                            }
                        }else{
                            val.active = false;
                        }
                        dates_tabs.push(val);
                    });
                    this.dates_tabs = dates_tabs;
                            
                },
                translate_date_to_valid: function(day){
                    if(day.date && day.month && day.year){
                        return new Date(day.year+'-'+(day.month+1)+'-'+day.date);
                    }
                    return this.date_select;
                },
                update__date_select: function(date, rebuild_tab=false){
                    this.date_select = date;
                    this.date_select.setHours(this.current_date.getHours());
                    this.date_select.setMinutes(this.current_date.getMinutes());
                    this.date_select.setSeconds(this.current_date.getSeconds());
                    this.diff_day = this.get_diff_day(this.current_date, this.date_select );
                    /**
                     * MAJ de la date.
                     */
                    this.send__date_select();
                    this.build_creneaux();
                    /**
                     * necessaire si l'utilisateur, selectionne une nouvelle date.
                     */
                    if(rebuild_tab){
                        this.build_tabs();
                    }
                },
                build_creneaux: function(){   
                    this.horaires=[];                
                    var plage_all = this.creneau_parjour(this.date_select.getDay());                    
                    this.perfom_build_creneaux(plage_all);                    
                    /**
                     * Les creneaux sont prioritaires, donc si on contruit les creneaux on les affichage.
                     */
                    this.show_date=false;
                    this.plage_heure=true;
                },
                perfom_build_creneaux: function(plage_all, etape='matinee'){
                    var self = this;
                    var plage = plage_all;
                    if(plage_all.matinee){
                        if(etape=='matinee'){                        
                            if(plage.matinee){
                                self.buildHoraire(plage.matinee, etape, plage_all);
                            }
                        }else if(etape == 'soir'){
                            if(plage.soir){
                                self.buildHoraire(plage.soir, etape, plage_all);
                            }
                        }
                    }else{
                        if(plage.soir){
                            self.buildHoraire(plage.soir, 'soir', plage_all);
                        }
                    }
                    
                },
                 buildHoraire: async function( plage, etape_construction, plage_all){
                    var self = this;
					//console.log('contruction des creneaux de type  ',this.type, ' : ', plage);
					if( !plage.ht_debut || !plage.ht_fin ){
						return false;
                    }
                    var result=null;
					var ht_debut = parseInt( plage.ht_debut );
					var ht_fin = parseInt( plage.ht_fin );
					var mn_debut = parseInt( plage.mn_debut );
					var mn_fin = parseInt( plage.mn_fin );					
					//console.log(ht_debut, ht_fin, plage_mn);
					var current_date = new Date(this.date_select);  
					var semi=false;
					var plage_mn = parseInt(this.plage_mn); //creneau
					/**
					 *  javacript fonctionne comme suit avec les dates :
					 * 	- si on definit l'heure à 7h, puis on definie les minutes à 30
					 *  on otient : 7h:30
					 *  - Si ensuite on definit les minutes à 15
					 * 	on otient : 7h:15.
					 */
					function promisecustom ( etape=0, h, mn){

						return new Promise( (resolve, reject) => {
							//console.log('promisecustom : ', etape, h, ' semi : ', semi, 'type : ', self.type, ' Creneau : ',plage_mn, 'mn_debut : ',mn_debut);
							var ct_bl = {}, c_hr = c_mn = null;
							
                            var crt_debut = h + etape;
                            var status=true;
							//var crt_fin =  plage_mn;
                            //var semi_time = self.periodicite;
                            //var remove_hour = false;
                            
                            /**
                             * block 1 
                             */
                            current_date.setHours( crt_debut );
                            current_date.setMinutes( mn );
                            c_hr = current_date.getHours();	
                            c_mn = current_date.getMinutes();
                            if(c_hr<10){
									c_hr = '0'+c_hr;
							}
							if(c_mn<10){
									c_mn = '0'+c_mn;
							}
                            ct_bl.h1 = c_hr+':'+c_mn;
                            /**
                             * block 2 
                             */
                            current_date.setHours( crt_debut );
                            current_date.setMinutes( mn + self.plage_mn );
                            c_hr = current_date.getHours();	
                            c_mn = current_date.getMinutes();
                            if(c_hr<10){
								c_hr = '0'+c_hr;
							}
							if(c_mn<10){
								c_mn = '0'+c_mn;
							}
                            ct_bl.h2 = c_hr+':'+c_mn;
                            /**
                             * 
                             */
                            if( parseInt(c_hr) > ht_fin ){
                                status=false;
                            }else if(parseInt(c_hr) == ht_fin && parseInt(c_mn) > mn_fin ){
                                status=false;
                            }                            
                            if(status){
                                addCrenaux(ct_bl);
                                resolve( { etape:etape, 'mn': mn} );
                            }else{
                                reject( { etape:etape, 'mn': mn} );
                            }
                            

                                function addCrenaux(ct_bl){       
                                        self.horaires.push( ct_bl );
                                }                                 
						} );
					}
					
					 function successCallback(value){
                            //console.log('succes : ', value);
                            //console.log('type ',self.type,' test : ', (value.etape + ht_debut + Math.round(self.plage_mn/60)), ht_fin);
							if((value.etape + ht_debut + Math.round(self.plage_mn/60)) <= ht_fin) { 
                                if(self.type=='livraison'){
                                  //console.log(' build date : ', (value.etape + ht_debut + Math.round(self.plage_mn/60)), ht_fin,' value : ', value);  
                                } 
                                if(mn_debut==0){
                                    if( (value.mn + self.periodicite) < 60 ){ 
                                        promisecustom( value.etape, ht_debut, (value.mn + self.periodicite) ).then(successCallback, failureCallback );
                                    }else{
                                        promisecustom(value.etape + 1, ht_debut, mn_debut).then(successCallback, failureCallback);
                                    }
                                }
                                if(mn_debut!=0){
                                    if( (value.mn + self.periodicite) <= 60 ){
                                        promisecustom( value.etape, ht_debut, (value.mn + self.periodicite) ).then(successCallback, failureCallback );
                                    }else{
                                        promisecustom(value.etape + 1, ht_debut, mn_debut).then(successCallback, failureCallback);
                                    }
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
                            //console.log('Fin de la contruction de type ',self.type, ' : ', plage);
                            if(etape_construction == 'matinee'){
                                self.perfom_build_creneaux(plage_all, 'soir');
                            }                            
						}
						promisecustom( 0, ht_debut, mn_debut).then(successCallback, failureCallback);
						return result;
				},
                creneau_parjour: function(index){
                    var plages = [
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:12, mn_fin:30 }, soir:{ht_debut:18, mn_debut:00, ht_fin:22, mn_fin:30 }}, //dim
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:14, mn_fin:30 }, soir:{ht_debut:13, mn_debut:00, ht_fin:21, mn_fin:30 }}, //lin
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:14, mn_fin:30 }, soir:{ht_debut:13, mn_debut:00, ht_fin:21, mn_fin:30 }}, //mard
						{matinee:{ ht_debut:8, mn_debut:30, ht_fin:14, mn_fin:30 }, soir:{ht_debut:13, mn_debut:00, ht_fin:22, mn_fin:00 } }, //merc
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:14, mn_fin:30 }, soir:{ht_debut:16, mn_debut:30, ht_fin:21, mn_fin:30 }}, //jeudi
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:14, mn_fin:30 }, soir:{ht_debut:16, mn_debut:30, ht_fin:21, mn_fin:30 }}, //vendredi
						{matinee:{ ht_debut:8, mn_debut:00, ht_fin:14, mn_fin:30 }, soir:{ht_debut:18, mn_debut:00, ht_fin:21, mn_fin:30 }}  //samedi    			
                    ];
                    /**
                     * selection de la plage
                     */
                    if( plages[index] ){    			
						plage_valide = plages[index];
					}else{
						plage_valide = plages[0];
                    }
                    /**
                     * si la date du jour est egal à celle selectionner, respecter les heures de debuts.
                     * + Ajout du decallage sur les creneaux.
                     */
                    //console.log('difference de jours pour le type ',this.type, ' : ',this.diff_day);
                    if(
                        (this.type=='recuperation' && this.diff_day == this.date_debut_default) ||
                        (this.type=='livraison' && this.diff_day == (this.delai_traitement_en_jour + this.date_debut_default) )
                    )
                    {
                        var hour_now = this.current_date.getHours(), hour_final=0;
                        if( plage_valide.matinee && ( plage_valide.matinee.ht_fin >= (hour_now + Math.round(this.plage_mn/60) + this.decalage_heure) ) ){
                            // + decallage
                            hour_final = hour_now + this.decalage_heure;
                            if(hour_final > plage_valide.matinee.ht_debut){
                                plage_valide.matinee.ht_debut = hour_final;
                            }                            
                        }else{
                            delete plage_valide.matinee;
                        }
                        if( plage_valide.soir && ( plage_valide.soir.ht_fin >= (hour_now + Math.round(this.plage_mn/60) + this.decalage_heure) ) ){
                            // + decallage
                            hour_final = hour_now + this.decalage_heure;
                            if(hour_final > plage_valide.soir.ht_debut){
                                plage_valide.soir.ht_debut = hour_final;
                            }
                        }
                        else{
                            delete plage_valide.soir;
                        }
                    }
                    /**
                     * 
                     */

                    /**
                     * MAJ des creneaux en fonction de celui precedament selectionnée.
                     */
                    if(this.type == 'livraison' ){
                        console.log('check new creneau : ', this.default__creneau_livraison, plage_valide);
                        if( this.default__creneau_livraison.h1 && this.default__creneau_livraison.h1 != '' ){
                            var hr_new = (this.default__creneau_livraison.h1).split(":");
                            var current_date = this.date_select;
                            hr_new[0] = parseInt(hr_new[0]);
                            hr_new[1] = parseInt(hr_new[1]);                            
                            if(plage_valide.matinee  ){
                                console.log('Creneaux de recuperation matinee : ', hr_new,' ht_debut : ', plage_valide.matinee.ht_debut, ' ht_fin : ',plage_valide.matinee.ht_fin);
                                if(hr_new[0] && (plage_valide.matinee.ht_debut <= hr_new[0]) && (plage_valide.matinee.ht_fin > hr_new[0])  ){                                    
                                    current_date.setHours( hr_new[0] );
                                    current_date.setMinutes( hr_new[1] + this.periodicite); console.log(current_date);
                                    plage_valide.matinee.ht_debut = current_date.getHours();
                                    plage_valide.matinee.mn_debut = current_date.getMinutes();
                                }else if(hr_new[0]){
                                    delete plage_valide.matinee;
                                }                                
                            }
                            if( !plage_valide.matinee && plage_valide.soir ) {
                                console.log('Creneaux de recuperation soir : ', hr_new, ' ht_debut : ', plage_valide.soir.ht_debut, ' ht_fin : ',plage_valide.soir.ht_fin);
                                
                                if(hr_new[0] && (plage_valide.soir.ht_debut <= hr_new[0]) && (plage_valide.soir.ht_fin >= hr_new[0])){
                                    current_date.setHours( hr_new[0] );
                                    current_date.setMinutes( hr_new[1] + this.periodicite);
                                    plage_valide.soir.ht_debut = current_date.getHours();
                                    plage_valide.soir.mn_debut = current_date.getMinutes();
                                }else if(hr_new[0]){
                                    delete plage_valide.soir;
                                }
                                
                            }
                        }
                    }
                    console.log(' plage_valide : ', plage_valide);
                    return plage_valide;
                },
                buildCalendarMounth: function(){
                    if(!this.valid_date()){return false;}
                    this.months=[];
					var current_date = this.current_date;
					var day_index = current_date.getDay();
					var day_unavailable=null;
					if(day_index == 0){ day_unavailable = 7;}
					else{
						day_unavailable = day_index;
					}
                   this.buildCalendar(-day_unavailable, false);
                },
                buildCalendar: function(days, status, etape=1){
                    if(etape==1){
                        this.CalendarMounth(days, status);
                    }else if(etape==2){
                        day_unavailable = 31 + days;
                        this.CalendarMounth(day_unavailable, true);
                    }
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
                        this.buildCalendar(days, true, 2);
					}else{
						i=1;
						var newDays = [];
						while (i <= days) {
                            status=true;
                            if(self.type == 'recuperation'){
                                if(
                                (i <= self.date_debut_default) ||
                                (i > self.periode_day_valide)
                                ){
                                    status=false;
							    } 
                            }else if(self.type == 'livraison'){
                                if(
                                (i <= self.date_debut_default) ||
                                ( i <= self.diff_day ) ||
                                (i > self.periode_day_valide)
                                ){
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
                select_date_day: function(day){                    
                    if(day.status){
                        this.dates_tabs=[];
                        this.update__date_select(this.translate_date_to_valid(day), true);
                        this.plage_heure = true;
                        this.show_date = false;
                        /**
                         * Si le type est recuperation,alors on met à jour, livraison.
                         */
                        if(this.type == 'recuperation'){
                            this.$emit( 'ev_reload_livraison__date', day ); 
                        }
                    } 
                },
                valid_date: function(){
                    //console.log('validation_date : ', this.diff_day, this.delai_traitement_en_jour, ' periode : ', this.periode_day_valide);
                    //var sm = this.diff_day + this.delai_traitement_en_jour;
                    //console.log('validation_date : ', sm, ' periode : ', this.periode_day_valide);
                    if( (this.diff_day + this.delai_traitement_en_jour) > this.periode_day_valide){
                        this.show_texte_error = true;
                        return false;
                    }else{
                        this.show_texte_error = false;
                        return true;
                    }
                },
                select_plage_heure: function(index){
                    var self=this;
                    var horaires = [];
                    $.each(self.horaires, function(i, hour){
						if(i == index){
                            hour['active']=true;
							horaires.push(hour);
							self.send__creneau(hour); 
						}else{
							hour['active']=false;
							horaires.push(hour);
						}
					});
					self.horaires = horaires;
                },
                send__creneau: function(creneau){
                    //console.log('Creneau selectionné pour le type ', this.type, ' : ', creneau);
                    creneau.type = this.type;
                    this.$emit( 'ev_reload_livraison__creneau', creneau );
                }
            },
            
		});
    
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
        
		/**
		 * initialisation.
		 */
		new Vue({
			delimiters : [ '${', '}' ],
			el : '#selection_horaire',
			data : { 
                show_selection: true,
                plage_heure: true,
                date_recuperation: '',    
                creneau_recuperation: '',
                default_type: 0,     
                valid_date: false,
                valid_creneau: false,
                valid_localisation: false,      
            },
            mounted: function(){

            },
            methods: {
                reload_livraison__date: function(day){
                    this.date_recuperation = day.year+'-'+(day.month + 1)+'-'+day.date;
                },
                reload_livraison__creneau: function(creneau){
                    this.creneau_recuperation = creneau;
                },
                change_type_livraison: function(datas){
                    console.log('change_type_livraison : ', datas);
                },
                procced_checkout: function(){

                },
                back_to_cart: function(){

                },
            }
    
        });
});
    

