<?php

require_once '../api/init/init.php';
//if(isset($_GET['build'])){_load_scss();}

$ROOT =ROOT_WBU;
$fullRoot = FULLROOT_WBU;

//echo $fullRoot;
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">


    <title>Localisation</title>


    <!-- jquery.modal.min.css -->
    <!-- Custom styles for this template -->
	<link href="<?php echo $ROOT.'/'; ?>selection_creneau/css/style.css?n=<?php echo time();?>" rel="stylesheet">


    <!-- Jquery -->
    <script src="<?php echo $ROOT.'/'; ?>api/js/jquery.min.js"></script>
    <!-- vuejs -->
    <script src="<?php echo $ROOT.'/'; ?>api/js/vuejs/vue.js"></script>
<style type="text/css">
    .logo {
    width: 50px;
}
</style>

  </head>

  <body data-root="<?php echo $ROOT; ?>">
    <nav class="navbar navbar-light fixed-top bg-white flex-md-nowrap p-0 header ">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0 text-center bg-white shadow-none" href="#"><img src="<?php echo $ROOT.'/'; ?>api/img/logo-wbu.jpg" class="logo" /> </a>

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
        	<?php include_once $fullRoot.'/selection_creneau/selection-horaire.php'; ?>
  		<div id="displayErrorAjax"></div>
	</main>
      </div>
    </div>


    <!-- include template selection-horaire-valid.js -->
    <?php include_once $fullRoot.'/api/templates/vuejs-template.html.twig'; ?>
    <script src="<?php echo $ROOT.'/'; ?>selection_creneau/selection-horaire.js?n=<?php echo time();?>"></script>
    <script src="<?php echo $ROOT.'/'; ?>api/plugin/js-cookie/js.cookie.min.js"></script>
	<!--  -->
	<script src="<?php echo $ROOT.'/'; ?>selection_creneau/js/jquery.modal.min.js"></script>
  </body>
</html>
