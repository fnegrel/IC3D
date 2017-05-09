var Alti=new Array();
var Latlong=new Array();
var Listealti=new Array();
var listetuiles = new Array();
var Newlistealti = new Array();
var Nbl=15;
var Nbc=15;
var controls;
var clock = new THREE.Clock();
var Maxalti = -10000;
var Push = new Array();
var TUILETempo = new Array();
var TUILEBuffer = new Array();
var TUILE = new Array(); 
var C=0;
var Fer=0;
var L2= new Array();


var map = L.map('map').setView([51.134642,1.358618],17);
L.control.scale().addTo(map);
L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png').addTo(map);


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


function Region() {
	var compteurligne = 0;
	var compteurcolonne = 0;
	var maillelong = 0.0018;
	var maillelat = maillelong/2 ;
	var NE=Rec[0];
	var NW=Rec[1];
	var SW=Rec[2];
	var SE=Rec[3];
	console.log(NE);
	Listeregion = [];
	// bon, pas le pole nord (changement de dates)
  for (var k = NW[0],finlatitude = SE[0]; k > finlatitude-maillelat; k = k-maillelat) {

		compteurcolonne=0
		compteurligne=compteurligne+1
    for (var j = NW[1],finlongitude = NE[1]; j < finlongitude+maillelong; j = j+maillelong) {

			compteurcolonne=compteurcolonne+1
			console.log("coucouregion")
			if (j < NE[1] ) {  longitudetemp=j}
			else { longitudetemp=NE[1],console.log("finmaillelong")}
			if (k > SE[0] ) {  latitudetemp=k}
			else { latitudetemp=SE[0],console.log("finmaillelat") }
			console.log(longitudetemp);
			console.log(latitudetemp);
			//L.marker([latitudetemp,longitudetemp]).addTo(map);
			Listeregion.push([latitudetemp,longitudetemp]);
			//L.marker([latitudetemp,longitudetemp]).addTo(map);
		}
  }
  console.log(Listeregion);
  nbmaille = (compteurcolonne-1)*(compteurligne-1);
  console.log(nbmaille,compteurligne,compteurcolonne);
  return([nbmaille,compteurligne,compteurcolonne]);
}


function Tuile(NW,SE,Fer) {


	Latlong=[];
	Listealti=[];
	var C=Math.abs(NW[0]-SE[0]);
	var L=Math.abs(SE[1]-NW[1]);
	var dc=C/Nbc;
	var dl=L/Nbl;
	var PP="";
	var Ltempo=new Array();

	for (var j = 0,len0 = Nbl; j < len0; j++) {

		var Long=Math.round((NW[1]+j*dl)*100000000)/100000000;
		console.log(Long);
		var Colonnelatlong=new Array();

		for (var i = 0,len1 = Nbc; i < len1; i++) {

			var Lat=Math.round((NW[0]-i*dc)*100000000)/100000000;
			Colonnelatlong.push([Lat,Long]);
			PP=PP+String(Lat)+","+String(Long)+"%7C";
		}
		Latlong.push(Colonnelatlong);
	}
	
	Push.push(Latlong);

	PP=PP.substring(0,PP.length-3);
	var url="https://maps.googleapis.com/maps/api/elevation/json?locations="+PP+"&key=AIzaSyAy2lw1yp2qpd9SgPJxNOlAHJZcUs7YgYc";
	//var url="https://maps.googleapis.com/maps/api/elevation/json?locations="+PP+"&key=AIzaSyBklg-AstGRMSnEXjBhjwxniV7W9sXSDL0";
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
				//Listealti.push(Elevation[k].elevation);
				Ltempo.push(Elevation[k].elevation);
				if (Elevation[k].elevation > Maxalti){
					Maxalti = Elevation[k].elevation;
				}
			}
			Listealti.push([Ltempo,Fer])
			console.log(Listealti);
		},

		error: function (response) {
			alert("Error");
		}
	});
	//return(Listealti)
}

function Tuilage() {
	Fer=0;
	Push=[];
	Newlistealti = [];
	var Format = Region();
	console.log(Format);
	for (var k = 0,fink = Format[2]*Format[1]-Format[2]; k < fink; k++) {
		if ((k+1)%Format[2]==0) { 
			console.log('je passe le point')
		}
		
		else {
			//L.marker([listeRegion[k][0],listeRegion[k][1]]).addTo(map);
			L.marker([Listeregion[k][0],Listeregion[k][1]]).addTo(map);
			console.log('markerpls');
			//listeTuiles.push([Tuile(listeRegion[k],listeRegion[k+Format[1]+1])]);
			Tuile(Listeregion[k],Listeregion[k+Format[2]+1],Fer);
			Fer=Fer+1;
			
		}
	}
}


function Affichage() {
	Newlistealti = [];
	Format=Region();
	//return([nbmaille,compteurcolonne,compteurligne]);
	var Temparray = new Array();
	L2=[];
	var Min=0;
	
	for (var j = 0,Lenj = Listealti.length; j < Lenj; j++) {
		console.log(j);
		for (var k = 0, Lenk=Listealti.length; k < Lenk; k++) {
			if (Listealti[k][1]==Min+j) {
				console.log(k);
				for (var w=0,lenw=Listealti[0][0].length; w<lenw;w++) {
					L2.push(Listealti[k][0][w]);
				}
				console.log(L2)
			} 
		}
	}	

	for (var k = 0,Lenkk = L2.length; k < Lenkk; k++) {

		Temparray.push(L2[k]);
		if ((k+1)%(Nbc*Nbl)==0) {
			console.log(k);
			Newlistealti.push(Temparray);
			Temparray = [];
		}
	}
		
	//Traveaux	
	
	TUILE = []; 
	C=0
	for (var i = 0,Lenligne = Format[1]-1; i < Lenligne; i++) {
		
		for (var k = 0; k < 15; k++) {
					
			for (var j = 0,Lencolonne = Format[2]-1; j < Lencolonne; j++) {
				
				for (var l = 0; l < 15; l++) {
					
					if ((j+(Format[2]-1)*i) <Format[0]) {
						
						TUILE.push(Newlistealti[j+(Format[2]-1)*i][l*15+k]);
						console.log("DEMACIA")
						C=C+1;
					}
					
					else {
						
						console.log(i)
						console.log(k)
						console.log(j)
						console.log(l)
						console.log(i+(Format[1]-1)*j)
						console.log("WTF")
					}			
				}
			}		
		}
	}
	
	console.log(TUILE)
	TUILE[0]=-4000;

	console.log("coucouaffichage")
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );


	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1500);
	camera.position.set(0, 0, Maxalti);


	var material = new THREE.MeshBasicMaterial( { color: 0x999999, wireframe : true } );
	var geometry = new THREE.PlaneGeometry(60,60,(Nbc)*(Format[2]-1)-1,(Nbl)*(Format[1]-1)-1);
	var geometry2 = new THREE.BoxGeometry(1, 1, 1 );

	var compteur=0;
	var Tableau_scene = new Array();
	
	
	
	for (var CC=0;CC<geometry.vertices.length;CC++) {
		geometry.vertices[CC].z = TUILE[CC];
	}
	console.log(geometry.vertices.length);

	var material = new THREE.MeshBasicMaterial( {wireframe : true } );
	var plan =new THREE.Mesh(geometry, material)
	scene.add(plan)


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