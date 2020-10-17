<!-- -->
<template>
  <div class="horaireselection" :id="id_html">
    <div>
      <h3 class="title" v-html="titre"></h3>
    </div>
    <div class="content-body">
      <!-- selection du jour -->
      <ul class="tabs">
        <li
          v-for="(tab, index) in dates_tabs"
          @click="select_date_tab(tab.index)"
          :class="[tab.active ? 'active' : '']"
          :key="index"
        >
          <strong class="d-block" v-html="tab.jour"></strong>
          <span class="d-block" v-html="tab.mois"></span>
        </li>
      </ul>
      <section v-show="!show_texte_error">
        <!-- plage d'heure -->
        <div v-show="plage_heure">
          <ul class="list-dates">
            <li v-for="(hour, index) in horaires" :key="index">
              <span
                class="plage-heure"
                :class="[hour.active == true ? 'active' : '']"
                @click="select_plage_heure(index)"
              >
                {{ hour.h1 }} - {{ hour.h2 }}</span
              >
            </li>
          </ul>
          <div
            v-if="display_errors_plage_heure(horaires)"
            v-html="display_errors_plage_heure(horaires)"
          ></div>
        </div>
        <!-- jour disponible -->
        <div v-show="show_date">
          <ul class="month-array headers">
            <li>Lun.</li>
            <li>Mar.</li>
            <li>Mer.</li>
            <li>Jeu.</li>
            <li>Ven.</li>
            <li>Sam.</li>
            <li>Dim.</li>
          </ul>
          <ul class="month-array">
            <li v-for="(day, index) in months" :key="index">
              <span
                class="d-block date-day"
                :class="[day.status ? '' : 'disable']"
                :data-status="day.status"
                @click="select_date_day(day)"
              >
                {{ day.date_french }}
                <span class="d-block" v-html="day.month_french"></span>
              </span>
            </li>
          </ul>
        </div>
      </section>
      <!-- texte -->
      <div v-show="show_texte_error">
        <p>
          Malheureusement nous ne pouvons pas accepter de commande plus de 4
          semaines à l'avance. Merci de choisir une autre date.
        </p>
      </div>
    </div>
    <!--  -->
    <div class="suiveur-update-datas"></div>
  </div>
</template>

<script>
var $;
if (window.jQuery) {
  $ = window.jQuery;
} else if (window.$) {
  $ = window.$;
}
//
//import moment from "moment";
/*
if (window.moment) {
  var moment = window.moment;
}
/**/
/**
 * NB: Pour demarer il faut la date du jour( ou de reference).
 * On ne demare plus par defaut au chargement du module, les actions terminées doivent entrainnent les autres.
 * on commence par un bloc ( exemple recuperation ) qui entrainnera celui de livraison.
 * L'execution au niveau des functions suit cette ordre
 * 1 - Construction des tabs.
 * 2 - Constrction des plages horaires (crenneaux);
 * 3 - Construction du calendrier.
 *
 *  ----------------------- 1 - Construction des tabs ----------
 *  a- determiner la date de debut valide.
 *  b- construire les autres tabs en tennant compte, si necessaire du decalage,
 *  des jours feriers, les jours non ouvrés.
 *  ----------------------- 2 - Construction des crenneaux ----------
 *  a-
 */
export default {
  name: "SelectionHoraire",
  props: {
    id_html: {
      type: String,
      default: ""
    },
    titre: {
      type: [String],
      default: "Sélectionner les horaires de collecte"
    },
    type: {
      type: String,
      default: ""
    },
    delai_traitement_en_jour: {
      type: [Number],
      default: 3
    },
    plage_mn: {
      type: [Number],
      default: 60
    },
    maj__date_select: {
      type: String,
      default: ""
    },
    default__creneau: {
      type: [String, Object],
      default: ""
    }, //pour definir une valeur par defaut pour le creneau lors de conscrution complete.
    creneau_update: {
      type: [String, Object],
      default: ""
    }, // pour mettre a jour le creneau de livraison, apres la selection sur selui de la recuperation.
    /**
     * Permet de reconstruire tous les options, apres MAJ du type de livraison.
     */
    re_construction_module: {
      type: [Number],
      default: 0
    },
    /**
     * Date du jour ou date de reference.
     */
    default_date: {
      type: [Date, String]
    },
    /**
     * Date reference pour le calendrier
     */
    default_date_calendar: {
      type: [Date, String],
      default: ""
    },
    jour_desactiver: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data: function() {
    return {
      dates_tabs: [],
      horaires: [],
      months: [],
      /**
       * La date du jour en cours. c'est la date fournit par le parent, donc default_date.
       * @delete
       */
      current_date: "",
      /**
       * La date qui est selectionné, ou encore la date qui est utilisé.
       */
      date_select: "",
      /**
       * La date utilisé par le prgoramme, elle tient compte des jours désactivé.
       */
      date_select_utilisable: "",
      /**
       * date de debut de reservation.peut etre le jour en cours, le lendemain.
       */
      date_debut_default: 0,
      /**
       * nombre de jour sur la tab.
       */
      number_day: 2,
      /**
       * Utiliser par livraison, pour determiner le nombre de jour supplementaire qui seront masqués.
       */
      diff_day: 0,
      /**
       *
       */
      periode_day_valide: 21,
      /**
       * Decallage d'heure, permet de reserver à partir d'une heure, fonctionne sur la date en cour.
       *
       */
      decalage_heure: 1,
      /**
       * La periodicite entre les creneaux, (8h-00 ...) (8h-30 ...) (9h-00 ...) (9h30 ...);
       */
      periodicite: 30,
      /**
       *
       */
      update__creneau_livraison: "",
      /**
       * Boolean
       */
      plage_heure: true,
      show_date: false,
      show_texte_error: false,
      /**
       * Permet d'ignorer certains comportement lors de la reconstruction des modules.
       */
      update_builder_is_running: false,
      /**
       * Permet d'ignorer certains comportement lors de la construction des modules.
       */
      builder_is_running: false,
      /**
       *
       */
      selection_metafields: window.selection_plage_heure,
      /**
       * Stocke les heures non utilisés.
       */
      remove_hours: {}
      /**
       * for test
       */
      //maj__date_select2:''
    };
  },
  watch: {
    /**
     * NB : les watcher ne s'execute pas au chargement.
     * Permet de modifier la date_select.
     * au format YY-mm-jj ou YY-mm-jjTh:mn
     */
    perfom__date_select: function() {
      if (this.perfom__date_select) {
        this.update_date_livraiosn();
      }
    },
    perfom__creneau: function() {
      this.update_creneau_livraiosn();
    },
    re_construction_module: function() {
      if (this.type === "recuperation") {
        this.re_builder();
      }
    },
    /**
     * Elle s'execute une fois le parent aurra fournit une valeur.
     */
    default_date() {
      this.date_select = this.default_date;
      //console.log(this.type, " : ", this.default_date);
      if (this.type === "recuperation") {
        this.$emit("ev_default_date_calendar", this.date_select);
      }
      this.get_date_debut_valide();
    }
  },
  computed: {
    perfom__date_select: {
      /**
       * La valeur de maj__date_select2 est MAJ chaque fois que maj__date_select est modifié.
       * Donc, la fonction get est executé.
       * NB : Ce systeme a besoin d'un rendu {{perfom__date_select}} ou de disposer d'une methode, ou d'un watcher pour fonctionner , i.e pour suivre les modifications.
       * elle s'execute avant mounted;
       * Mais pour des raison d performance, il ne faut pas mettre de methode à l'interieur. (Analyse person).
       */
      get() {
        return this.maj__date_select;
      }
    },
    /**
     * Pour suivre la MISE à jour des creanaux lors des clics.
     */
    perfom__creneau: {
      get() {
        return this.creneau_update;
      }
    }
    /**
     * On utilise pas cette approche elle s'execute par defaut, lors de la construction du blocs.
     */
    /**
    display_default_date: {
      get() {
        console.log("computed this.default_date : ", this.default_date);
        return this.default_date;
      }
    }
    /**/
  },
  mounted: function() {
    /**
     *
     */
    if (this.selection_metafields) {
      this.selection_metafields = JSON.parse(this.selection_metafields);
      this.selection_metafields = this.selection_metafields.selection_plage_heure; //console.log(this.selection_metafields);
    }
    /**
     * On ne demare plus par defaut au chargement du module, les actions doivent entrainnent les autres.
     */
    //this.builder();
  },
  methods: {
    /**
     * MAJ des creneaux de livraison à partir d'une selection de date sur la selection de recuperation.
     */
    update_date_livraiosn: function() {
      var self = this;

      if (this.type == "livraison") {
        /**
         * Pour eviter les chauvements on ajouter un waiter
         */
        var waiter = function() {
          if (!self.update_builder_is_running && !self.builder_is_running) {
            var date_from_recuperation = new Date(
              self.get_date_for_old_browser(self.perfom__date_select)
            );
            //console.log('update_date_livraiosn : ', self.perfom__date_select, date_from_recuperation);
            self.date_select = self.addDays(
              date_from_recuperation /* not use here : this.date_debut_default + */,
              self.delai_traitement_en_jour
            );
            self.date_select.setHours(self.current_date.getHours());
            self.date_select.setMinutes(self.current_date.getMinutes());
            self.date_select.setSeconds(self.current_date.getSeconds());
            /**
             * MAJ de la date.
             */
            self.send__date_select();
            self.diff_day = self.get_diff_day(
              self.current_date,
              self.date_select
            );
            self.builder_update();
            /**
             * on remet les creneaux à l'initiale
             */
            self.update__creneau_livraison = "";
          } else {
            setTimeout(function() {
              console.log("builder_update is waiting");
              waiter();
            }, 300);
          }
        };
        waiter();
      }
    },
    get_date_for_old_browser: function(date = null) {
      //console.log('get_date_for_old_browser : ', date);
      var date_show;
      if (!date) {
        //return Moment();
        return new Date();
      }

      if (typeof date === "string") {
        var ar1 = date.split("T");
        date_show = ar1[0].split("-");
        if (date_show[2]) {
          date_show[1] = date_show[1].toString().padStart(2, "0");
          date_show[2] = date_show[2].toString().padStart(2, "0");
          if (ar1[1]) {
            date_show =
              date_show[0] +
              "-" +
              date_show[1] +
              "-" +
              date_show[2] +
              "T" +
              ar1[1];
          } else {
            date_show = date_show[0] + "-" + date_show[1] + "-" + date_show[2];
          }
          //return Moment(date_show);
          return new Date(date_show);
        }
      }
      /*
      date_show = Moment(date);
      if (date_show.isValid()) {
        return date_show;
      } else {
        //console.log('date to split : ', date_show, '\n\n', date);
        if ("Invalid Date" == date) {
          alert("error : " + this.type);
          return this.date_select;
        }
      }
      /***/
      return new Date(date);
    },
    update_creneau_livraiosn: async function() {
      /**
       * Est executé au chargement car le builder appelle la fonction send__date_select()
       */
      if (this.type == "livraison") {
        await this.build_creneaux();
        /**
         * Permet de selectionner le premier creneau lors de la selection manuel au niveau de la recuperation.
         */
        await this.select_plage_heure();
      }
    },
    /**
     * Permet de reconstruire entirement le module de selection.
     * Executer par une action externe au module de selection, notament lors de la selection du type de livraison.
     */
    re_builder: function() {
      var self = this;
      /**
       * on remet les creneaux à l'initiale
       */
      this.update__creneau_livraison = "";
      /**
       * { Pour la version suivante, il faudra que lorsqu'on désactive this.builder();  que le resultat soit vide, actuelement les creneau s'affiche. D'ou l'ajout d"un waiter }
       * Reconstruction du module
       */
      function waiter() {
        if (!self.builder_is_running && !self.update_builder_is_running) {
          self.horaires = [];
          self.dates_tabs = [];
          self.months = [];
          self.get_date_debut_valide();
        } else {
          setTimeout(function() {
            console.log(" Re_builder is waiting ");
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
          //console.log('Builder update etape : ', etape);
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
      execution(1)
        .then(nextExecution, stopExecution)
        .catch(function(error) {
          console.log("Error builder catch : ", error);
        });

      function nextExecution(value) {
        execution(value.etape + 1)
          .then(nextExecution, stopExecution)
          .catch(function(error) {
            console.log("Error builder catch : ", error);
          });
      }

      function stopExecution(value) {
        self.update_builder_is_running = false;
        if (!value.etape)
          console.log("Error on builder stopExecution : ", value);
      }
    },
    display_errors_plage_heure: function(horaires) {
      if (horaires.length == 0 && !this.show_date) {
        return "Aucune plage disponible pour cette journée";
      }
      return false;
    },
    /**
     * Construit le module de selection tout en tennant compte des données par defaut.
     */
    builder: async function() {
      var self = this;
      this.builder_is_running = true;
      await self.get_select_date();
      //console.log('%c  Builder fin de etape : %s', 'background: #ccc; color: #1a7b01;', etape1, ' type : ', self.type);
      await self.build_tabs();
      //console.log('%c  Builder fin de etape : %s', 'background: #ccc; color: #1a7b01; padding: 2px;', etape2, ' type : ', self.type);
      await self.build_creneaux();
      //console.log('%c  Builder fin de etape : %s', 'background: #ccc; color: #1a7b01; padding: 2px;', etape3, ' type : ', self.type);
      await self.buildCalendarMounth();
      //console.log('%c  Builder fin de etape : %s', 'background: #ccc; color: #1a7b01; padding: 2px;', etape4, ' type : ', self.type);
      await self.send__date_select();
      //console.log('%c  Builder fin de etape : %s', 'background: #ccc; color: #1a7b01; padding: 2px;', etape5, ' type : ', self.type);
      await self.select_plage_heure();
      //console.log('%c  Builder fin de etape : %s', 'background: #ccc; color: #1a7b01; padding: 2px;', etape6, ' type : ', self.type);
      /**
       *
       */
      //console.log('%c Builder etape execution terminée %s', 'background: #222; color: #01bd29; padding: 5px;', ' type : ', self.type);
      this.builder_is_running = false;
      return false;
    },
    get_select_date: function() {
      //console.log('get_select_date debut, type ', this.type);
      if (this.type == "recuperation") {
        if (
          this.builder_is_running &&
          this.maj__date_select != "" &&
          this.valid_default_date() > 0
        ) {
          this.date_select = new Date(
            this.get_date_for_old_browser(this.maj__date_select)
          );
        } else {
          this.date_select = this.addDays(
            this.current_date,
            this.date_debut_default
          );
        }
        this.diff_day = this.get_diff_day(this.current_date, this.date_select);
        //console.log('get_select_date FIN');
        return "get_select_date"; //this.date_select;
      } else if (this.type == "livraison") {
        if (
          this.builder_is_running &&
          this.maj__date_select != "" &&
          this.valid_default_date() > 0
        ) {
          this.date_select = new Date(
            this.get_date_for_old_browser(this.maj__date_select + "T00:00:00")
          );
          //console.log('TRI update__date_select : ', this.date_select,'\n\n', this.maj__date_select,'\n\n', this.get_date_for_old_browser(this.maj__date_select + 'T00:00:00'));
        } else {
          this.date_select = this.addDays(
            this.current_date,
            this.date_debut_default + this.delai_traitement_en_jour
          );
        }
        this.diff_day = this.get_diff_day(this.current_date, this.date_select);
        //console.log('get_select_date FIN, type ', this.type);
        return "get_select_date"; //this.date_select;
      }
    },
    valid_default_date: function() {
      var date_du_jour = this.current_date;
      date_du_jour.setHours(0);
      date_du_jour.setMinutes(0);
      date_du_jour.setSeconds(0);
      var diff = this.get_diff_day(date_du_jour, this.maj__date_select, false);
      //console.log('valid_default_date ', this.type, ' : ',diff)
      return diff;
    },
    send__date_select: function() {
      //console.log('Date selectionner pour le type ', this.type,' : ', this.date_select);
      this.$emit("ev_date_to_save", {
        type: this.type,
        date: this.date_select
      });
      return "send__date_select";
    },
    addDays: function(date, days) {
      //console.log('addDays : ', days);
      var result = new Date(this.get_date_for_old_browser(date));
      if (days == 0) {
        return result;
      }
      result.setDate(result.getDate() + days);
      //console.log('addDays : ', result, date);
      return result;
    },
    /**
     * On recupere la date de debut valide, qui serra utilisé comme date de reference.
     * On verifie si l'indice du jour n'appartient pas à un element desactiver.
     */
    get_date_debut_valide() {
      var self = this;
      //console.log("Debut get_date_debut_valide");
      self.builder_is_running = true;
      /**
       * On doit avoir au moins un jour ouvrée sur 1 semaine.
       */
      class CustomLoop {
        indice_du_jour;
        jour_desactiver = [];
        current_date;
        max_execution = 0;
        results;
        type;
        delai_traitement_en_jour;
        jour_supplementaire = 0;

        constructor(
          jour_desactiver,
          default_date,
          type,
          delai_traitement_en_jour
        ) {
          this.indice_du_jour = default_date.getDay();
          this.jour_desactiver = jour_desactiver;
          this.current_date = default_date;
          this.type = type;
          this.delai_traitement_en_jour = delai_traitement_en_jour;
        }

        JourValide() {
          if ($.inArray(this.indice_du_jour, this.jour_desactiver) !== -1) {
            return false;
          }
          return true;
        }

        /**
         * on verifie si le sjour est valide sinon, on incremente.
         */
        checkValide() {
          this.max_execution++;
          if (this.max_execution > 15) {
            throw "Erreur execution class get_date_debut_valide()";
          }
          if (this.JourValide()) {
            if (this.type == "livraison") {
              return this.ajouteJrSupplmentaire();
            } else {
              var result = {
                indice_du_jour: this.indice_du_jour,
                current_date: this.current_date,
                status: "checkValide"
              };
              this.results = result;
              return result;
            }
          } else {
            this.indice_du_jour++;
            if (this.indice_du_jour > 6) {
              this.indice_du_jour = 0;
            }
            this.current_date = this.addDays(this.current_date, 1);
            this.checkValide();
          }
        }

        ajouteJrSupplmentaire() {
          this.max_execution++;
          if (this.max_execution > 25) {
            throw "Erreur execution class get_date_debut_valide().ajouteJrSupplmentaire";
          }
          if (this.jour_supplementaire < this.delai_traitement_en_jour) {
            this.indice_du_jour++;
            if (this.indice_du_jour > 6) {
              this.indice_du_jour = 0;
            }
            if (this.JourValide()) {
              this.jour_supplementaire++;
              this.current_date = this.addDays(this.current_date, 1);
              this.ajouteJrSupplmentaire();
            } else {
              this.current_date = this.addDays(this.current_date, 1);
              this.ajouteJrSupplmentaire();
            }
          } else {
            var result = {
              indice_du_jour: this.indice_du_jour,
              current_date: this.current_date,
              status: "checkValide"
            };

            this.results = result;
            return result;
          }
        }

        addDays(date, days) {
          var result = new Date(date);
          if (days == 0) {
            return result;
          }
          result.setDate(result.getDate() + days);
          //console.log('addDays : ', result, date);
          return result;
        }
      }
      const execute = new CustomLoop(
        self.jour_desactiver,
        self.default_date,
        self.type,
        self.delai_traitement_en_jour
      );
      execute.checkValide();
      /**
       * Le Js s'execute tjours de maniere aleatoire, on utilise une variable qui declanchera la suite du code.
       * result par defaut est vide, s'il contient status avec la valeur voulue, donc cest ok.
       */
      if (execute.results.status && execute.results.status === "checkValide") {
        self.date_select = execute.results.current_date;
        /*
        console.log(
          " Date de debut ou date de reference ",
          self.type,
          " : ",
          self.date_select
        );
        console.log("End get_date_debut_valide");
        /**/

        /**
         * On declenche la construction du second block.
         */
        if (self.type == "recuperation") {
          this.build_tabs();
          self.buildCalendarMounth();
          self.$emit("ev_reload_livraison__date", self.date_select);
        } else if (self.type == "livraison") {
          this.diff_day = this.get_diff_day(this.date_select, new Date());
          /*
          console.log(
            "date recuperation : ",
            self.default_date,
            "Date livraison : ",
            self.date_select
          );
          /**/
          this.build_tabs();
          self.buildCalendarMounth();
        }
      }
    },
    build_tabs() {
      var self = this;
      //console.log("Debut build_tabs");
      this.dates_tabs = [];

      var i = 0,
        j = 0,
        jour_supplementaire = 0;
      /**
       * not use
       * on verifie si dans le delai de traitement il y'a des jours désactivés.
       */
      if (self.type == "livraison0") {
        var day_livraison = self.date_select.getDay();

        if (day_livraison === 0) {
          day_livraison = 7;
        }
        /**
         * On obtient l'indice du jour de recuperation exacte. (fournit par la date en cours ou date du jours );
         */
        var jour_recuperation =
          7 + day_livraison - self.delai_traitement_en_jour;
        if (jour_recuperation > 7) {
          jour_recuperation = jour_recuperation - 7;
        }
        /**
         * On verifie si ce jour est valide. Ce qui permet d'obtenir le jour effectif de recuperation.
         */
        var stop_test_jour_recuperation = 0;
        while (
          $.inArray(jour_recuperation, self.jour_desactiver) !== -1 &&
          stop_test_jour_recuperation < 14
        ) {
          jour_recuperation++;
          if (jour_recuperation > 6) {
            jour_recuperation = 0;
          }
          stop_test_jour_recuperation++;
        }

        var jjr = 0;
        var total_jour_delais =
          Math.abs(parseInt(jour_recuperation)) +
          Math.abs(parseInt(self.delai_traitement_en_jour));
        //var ii = jour_recuperation;

        /*
        console.log(
          "jour de recuperation : ",
          jour_recuperation,
          "total_jour_delais :: ",
          total_jour_delais,
          "Jour desactiver : ",
          self.jour_desactiver
        );
        /**/

        var w_ii = 0;
        for (var ii = jour_recuperation; ii <= total_jour_delais; ii++) {
          if (ii <= 6) {
            //console.log("if for  :: ", ii);

            w_ii = ii;
            while ($.inArray(w_ii, self.jour_desactiver) !== -1 && ii <= 14) {
              //console.log(' < 6 : ', ii, ' :: ', w_ii);
              jour_supplementaire++;
              if (w_ii > ii) {
                //ii++;
              }
              ii++;
              w_ii++;
              if (w_ii > 6) {
                w_ii = 0;
              }
            }
          } else {
            //console.log("else for  :: ", ii);

            w_ii = jjr;
            while (
              $.inArray(w_ii, self.jour_desactiver) !== -1 &&
              ii <= total_jour_delais
            ) {
              //console.log(' > 6 : ', ii, ' :: ', w_ii);
              jour_supplementaire++;
              if (w_ii > jjr) {
                //ii++;
                //jjr++;
              }
              ii++;
              w_ii++;
            }
          }
          //console.log("Jour recuperation before  :: ", jour_supplementaire);
        }
        /*
        console.log(
          "Jour recuparation",
          jour_recuperation,
          "delai de traitement",
          self.delai_traitement_en_jour,
          "jour_supplementaire",
          jour_supplementaire,
          "total_jour_delais",
          total_jour_delais
        );
        /**/
      }
      j = jour_supplementaire;
      this.jour_supplementaire = jour_supplementaire;
      /**
       * Date fournit par le systeme ou date du jour.
       */
      var current_date = self.default_date;
      while (i < self.number_day && j < 7) {
        var date = self.addDays(self.date_select, j);
        //console.log(" build_tabs ", self.type, " :: ", self.date_select);
        var day = date.getDay();
        /*
        console.log(
          "Date du jour suivant :",
          self.type,
          " :: ",
          date,
          "j index : ",
          j
        );
        /**/
        var date_n = date.getDate();
        if (self.type == "livraison") {
          day = self.getDayFrench(day);
        } else {
          if (self.get_diff_day(current_date, date) == 0) {
            day = "Aujourd'hui";
          } else if (self.get_diff_day(current_date, date) == 1) {
            day = "Demain";
          } else {
            //console.log('indice de la date : ', day, date);
            day = self.getDayFrench(day);
          }
        }

        if (date_n == 1) {
          date_n = "1er";
        }
        var tab = {
          jour: day,
          mois: date_n + " " + self.getMonthFrench(date.getMonth()),
          index: date.getDay(),
          date: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          active: i == 0 ? true : false
        };
        /**
         * On supprimer les dates désactivées.
         */
        if ($.inArray(date.getDay(), self.jour_desactiver) === -1) {
          self.dates_tabs.push(tab);
          if (i == 0) {
            self.date_select_utilisable = date;
            self.date_select = date;
          }
          i++;
        }
        j++;
      }
      self.dates_tabs.push({
        jour: "Plus de dates",
        mois: "afficher le calendrier",
        index: "all"
      });
      //console.log("self.dates_tabs : ", self.dates_tabs);
      if (
        self.dates_tabs.length &&
        self.dates_tabs.length >= self.number_day + 1
      ) {
        //console.log("End build_tabs");
        var EndBuild_creneaux = self.build_creneaux();
        EndBuild_creneaux.then(function() {
          self.builder_is_running = false;
        });
      }
      return "build_tabs";
    },
    getDayFrench: function(index) {
      var days = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi"
      ];
      if (days[index]) {
        return days[index];
      }
      return days[0];
    },
    getMonthFrench: function(index, type = "all") {
      var Months = [
        "Janvier",
        "février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Aout",
        "Septembre",
        "Octobre",
        "Novembre",
        "Decembre"
      ];
      if (type == "small") {
        Months = [
          "jan.",
          "fév.",
          "Mar.",
          "Avr.",
          "Mai.",
          "Jui.",
          "Jui.",
          "Aout.",
          "Sep.",
          "Oct.",
          "Nov.",
          "Dec."
        ];
      }
      if (Months[index]) {
        return Months[index];
      }
      return Months[0];
    },
    /**
     *
     * @param {*} date1 //Date inferieur
     * @param {*} date2 // date superieur
     * @param {int} positive //true pour une valeur absolue
     */
    get_diff_day: function(date1, date2, positive = true) {
      date1 = new Date(this.get_date_for_old_browser(date1));
      date2 = new Date(this.get_date_for_old_browser(date2));
      var diffTime = 0;
      if (positive) {
        diffTime = Math.abs(date2 - date1);
      } else {
        diffTime = date2 - date1;
      }

      var diff_exact = diffTime / (1000 * 60 * 60 * 24);
      var diffDays = diff_exact;
      //var diffDays = Math.ceil(diff_exact);
      //console.log('Difference entre les deux date ', diffDays);
      return Math.round(diffDays);
    },
    /**
     *
     * @param {*} date1 //Date inferieur
     * @param {*} date2 // date superieur
     * @param {int} positive //true pour une valeur absolue
     */
    get_diff_day_close: function(date1, date2) {
      var self = this;
      date1 = new Date(date1);
      date2 = new Date(date2);
      var diffDays = 0;
      var indice_du_jour;
      var max_day = 0;
      while (date2 > date1 && max_day < 31) {
        indice_du_jour = date1.getDay();
        if ($.inArray(indice_du_jour, this.jour_desactiver) !== -1) {
          diffDays++;
          //console.log(" Diff-Days :::: ", diffDays);
        }
        date1 = self.addDays(date1, 1);
        max_day++;
      }
      return diffDays;
    },
    select_date_tab: function(index) {
      var self = this;
      var dates_tabs = [];
      if (index == "all") {
        this.plage_heure = false;
        this.show_date = true;
      } else {
        this.plage_heure = true;
        this.show_date = false;
      }
      $.each(this.dates_tabs, function(i, val) {
        if (val.index == index) {
          val.active = true;
          if (index != "all") {
            self.update__date_select(self.translate_date_to_valid(val));
            /**
             * Si le type est recuperation,alors on met à jour, livraison.
             */
            if (self.type == "recuperation") {
              self.$emit("ev_reload_livraison__date", val);
            }
            /**
             * On reconstruit les crenneaux de recuperation.
             */

            var EndBuild_creneaux = self.build_creneaux();
            EndBuild_creneaux.then(function() {
              //self.builder_is_running = false;
            });
            /***/
          }
        } else {
          val.active = false;
        }
        dates_tabs.push(val);
      });
      this.dates_tabs = dates_tabs;

      /**
       * On remet les creneaux de la livraison à jour.
       */
      if (this.type == "livraison") {
        this.update__creneau_livraison = "";
      }
    },
    translate_date_to_valid: function(day) {
      /**
       * On retire day.month, car la valeur peut etre = 0(pour janvier)
       */
      if (day.date && day.year) {
        var day_d = day.date;
        if (day.date < 10) {
          day_d = "0" + day.date;
        }
        var new_date = new Date(
          this.get_date_for_old_browser(
            day.year + "-" + (day.month + 1) + "-" + day_d
          )
        );
        //console.log(day.year+'-'+(day.month+1)+'-'+day_d+'T00:00:00', new_date);
        return new_date;
      }
      return this.date_select;
    },
    update__date_select: function(date, rebuild_tab = false) {
      this.date_select = date;
      this.date_select_utilisable = date;
      //console.log("Nouvelle date selectTab ", this.date_select);
      this.date_select.setHours(this.current_date.getHours());
      this.date_select.setMinutes(this.current_date.getMinutes());
      this.date_select.setSeconds(this.current_date.getSeconds());
      this.diff_day = this.get_diff_day(this.current_date, this.date_select);
      /**
       * MAJ de la date.
       */
      this.send__date_select();
      //this.build_creneaux();
      /**
       * necessaire si l'utilisateur, selectionne une nouvelle date.
       */
      if (rebuild_tab) {
        this.build_tabs();
      }
    },
    build_creneaux: async function() {
      //console.log("Debut build_creneaux");
      var self = this;
      return new Promise(function(resolve) {
        //console.log('build_creneaux : ', self.date_select);
        self.horaires = [];

        var plage_all = self.creneau_parjour(
          self.date_select_utilisable.getDay()
        );

        var resultCrenneau = self.perfom_build_creneaux(plage_all);

        /**
         * Les creneaux sont prioritaires, donc si on contruit les creneaux on les affichage.
         */
        self.show_date = false;
        self.plage_heure = true;
        /**
         * on attend le retour de perfom_build_creneaux.
         */
        resultCrenneau.then(function(val) {
          /*
          console.log(
            "End build_creneaux ",
            self.type,
            "Indice du jour : ",
            self.date_select_utilisable.getDay()
          );
          /**/
          resolve({ status: "build_creneaux", orther: val });
        });
      });
    },
    perfom_build_creneaux: function(plage_all, etape = "matinee") {
      var self = this;
      //console.log("Debut perfom_build_creneaux : ", etape);
      return new Promise(function(resolve) {
        var plage = plage_all;
        var resultBuildHoraire;
        if (plage_all.matinee) {
          if (etape == "matinee") {
            if (plage.matinee) {
              resultBuildHoraire = self.buildHoraire(
                plage.matinee,
                etape,
                plage_all
              );
              resultBuildHoraire.then(
                function(val) {
                  //console.log("End perfom_build_creneaux : ", etape);
                  resolve({ status: "perfom_build_creneaux", orther: val });
                },
                function(error) {
                  console.log("error", error);
                }
              );
            }
          } else if (etape == "soir") {
            if (plage.soir) {
              resultBuildHoraire = self.buildHoraire(
                plage.soir,
                etape,
                plage_all
              );
              resultBuildHoraire.then(
                function(val) {
                  //console.log("End perfom_build_creneaux : ", etape);
                  resolve({ status: "perfom_build_creneaux", orther: val });
                },
                function(error) {
                  console.log("error", error);
                }
              );
            }
          }
        } else {
          if (plage.soir) {
            resultBuildHoraire = self.buildHoraire(
              plage.soir,
              "soir",
              plage_all
            );
            resultBuildHoraire.then(
              function(val) {
                //console.log("End perfom_build_creneaux : ", etape);
                resolve({ status: "perfom_build_creneaux", orther: val });
              },
              function(error) {
                console.log("error", error);
              }
            );
          }
        }
      });
    },
    buildHoraire: async function(plage, etape_construction, plage_all) {
      var self = this;
      //console.log(" Debut buildHoraire ");
      return new Promise(function(resolveParent) {
        if (!plage.ht_debut || !plage.ht_fin) {
          resolveParent({ status: "buildHoraire" });
        }
        var result = null;
        var ht_debut = parseInt(plage.ht_debut);
        var ht_fin = parseInt(plage.ht_fin);
        var mn_debut = parseInt(plage.mn_debut);
        var mn_fin = parseInt(plage.mn_fin);
        //console.log(ht_debut, ht_fin, plage_mn);
        var current_date = new Date(
          self.get_date_for_old_browser(self.date_select)
        );
        //var semi=false;
        //var plage_mn = parseInt(this.plage_mn); //creneau
        /**
         *  javacript fonctionne comme suit avec les dates :
         * 	- si on definit l'heure à 7h, puis on definie les minutes à 30
         *  on otient : 7h:30
         *  - Si ensuite on definit les minutes à 15
         * 	on otient : 7h:15.
         */
        function promisecustom(etape = 0, h, mn) {
          return new Promise((resolve, reject) => {
            //console.log('promisecustom : ', etape, h, ' semi : ', semi, 'type : ', self.type, ' Creneau : ',plage_mn, 'mn_debut : ',mn_debut);
            var ct_bl = {},
              c_hr = null;
            var c_mn = null;
            var crt_debut = h + etape;
            var status = true;
            //var crt_fin =  plage_mn;
            //var semi_time = self.periodicite;
            var remove_hour = false;

            /**
             * block 1
             */
            current_date.setHours(crt_debut);
            current_date.setMinutes(mn);
            c_hr = current_date.getHours();
            c_mn = current_date.getMinutes();
            if (self.remove_hours && self.remove_hours[c_hr + "-" + c_mn]) {
              remove_hour = true;
            }
            if (c_hr < 10) {
              c_hr = "0" + c_hr;
            }
            if (c_mn < 10) {
              c_mn = "0" + c_mn;
            }
            ct_bl.h1 = c_hr + ":" + c_mn;

            /**
             * block 2
             */
            current_date.setHours(crt_debut);
            current_date.setMinutes(mn + self.plage_mn);
            c_hr = current_date.getHours();
            c_mn = current_date.getMinutes();
            if (c_hr < 10) {
              c_hr = "0" + c_hr;
            }
            if (c_mn < 10) {
              c_mn = "0" + c_mn;
            }
            ct_bl.h2 = c_hr + ":" + c_mn;
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
                mn: mn
              });
            } else {
              reject({
                etape: etape,
                mn: mn
              });
            }

            function addCrenaux(ct_bl) {
              /**
               * On selectionne la valeur valeur par defaut ( à verfier et noter)
               */
              if (
                self.builder_is_running &&
                self.perfom__creneau &&
                self.perfom__creneau.h1
              ) {
                if (
                  self.perfom__creneau.h1 == ct_bl.h1 &&
                  self.perfom__creneau.h2 == ct_bl.h2
                ) {
                  ct_bl.active = true;
                }
              }
              self.horaires.push(ct_bl);
            }
          });
        }

        function successCallback(value) {
          //console.log('succes : ', value);
          //console.log('type ',self.type,' test : ', (value.etape + ht_debut + Math.round(self.plage_mn/60)), ht_fin);
          if (
            value.etape + ht_debut + Math.round(self.plage_mn / 60) <=
            ht_fin
          ) {
            if (self.type == "livraison") {
              //console.log(' build date : ', (value.etape + ht_debut + Math.round(self.plage_mn/60)), ht_fin,' value : ', value);
            }
            if (mn_debut == 0) {
              if (value.mn + self.periodicite < 60) {
                promisecustom(
                  value.etape,
                  ht_debut,
                  value.mn + self.periodicite
                ).then(successCallback, failureCallback);
              } else {
                promisecustom(value.etape + 1, ht_debut, mn_debut).then(
                  successCallback,
                  failureCallback
                );
              }
            }
            if (mn_debut != 0) {
              if (value.mn + self.periodicite <= 60) {
                promisecustom(
                  value.etape,
                  ht_debut,
                  value.mn + self.periodicite
                ).then(successCallback, failureCallback);
              } else {
                promisecustom(value.etape + 1, ht_debut, mn_debut).then(
                  successCallback,
                  failureCallback
                );
              }
            }
          } else {
            fin_construction();
          }
        }

        function failureCallback(error) {
          //console.log('error : ', error);
          if (error.etape + ht_debut < ht_fin) {
            fin_construction();
            //promisecustom(error.etape + 1, ht_debut, plage_mn).then(successCallback, failureCallback);
          } else {
            fin_construction();
          }
        }

        /**
         *
         */
        function fin_construction() {
          /*
          console.log(
            "Fin de la contruction de type ",
            self.type,
            " : ",
            etape_construction,
            plage_all
          );
          /***/
          if (etape_construction == "matinee") {
            var PlageSoirBuild = self.perfom_build_creneaux(plage_all, "soir");
            PlageSoirBuild.then(function(val) {
              resolveParent({ status: "buildHoraire", orther: val });
            });
          }
          resolveParent({ status: "buildHoraire" });
        }
        promisecustom(0, ht_debut, mn_debut).then(
          successCallback,
          failureCallback
        );
        return result;
      });
    },
    get_value_plage_from: function(value) {
      if (value != "") {
        value = value.split("|");
        var _ht_debut = value[0].split(":");
        var _ht_fin = value[1].split(":");
        return {
          matinee: {
            ht_debut: parseInt(_ht_debut[0]),
            mn_debut: parseInt(_ht_debut[1]),
            ht_fin: parseInt(_ht_fin[0]),
            mn_fin: parseInt(_ht_fin[1])
          }
        };
      } else {
        return {
          matinee: {
            ht_debut: 7,
            mn_debut: 30,
            ht_fin: 21,
            mn_fin: 30
          }
        };
      }
    },
    creneau_parjour: function(index) {
      var self = this;
      //var days_string = [window.wbu_lundi,window.wbu_mardi,window.wbu_mercredi, window.wbu_jeudi, window.wbu_vendredi, window.wbu_samedi];

      this.current_date = self.default_date;
      self.remove_hours = {};
      var plages = [
        //{}, //dim
        //{ matinee: { ht_debut: 7, mn_debut: 30, ht_fin: 21, mn_fin: 30 } }, //lin
        //{ matinee: { ht_debut: 7, mn_debut: 30, ht_fin: 21, mn_fin: 30 } }, //mard
        //{ matinee: { ht_debut: 7, mn_debut: 30, ht_fin: 21, mn_fin: 30 } }, //merc
        //{ matinee: { ht_debut: 7, mn_debut: 30, ht_fin: 21, mn_fin: 30 } }, //jeudi
        //{ matinee: { ht_debut: 7, mn_debut: 30, ht_fin: 21, mn_fin: 30 } }, //vendredi
        //{ matinee: { ht_debut: 7, mn_debut: 30, ht_fin: 21, mn_fin: 30 } }  //samedi
      ];
      plages.push(this.get_value_plage_from(window.wbu_dimanche));
      plages.push(this.get_value_plage_from(window.wbu_lundi));
      plages.push(this.get_value_plage_from(window.wbu_mardi));
      plages.push(this.get_value_plage_from(window.wbu_mercredi));
      plages.push(this.get_value_plage_from(window.wbu_jeudi));
      plages.push(this.get_value_plage_from(window.wbu_vendredi));
      plages.push(this.get_value_plage_from(window.wbu_samedi));

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
       * si la date du jour est egal à celle selectionner, respecter les heures de debuts.
       * + Ajout du decallage sur les creneaux.
       */
      //console.log('difference de jours pour le type ', this.type, ' : ', this.diff_day);
      if (
        (this.type == "recuperation" &&
          this.diff_day == this.date_debut_default) ||
        (this.type == "livraison" &&
          this.diff_day ==
            this.delai_traitement_en_jour + this.date_debut_default)
      ) {
        var hour_now = this.current_date.getHours(),
          hour_final = 0;
        if (
          plage_valide.matinee &&
          plage_valide.matinee.ht_fin >=
            hour_now + Math.round(this.plage_mn / 60) + this.decalage_heure
        ) {
          // + decallage
          hour_final = hour_now + this.decalage_heure;
          //console.log('heure final : ', hour_now + this.decalage_heure,
          //  ' : ', hour_now, ' : ', this.decalage_heure, ': ',
          //  this.current_date.getHours(), ' : ', hour_final);
          if (hour_final > plage_valide.matinee.ht_debut) {
            plage_valide.matinee.ht_debut = hour_final;
          }
        } else {
          delete plage_valide.matinee;
        }
        if (
          plage_valide.soir &&
          plage_valide.soir.ht_fin >=
            hour_now + Math.round(this.plage_mn / 60) + this.decalage_heure
        ) {
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
       * MAJ des creneaux en fonction de celui precedament selectionnée.
       */
      if (this.type == "livraison" && !this.update_builder_is_running) {
        var date_livraison = this.date_select;
        date_livraison.setHours(0);
        date_livraison.setMinutes(0);
        date_livraison.setSeconds(0);
        /**
         * Pour le comportement par defaut, aucune n'etant selectionné donc this.perfom__date_select est vide,
         * on va deduire la date de recuperation.
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

        var diff_day = this.get_diff_day(
          date_livraison,
          date_from_recuperation
        );

        var nombre_jour_desactive = this.get_diff_day_close(
          date_from_recuperation,
          date_livraison
        );
        diff_day = diff_day - nombre_jour_desactive;
        /*
        console.log(
          "\n\n Date livraiosn : ",
          date_livraison,
          "\n diff : ",
          diff_day,
          "\n Delai_traitement_en_jour : ",
          this.delai_traitement_en_jour,
          "\n Jour supplementaire : ",
          this.jour_supplementaire,
          "\n Date recuperation ",
          date_from_recuperation,
          "\n nombre_jour_desactive : ",
          nombre_jour_desactive
        );
        /**/
        if (
          diff_day ==
          this.delai_traitement_en_jour +
            this.date_debut_default +
            this.jour_supplementaire
        ) {
          this.update__creneau_livraison = this.perfom__creneau;
        } else {
          this.update__creneau_livraison = "";
        }
        if (
          this.update__creneau_livraison &&
          this.update__creneau_livraison.h1 &&
          this.update__creneau_livraison.h1 != ""
        ) {
          var hr_new = this.update__creneau_livraison.h1.split(":");
          var current_date = this.date_select;
          hr_new[0] = parseInt(hr_new[0]);
          hr_new[1] = parseInt(hr_new[1]);
          if (plage_valide.matinee) {
            /*
            console.log(
              "Creneaux de recuperation matinee : ",
              hr_new,
              " ht_debut : ",
              plage_valide.matinee.ht_debut,
              " ht_fin : ",
              plage_valide.matinee.ht_fin
            );
            console.log(plage_valide.matinee);
            /**/
            /**
             * Ce cas fonctionne si l'heure (debut) de recuperation est >= à l'heure de livraison.
             * et l'heure (fin) de livraiosn > à l'heure (debut) de recuperation.
             */
            if (
              hr_new[0] &&
              plage_valide.matinee.ht_debut <= hr_new[0] &&
              plage_valide.matinee.ht_fin > hr_new[0]
            ) {
              current_date.setHours(hr_new[0]);
              current_date.setMinutes(hr_new[1] + this.periodicite); //console.log(current_date);
              plage_valide.matinee.ht_debut = current_date.getHours();
              plage_valide.matinee.mn_debut = current_date.getMinutes();
            } else if (
              /**
               * Ce cas fonctionne si l'heure (debut) de recuperation est < à l'heure de livraison.
               * et l'heure (fin) de livraiosn > à l'heure (debut) de recuperation.
               */
              hr_new[0] &&
              plage_valide.matinee.ht_debut > hr_new[0] &&
              plage_valide.matinee.ht_fin > hr_new[0]
            ) {
              //on decale l'heure, pour converser les periodes de repos.
              /**
               * Compliquer pour mettre cela en place, et pas demandé pour le moment.
               *
               */
              /*
               Ceci decale une seule foix, donc ne fonctionne pas.
               current_date.setHours(plage_valide.matinee.ht_debut);
              current_date.setMinutes(
                plage_valide.matinee.mn_debut + this.periodicite
              );
              plage_valide.matinee.ht_debut = current_date.getHours();
              plage_valide.matinee.mn_debut = current_date.getMinutes();
              /**/
            } else if (hr_new[0]) {
              delete plage_valide.matinee;
            }
          }
          if (!plage_valide.matinee && plage_valide.soir) {
            //console.log('Creneaux de recuperation soir : ', hr_new, ' ht_debut : ', plage_valide.soir.ht_debut, ' ht_fin : ',plage_valide.soir.ht_fin);
            if (
              hr_new[0] &&
              plage_valide.soir.ht_debut <= hr_new[0] &&
              plage_valide.soir.ht_fin >= hr_new[0]
            ) {
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
       * Si la date encours de selection est egale à celle dans le metafield,
       * on enleve la plage.
       *
       * Pour y parvenir on met dans une variable les heures à supprimer.
       */
      var current_date_select = this.date_select;
      //console.log('self.selection_metafields', self.selection_metafields);
      if (
        self.selection_metafields &&
        self.selection_metafields.livraison &&
        self.type == "livraison"
      ) {
        $.each(self.selection_metafields.livraison, function(i, k) {
          if (!k.mn_debut) {
            k.mn_debut = 0;
          }
          if (
            current_date_select &&
            k.date ==
              current_date_select.getDate() +
                "/" +
                (current_date_select.getMonth() + 1) +
                "/" +
                current_date_select.getFullYear()
          ) {
            if (
              plage_valide.matinee &&
              k.ht_debut < plage_valide.matinee.ht_fin
            ) {
              //plage_valide.matinee.ht_debut = k.ht_debut;
              //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
              self.remove_hours[k.ht_debut + "-" + k.mn_debut] = {
                hr: k.ht_debut,
                mn: k.mn_debut
              };
            } else if (plage_valide.soir) {
              //plage_valide.matinee.ht_debut = k.ht_debut;
              //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
              self.remove_hours[k.ht_debut + "-" + k.mn_debut] = {
                hr: k.ht_debut,
                mn: k.mn_debut
              };
            }
          }
        });
      }
      if (
        self.selection_metafields &&
        self.selection_metafields.recuperation &&
        self.type == "recuperation"
      ) {
        $.each(self.selection_metafields.recuperation, function(i, k) {
          if (!k.mn_debut) {
            k.mn_debut = 0;
          }
          if (
            current_date_select &&
            k.date ==
              current_date_select.getDate() +
                "/" +
                (current_date_select.getMonth() + 1) +
                "/" +
                current_date_select.getFullYear()
          ) {
            if (
              plage_valide.matinee &&
              k.ht_debut < plage_valide.matinee.ht_fin
            ) {
              // plage_valide.matinee.ht_debut = k.ht_debut;
              //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
              self.remove_hours[k.ht_debut + "-" + k.mn_debut] = {
                hr: k.ht_debut,
                mn: k.mn_debut
              };
            } else if (plage_valide.soir) {
              //plage_valide.matinee.ht_debut = k.ht_debut;
              //plage_valide.matinee.ht_fin = parseInt(k.ht_debut) + 2;
              self.remove_hours[k.ht_debut + "-" + k.mn_debut] = {
                hr: k.ht_debut,
                mn: k.mn_debut
              };
            }
          }
        });
      }
      //console.log( 'self.remove_hours : ', self.remove_hours );
      //console.log(' plage_valide : ', plage_valide);
      return plage_valide;
    },
    buildCalendarMounth: function() {
      if (!this.valid_date()) {
        return false;
      }
      this.months = [];
      /*
      var current_date =
        this.default_date_calendar !== ""
          ? this.default_date_calendar
          : this.current_date;
      /**/
      var current_date = this.current_date;
      if (this.type === "livraison" && this.default_date_calendar !== "") {
        /*
        console.log(
          "date de reference du calendrier : \n",
          this.default_date_calendar,
          "\n date defaut : \n",
          this.default_date,
          "\n date selectionner : \n",
          this.date_select,
          "\n current_date : \n",
          this.current_date
        );
        /**/
        current_date = this.default_date_calendar;
      }
      var day_index = current_date.getDay();
      var day_unavailable = null;
      if (day_index == 0) {
        day_unavailable = 7;
      } else {
        day_unavailable = day_index;
      }
      this.buildCalendar(-day_unavailable, false);
      return "buildCalendarMounth";
    },
    buildCalendar: function(days, status, etape = 1) {
      /*
      console.log(
        this.type,
        " days : ",
        days,
        "\n status : ",
        status,
        "\n this.jour_desactiver",
        this.jour_desactiver
      );
      /**/
      if (etape == 1) {
        this.CalendarMounth(days, status);
      } else if (etape == 2) {
        var day_unavailable = 31 + days;
        this.CalendarMounth(day_unavailable, true);
      }
    },
    CalendarMounth: function(days = -25, status = true) {
      var self = this;
      var current_date = this.current_date;
      if (this.type === "livraison" && this.default_date_calendar !== "") {
        current_date = this.default_date_calendar;
      }
      var date = new Date(this.get_date_for_old_browser(current_date));
      //console.log("Current date day ", date.getDate(), "type ", self.type);
      var i = 1;

      if (days < 0) {
        i = -1;
        while (i >= days) {
          //console.log('negatif : ', i);
          status =
            $.inArray(date.getDay(), self.jour_desactiver) === -1
              ? status
              : false;
          self.months.push({
            status: status,
            date_french: date
              .getDate()
              .toString()
              .padStart(2, "0"),
            date: date.getDate(),
            day: date.getDay(),
            month: date.getMonth(), //date.getMonth().toString().padStart(2, '0'),
            month_french: self.getMonthFrench(date.getMonth(), "small"),
            year: date.getFullYear()
          });
          date.setDate(date.getDate() - 1);
          i--;
        }
        self.months.shift();
        self.months.reverse();
        this.buildCalendar(days, true, 2);
        // debug
        /*
        if (self.type == "recuperation") {
          console.log("etape 1 : ", moment(date).format("DD-MM-YYYY HH:mm:ss"));
        }
        /**/
      } else {
        i = 1;
        var newDays = [];
        while (i <= days) {
          status = true;

          if (self.type == "recuperation") {
            if (i <= self.date_debut_default || i > self.periode_day_valide) {
              status = false;
            }
          } else if (self.type == "livraison") {
            if (
              i <= self.date_debut_default ||
              i <= self.diff_day ||
              i > self.periode_day_valide
            ) {
              status = false;
            }
            /*
            console.log(
              "date select : ",
              self.date_select,
              "date en cours : ",
              date
            );
            /**/
            if (self.date_select > date) {
              status = false;
            }
          }
          status =
            $.inArray(date.getDay(), self.jour_desactiver) === -1
              ? status
              : false;
          newDays.push({
            status: status,
            date_french: date
              .getDate()
              .toString()
              .padStart(2, "0"),
            date: date.getDate(),
            day: date.getDay(),
            month: date.getMonth(), //date.getMonth().toString().padStart(2, '0'),
            month_french: self.getMonthFrench(date.getMonth(), "small"),
            year: date.getFullYear()
          });
          date.setDate(date.getDate() + 1);
          i++;

          // debug
          /*
          if (self.type == "recuperation") {
            console.log(
              "etape 2 : ",
              moment(date).format("DD-MM-YYYY HH:mm:ss"),
              "\n status",
              status
            );
          }
          /**/
        }
        //newDays.shift();
        $.each(newDays, function(i, val) {
          self.months.push(val);
        });
      }
      //debug
      /*
      if (self.type == "recuperation") {
        console.log("self.months : ", self.months);
      }
      /**/
    },
    select_date_day: function(day) {
      if (day.status) {
        this.dates_tabs = [];
        this.update__date_select(this.translate_date_to_valid(day), true);
        this.plage_heure = true;
        this.show_date = false;
        /**
         * Si le type est recuperation,alors on met à jour, livraison.
         */
        if (this.type == "recuperation") {
          this.$emit("ev_reload_livraison__date", day);
        }
        /**
         * on remet les creneaux à l'initiale
         */
        if (this.type == "livraison") {
          this.update__creneau_livraison = "";
        }
      }
    },
    valid_date: function() {
      /*
      console.log(
        "validation_date : ",
        this.diff_day,
        this.delai_traitement_en_jour,
        " periode : ",
        this.periode_day_valide
      );
      /**/
      //var sm = this.diff_day + this.delai_traitement_en_jour;
      //console.log('validation_date : ', sm, ' periode : ', this.periode_day_valide);
      if (
        this.diff_day + this.delai_traitement_en_jour >
        this.periode_day_valide
      ) {
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
      //console.log('select_plage_heure : ', this.type , ' perfom__creneau : ', this.perfom__creneau, ' default__creneau : ', this.default__creneau);
      //console.log('self.builder_is_running : ', self.builder_is_running, ' self.update_builder_is_running : ', self.update_builder_is_running);
      var ct_bl = "";
      if (
        this.default__creneau &&
        this.default__creneau != "" &&
        this.builder_is_running
      ) {
        ct_bl = self.default__creneau.split("-");
        ct_bl[0] = ct_bl[0].trim();
        ct_bl[1] = ct_bl[1].trim();
        index = null;
        //console.log(ct_bl);
      } else if (
        self.perfom__creneau &&
        self.perfom__creneau != "" &&
        !self.perfom__creneau.h1
      ) {
        ct_bl = self.perfom__creneau.split("-");
        ct_bl[0] = ct_bl[0].trim();
        ct_bl[1] = ct_bl[1].trim();
        index = null;
        //console.log(ct_bl);
      }
      $.each(self.horaires, function(i, hour) {
        if (ct_bl && ct_bl[0] && ct_bl[0] == hour.h1 && ct_bl[1] == hour.h2) {
          hour.active = true;
          horaires.push(hour);
          if (self.builder_is_running && self.type == "livraison") {
            self.send__creneau(hour);
          }
        } else if (i == index) {
          hour.active = true;
          horaires.push(hour);
          self.send__creneau(hour);
        } else {
          hour.active = false;
          horaires.push(hour);
        }
      });
      self.horaires = horaires;
      return "select_plage_heure";
    },
    send__creneau: function(creneau) {
      this.$emit("ev_date_et_creneau_to_save", {
        type: this.type,
        date: this.date_select,
        creneau: creneau
      });
      //if(!this.builder_is_running)
      {
        creneau.type = this.type;
        this.$emit("ev_reload_livraison__creneau", creneau);
      }
    }
  }
};
</script>
