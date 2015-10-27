var map;
document.querySelector('input#radius').value = 500;
var selected;
var locator = {
    ready    : false,
    position : ''
}

var reselect_btn = document.querySelector('#randomise');
var position = function() {
    
    var current_position;
    if (navigator.geolocation) {
       var timeoutVal = 10 * 1000 * 1000;
       navigator.geolocation.getCurrentPosition(locatorCheck, errorMessage,
       { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 });
    }
    else {
       alert("Geolocation is not supported by this browser");
    }
    
    function locatorCheck( location ) {
        if ( typeof location.coords === "object" ) {
            locator.ready = true;
            locator.position = location;
        }
        console.log(locator.ready);
        console.log(locator.position);
        mapInit(locator.position);
    }
}

function errorMessage(message) {
    alert ( 'Geolocation failed' ); 
}

function mapInit ( position ) {
    var London = { lat: 51.5287718, lng : -0.2416814 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: London,
        zoom: 15
    });
    
    setCurrentPos ( position );
}

function setCurrentPos( position ) {
    var geoCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    map.setCenter( geoCoords );
    initSelection( geoCoords );
}

function initSelection( position ) {
    var x = radius;
    findLocal( position , radius );
    document.querySelector('input#radius').value = x;
    console.log('init' + position);
}

function findLocal( target_pos , radius ) {
    var request = {
        location: target_pos,
        radius: document.querySelector('input#radius').value,
        types: ['cafe', 'food', 'meal_takeaway', 'meal_delivery']
    };

    service = new google.maps.places.PlacesService(map);
    
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) 
            console.log(results);
            randomiseChoices(results);
    }
}

function randomiseChoices(results) {
    var rng = Math.floor(Math.random() * (results.length)) + 1;
    var i = 0;
    results.sort(function() { return 0.5 - Math.random() });
    
    var interval = window.setInterval( selectItem, 100 );            
    function selectItem() {
        var last = i === results.length - 1; 
        if ( last )  { 
            clearInterval( interval );
        } else { 
            i++;
            if ( i === rng ) { 
                var chosen = results[i];
                results.splice( i, 1 );
                results.push( chosen );
            }
        }
        selected = ( last );
        var place = results[i];
        createMarker(place); 
    } 
}

var placeLoc;
function createMarker(place) {
    var alpha = (selected) ? 1 : 0.2;
    placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: placeLoc,
        opacity: alpha
    });
    infoWindow(place, marker);
    google.maps.event.addListener(marker, 'click', function() {  
        var marker_map = this.getMap();
        this.info.open(marker_map, marker);
    });
}

function infoWindow(place, marker) {
    marker.info = new google.maps.InfoWindow({
        content: buildContent(place),
        maxWidth: 500
    });
    if (selected) {
        var marker_map = marker.getMap();
        marker.info.open(marker_map, marker);
        var lat_adjust = placeLoc.lat() + 0.003;
        map.setCenter({ lat: lat_adjust, lng: placeLoc.lng() });
    }
}

function buildContent(place) {
    
    var html_content = {};
    var content = {
        name : place.name,
        img : getPlacePhoto(place),
        address : place.vicinity,
        rating : place.rating
    }
    for( var key in content ) {
        if(content[key] === undefined) {
            delete content[key];
            continue;
        }
        switch(key) {
            
            case "name":
                html_content.name = '<h3 class="place-name">'+content['name']+'</h3>';
                break;
            case "img":
                html_content.img = '<img src="'+content['img']+'" class="place-photo"/>';
                break;
            case "address":
                html_content.address = '<p>'+content['address']+'</p>';
                break;
            case "rating":
                html_content.rating = '<span class="rating">'+content['rating']+'&#10030;</span>';
                break;
            default:
                break;
        }
    }
    return concatenate ( html_content );
}

function concatenate ( object ) {
    var string = '';
    for( key in object ) {
        string = string + object[key];    
    }
    return string;
}

function getPlacePhoto(place) {
    if ( place.hasOwnProperty( 'photos ') ) 
        return place.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 });
}

reselect_btn.addEventListener('click', position, false);

/** 
/* pipeline:
/* 
/* show selected place info (get place by id from places library)
/*     - Category
/*     - Opening Hours
/*     - Tel
/*     - Address
/* decouple selection function from data object retrieval
*/

