<template>
  <div class="block-left">
    <div>
      <h3 class="title" v-html="titre"></h3>
    </div>
    <ul class="type-livraison">
      <li
        v-for="(type, index) in types_livraison"
        @click="select_type_tab($event, index)"
        :key="index"
        :class="[type.active ? 'active' : '', type.type ? type.type : '']"
      >
        <h4 class="title">
          {{ type.titre }} <small v-html="display_prise(type.montant)"></small>
        </h4>
        <span
          class="d-block"
          v-for="(body_text, key) in type.body"
          v-html="body_text"
          :key="key"
        ></span>
      </li>
    </ul>
    <div v-if="show_adresse">
      <h3 class="title">Adresse</h3>
      <div>
        <strong v-html="adresse_name"></strong>
      </div>
    </div>
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

export default {
  name: "TypeLivraison",
  props: {
    datas: [Object, Array, String, Number],
    id_html: {
      type: String,
      default: ""
    },
    default_type: {
      type: [String, Number],
      default: 0
    },
    blocks_type_livraisons: {
      type: Array
    }
  },
  data: function() {
    return {
      titre: "Types de livraison",
      types_livraison: [],
      show_adresse: false,
      adresse_name: ""
    };
  },
  mounted: function() {
    //console.log('contenu dans default_type, ', this.default_type);
    this.buildTypes();
    this.adresse_name = Cookies.get("wbu_localisation_map");
    if (this.adresse_name) {
      this.show_adresse = true;
    }
  },
  watch: {
    default_type: function() {
      //console.log('MAJ de default_type : ', this.default_type)
      this.buildTypes();
    }
  },
  methods: {
    select_type_tab: function(event, index) {
      var self = this;
      $(".map-localisation-wbu .type-livraison li").removeClass("active");
      if (event.target.localName == "li") {
        $(event.target).addClass("active");
      } else if (event.target.localName == "small") {
        $(event.target)
          .parent()
          .parent()
          .addClass("active");
      } else {
        $(event.target)
          .parent()
          .addClass("active");
      }
      if (this.types_livraison[index]) {
        self.$emit("ev_change_type_livraison", self.types_livraison[index]);
      } else {
        console.log("error");
      }
    },
    display_prise: function(price) {
      if (price == 0) {
        return "+0€"; //'FREE';
      } else {
        return "+" + price + "€";
      }
    },
    buildTypes: function() {
      var self = this;
      var types_livraison = self.blocks_type_livraisons;
      $.each(types_livraison, function(i, type) {
        //console.log('Valeur seletionné pour type de livraison : ', self.default_type);
        if (type.type == self.default_type) {
          types_livraison[i].active = true;
        }
      });
      //console.log('types_livraison', types_livraison);
      this.types_livraison = types_livraison;
    }
  }
};
</script>
