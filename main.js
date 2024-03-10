// IIFE
(() => {
    // Initialize a Leaflet map centered at specified coordinates
    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    // Incorporate a tile layer from OpenStreetMap and provide necessary attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a custom icon for map markers
    let customIcon = L.icon({
        iconUrl: './bus.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

     // Function to convert filtered data into a GeoJSON object
    function geoJSONFromData(data) {
        return {
            type: "FeatureCollection",
            features: data.map((bus) => ({
                type: "Feature",
                properties: {
                    bearing: bus.vehicle.position.bearing,
                    route: bus.vehicle.trip.routeId,
                    direction: bus.vehicle.trip.directionId,
                },
                geometry: {
                    type: "Point",
                    coordinates: [
                        bus.vehicle.position.longitude,
                        bus.vehicle.position.latitude
                    ],
                },
            })),
        };
    }

    // Function to add custom markers to the map using GeoJSON data
    function updateMapWithCustomMarkers(geoJSON) {
        L.geoJSON(geoJSON, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: customIcon,
                    rotationAngle: feature.properties.bearing,
                });
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    `Route: ${feature.properties.route}<br>Direction: ${feature.properties.direction}`
                );
            },
        }).addTo(map);
    }

    // Function to update the map data
    function refreshMap() {
        // Remove existing map data
        map.eachLayer(function (layer) {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });

        // Retrieve and process new bus data
        fetch("https://prog2700.onrender.com/hrmbuses")
            .then((response) => response.json())
            .then((data) => {
                // Filter the data for buses on routes 1-10
                const filteredData = data.entity.filter(
                    (bus) =>
                        bus.vehicle.trip.routeId >= 1 && bus.vehicle.trip.routeId <= 10
                );
                const geoJSON = geoJSONFromData(filteredData);

                // Add custom markers to the map using the updated data
                updateMapWithCustomMarkers(geoJSON);
            })
            .catch((error) => {
                console.error("Error fetching and processing data:", error);
            });
    }

    // Refresh the map at regular intervals (every 3 seconds)
    setInterval(refreshMap, 3000);

    // Perform an initial refresh of the map data
    refreshMap();
})();