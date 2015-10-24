var map;
var radius = 500;
var selected;

function mapInit() {
    var London = new google.maps.LatLng( 51.5287718, -0.2416814);
    map = new google.maps.Map(document.getElementById('map'), {
        center: London,
        zoom: 15
    });
    getCurrentPos();
}
function getCurrentPos() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var current_pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            if(current_pos !== undefined)
                findLocal(current_pos);
        });
    }
}

function reselect() {
    console.log('click');
    getCurrentPos();
}

function findLocal(target_pos) {
    map.setCenter(target_pos);
    var request = {
        location: target_pos,
        radius: radius,
        types: ['cafe', 'food', 'meal_takeaway', 'meal_delivery']
    };

    service = new google.maps.places.PlacesService(map);
    
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) 
            randomiseChoices(results);
    }
}


function randomiseChoices(results) {
    var rng = Math.floor(Math.random() * (results.length)) + 1;
    var i = 0;
    results.sort(function() { return 0.5 - Math.random() });
    var interval = window.setInterval(selectItem, 100);            
    function selectItem() {
        i + 1 === results.length ? clearInterval(interval) : i++;
        var place = results[i];
        if ( i === rng ) {
            var chosen = results[i];
            console.log(chosen);
            
            results.splice(i, 1);
            results.push(chosen);
            console.log(results);
        }
        selected = (i === results.length - 1);
        createMarker(place, selected); 
    } 
}

function createMarker(place) {
    var alpha = (selected) ? 1 : 0.2;
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: placeLoc,
        opacity: alpha
    });

    var html_content;
    function buildContent() {
        var html_name = '<h3 class="place-name">'+place.name+'</h3>';
        var html_img = '';
        var html_img = '<img src="'+getPlacePhoto(place)+'" class="place-photo"/>';
        
        html_content = html_name;
        if(html_img.length > 0)
            html_content = html_content + html_img;
        
        return html_content;
    }
    console.log(getPlacePhoto(place));
    
    marker.info = new google.maps.InfoWindow({
        content: buildContent(),
        maxWidth: 500
    });
    
    if (selected) {
        var marker_map = marker.getMap();
        marker.info.open(marker_map, marker);
        map.setCenter(placeLoc);
    }

    google.maps.event.addListener(marker, 'click', function() {  
        var marker_map = this.getMap();
        this.info.open(marker_map, marker);
    });
}

function getPlacePhoto(place) {
    if (place.hasOwnProperty('photos')) { 
        return place.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 });
    }
}
/** 
/* pipeline:
/* 
/* show selected place info
/*     - Category
/*     - Opening Hours
/*     - Tel
/*     - Address
/* randomise again
/* decouple selection function from data object retrieval
/* decouple buildcontent from create marker
*/