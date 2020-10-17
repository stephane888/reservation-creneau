<template>
  <div>
    <transition name="fade" mode="out-in">
      <div class="creneaux-mbt--block mt-5" v-show="show">
        <div>
          <h1 class="text-left font-weight-bold" v-html="titre_module"></h1>
        </div>
        <type-livraison
          :blocks_type_livraisons="blocks_type_livraisons"
          @ev_change_type_livraison="ev_change_type_livraison"
          ref="typelivraison"
        >
          <template v-slot:alert>
            <div class="col-md-12 ">
              <alert
                @ev_alert_close="alert_close"
                :show_alert="show_alert"
                :alert_message="alert_message"
                :alert_attribut_class="alert_attribut_class"
              ></alert>
            </div>
          </template>
          <template>
            <div class="col-md-7">
              <selectionhoraire
                :collecte_delai_jour="collecte_delai_jour"
                :collecte_jour_desactivee="collecte_jour_desactivee"
                :collecte_date_desactivee="collecte_date_desactivee"
                :collecte_interval="collecte_interval"
                :collecte_configs="collecte_configs"
                :collecte_current_date="collecte_current_date"
                :livraison_delai_jour="livraison_delai_jour"
                :livraison_jour_desactivee="livraison_jour_desactivee"
                :livraison_date_desactivee="livraison_date_desactivee"
                :livraison_interval="livraison_interval"
                :livraison_configs="TypeLivraison"
                :livraison_current_date="livraison_current_date"
                :nombre_semaine="nombre_semaine"
                :nombre_res_creneau="nombre_res_creneau"
                :plage_heures_valide="plage_heures_valide"
                :disable_heureday="disable_heureday"
                :disable_heuredate="disable_heuredate"
                :url_get_creneau="url_get_creneau"
                ref="selectionhoraire"
                @ev_creneau_collecte="ev_creneau_collecte"
                @ev_creneau_livraison="ev_creneau_livraison"
              ></selectionhoraire>
            </div>
          </template>
        </type-livraison>
        <div class="londing-cover dynamique d-flex" v-if="show && show_cover">
          <VueLoading
            type="bars"
            color="#00a3dd"
            :size="{ width: '90px', height: '50px' }"
          ></VueLoading>
        </div>
        <!--
        <div>
          <pre class="d-none0 border p-3">app_env_prod {{ app_env_prod }}</pre>
          <pre class="d-none0  border p-3">
            creneau_collecte: {{ creneau_collecte }}
          </pre>
          <pre class="d-none0  border p-3">
            creneau_livraison: {{ creneau_livraison }}
          </pre>

          <pre class="d-none0  border p-3">
            TypeLivraison: {{ TypeLivraison }}
          </pre>
        </div>
        -->
      </div>
    </transition>
  </div>
</template>

<script>
var $;
if (window.jQuery) {
  $ = window.jQuery;
} else if (window.$) {
  $ = window.$;
}
import TypeLivraison from "/siteweb/PluginsModules/stephane888/wbu-components/src/components/Crenneaux/v2/TypeLivraison.vue";
import SelectionHoraire from "/siteweb/PluginsModules/stephane888/wbu-components/src/components/Crenneaux/v2/SelectionCreneau.vue";
import { VueLoading } from "vue-loading-template";
import Alert from "/siteweb/PluginsModules/stephane888/wbu-components/src/components/Alert/index.vue";
export default {
  name: "CrenneauV2",
  props: {
    /**
     * provider @TypeLivraison
     */
    blocks_type_livraisons: {
      type: Array
    },
    titre_module: {
      type: String,
      default: "Finaliser la commande"
    },
    /**
     * provider @SelectionCreneau
     */
    nombre_semaine: {
      type: Number
    },
    /**
     * provider @selec
     */
    nombre_res_creneau: {
      type: Number
    },
    /**
     * provider @SelectionCreneau.
     */
    plage_heures_valide: {
      type: Array
    },
    /**
     * @selectionCreneau
     */
    disable_heureday: {
      type: Array
    },
    /**
     * @selectionCreneau
     */
    disable_heuredate: {
      type: Array
    },
    /**
     * provider @SelectionCreneau
     */
    collecte_delai_jour: {
      type: Number
    },
    /**
     * provider @SelectionCreneau
     */
    collecte_jour_desactivee: {
      type: Array
    },
    /**
     * provider @SelectionCreneau
     */
    collecte_date_desactivee: {
      type: Array
    },
    /**
     *provider @SelectionCrenenau
     */
    collecte_interval: {
      type: Number
    },
    collecte_current_date: {
      type: Object
    },
    /**
     * provider @SelectionCreneau
     */

    livraison_delai_jour: {
      type: Number
    },

    livraison_jour_desactivee: {
      type: Array
    },
    /**
     * provider @SelectionCreneau
     */
    livraison_date_desactivee: {
      type: Array
    },
    /**
     * provider @SelectionCreneau
     */
    livraison_interval: {
      type: Number
    },
    livraison_current_date: {
      type: Object
    },
    url_save_creneau: {
      type: String,
      default: "http://habeuk.kksa/api/shopify/creneaux/add"
    },
    url_get_creneau: {
      type: String
    },
    app_env_prod: {
      type: Boolean,
      default: true
    }
  },
  components: {
    "type-livraison": TypeLivraison,
    selectionhoraire: SelectionHoraire,
    alert: Alert,
    VueLoading
  },
  data() {
    return {
      collecte_configs: {},
      VueCollecte: {},
      VueLivraison: {},
      show: false,
      show_cover: false,
      /**
       * Alert module
       */
      show_alert: false,
      alert_message: "",
      alert_attribut_class: "alert-primary",
      /**
       * Contient les valeurs des creneaux.
       */
      creneau_livraison: "",
      creneau_collecte: "",
      /**
       * Contient la valeur courante de type de livraiosn.( valeur fournit par la configuration ).
       * ne doit pas etre vide avant la vilidation.
       */
      TypeLivraison: {},
      /**
       * Coontient la valeur de type de livraison dans la panier.
       */
      CartTypeLivraison: "",
      // contient les données du panier.
      cart: "",
      //
      VueTypelivraison: "",
      livraison_app_date_current_string: "",
      collecte_app_date_current_string: ""
    };
  },
  mounted() {
    console.log("init index");
    this.VueCollecte = this.$refs.selectionhoraire.$refs.collecte;
    this.VueLivraison = this.$refs.selectionhoraire.$refs.livraison;
    this.show = true;
    this.VueTypelivraison = this.$refs.typelivraison;
    this.initcreneau();
  },
  methods: {
    /**
     * Charge le panier.
     * Retourne true si la requte est terminée avec succes et false si non.
     */
    loadcart: function() {
      var self = this;
      return new Promise((resolve, reject) => {
        self.show_cover = true;
        $.getJSON("/cart.js", function(cart, textStatus) {
          console.log("Panier textStatus : ", cart);
          self.show_cover = false;
          if (textStatus) {
            self.cart = cart;
            resolve(true);
          } else {
            reject(false);
          }
        }).fail(function() {
          console.log("Impossible de recuperer le panier");
          self.show_cover = false;
          if (self.app_env_prod) {
            reject(false);
          } else {
            resolve(false);
          }
        });
      });
    },
    async initcreneau() {
      // Valide pour les tests uniquement.
      if (!this.app_env_prod) {
        this.setEvant();
      }
      /**/
      //on modifie les html
      this.HideStaticLoading();
      // On charge la panier.
      var status_cart = await this.loadcart();
      if (status_cart) {
        await this.getProductType();
        /**
         * Si les deux id sont different cela peut traduire que l'utilisateur a precedamant fait * une autre selection.
         * Bref : on concerve la valeur presente dans la panier.
         */
        if (
          this.TypeLivraison &&
          this.CartTypeLivraison.id !== this.TypeLivraison.id
        ) {
          this.apply_type_livraison_by_id(this.CartTypeLivraison.id);
        }
        //on ecoute l'evenement
        this.setEvant();
      }
    },

    /**
     * Permet de comparer le type de livraison dans le panier et celui en affichage.
     *
     */

    /**
     * @return l'object (type de livraison) ou false, si cest vide.
     */
    async getProductType() {
      if (this.cart && this.cart.item_count > 0) {
        for (const i in this.cart.items) {
          var product = this.cart.items[i];
          if (this.typeLivraisonIds.includes(product.id)) {
            this.CartTypeLivraison = product;
            return product;
          }
        }
      } else {
        return false;
      }
    },
    /**
     * Permet à un programme externe/interne d'execute le processus de sauvegarde.
     */
    setEvant() {
      var self = this;
      //console.log("init setEvent");
      $(document).on("SaveCreneauxChechout", function(elem) {
        self.SaveCreneau(elem);
      });
    },
    /**
     * Processus de sauvegarde.
     */
    async SaveCreneau(elem = null) {
      var test = await this.verification();
      if (test) {
        var attribut = await this.buildAttribut();
        await this.SaveAttributeCart(attribut);
        //console.log("Attribut : ", attribut);
        //on verifie que le panier est ok.
        await this.loadcart();
        //console.log("new cart : ", this.cart);
        if (
          (this.cart &&
            this.cart.attributes &&
            this.cart.attributes.livraison) ||
          !this.app_env_prod
        ) {
          await this.SaveCreneauOnApi();
          $(".cart-checkout .loadding", elem.target).removeClass("fa-spin");
          //alert("");
          this.triggerCheckout();
        } else {
          this.show_alert = true;
          this.alert_attribut_class = "alert-danger ml-md-4";
          this.alert_message +=
            '- Une erreur s"est produite lors de la sauvegarde de vos informations. <br /> Verifier votre connexion et actualiser la page <br />';
          return false;
        }
      } else {
        if (elem && elem.target) {
          $(".cart-checkout .submit-cart-test", elem.target).addClass(
            "bg-danger"
          );
          $(".cart-checkout .loadding", elem.target).removeClass("fa-spin");
        }
      }
    },
    SaveCreneauOnApi() {
      var self = this;
      return new Promise(resolve => {
        var url = "date_collecte=";
        url += encodeURIComponent(
          self.creneau_collecte.date.format("DD-MM-YYYY HH:mm:ss")
        );
        url +=
          "&date_livraison=" +
          encodeURIComponent(
            self.creneau_livraison.date.format("DD-MM-YYYY HH:mm:ss")
          );
        url +=
          "&creneau_livraison=" +
          encodeURIComponent(self.creneau_livraison.creneau.begin) +
          "-";
        url += encodeURIComponent(self.creneau_livraison.creneau.end);
        url +=
          "&creneau_collecte=" +
          encodeURIComponent(self.creneau_collecte.creneau.begin) +
          "-";
        url += encodeURIComponent(self.creneau_collecte.creneau.end);

        url += "&creneau_type=" + encodeURIComponent(self.TypeLivraison.type);
        var ifrm = document.createElement("iframe");
        ifrm.setAttribute("src", self.url_save_creneau + "?" + url);
        ifrm.setAttribute("style", "display:none !important");
        ifrm.style.width = "640px";
        ifrm.style.height = "480px";
        document.body.appendChild(ifrm);
        resolve(true);
        /**
        $.getJSON(self.url_save_creneau + "?" + url, function(
          cart,
          textStatus
        ) {
          if (textStatus) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
        /**/
      });
    },
    triggerCheckout() {
      $(".creneaux-mbt .cart-checkout .submit-cart").trigger("click");
    },
    buildAttribut() {
      //
      var livraison = "Livraison";
      livraison += "\r\n";
      livraison +=
        "Date :" + this.creneau_livraison.date.format("DD-MM-YYYY HH:mm:ss");
      livraison += "\r\n";
      livraison +=
        "Creneau :" +
        this.creneau_livraison.creneau.begin +
        " - " +
        this.creneau_livraison.creneau.end;
      //
      var collecte = "Collecte";
      collecte += "\r\n";
      collecte +=
        "Date :" + this.creneau_collecte.date.format("DD-MM-YYYY HH:mm:ss");
      collecte += "\r\n";
      collecte +=
        "Creneau :" +
        this.creneau_collecte.creneau.begin +
        " - " +
        this.creneau_collecte.creneau.end;
      //
      return {
        attributes: {
          localisation: this.VueTypelivraison.current_address,
          recuperation: collecte,
          livraison: livraison
        }
      };
    },
    async verification() {
      this.alert_message = "";
      this.show_alert = false;
      var test1 = await this.verificationTypeLivraison();
      var test2 = await this.VerificationCrenaux();
      var test3 = await this.VerificationAdress();
      if (test1 && test2 && test3) {
        return true;
      } else {
        this.show_alert = true;
        this.alert_attribut_class = "alert-danger ml-md-4";
        return false;
      }
    },
    async VerificationAdress() {
      if (!this.app_env_prod) {
        return true;
      }
      if (
        this.VueTypelivraison &&
        this.VueTypelivraison.current_address != ""
      ) {
        return true;
      } else {
        this.alert_message += "- Vous devez selectionner votre adresse <br />";
        return false;
      }
    },
    async verificationTypeLivraison() {
      if (!this.app_env_prod) {
        return true;
      }
      if (this.CartTypeLivraison && this.CartTypeLivraison.id) {
        return true;
      } else {
        this.alert_message +=
          "- Vous devez selectionner un mode de livraison.<br />";
        return false;
      }
    },
    async VerificationCrenaux() {
      var livraison = true;
      var collecte = true;
      //livraison
      if (
        this.creneau_livraison &&
        this.creneau_livraison.creneau &&
        this.creneau_livraison.creneau.begin
      ) {
        //
      } else {
        livraison = false;
        this.alert_message +=
          "- Vous devez selectionner un creneau pour la livraison.<br />";
      }
      if (
        this.creneau_livraison &&
        this.creneau_livraison.date &&
        this.creneau_livraison.date.isValid()
      ) {
        //
      } else {
        livraison = false;
        this.alert_message +=
          "- Vous devez selectionner une date pour la livraison.<br />";
      }
      //collecte
      if (
        this.creneau_collecte &&
        this.creneau_collecte.creneau &&
        this.creneau_collecte.creneau.begin
      ) {
        //
      } else {
        collecte = false;
        this.alert_message +=
          "- Vous devez selectionner un creneau pour la collecte.<br />";
      }
      if (
        this.creneau_collecte &&
        this.creneau_collecte.date &&
        this.creneau_collecte.date.isValid()
      ) {
        //
      } else {
        collecte = false;
        this.alert_message +=
          "- Vous devez selectionner une date pour la collecte.<br />";
      }
      if (livraison && collecte) {
        return true;
      } else {
        return false;
      }
    },
    addProduct: function(id_product, qte = 1) {
      var self = this;
      return new Promise((resoleve, reject) => {
        self.show_cover = true;
        $.post("/cart/add", {
          id: id_product,
          quantity: qte
        })
          .done(function() {
            /**
             * return html
             */
            console.log(" Product add : ", id_product);
            self.show_cover = false;
            resoleve(true);
          })
          .fail(function() {
            self.show_cover = false;
            reject(false);
          });
      });
    },
    /**
     * supprime un produit /ou supprime et ajoute un autre.( modifier la variante)
     */
    deleteUpdateProduct(id_product, new_product = null) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var product = {
          updates: {}
        };
        self.show_cover = true;
        product.updates[id_product] = 0;
        $.post("/cart/update", product)
          .done(function() {
            /**
             * Return html
             */
            console.log(" Product remove : ", id_product);
            if (new_product) {
              resolve(self.addProduct(new_product));
            } else {
              self.show_cover = false;
              resolve(true);
              return true;
            }
          })
          .fail(function() {
            self.show_cover = false;
            if (self.app_env_prod) {
              reject(false);
            } else {
              resolve(false);
            }
          });
      });
    },
    SaveAttributeCart(datas) {
      var self = this;
      return new Promise((resolve, reject) => {
        self.show_cover = true;
        $.post("/cart/update", datas)
          .done(function() {
            self.show_cover = false;
            resolve(true);
          })
          .fail(function() {
            self.show_cover = false;
            if (self.app_env_prod) {
              reject(false);
            } else {
              resolve(false);
            }
          });
      });
    },
    ev_change_type_livraison(datas) {
      //console.log("ev_change_type_livraison : ", datas);
      //console.log("this.VueCollecte", this.VueCollecte);
      //on MAJ la livraison à partir des valeurs de types de livraiosns.
      this.TypeLivraison = datas;
      //on MAJ la collecte à partir des valeurs de types de livraiosns.
      var collecte = {
        creneau: datas.creneau,
        delai:
          this.VueCollecte && this.VueCollecte.delai_jour
            ? this.VueCollecte.delai_jour
            : 0, // pour collecte le decalage est fixe ou definit par la valeur de this.delai_jour
        delai_next_creneau: datas.delai_next_creneau
      };
      this.collecte_configs = collecte;
      // MAJ le type de livraiosn dans le panier.
      this.CartTypeLivraisonUpdate();
    },
    async CartTypeLivraisonUpdate() {
      if (this.cart && this.cart.item_count > 0) {
        if (this.CartTypeLivraison && this.CartTypeLivraison !== "") {
          if (this.CartTypeLivraison.id != this.TypeLivraison.id) {
            await this.deleteUpdateProduct(
              this.CartTypeLivraison.id,
              this.TypeLivraison.id
            );
            await this.loadcart();
            await this.getProductType();
          }
        } else {
          await this.addProduct(this.TypeLivraison.id);
          await this.loadcart();
          await this.getProductType();
        }
      }
    },
    /**
     * Applique un type de livraison.
     */
    apply_type_livraison_by_id(id) {
      for (const i in this.blocks_type_livraisons) {
        if (id == this.blocks_type_livraisons[i].id) {
          this.VueTypelivraison.select_type_tab(i);
          this.ev_change_type_livraison(this.blocks_type_livraisons[i]);
        }
      }
    },
    ev_creneau_livraison(creneau) {
      this.creneau_livraison = creneau;
    },

    ev_creneau_collecte(creneau) {
      this.creneau_collecte = creneau;
    },
    HideStaticLoading() {
      $(".londing-cover.static").fadeOut(600);
    },
    alert_close() {
      this.show_alert = false;
    }
  },
  computed: {
    /**
     * Contient les id de type de livraisons.
     */
    typeLivraisonIds: {
      get() {
        var ids = [];
        for (const i in this.blocks_type_livraisons) {
          ids.push(this.blocks_type_livraisons[i].id);
        }
        return ids;
      }
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "/siteweb/PluginsModules/stephane888/wbu-components/src/components/Crenneaux/v2/css/default.scss";
</style>
