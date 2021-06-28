

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11', 
center: campground.geometry.coordinates,
zoom: 10 
});


var marker = new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.addTo(map);