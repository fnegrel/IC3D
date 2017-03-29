var Alti=new Array();
var LatLong=new Array();
var ListeAlti=new Array();
var listeRegion = new Array();
var listeTuiles = new Array();
var NewListeAlti = new Array();
var Nbl=15;
var Nbc=15;
var controls;
var clock = new THREE.Clock();
var maxalti = -10000;


var map = L.map('map').setView([51.134642,1.358618],15);
L.control.scale().addTo(map);
L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png').addTo(map);

//POYAVE 1
// Add it to the map
//var areaSelect = L.areaSelect({width:200, height:300});
//areaSelect.addTo(map);

// Read the bouding box
//var bounds = areaSelect.getBounds();

// Get a callback when the bounds change
//areaSelect.on("change", function() {
//	console.log("Bounds:", this.getBounds());
//});

// Set the dimensions of the box
//areaSelect.setDimensions({width: 500, height: 500})

// And to remove it do:
//areaSelect.remove();


//POYAVE2
var locationFilter = new L.LocationFilter().addTo(map);

var Rec = new Array();

locationFilter.on("change", function (e) {
	// Do something when the bounds change.
	// Bounds are available in `e.bounds`.



	var NE = new Array(e.bounds._northEast.lat,e.bounds._northEast.lng);
	var SE = new Array(e.bounds._southWest.lat,e.bounds._northEast.lng);
	var NW = new Array(e.bounds._northEast.lat,e.bounds._southWest.lng);
	var SW = new Array(e.bounds._southWest.lat,e.bounds._southWest.lng);

	Rec = new Array(NE,NW,SW,SE);
});

locationFilter.on("enabled", function () {
	// Do something when enabled.
});

locationFilter.on("disabled", function () {
	// Do something when disabled.
});

function Region (){
	var compteurligne = 0;
	var compteurcolonne = 0;
	var maillelong = 0.0018;
	var maillelat = maillelong/2 ;
	var NE=Rec[0];
	var NW=Rec[1];
	var SW=Rec[2];
	var SE=Rec[3];
	console.log(NE);
	listeRegion = [];
	// bon, pas le pole nord (changement de dates)
	for (var j = NW[1],finlongitude = NE[1]; j < finlongitude+maillelong; j = j+maillelong) {
		compteurcolonne=compteurcolonne+1
		compteurligne=0
		for (var k = NW[0],finlatitude = SE[0]; k > finlatitude-maillelat; k = k-maillelat) {
			compteurligne=compteurligne+1
			console.log("coucouregion")
			if (j < NE[1] ) {  longitudetemp=j}
			else { longitudetemp=NE[1],console.log("finmaillelong")}
			if (k > SE[0] ) {  latitudetemp=k}
			else { latitudetemp=SE[0],console.log("finmaillelat") }
			console.log(longitudetemp);
			console.log(latitudetemp);
			listeRegion.push([latitudetemp,longitudetemp]);
			//L.marker([latitudetemp,longitudetemp]).addTo(map);
		}
	}
	console.log(listeRegion);
	nbmaille = (compteurcolonne-1)*(compteurligne-1);
	console.log(nbmaille,compteurcolonne,compteurligne);
	return([nbmaille,compteurligne,compteurcolonne]);
}


function Mark2() {
	NewListeAlti = [];
	var format = Region();
	var listeTuiles = [];
	console.log(format);
	for (var k = 0,fink = format[1]*format[2]-format[1]; k < fink; k++) {
		if ((k+1)%format[1]==0) { console.log('je passe le point')}
		else {
			//L.marker([listeRegion[k][0],listeRegion[k][1]]).addTo(map);
			L.marker([listeRegion[k+format[1]+1][0],listeRegion[k+format[1]+1][1]]).addTo(map);
			console.log('markerpls');
			listeTuiles.push([Mark1(listeRegion[k],listeRegion[k+format[1]+1])]);
			console.log(listeTuiles);
			}




	}
   }




function Mark1(NW,SE) {



	Alti=[];
	LatLong=[];
	ListeAlti=[];
	var C=Math.abs(NW[0]-SE[0]);
	var L=Math.abs(SE[1]-NW[1]);
	var dc=L/Nbc;
	var dl=C/Nbl;
	var PP="";

	for (var j = 0,len0 = Nbl; j < len0; j++) {

		var Long=Math.round((NW[1]+j*dl)*100000000)/100000000;
		var ColonneLatLong=new Array();

		for (var i = 0,len1 = Nbc; i < len1; i++) {

			var Lat=Math.round((NW[0]-i*dc)*100000000)/100000000;
			ColonneLatLong.push([Lat,Long]);
			PP=PP+String(Lat)+","+String(Long)+"%7C";
		}
		LatLong.push(ColonneLatLong);
	}

	PP=PP.substring(0,PP.length-3);
	var url="https://maps.googleapis.com/maps/api/elevation/json?locations="+PP+"&key=AIzaSyAy2lw1yp2qpd9SgPJxNOlAHJZcUs7YgYc";
	var yql_url = 'https://query.yahooapis.com/v1/public/yql';

	$.ajax({
		//http://stackoverflow.com/questions/20035101/no-access-control-allow-origin-header-is-present-on-the-requested-resource
		url: yql_url,
		data: {
			q: 'SELECT * FROM json WHERE url="'+url+'"',
			format: 'json',
			jsonCompat: 'new',
		},
		dataType: 'jsonp',
		complete: function(data) {
			if (data.readyState === 4 && data.status === 200) {
				var Elevation=data.responseJSON.query.results.json.results;
			}

			for (var k=0,len2=Nbc*Nbl;k<len2;k++) {
				ListeAlti.push(Elevation[k].elevation);
				if (Elevation[k].elevation > maxalti){
					maxalti = Elevation[k].elevation;
				}
			}
			console.log(ListeAlti);

		},

		error: function (response) {
			alert("Error");
		}
	});

	return(ListeAlti)
}




function Affichage() {

		Format=Region();
		//return([nbmaille,compteurcolonne,compteurligne]);
		var tempArray = new Array();


		for (var k = 0,lenAlti = ListeAlti.length; k < lenAlti; k++) {

			tempArray.push(ListeAlti[k]);

			if ((k+1)%(Nbc*Nbl)==0) {
				NewListeAlti.push(tempArray);
				tempArray = [];

			}
		}

		console.log(NewListeAlti);

		console.log("coucouaffichage")
		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );


		var scene = new THREE.Scene();

		var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1500);
		camera.position.set(0, 0, maxalti);


		var material = new THREE.MeshBasicMaterial( { color: 0x999999, wireframe : true } );
		var geometry = new THREE.PlaneGeometry(60,60,Nbl-1, Nbc-1);
		var geometry2 = new THREE.BoxGeometry(1, 1, 1 );

		console.log(geometry.vertices.length)
		var compteur=0;
		var Tableau_scene = new Array();
		for (var j = 0, fin = Format[1]-1 ; j < fin; j++) {
			for (var k = 0, fin2 = Format[2]-1 ; k < fin2; k++) {
				console.log('meurs')
				if (compteur < NewListeAlti.length) {

					var geometry = new THREE.PlaneGeometry(60,60,Nbl-1, Nbc-1);
					console.log(compteur);

					for (var y = 0, len = geometry.vertices.length; y < len; y++) {



						geometry.vertices[y].z = NewListeAlti[compteur][y] ;
						console.log(NewListeAlti[compteur][y])
						console.log(compteur);
						console.log(y);

						//var plane_+String(compteur) = new THREE.Mesh(geometry, material);
						//scene.add(plane);
					}

					var material1 = new THREE.MeshBasicMaterial( { color: 0xFF0000, wireframe : true } );
					var material2 = new THREE.MeshBasicMaterial( { color: 0x0000FF, wireframe : true } );
					var material3 = new THREE.MeshBasicMaterial( { color: 0x00FF00, wireframe : true } );
					var material4 = new THREE.MeshBasicMaterial( { color: 0xD2691E, wireframe : true } );
					if (compteur == 0){
						Tableau_scene.push(new THREE.Mesh(geometry, material1));
					}
					else if (compteur == 1) {
						Tableau_scene.push(new THREE.Mesh(geometry, material2));
					}
					else if	(compteur == 2){
						Tableau_scene.push(new THREE.Mesh(geometry, material3));
					}
					else if (compteur == 3){
						Tableau_scene.push(new THREE.Mesh(geometry, material4));
					}
					else {
						Tableau_scene.push(new THREE.Mesh(geometry, material));
					}

					console.log(Tableau_scene);

					Tableau_scene[compteur].position.x = Tableau_scene[compteur].position.x-k*60;
					Tableau_scene[compteur].position.y = Tableau_scene[compteur].position.y+j*60;
					Tableau_scene[compteur].rotation.z = +90*2*Math.PI/360 ;
					compteur=compteur+1;
				}


			}
		}
		console.log(Tableau_scene);
		for (var m=0,len = Tableau_scene.length; m<len ;m++){
			scene.add(Tableau_scene[m]);
			console.log("Dessin")
		};



		//for (var i = 0, l = geometry.vertices.length; i < l; i++) {
		//geometry.vertices[i].z = ListeAlti[i] ;
		//	console.log(ListeAlti[i])
		//}

		//var plane = new THREE.Mesh(geometry, material);
		//scene.add(plane);

		var cube = new THREE.Mesh( geometry2, material );
		scene.add( cube );
		console.log("Wurst")


		// Axe du dessin



		var AxeX= new THREE.Geometry();
		var AxeY= new THREE.Geometry();
		var AxeZ= new THREE.Geometry();/*
		AxeX.vertices.push(new THREE.Vector3(0,0,0));
		AxeY.vertices.push(new THREE.Vector3(0,0,0));
		AxeZ.vertices.push(new THREE.Vector3(0,0,0));
		AxeX.vertices.push(new THREE.Vector3(70,0,0));
		AxeY.vertices.push(new THREE.Vector3(0,70,0));
		AxeZ.vertices.push(new THREE.Vector3(0,0,70));


		var material1 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var material2 = new THREE.MeshBasicMaterial( { color: 0xFF0033 } );
		var material3 = new THREE.MeshBasicMaterial( { color: 0x0000FF } );


		var line1 = new THREE.Line(AxeX, material1);
		var line2 = new THREE.Line(AxeY, material2);
		var line3 = new THREE.Line(AxeZ, material3);
*/

		var geometry2= new THREE.Geometry();

		geometry2.vertices.push(new THREE.Vector3(-70,0,0));
		geometry2.vertices.push(new THREE.Vector3(0,70,0));
		geometry2.vertices.push(new THREE.Vector3(70,0,0));

		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 ,
		wireframe: true} );

		var line = new THREE.Line(geometry2, material)
		//camera.position.x = 0;
		//camera.position.y = -20;
		//camera.position.z = 1100;


		controls = new THREE.OrbitControls( camera);

		controls.enablePan = true;
		controls.enableZoom = true;
		controls.enableRotate = true;


		var render = function () {


			requestAnimationFrame(render);
			controls.update();
			renderer.render(scene, camera);

			//plane.rotation.y += 0.001;

		};

		render();
}
