
var map;

function initMap() {

    var xanda = new google.maps.LatLng(51.590992,-0.1654489);
    map = new google.maps.Map(document.getElementById('map'), {
        center: xanda,
        zoom: 15
    });
    console.log(navigator.geolocation);
    var request = {
        radius: '500',
        types: ['cafe', 'food', 'meal_takeaway', 'meal_delivery']
    };
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            request.location = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            console.log(request);
            map.setCenter(request.location);
        });
    }

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var rng = Math.floor(Math.random() * (results.length)) + 1;
            console.log(results[rng]);
            var i = 0;
            results.sort(function() { return 0.5 - Math.random() });
            var interval = window.setInterval(selectItem, 100);            
            function selectItem() {
                i == results.length - 1 ? clearInterval(interval) : i++;
                var place = results[i];
                if ( i === rng ) {
                    var chosen = results[i];
                    results.splice(i, 1);
                    results.push(chosen);
                }

                createMarker(place, (i === results.length - 1)); 
            } 
        }
    }
    function createMarker(place, selected) {
        var alpha = (selected) ? 1 : 0.2;
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: placeLoc,
            opacity: alpha
        });

        var html_name = '<h3 class="place-name">'+place.name+'</h3>';
        var html_img = '<img src="'+getPlacePhoto(place)+'" class="place-photo"/>';

        marker.info = new google.maps.InfoWindow({
            content: html_name+html_img,
            maxWidth: 500
        });

        if (selected) {
            var marker_map = marker.getMap();
            marker.info.open(marker_map, marker);
        }

        google.maps.event.addListener(marker, 'click', function() {  
            var marker_map = this.getMap();
            this.info.open(marker_map, marker);
        });
    }
    function getPlacePhoto(place) {
        console.log(place.hasOwnProperty('photos'));
        if (place.hasOwnProperty('photos')) { 
            return place.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 });
        }
    }
}
/** 
/* pipeline:
/* 
/* show selected place info
/*     - Name
/*     - Photo
/*     - Category
/*     - Opening Hours
/*     - Tel
/*     - Address
/* get current location
/* randomise again
*/