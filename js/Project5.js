// Creates a new geocoder, lat/long, options, and map object.   -->
function initialize() {

  //  First, geocode address
  codeAddress();

  //  Next, call Google API; store returned map object into the local variable (map).
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

// Grab address from text box, to geocode; set the displayed map and marker.
function codeAddress() {
  var address = document.getElementById('address').value;

  // Destroy existing Cafe markers.
  if (typeof yelp != 'undefined')  {
     clearMarkers(yelp);
  }

  // Destroy existing Address marker.
  if (typeof marker != 'undefined')  {
     addressMarker.setMap(null);;
  }

  //  Retrieve geocoded lat/lon
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {

      // Insure the location's alignment is centered around the mpa
      map.setCenter(results[0].geometry.location);

      // Use Google's Marker API to create a Marker object
      addressMarker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          animation: google.maps.Animation.DROP,
          title:  address
      });

      // Use YELP to find nearby "cafe" locations.
      getYelp('cafe');

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

//toggle array of displayed layers on/off
function toggleCafeLayer (arraylayer) {
    if (arraylayer) {
        for (i in arraylayer) {

            if (arraylayer[i].getVisible() == true)
            {
                arraylayer[i].setMap(null);
                arraylayer[i].visible = false;
            }
            else
            {
                arraylayer[i].setMap(map);
                arraylayer[i].visible = true;
            }
        }
    }
}

//Function to create yelp marker
function createYelpMarker (i,latitude,longitude,title, infowindowcontent) {
    var markerLatLng = new google.maps.LatLng(latitude,longitude);

    //extent bounds for each stop and adjust map to fit to it
    bounds.extend(markerLatLng);
    map.fitBounds(bounds);

    yelp[i] = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: cafeIcon,
        title: title
    });

    //add an onclick event
    google.maps.event.addListener(yelp[i], 'click', function() {
        infowindow.setContent(infowindowcontent);
        infowindow.open(map,yelp[i]);
    });
}

// Retrieve YELP data
function  getYelp(term)   {
    bounds = new google.maps.LatLngBounds ();

    $.getJSON('http://api.yelp.com/business_review_search?lat='+map.getCenter().lat()+'&long='+map.getCenter().lng()+'&limit=20&ywsid=ynoYeq0HNwWfPKFRqK-5qg&term='+term+'&callback=?'
    , function(data){

      $.each(data.businesses, function(i,item){
          //trace(item);
          infowindowcontent = '<strong>'+item.name+'</strong><br>';
          infowindowcontent += '<img src="'+item.photo_url+'"><br>';
          infowindowcontent += '<a href="'+item.url+'" target="_blank">see it on yelp</a>';
          createYelpMarker(i,item.latitude,item.longitude,item.name, infowindowcontent);
      });
    });
}

// Remove existing markers from a map
function clearMarkers(markers) {
   for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
  };
}

// Debugging function
function trace(message){
   if (typeof console != 'undefined')  {
    console.log(message);
   }
}

