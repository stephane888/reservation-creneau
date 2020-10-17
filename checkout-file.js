/**
Ceci permet de corriger un problème sur iOS. Sur ce navigateur, lorsque l'on fait un retour
 arrière, le navigateur affiche directement la page précédente du cache, en ignorant tout ce
  qui a pu se passer (comme l'ajout d'un produit au panier). Ceci permet de détecter ce retour arrière en rechargeant la page.
	*/
window.onpageshow = function(event) {
  if (event.persisted) {
    window.location.reload();
  }
};

function resolveAfter2Seconds(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

async function f1() {
  var x = await resolveAfter2Seconds(10);
  console.log(x); // 10
}
f1();

/*
Gist related to this blog post:
http://freakdesign.com.au/blogs/news/29561473
*/

/*
    JS INECTION CODE
    ADDS STYLESHEET TO SHOPIFY CHECKOUT
*/
if (typeof Checkout === 'object') {
  console.log(' Checkout is ok ');
}

function waitCheckoutInit() {
  if (typeof Checkout === 'object') {
    console.log('init checkout : ', Checkout);
    if (typeof Checkout.$ === 'function') {
      /* get the current cdn id so we know we are using the latest file */
      var images = Checkout.$('img');
      var cdn = '';
      var uid = [];
      if (images.length) {
        for (var i = 0; i < images.length; i++) {
          var src = images[i].src;
          if (src.indexOf('?') > -1) {
            var urlArray = src.split('/');
            if (urlArray.length > 7) {
              uid = [urlArray[6], urlArray[7], urlArray[9]];
              cdn = src.split('?').pop();
              break;
            }
          }
        }
      }
      console.log('cdn : ', cdn, 'uid : ', uid);
      if (uid.length === 3) {
        /* jquery */
        var js = document.createElement('script');
        js.type = 'text/javascript';
        js.src = '//ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js';
        document.getElementsByTagName('head')[0].appendChild(js);

        /* add your css file */
        var css = document.createElement('link');
        css.type = 'text/css';
        css.rel = 'stylesheet';
        css.href =
          '//cdn.shopify.com/s/files/1/0267/8875/7564/t/7/assets/checkout-process.scss.css?' +
          cdn;
        document.getElementsByTagName('head')[0].appendChild(css);

        /* custom JS */
        var js = document.createElement('script');
        js.type = 'text/javascript';
        js.src =
          '//cdn.shopify.com/s/files/1/0267/8875/7564/t/7/assets/checkout-process.js?' +
          cdn;
        document.getElementsByTagName('head')[0].appendChild(js);
      }
    }
  } else {
    setTimeout(function() {
      console.log('Wait init checkout');
      waitCheckoutInit();
    }, 5900);
  }
}
waitCheckoutInit();

/* END JS INECTION CODE */

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
