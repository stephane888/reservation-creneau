<!-- selection-horaire.liquid -->
<!-- selection -->
<div id="selection_horaire" >
    <section  class="map-localisation-wbu container" v-if="show_selection" >
      <div class="row">
        <strong class="text-alert-danger element-visible" style="display:none;"> Afin d'afficher correctement les créneaux, merci de cliquer sur la date concernée </strong>
        <div class="col-sm-8">
            <div >
                <selection_horaire :id_html="'id_date_recuperation'"
                :type="'recuperation'"
                @ev_reload_livraison__date="reload_livraison__date"
                @ev_reload_livraison__creneau="reload_livraison__creneau"
                ></selection_horaire>
                <selection_horaire :id_html="'id_date_livraison'"
                :type="'livraison'"
                :default__date_select="date_recuperation"
                :default__creneau="creneau_recuperation"
                ></selection_horaire>
            </div>
        </div>

        <div class="col-sm-4">
		<type_livraison @ev_change_type_livraison="change_type_livraison" :default_type="default_type"></type_livraison>
        </div>
        <div class="col-sm-8 element-visible" style="display:none;" >
            <button @click="procced_checkout" href="#" class="button-primary cart-checkout-custom" :class="[ (valid_creneau > 0 && valid_date > 0 )? '':'disabled']">Continuer <svg aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 8 6" style="transform: rotate(-90deg);">
              <g fill="currentColor" fill-rule="evenodd">
                <polygon class="icon-chevron-down-left" points="4 5.371 7.668 1.606 6.665 .629 4 3.365"></polygon>
                <polygon class="icon-chevron-down-right" points="4 3.365 1.335 .629 1.335 .629 .332 1.606 4 5.371"></polygon>
              </g>
            </svg> </button>
                            <a href="#" @click="back_to_cart" class="cart-continue" >  <svg aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" style="transform: rotate(90deg);">
              <g fill="currentColor" fill-rule="evenodd">
                <polygon class="icon-chevron-down-left" points="4 5.371 7.668 1.606 6.665 .629 4 3.365"></polygon>
                <polygon class="icon-chevron-down-right" points="4 3.365 1.335 .629 1.335 .629 .332 1.606 4 5.371"></polygon>
              </g>
            </svg> Retourner au panier</a>
        </div>

      </div>
    </section>
</div>
<script>
if(window.location.host == 'modulejs.kksa'){
    window.wbu_date_now = new Date('2019-12-01T03:00'); ////'{{"now" | date: "%Y-%m-%dT%H:%M"}}';
    window.selection_plage_heure = '{"selection_plage_heure":{"livraison":{"24":{"date":"10/12/2019","ht_debut":7,"mn_debut":30},"25":{"date":"10/12/2019","ht_debut":8,"mn_debut":0},"26":{"date":"28/11/2019","ht_debut":7,"mn_debut":30},"27":{"date":"30/11/2019","ht_debut":8,"mn_debut":0},"28":{"date":"30/11/2019","ht_debut":14,"mn_debut":0},"29":{"date":"2/12/2019","ht_debut":18,"mn_debut":0},"30":{"date":"2/12/2019","ht_debut":18,"mn_debut":30}},"recuperation":{"21":{"date":"9/12/2019","ht_debut":7,"mn_debut":30},"22":{"date":"9/12/2019","ht_debut":8,"mn_debut":0},"26":{"date":"28/11/2019","ht_debut":18,"mn_debut":0},"28":{"date":"28/11/2019","ht_debut":17,"mn_debut":0}}}}';////'{{ wbu_metafield.wbu | json }}';
}else{
    window.wbu_date_now = '{{"now" | date: "%Y-%m-%dT%H:%M"}}';
}

</script>
<!-- templates -->

<!-- -->
<template id="templatehoraireselection">
<div class="horaireselection" :id="id_html">
	<div>
		<h3 class="title" v-html="titre"></h3>
	</div>
	<div class="content-body">
		<!-- selection du jour -->
		<ul class="tabs">
			<li v-for="(tab, index) in dates_tabs"
				@click="select_date_tab(tab.index)"
				:class="[(tab.active)? 'active':'']"><strong class="d-block"
				v-html="tab.jour"></strong> <span class="d-block" v-html="tab.mois"></span>
			</li>
		</ul>
		<section v-show="!show_texte_error">
			<!-- plage d'heure -->
			<div v-show="plage_heure">
				<ul class="list-dates">
					<li v-for="(hour, index) in horaires"><span class="plage-heure"
						:class="[(hour.active == true)? 'active':'']"
						@click="select_plage_heure(index)"> ${hour.h1} - ${hour.h2}</span>
					</li>
				</ul>
				<div v-if="display_errors_plage_heure(horaires)"
					v-html="display_errors_plage_heure(horaires)"></div>
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
					<li v-for="(day, index) in months"><span class="d-block date-day"
						:class="[(day.status == 0)? 'disable':'']"
						@click="select_date_day(day)"> ${day.date_french} <span
							class="d-block" v-html="day.month_french"></span>
					</span></li>
				</ul>
			</div>
		</section>
		<!-- texte -->
		<div v-show="show_texte_error">
			<p>Malheureusement nous ne pouvons pas accepter de commande plus de 4
				semaines à l'avance. Merci de choisir une autre date.</p>
		</div>
	</div>
	<!--  -->
</div>
</template>

<!-- -->
<template id="template-types-de-livraison">
<div class="block-left">
    <div>
        <h3 class="title" v-html="titre"></h3>
    </div>
    <ul class="type-livraison">
        <li v-for="(type, index) in types_livraison"
            @click="select_type_tab($event, index)"
            :class="[(type.active)? 'active':'', (type.type)?type.type:'']">
            <h4 class="title">
                ${type.titre} <small v-html="display_prise(type.montant)"></small>
            </h4> <span class="d-block" v-for="(body_text, key) in type.body"
            v-html="body_text"></span>
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






