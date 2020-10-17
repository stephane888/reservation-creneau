<?php
/**
 * version utilisable 15-10-2020
 */
require_once '../api/init/init.php';
// if(isset($_GET['build'])){_load_scss();}

$ROOT = ROOT_WBU;
$fullRoot = FULLROOT_WBU;
// https://github.com/emn178/markdown/blob/master/README.md
// echo $fullRoot;
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.0/moment-with-locales.min.js"></script>

    <title>Localisation</title>


    <!-- jquery.modal.min.css -->
    <!-- Custom styles for this template -->
	<link href="<?php

echo $ROOT . '/';
?>selection_creneau/css/style.css?n=<?php

echo time();
?>" rel="stylesheet">


    <!-- Jquery -->
    <script src="<?php

    echo $ROOT . '/';
    ?>api/js/jquery.min.js"></script>
    <!-- vuejs -->
    <script src="<?php

    echo $ROOT . '/';
    ?>api/js/vuejs/vue.js"></script>
<script src="/selection_creneau/vuejs/CrenSelect/CrenSelect.umd.min.js?n="<?php time()?>></script>
<style type="text/css">
    .logo {
    width: 50px;
}
</style>

  </head>

  <body data-root="<?php

  echo $ROOT;
  ?>">
    <nav class="navbar navbar-light fixed-top bg-white flex-md-nowrap p-0 header ">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0 text-center bg-white shadow-none" href="#"><img src="<?php

      echo $ROOT . '/';
      ?>api/img/logo-wbu.jpg" class="logo" /> </a>

      <ul class="navbar-nav px-3">
        <li class="nav-item">
                <a class="nav-link" href="#" target="_blanck">
                	<i class="fas fa-database mr-2"></i> Config
                </a>
        </li>
      </ul>
    </nav>

    <div class="container-fluid">
      <div class="row mt-3">
        <main role="main" class="col-md-12 col-12 py-5" >
        	<section id="selectionCrenneau">
        		<crenneau-selection :jour_desactiver="jour_desactiver" :blocks_type_livraisons="blocks_type_livraisons"></crenneau-selection>
        	</section>
  			<div id="displayErrorAjax"></div>
		</main>
      </div>
    </div>

<script>
    if(window.location.host == 'modulejs.kksa'){
        //window.wbu_date_now = new Date('2019-12-01T03:00'); ////'{{"now" | date: "%Y-%m-%dT%H:%M"}}';
        // window.wbu_date_now = new Date('2020-05-08T09:48');
        window.wbu_date_now = new Date();
        window.selection_plage_heure = '{"selection_plage_heure":{"livraison":{"24":{"date":"10/12/2019","ht_debut":7,"mn_debut":30},"25":{"date":"10/12/2019","ht_debut":8,"mn_debut":0},"26":{"date":"28/11/2019","ht_debut":7,"mn_debut":30},"27":{"date":"30/11/2019","ht_debut":8,"mn_debut":0},"28":{"date":"30/11/2019","ht_debut":14,"mn_debut":0},"29":{"date":"2/12/2019","ht_debut":18,"mn_debut":0},"30":{"date":"2/12/2019","ht_debut":18,"mn_debut":30}},"recuperation":{"21":{"date":"9/12/2019","ht_debut":7,"mn_debut":30},"22":{"date":"9/12/2019","ht_debut":8,"mn_debut":0},"26":{"date":"28/11/2019","ht_debut":18,"mn_debut":0},"28":{"date":"28/11/2019","ht_debut":17,"mn_debut":0}}}}';////'{{ wbu_metafield.wbu | json }}';
    }else{
        window.wbu_date_now = '{{"now" | date: "%Y-%m-%dT%H:%M"}}';
    }

window.wbu_lundi = '7:30|21:30';
window.wbu_mardi = '8:30|21:30';
window.wbu_mercredi = '9:30|21:30';
window.wbu_jeudi = '10:30|21:30';
window.wbu_vendredi = '11:30|21:30';
window.wbu_samedi = '12:30|18:00';
window.wbu_dimanche = '13:30|21:30';
// Jours désactiver
window.wbu_lundi_disable = false;
window.wbu_mardi_disable = false;
window.wbu_mercredi_disable = false;
window.wbu_jeudi_disable = false;
window.wbu_vendredi_disable = false;
window.wbu_samedi_disable = true;
window.wbu_dimanche_disable = true;
// delai de livraison
 window.wbu_free_delai = 5;
 window.wbu_plus_delai = 2;
 window.wbu_express_delai = 1;
</script>


	<!--  -->
	<script src="/selection_creneau/js/app.js"></script>
	<script src="<?php

echo $ROOT . '/';
?>selection_creneau/js/jquery.modal.min.js"></script>
  </body>
</html>
