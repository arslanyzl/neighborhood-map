// --- MODEL ---

var locations = [
  {
    title: 'Marienplatz',
    location: {lat: 48.137494, lng: 11.575430}
  },
  {
    title: 'Odeonsplatz',
    location: {lat: 48.143732, lng: 11.577297}
  },
  {
    title: 'Alte Pinakothek',
    location: {lat: 48.148597, lng: 11.570018}
  },
  {
    title: 'Deutsches Museum',
    location: {lat: 48.130358, lng: 11.583645}
  },
  {
    title: 'BMW Welt',
    location: {lat: 48.178284, lng: 11.556187}
  },
  {
    title: 'Olympiapark München',
    location: {lat: 48.175682, lng: 11.551791}
  },
  {
    title: 'Ludwig-Maximilians-Universität München',
    location: {lat: 48.150774, lng: 11.580327}
  },
  {
    title: 'Sendlinger Tor',
    location: {lat: 48.166871, lng: 11.567718}
  }
];

// ---VIEWMODEL---

var map;

function initGoogleMap() {
      ko.applyBindings(new ViewModel);
}

function ViewModel() {
  var self = this;

  this.markers = [];

  this.initMap = function () {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 48.137494, lng: 11.575430}, zoom: 13
    });



    this.largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      this.position = locations[i].location;
      this.title = locations[i].title;
      // Create a marker per location, and put into markers array.
      this.marker = new google.maps.Marker({
        map: map,
        position: this.position,
        title: this.title,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        id: i
      });
      // Push the marker to our array of markers.
      this.marker.setMap(map);
      this.markers.push(this.marker);
      // Create an onclick event to open an infowindow at each marker.
      this.marker.addListener('click', self.openInfoWindow);

      this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
      bounds.extend(this.markers[i].position);
      this.openInfoWindow = function() {
      populateInfoWindow(this, self.largeInfowindow);
      this.setAnimation(google.maps.Animation.BOUNCE);
      };
      //resize google map when changing screen size
      google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
      });
    };


        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
  };
      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
  var makeMarkerIcon = function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
  }

  var populateInfoWindow = function(marker, infowindow) {
      // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);
      setTimeout(function() {marker.setAnimation(null);}, 750);
          // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });

      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }
  };

  this.initMap();
  //Place list and filter by search
  this.search = ko.observable('');
  this.myPlaces = ko.computed(function() {
    var list = [];
    for (var i = 0; i < this.markers.length; i++) {
      var place = this.markers[i];
      if (place.title.toLowerCase().includes(this.search().toLowerCase())) {
        list.push(place);
        this.markers[i].setVisible(true);
       } else {
        this.markers[i].setVisible(false);
      }
    }
      return list;
  }, this);
};
