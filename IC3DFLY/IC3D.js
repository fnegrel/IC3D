var Alti=new Array();
var LatLong=new Array();
var ListeAlti=new Array();
var Nbl=17;
var Nbc=17;
var controls;
var flyControls;
var clock = new THREE.Clock();
var Max = -10000;

var map = L.map('map').setView([48.629412,-4.529276],15);
L.control.scale().addTo(map);
L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png').addTo(map);


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

function Mark1() {

	var NE=Rec[0];
	var NW=Rec[1];
	var SW=Rec[2];
	var SE=Rec[3];
	Alti=[];
	LatLong=[];
	ListeAlti=[];
	var C=NW[0]-SW[0];
	var L=NE[1]-NW[1];
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
	var url="https://maps.googleapis.com/maps/api/elevation/json?locations="+PP+"&key=AIzaSyCTSax3v-9bQ0gzolfK22QqJPSmQyMcdjA";
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
				ListeAlti.push(Elevation[k].elevation)
				if (Elevation[k].elevation > Max){
					Max = Elevation[k].elevation;
				}

			}
			console.log(ListeAlti);

		},

		error: function (data) {
			alert("Error");
		}
	});

	return(Max);

}


//"https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/"+LatLong[1]+","+LatLong[0]+",3/600x300?access_token=sk.eyJ1Ijoia3l6ZXJzdXNoaSIsImEiOiJjaXpoZ25tdnIwMDNqMndsOTB4NmdoNHExIn0.eemm2BU0LXva8-vXGGWAAA"

function Affichage() {

		console.log('coucou')
		console.log(Max)
		console.log(ListeAlti)
		console.log("coucouaffichage")
		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );


		var scene = new THREE.Scene();

		var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 500);
		camera.position.set(0, 0, Max);


		var geometry2 = new THREE.BoxGeometry(1, 1, 1 );
		var geometry = new THREE.PlaneGeometry(60,60,Nbl-1, Nbc-1);
		console.log(geometry.vertices.length)
		for (var i = 0, l = geometry.vertices.length; i < l; i++) {
		  geometry.vertices[i].z = ListeAlti[i] ;
			console.log(ListeAlti[i])
		}



		var material = new THREE.MeshBasicMaterial( {
			color: 0xdddddd ,
			wireframe : true
		} );


		var central = new Array((Rec[0][0]+Rec[1][0]+Rec[2][0]+Rec[3][0])/4,((Rec[0][1]+Rec[1][1]+Rec[2][1]+Rec[3][1])/4));
		//central[0]=(Rec[0][0]+Rec[1][0]+Rec[2][0]+Rec[3][0])/4;
		//central[1]=(Rec[0][1]+Rec[1][1]+Rec[2][1]+Rec[3][1])/4;

		var texture = new THREE.TextureLoader();
		texture.crossOrigin = 'anonymous';
		//texture.load("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/"+central[0]+","+central[1]+",5/256x128?access_token=sk.eyJ1Ijoia3l6ZXJzdXNoaSIsImEiOiJjaXpoZ25tdnIwMDNqMndsOTB4NmdoNHExIn0.eemm2BU0LXva8-vXGGWAAA");
		var textureMaterial = new THREE.MeshLambertMaterial({ color: 0xdddddd,
		wireframe: true});

		var texturechat = new THREE.TextureLoader().load("chat.jpg");

		// load a resource
		texture.load("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/"+central[1]+","+central[0]+",17/1024x1024?access_token=sk.eyJ1Ijoia3l6ZXJzdXNoaSIsImEiOiJjaXpoZ25tdnIwMDNqMndsOTB4NmdoNHExIn0.eemm2BU0LXva8-vXGGWAAA",
		// Function when resource is loaded
				function ( texture ) {
					var textureMaterial = new THREE.MeshBasicMaterial({ map: texture });
					console.log("Victory is mine")
					var plane = new THREE.Mesh(geometry, textureMaterial);
					scene.add( plane );
					plane.rotation.x += -90*2*Math.PI/360;
					//plane.rotation.z += 45*Math.PI/360
				},
				// Function called when download progresses
				function ( xhr ) {console.log( (xhr.loaded / xhr.total * 100) + '% loaded' )},
				// Function called when download errors
				function ( xhr ) {console.log('');
			}
		);



		//https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/2.6,48.8,5/256x128?access_token=sk.eyJ1Ijoia3l6ZXJzdXNoaSIsImEiOiJjaXpoZ25tdnIwMDNqMndsOTB4NmdoNHExIn0.eemm2BU0LXva8-vXGGWAAA

		var material2 = new THREE.MeshBasicMaterial({
		color: 0xdddddd,
		wireframe: true
		});





		var cube = new THREE.Mesh( geometry2, material2 );
		scene.add( cube );

		scene.add(new THREE.AmbientLight(0xeeeeee));


		// Axe du dessin



		var AxeX= new THREE.Geometry();
		var AxeY= new THREE.Geometry();
		var AxeZ= new THREE.Geometry();

		/*
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

		var material = new THREE.MeshBasicMaterial( { color: 0xdddddd ,
		wireframe: true} );

		var line = new THREE.Line(geometry2, material)
		//camera.position.x = 0;
		//camera.position.y = -20;
		//camera.position.z = 1100;


		//controls = new THREE.OrbitControls( camera);
		
		//controls.enablePan = true;
		//controls.enableZoom = true;
		//controls.enableRotate = true;

		var flyControls = new THREE.FlyControls(camera);
        flyControls.movementSpeed = 25;
        flyControls.domElement = document.querySelector("#WebGL-output");
        flyControls.rollSpeed = Math.PI / 24;
        flyControls.autoForward = true;
        flyControls.dragToLook = false;

		var render = function () {

			flyControls.update(delta);
            webGLRenderer.clear();
			requestAnimationFrame(render);
			//controls.update();
			renderer.render(scene, camera);

			//plane.rotation.y += 0.001;

		};

		render();
}
