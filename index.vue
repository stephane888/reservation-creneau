<template>
  <div id="selection_horaire">
    <section class="map-localisation-wbu container" v-show="show_selection">
      <div class="row">
        <strong class="text-alert-danger element-visible" style="display:none;">
          Afin d'afficher correctement les créneaux, merci de cliquer sur la
          date concernée
        </strong>
        <div class="col-sm-8">
          <div>
            <selection_horaire
              :id_html="'id_date_recuperation'"
              :type="'recuperation'"
              :delai_traitement_en_jour="delai_traitement_en_jour"
              :re_construction_module="re_construction_module"
              :plage_mn="plage_mn"
              :maj__date_select="date_recuperation"
              :default__creneau="default_creneau_recuperation"
              :jour_desactiver="jour_desactiver"
              :default_date="date_de_reference"
              @ev_default_date_calendar="set_date_reference"
              @ev_reload_livraison__date="reload_livraison__date"
              @ev_reload_livraison__creneau="reload_livraison__creneau"
              @ev_date_to_save="date_to_save"
              @ev_date_et_creneau_to_save="date_et_creneau_to_save"
            ></selection_horaire>

            <selection_horaire
              :id_html="'id_date_livraison'"
              :type="'livraison'"
              :maj__date_select="date_livraison"
              :default_date="date_from_recuperation"
              :default__creneau="default_creneau_livraison"
              :creneau_update="creneau_update_livraison"
              :titre="'Sélectionner les horaires de livraison'"
              :delai_traitement_en_jour="delai_traitement_en_jour"
              :re_construction_module="re_construction_module"
              :plage_mn="plage_mn"
              :jour_desactiver="jour_desactiver"
              :default_date_calendar="default_date_calendar"
              @ev_date_to_save="date_to_save"
              @ev_date_et_creneau_to_save="date_et_creneau_to_save"
            ></selection_horaire>
          </div>
        </div>

        <div class="col-sm-4">
          <type_livraison
            @ev_change_type_livraison="change_type_livraison"
            :default_type="default_type"
            :blocks_type_livraisons="blocks_type_livraisons"
          ></type_livraison>
        </div>
        <div class="col-sm-8 element-visible" style="display:none;">
          <button
            @click="procced_checkout"
            class="button-primary cart-checkout-custom"
            :class="[valid_creneau > 0 ? '' : 'disabled']"
          >
            Continuer
            <svg
              aria-hidden="true"
              focusable="false"
              role="presentation"
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="10"
              viewBox="0 0 8 6"
              style="transform: rotate(-90deg);"
            >
              <g fill="currentColor" fill-rule="evenodd">
                <polygon
                  class="icon-chevron-down-left"
                  points="4 5.371 7.668 1.606 6.665 .629 4 3.365"
                ></polygon>
                <polygon
                  class="icon-chevron-down-right"
                  points="4 3.365 1.335 .629 1.335 .629 .332 1.606 4 5.371"
                ></polygon>
              </g>
            </svg>
          </button>
          <a href="#" @click="back_to_cart" class="cart-continue">
            <svg
              aria-hidden="true"
              focusable="false"
              role="presentation"
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="6"
              viewBox="0 0 8 6"
              style="transform: rotate(90deg);"
            >
              <g fill="currentColor" fill-rule="evenodd">
                <polygon
                  class="icon-chevron-down-left"
                  points="4 5.371 7.668 1.606 6.665 .629 4 3.365"
                ></polygon>
                <polygon
                  class="icon-chevron-down-right"
                  points="4 3.365 1.335 .629 1.335 .629 .332 1.606 4 5.371"
                ></polygon>
              </g>
            </svg>
            Retourner au panier</a
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script>
var $;
if (window.jQuery) {
  $ = window.jQuery;
} else if (window.$) {
  $ = window.$;
}
import Cookies from "vue-cookies";
//import Moment from "vue-moment";
import SelectionHoraire from "./SelectionHoraire.vue";
import TypeLivraison from "./TypeLivraison.vue";

//
export default {
  name: "Crenneau",
  props: {
    jour_desactiver: {
      type: Array,
      default: function() {
        return [];
      }
    },
    blocks_type_livraisons: {
      type: Array,
      default: function() {
        return [];
      }
    },
    free_horaire: {
      type: Number,
      default: 60
    }
  },
  data: function() {
    return {
      show_selection: false,
      plage_heure: true,
      /**
       * format 2019-12-5
       */
      date_recuperation: "",
      default_creneau_recuperation: "",
      date_livraison: "",
      default_creneau_livraison: "",
      creneau_update_livraison: "",
      date_from_recuperation: "",
      /**
       * Plage d'un creneau.
       */
      plage_mn: this.free_horaire,
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
      default_type_static: "free",
      /**
       *  Plage du creneau.
       */
      custom_plage_mn: this.free_horaire,
      /**
       *
       */
      delai_traitement_en_jour: 3,
      /**
       * Jour supplementaire, existe s'il ya des jours désactivés.
       */
      jour_supplementaire: 0,
      /**
       * Les variantes du produits.
       */
      variants: {
        "31058498125884": {
          type: "free",
          id: 31058498125884
        },
        "31058498158652": {
          type: "plus",
          id: 31058498158652
        },
        "31058498191420": {
          type: "express",
          id: 31058498191420
        }
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
      default_select_date_recuperation: "",
      default_select_hour_recuperation: "",
      default_select_date_livraison: "",
      default_select_hour_livraison: "",
      /**
       *
       */
      cart: {},
      /**
       * Identifiant pour la Map.
       */
      model_ref: "map-google-field",
      /**
       * identifiant de selection de retour
       */
      selection_back: "#id-cart-form",
      date_de_reference: "",
      /**
       * Date reference pour le calendrier
       */
      default_date_calendar: "",
      current_type_livraison: {}
    };
  },
  components: {
    selection_horaire: SelectionHoraire,
    type_livraison: TypeLivraison
  },
  mounted: async function() {
    //console.log("init INNNNNNNE");
    /**
     * en local
     */
    if (window.location.host == "modulejs.kksa") {
      this.show_selection = true;
    }
    this.selection_init();
    /**
     * Chargement du panier.
     */
    this.loadcart();
    /*
      this.date_recuperation = '2019-12-13';
      this.date_livraison = '2019-12-16';
      this.date_from_recuperation = this.date_recuperation;
      this.re_construction_module++;
    /**/
    /**
     * On recupere la date et l'heure du jour.
     */
    if (window.wbu_date_now) {
      this.date_de_reference = new Date(
        this.get_date_for_old_browser(window.wbu_date_now)
      );
      console.log("this.date_de_reference : ", this.date_de_reference);
      //si cest jeurdi ou vendredi on met le creneau à 96
      await this.surchargeDelaiTraitement(this.date_de_reference);
    } else {
      this.date_de_reference = new Date(this.get_date_for_old_browser());
    }
  },
  methods: {
    async surchargeDelaiTraitement(date_de_reference) {
      var self = this;
      return new Promise(resolve => {
        if (
          date_de_reference.getDay() == 4 ||
          date_de_reference.getDay() == 5
        ) {
          if (self.current_type_livraison.type) {
            if (self.current_type_livraison.type == "free") {
              self.delai_traitement_en_jour = 4;
            } else {
              self.delai_traitement_en_jour = self.current_type_livraison.delai;
            }
          } else {
            self.delai_traitement_en_jour = 4;
          }
          resolve(true);
        } else {
          if (self.current_type_livraison.type) {
            self.delai_traitement_en_jour = self.current_type_livraison.delai;
          } else {
            self.delai_traitement_en_jour = 3;
          }
          resolve(true);
        }
      });
    },
    /**
     * Ajout des dates à sauvergarder.
     * @param {*} datas
     */
    date_to_save: function(datas) {
      //console.log('Date à sauvergarder : ', datas);
      /**
       * Si l'utilisateur modifie une date, il faut verifier le type et le desactivé.
       */
      if (datas.type == "livraison") {
        this.valid_creneau_livraison = false;
      } else if (datas.type == "recuperation") {
        this.valid_creneau_recuperation = false;
      }
      this.valid_creneau = false;
    },
    /**
     * Ajout des dates à sauvergarder.
     * @param {*} datas
     */
    date_et_creneau_to_save: function(datas) {
      //console.log('Date et creneau à sauvergarder : ', datas);
      var texte = datas.type + "\r\n";
      var date = new Date(this.get_date_for_old_browser(datas.date));
      texte +=
        " Date : " +
        date.getDate() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        date.getFullYear() +
        "\r\n";
      texte +=
        " Heure : " + datas.creneau.h1 + " - " + datas.creneau.h2 + "\r\n";
      if (datas.type == "livraison" && date) {
        this.data_tosave_livraison = texte;
        this.valid_creneau_livraison = true;
      } else if (datas.type == "recuperation" && date) {
        this.data_tosave_recuperation = texte;
        this.valid_creneau_recuperation = true;
        this.valid_creneau_livraison = false;
      }
      if (this.valid_creneau_recuperation && this.valid_creneau_livraison) {
        this.valid_creneau = true;
        console.log(
          "\n\n Date et creneau à sauvergarder : \n",
          this.data_tosave_recuperation,
          this.data_tosave_livraison
        );
      } else {
        this.valid_creneau = false;
      }
    },
    change_type_livraison: async function(datas) {
      /*
      console.log("change_type_livraison : ", datas);
      console.log(
        "this.date_from_recuperation : ",
        this.date_from_recuperation
      );
      console.log("this.date_de_reference : ", this.date_de_reference);
      /**/
      this.current_type_livraison = datas;
      /**
       * met à jour les produits du panier.
       */
      this.updateTypeLivraison(datas);
      /**
       * Ajout le cover durant le processus
       */
      var selection = ".map-localisation-wbu";
      this.add_cover_wait(selection);
      /**
       * On definit de date_livraison à '', pour annuler la selection precedente.
       */
      this.date_livraison = "";
      /**
       * reconstruction des modules de selection.
       */
      await this.surchargeDelaiTraitement(this.date_de_reference);
      //this.delai_traitement_en_jour = datas.delai;
      this.plage_mn = datas.creneau;
      this.re_construction_module++;
    },
    reload_livraison__date: async function(day) {
      if (day.year && day.date) {
        var date_string =
          day.year +
          "-" +
          (day.month + 1).toString().padStart(2, "0") +
          "-" +
          day.date.toString().padStart(2, "0");
        this.date_from_recuperation = new Date(date_string);
        await this.surchargeDelaiTraitement(this.date_from_recuperation);
        //console.log("this.date_from_recuperation :: ", date_string);
      } else {
        this.date_from_recuperation = day;
      }
    },
    reload_livraison__creneau: function(creneau) {
      //console.log('Mise à jour du creneau de livraison, action déclenchée  par celui de la recuperation. : ', creneau);
      this.creneau_update_livraison = creneau;
    },
    loadcart: function() {
      var self = this;
      $.getJSON("/cart.js", function(cart) {
        //console.log('Panier charger : ', cart);
        self.cart = cart;
        self.analyseCart();
      });
    },
    selection_init: function() {
      var self = this;
      /**
       * display Message
       */
      $(".map-localisation-wbu.container .element-visible").css(
        "display",
        "block"
      );
      $('button[name="checkout"], .creneau.open').click(function(event) {
        $(".map-localisation-wbu.container .element-visible").css(
          "display",
          "block"
        );
        if (self.get_localisation()) {
          if (!self.valid_creneau || !self.valid_localisation) {
            event.preventDefault();
            /**
             * get data selection.
             */
            var selection = $(this).data("selection");
            if (selection && selection != "") {
              selection = "#" + selection;
              self.selection_back = selection;
            } else {
              selection = "#id-cart-form";
            }
            //console.log(selection);
            self.hidden_block(selection);
            console.log("essaie de watch", self.default_type2);
            //self.default_type = self.default_type + 1;
          } else {
            console.log(
              "Identifiant not found , creneau : ",
              self.valid_creneau,
              " localisation : ",
              self.valid_localisation
            );
          }
        }
      });
      /**
       *
       */
      if (window.location.search == "?selection=date") {
        $('button[name="checkout"]').trigger("click");
      }
    },
    apply_checkout: function() {
      $('button[name="checkout"]').trigger("click");
      this.valid_creneau = false;
    },
    procced_checkout: async function() {
      var self = this;
      if (!this.valid_creneau) {
        return false;
      }
      console.log(" Go payement ");
      //this.get_localisation();
      /**
       * On verifie le contenu des champs.
       */
      if (this.data_tosave_livraison && this.data_tosave_recuperation) {
        this.valid_creneau = true;
        var selection = ".map-localisation-wbu";
        self.add_cover_wait(selection);
        var datas = {
          attributes: {
            livraison: this.data_tosave_livraison,
            recuperation: this.data_tosave_recuperation
          }
        };
        var wbu_localisation_map = Cookies.get("wbu_localisation_map");
        if (wbu_localisation_map) {
          datas.attributes.localisation = wbu_localisation_map;
          self.valid_localisation = true;
        }
        /**
         * open map
         */
        if (!self.valid_localisation) {
          self.open_map();
        }
        this.url = "/cart/update";
        var saveAttribute = await this.save_attribute_cart(datas);
        console.log(
          "Procced_checkout saveAttribute : ",
          saveAttribute,
          " localisation : ",
          self.valid_localisation
        );
        if (self.valid_localisation && saveAttribute) {
          await this.apply_checkout();
        }
      }
    },
    analyseCart: function() {
      var self = this;
      var check_type_livraison = false;
      /**
       * on recherche si une variante de "type de livraison" existe deja
       */
      if (self.cart && self.cart.items) {
        /**
         * recupere les données(livraison/recuperation) du panier.
         */
        /*
        var getAttributes = function() {
          return new Promise(resolve => {
            //console.log('getAttributes debut');
            var texte = [];
            if (
              self.cart.attributes &&
              self.cart.attributes.livraison &&
              self.cart.attributes.recuperation
            ) {
              var livraison = self.cart.attributes.livraison.split("\r\n");
              var recuperation = self.cart.attributes.recuperation.split(
                "\r\n"
              );
              $.each(recuperation, function(i, val) {
                texte = val.split(" : ");
                if (texte[0] && texte[0].indexOf("Date") !== -1 && texte[1]) {
                  //console.log(texte[1]);
                  var date = texte[1].split("/");
                  self.date_recuperation =
                    date[2] + "-" + date[1] + "-" + date[0];
                }
                if (texte[0] && texte[0].indexOf("Heure") !== -1 && texte[1]) {
                  //console.log(texte[1]);
                  self.default_creneau_recuperation = texte[1];
                }
              });
              $.each(livraison, function(i, val) {
                texte = val.split(" : ");
                if (texte[0] && texte[0].indexOf("Date") !== -1 && texte[1]) {
                  //console.log(texte[1]);
                  var date = texte[1].split("/");
                  self.date_livraison = date[2] + "-" + date[1] + "-" + date[0];
                  self.date_from_recuperation = self.date_recuperation;
                }
                if (texte[0] && texte[0].indexOf("Heure") !== -1 && texte[1]) {
                  //console.log(texte[1]);
                  self.default_creneau_livraison = texte[1];
                }
              });

              //self.valid_creneau = true;
              resolve("getAttributes");
            } else {
              resolve("getAttributes");
            }
          });
        };
        /**/
        /**
         * 	check adress
         */
        var checkAdress = function() {
          if (
            self.cart.attributes &&
            self.cart.attributes.localisation &&
            self.cart.attributes.localisation != ""
          ) {
            self.valid_localisation = true;
          }
        };
        /**
         * type de livraison
         */
        var CheckTypeLivraison = function() {
          return new Promise(resolve => {
            //console.log('CheckTypeLivraison debut');
            $.each(self.cart.items, function(i, product) {
              if (self.variants[product.id]) {
                check_type_livraison = true;
                self.variant_in_cart = product.id;
                //console.log('Variante dans le panier : ', self.variant_in_cart);
                /**
                 * on applique le type de variation defini dans le panier.
                 */
                $.each(self.blocks_type_livraisons, async function(k, variant) {
                  //console.log(variant, product);
                  if (product.id == variant.id) {
                    self.default_type = variant.type;
                    //console.log('variante selectionner à partir du panier ',self.default_type, variant);
                    self.datas = variant;
                    self.current_type_livraison = variant;
                    /**
                     * reconstruction des modules de selection.
                     * (on reconstruit une seule fois)
                     */
                    //self.delai_traitement_en_jour = variant.delai;
                    await self.surchargeDelaiTraitement(self.date_de_reference);
                    self.plage_mn = variant.creneau;
                    //self.re_construction_module++;
                    /**
                     *
                     */
                    resolve("CheckTypeLivraison");
                    return true;
                  }
                });
                return false;
              }
            });
            resolve("CheckTypeLivraison");
            return false;
          });
        };

        /**
         * si aucun type de selestion n'est definit alors on ajoute, celui de la valeur par defaut.
         */
        var addDefultTypeLivraison = function() {
          if (!check_type_livraison) {
            //console.log('aucun type de Livraison dans la panier');
            $.each(self.variants, function(id, variant) {
              if (variant.type == self.default_type_static) {
                self.addProduct(id);
                self.default_type = self.default_type_static;
                check_type_livraison = true;
              }
            });
          }
        };

        var execution = async function() {
          //console.log('==Début analyse des données dans le panier == \n\n');
          await CheckTypeLivraison();
          //console.log('fin de etape : ', etape1, ' \n\n ');
          //await getAttributes();
          //console.log('fin de etape : ', etape2, ' \n\n ');

          await addDefultTypeLivraison();
          //console.log('fin de etape : ', etape3, ' \n\n ');
          await checkAdress();
          //console.log('fin de etape : ', etape4, ' \n\n ');
          /**
           * Si le type de livraison existe on reconstruit les modules.
           */
          if (check_type_livraison) {
            self.re_construction_module++;
          }
        };
        execution();
      }
    },
    open_map: function() {
      var self = this;
      $("#trigger-simple-map2" + self.model_ref).trigger("click");
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
        alert("Variante non definit");
      }
    },
    addProduct: function(id_product, qte = 1) {
      var self = this;
      $.post("/cart/add", {
        id: id_product,
        quantity: qte
      })
        .done(function() {
          /**
           * return html
           */
          console.log(" Product add : ", id_product);
          self.variant_in_cart = id_product;
          var selection = ".map-localisation-wbu";
          self.remove_cover_wait(selection);
        })
        .fail(function() {
          if (window.location.host != "modulejs.kksa") {
            alert("Votre panier est vide");
          }
          setTimeout(function() {
            var selection = ".map-localisation-wbu";
            self.remove_cover_wait(selection);
          }, 1000);
        });
    },
    save_attribute_cart: function(datas, apply_callback = true) {
      var self = this;
      return new Promise(resolve => {
        self.ajax_watch_attribute = 1;
        $.post(self.url, datas)
          .done(function() {
            /**
             * return html
             */
            console.log(" MAJ des attributs : ", datas);
            var selection = ".map-localisation-wbu";
            self.remove_cover_wait(selection);
            if (apply_callback) {
              self.ajax_watch_attribute = 2;
            }
            resolve(true);
          })
          .fail(function() {
            //alert( "error" );
            self.ajax_watch_attribute = 3;
            resolve(false);
          });
      });
    },
    /**
     * supprime un produit /ou supprime et ajoute un autre.( modifier la variante)
     */
    deleteProduct: function(id_product, new_product = null) {
      var self = this;
      var product = {
        updates: {}
      };
      product.updates[id_product] = 0;
      $.post("/cart/update", product)
        .done(function() {
          /**
           * Return html
           */
          console.log(" Product remove : ", id_product);
          if (new_product) {
            self.addProduct(new_product);
          } else {
            var selection = ".map-localisation-wbu";
            self.remove_cover_wait(selection);
          }
        })
        .fail(function() {
          if (window.location.host != "modulejs.kksa") {
            alert("Votre panier est vide");
          }
          setTimeout(function() {
            var selection = ".map-localisation-wbu";
            self.remove_cover_wait(selection);
          }, 1000);
        });
    },
    back_to_cart: function() {
      var self = this;
      var selection = ".map-localisation-wbu";
      self.hidden_block(selection, "back");
    },
    get_localisation: function() {
      var wbu_localisation_map = Cookies.get("wbu_localisation_map");
      if (wbu_localisation_map) {
        var datas = {
          attributes: {
            localisation: wbu_localisation_map
          }
        };
        this.url = "/cart/update";
        this.save_attribute_cart(datas, false);
        this.check_adress_validate = true;
      } else {
        this.check_adress_validate = false;
      }
      return true;
    },
    hidden_block: function(selection, action = "continue") {
      var self = this;
      $(selection).addClass("wbu-block-opacity");
      if (action == "continue") {
        $(selection).animate(
          {
            opacity: 0.5
          },
          1000,
          "linear",
          function() {
            self.show_selection = true;
            $(".map-localisation-wbu.container .element-visible").css(
              "display",
              "block"
            );
            $(selection).fadeOut(100, function() {
              $(".map-localisation-wbu.container .element-visible").css(
                "display",
                "block"
              );
              $(selection).removeClass("wbu-block-opacity");
            });
          }
        );
      } else {
        $(selection).animate(
          {
            opacity: 0.5
          },
          1000,
          "linear",
          function() {
            self.show_selection = false;
            $(self.selection_back).fadeIn(100, function() {
              $(self.selection_back).css({
                opacity: 1
              });
              $(selection).css({
                opacity: 1
              });
            });
          }
        );
      }
    },
    add_cover_wait: function(selection) {
      $(selection).addClass("wbu-block-opacity");
    },
    remove_cover_wait: function(selection) {
      $(selection).removeClass("wbu-block-opacity");
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
    set_date_reference(datas) {
      this.default_date_calendar = datas;
    }
  }
};
</script>
