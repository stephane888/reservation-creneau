<?php
require_once '../api/init/init.php';
// if(isset($_GET['build'])){_load_scss();}

$ROOT = ROOT_WBU;
$fullRoot = FULLROOT_WBU;

// echo $fullRoot;
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" type="image/png" sizes="32x32" href="//cdn.shopify.com/s/files/1/0013/2123/8594/t/5/assets/favicon-32x32.png?1823137142525308715">
		<!-- Google font Roboto -->
		<link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400" rel="stylesheet">

    <title>Selection des horaires</title>


    <!-- Bootstrap core CSS -->
    <link href="<?php

    echo $ROOT . '/';
    ?>api/plugin/bootstrap-4.1.1/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Font Awesome  -->
    <!-- Our project just needs Font Awesome Solid[fas fa-user] + Brands[fab fa-github-square] + regular[far fa-calendar-alt] -->
   	<link href="<?php

    echo $ROOT . '/';
    ?>api/plugin/fontawesome-free-5.6.3-web/css/fontawesome.min.css" rel="stylesheet">
  	<link href="<?php

  echo $ROOT . '/';
  ?>api/plugin/fontawesome-free-5.6.3-web/css/brands.min.css" rel="stylesheet">
    <link href="<?php

    echo $ROOT . '/';
    ?>api/plugin/fontawesome-free-5.6.3-web/css/solid.min.css" rel="stylesheet">
    <link href="<?php

    echo $ROOT . '/';
    ?>api/plugin/fontawesome-free-5.6.3-web/css/regular.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="<?php

    echo $ROOT . '/';
    ?>selection_horaire/css/dashboard.css" rel="stylesheet">
    <link href="<?php

    echo $ROOT . '/';
    ?>selection_horaire/css/style.css" rel="stylesheet">

    <!-- Jquery -->
    <script src="<?php

    echo $ROOT . '/';
    ?>api/js/jquery.min.js"></script>
    <!-- vuejs -->
    <script src="<?php

    echo $ROOT . '/';
    ?>api/js/vuejs/vue.js"></script>


	<script src="/selection_creneau/vuejs/CrenSelect/CrenSelect.umd.min.js"></script>
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
					<?php

    include_once $fullRoot . '/selection_horaire/selection_horaire.php';
    ?>
  			<div id="displayErrorAjax"></div>
			</main>
      </div>
    </div>





    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="<?php

    echo $ROOT . '/';
    ?>api/plugin/bootstrap-4.1.1/assets/js/vendor/popper.min.js"></script>
    <script src="<?php

    echo $ROOT . '/';
    ?>api/plugin/bootstrap-4.1.1/dist/js/bootstrap.min.js"></script>


  </body>
</html>
