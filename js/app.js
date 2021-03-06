// --- MODEL ---

var locations = [
  {
    title: 'Odeonsplatz',
    location: {lat: 48.142290, lng: 11.577612}
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
    title: 'Münchner Olympiastadion',
    location: {lat: 48.173383, lng: 11.546646}
  },
  {
    title: 'Ludwig-Maximilians-Universität',
    location: {lat: 48.150774, lng: 11.580327}
  },
  {
    title: 'Karlsplatz Stachus',
    location: {lat: 48.139272, lng: 11.566022}
  },
  {
    title: 'Marienplatz',
    location: {lat: 48.137493, lng: 11.575457}
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
      center: {lat: 48.158597, lng: 11.570018}, zoom: 13
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
  // Marker size and color
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
  // Populate the infowindow when the marker is clicked
  var populateInfoWindow = function(marker, infowindow) {
      // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;

      var clientID = "YYH20ZO3RA1S2OQ3VYXGRHV005BY1S3IF0V10ETQFYRWG1ZH";
      var clientSecret = "ZLBJYT0N5YJ4TWTL1A55NAJR0L1ACYE0TMEDJ2OT5LUOYSX0";

      var foursquareUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
        marker.position.lat() + ',' + marker.position.lng() +
        '&client_id=' + clientID + '&client_secret=' + clientSecret +
        '&query=' + marker.title + '&v=20171111' + '&m=foursquare';

      $.getJSON(foursquareUrl, function(data) {
        var response = data.response.venues[0];
        self.category = response.categories[0].shortName;
        self.street = response.location.formattedAddress[0];
        self.zipcity = response.location.formattedAddress[1];

        self.htmlInfo =
          '<h3>' + marker.title + '</h3>' +
          '<h5>' + self.category + '</h5>' +
          '<p><strong>Address: </strong>' + self.street + '</p>' +
          '<p>' + self.zipcity + '</p>';

        infowindow.setContent(self.htmlInfo);
      }).fail(function() {
        alert(
          "ERROR: Please refresh your page and/or check your internet connection"
        );
      });

      infowindow.open(map, marker);
      setTimeout(function() {marker.setAnimation(null);}, 750);
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });

      // Open the infowindow on the marker
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

function error() {
  alert("ERROR: Google Map could not be loaded. \nPlease check your internet connection")
};
