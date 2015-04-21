//
// @see - chapter 9 - MAPS AND GEO LOCATION IN BOOK
//
// Be sure to set the proper configuration in tiapp.xml for Android and
// IOS to have access to geo location services; see link for additional
// information
// http://docs.appcelerator.com/titanium/3.0/#!/guide/Tracking_Position_and_Heading
//
// will use this for promises
var Q = require('q');


/**
 * gets the current location of the user
 *
 * @returns {Promise}
 */
function getCurrentLocation() {

	var deferred = Q.defer();

	if (!Ti.Geolocation.getLocationServicesEnabled()) {
		alert('Location Services are not enabled');
		deferred.reject({
			location : null,
			message : 'Location Services are not enabled'
		});

	} else {

		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
		Ti.Geolocation.distanceFilter = 10;
		Ti.Geolocation.addEventListener('location', function listener(_location) {
			locationCallbackHandler(_location, deferred);

			// remove event handler since event was received
			Ti.Geolocation.removeEventListener('location', listener);
		});
	}

	return deferred.promise;
};

/**
 * @param {Object} _location
 * @param {Object} _deferred
 */
function locationCallbackHandler(_location, _deferred) {


	// process the results
	if (!_location.error && _location && _location.coords) {

		_deferred.resolve({
			location : _location.coords,
			message : null
		});

	} else {
		alert('Location Services Error: ' + _location.error);

		_deferred.reject({
			location : null,
			message : _location.error
		});

	}
}

/**
 *
 * converts the current location in to a string for display. returns
 * the title, address and original coordinates when promise is resolved
 * successfully
 *
 * @param {Object} _lat
 * @param {Object} _lng
 *
 * @returns {Promise}
 */
function reverseGeocoder(_lat, _lng) {
	var title;
	var deferred = Q.defer();

	// callback method converting lat lng into a location/address
	Ti.Geolocation.reverseGeocoder(_lat, _lng, function(_data) {
		if (_data.success) {
			Ti.API.debug("reverseGeo " + JSON.stringify(_data, null, 2));
			var place = _data.places[0];
			if (place.city === "") {
				title = place.address;
			} else {
				title = place.street + " " + place.city;
			}
			deferred.resolve({
				title : title,
				place : place,
				location : {
					latitude : _lat,
					longitude : _lng,
				}
			});
		} else {
			title = "No Address Found: " + _lat + ", " + _lng;
			deferred.reject({
				title : title,
				location : {
					latitude : _lat,
					longitude : _lng,
				}
			});
		}

	});
	return deferred.promise;
}


//
// functions exposed by this module
exports.reverseGeocoder = reverseGeocoder;
exports.getCurrentLocation = getCurrentLocation;
