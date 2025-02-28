document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([12.9716, 79.1594], 13); // Default coordinates and zoom level

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var firstLocation = true; // Flag to handle initial location loading
    var locationsData = {}; // Global variable to hold parking locations data
    var markers = {}; // Store markers for each location
    var nearestParking=''
    var parkingMarker=''

    async function loadAndTrackLocations() {
        try {
            // Wait for `loadParkingLocations` to complete
            await loadParkingLocations();
    
            // After `loadParkingLocations` finishes, run `startTrackingLocation`
            startTrackingLocation();
        } catch (error) {
            console.error("Error loading locations or starting tracking:", error);
        }
    }
    
    // Call the combined function
    loadAndTrackLocations();

    // loadParkingLocations();
    // startTrackingLocation();
    function loadParkingLocations() {
        fetch("/locations")
            .then(response => response.json())
            .then(locations => {
                console.log(locations); // Check if data is correctly fetched

                if (!locations || Object.keys(locations).length === 0) {
                    console.log("No parking locations found or invalid data format.");
                    return;
                }

                // Store locations data globally
                locationsData = locations;

                Object.keys(locations).forEach(id => {
                    if (!id) {
                        console.log("Skipping location with invalid ID.");
                        return; // Skip invalid ID
                    }

                    const location = locations[id];
                    if (location && location.latitude && location.longitude) {
                        console.log(`Creating marker for: ${location.name} at (${location.latitude}, ${location.longitude})`);

                        const markerColor = location.available_spots > 0 ? "green" : "red";
                        const marker = L.circleMarker([location.latitude, location.longitude], {
                            radius: 10,
                            fillColor: markerColor,
                            color: markerColor,
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.6
                        }).addTo(map);

                        // Add click event to each marker
                        marker.on("click", function () {
                            loadParkingLocations();
                            map.closePopup();
                            const popupContent = `
                                <div class="popup-content">
                                    <h3>${location.name}</h3>
                                    <p>Available Spots: ${location.available_spots}</p>
                                    <button class="book-button" onclick="bookSpot(${id}, '${location.name}', ${location.latitude}, ${location.longitude})">Book Now</button>
                                </div>
                            `;

                            marker.bindPopup(popupContent).openPopup();
                        });

                        markers[id] = marker; // Store marker reference
                    } else {
                        console.log(`Skipping location ${id} due to missing coordinates.`);
                    }
                });
            })
            .catch(error => {
                console.error("Error fetching locations:", error);
            });
    }


    function startTrackingLocation() {
        console.log("inside")
        if (navigator.geolocation) {
            // Watch position updates in real time
            navigator.geolocation.watchPosition(onLocationFound, showError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        } else {
            onLocationFound([12.9716, 79.1594])
            var userMarker =L.marker([12.9716, 79.1594]).addTo(map);
            userMarker.bindPopup("You are within " + 50 + " meters from this point").openPopup();
            userLocation=[12.9716, 79.1594]
            radius=50
            L.circle(userLocation, radius).addTo(map);

            
            alert("Geolocation is not supported by this browser.");
        }
    }
    
    // Display the location on the screen or send to server
    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
    
        // Display on the screen
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

    
        // Optionally, send the location to your backend server
        // updateLocationOnServer(latitude, longitude);
    }
    
    // Handle errors in retrieving location
    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                onLocationFound([12.9716, 79.1594])
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                onLocationFound([12.9716, 79.1594])
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                onLocationFound([12.9716, 79.1594])
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                onLocationFound([12.9716, 79.1594])
                break;
        }
    }

    // Load locations initially
    
    // loadParkingLocations();
    
    // map.on('locationfound', onLocationFound);
    // Live location tracking
    function onLocationFound(e) {
        console.log(e)
        const isObject = typeof e === "object" && !Array.isArray(e);
        if(isObject){
            var radius = e.coords.accuracy / 2;
        var userLocation = [e.coords.latitude,e.coords.longitude];
        userLatLng=userLocation
        console.log(userLocation)
        if(radius.toFixed(2)<1000 ){
            var userMarker = L.marker(userLocation).addTo(map);
            userMarker.bindPopup("You are within " + radius.toFixed(2) + " meters from this point").openPopup();
            L.circle(userLocation, radius).addTo(map);
        }
        }
        else{
            var userMarker =L.marker([12.9716, 79.1594]).addTo(map);
            userMarker.bindPopup("You are within " + 50 + " meters from this point").openPopup();
            userLocation=[12.9716, 79.1594]
            radius=50
            L.circle(userLocation, radius).addTo(map);
        }
        // Add a marker for the user's current location
        if(radius.toFixed(2)<1000 ){
            var userMarker = L.marker(userLocation).addTo(map);
            userMarker.bindPopup("You are within " + radius.toFixed(2) + " meters from this point").openPopup();
            L.circle(userLocation, radius).addTo(map);
        }
        else{
            var userMarker =L.marker([12.9716, 79.1594]).addTo(map);
            userMarker.bindPopup("You are within " + 50 + " meters from this point").openPopup();
            userLocation=[12.9716, 79.1594]
            radius=50
            L.circle(userLocation, radius).addTo(map);
        }
        
        // startTrackingLocation();
        // Add a circle showing the accuracy radius
        // L.circle(userLocation, radius).addTo(map);

        // If it's the first time the location is found, set view to the user's location
        if (firstLocation) {
            map.setView(userLocation, 16); // Set zoom level to 16 for better focus
            firstLocation = false; // Prevent further zoom adjustment
        }

        // Find the nearest available parking location using the stored locationsData
        let nearestParking = null;
        let minDistance = Infinity;

        Object.keys(locationsData).forEach(id => {
            const location = locationsData[id];
            if (location.available_spots > 0) { // Only consider locations with available spots
                const distance = calculateDistance(userLocation[0], userLocation[1], location.latitude, location.longitude);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestParking = location;
                }
            }
        });

        if (nearestParking) {
            // Add or update a marker for the nearest available parking location
            if (markers[nearestParking.id]) {
                // If marker already exists, just update the popup
                
                markers[nearestParking.id].setPopupContent(`Nearest Parking: ${nearestParking.name}`).openPopup();
                
            } else {
                // Create a new marker if it doesn't exist yet
                parkingMarker = L.marker([nearestParking.latitude, nearestParking.longitude]).addTo(map);
                parkingMarker._icon.classList.add("huechange");
                parkingMarker.bindPopup(`Nearest Parking: ${nearestParking.name}`).openPopup();
                
                markers[nearestParking.id] = parkingMarker; // Store marker reference
            }

            // Set bounds with padding, max zoom limit to avoid excessive zooming out
            var bounds = L.latLngBounds(userLocation, [nearestParking.latitude, nearestParking.longitude]);
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16, duration: 1.5 }); // Smooth zooming with a max zoom limit and animation
        } else {
            console.log("No available parking spots nearby.");
        }
    }

    function onLocationError(e) {
        // alert("Location access denied. Showing a fixed location on the map.");

        // Set a fixed location marker as fallback (example: city center coordinates)
        var fixed=L.marker([12.9716, 79.1594]).addTo(map);
        fixed._icon.classList.add("huechange");
        fixed.bindPopup("Default location: please enable location services for live tracking.").openPopup();
        
        map.setView([12.9716, 79.1594], 13); // Adjust map to fixed location
    }
    // loadParkingLocations();
    // Enable live location tracking
    // map.locate({ setView: false, maxZoom: 16, watch: true });

    // Event listeners for location found and location error
    
    // map.on('locationerror', onLocationError);

    // Load parking locations initially and store them globally
    

    // Book a parking spot
    window.bookSpot = function (id, name, latitude, longitude) {
        const bookingDetails = {
            id,
            name,
            latitude,
            longitude,
        };
        console.log(bookingDetails)
        // Book the parking spot
        fetch(`/book/${id}`, { method: "POST" })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === "success") {
                    alert(data.message);
                    loadParkingLocations();
                    console.log(markers)
                    parkingMarker = L.marker([latitude,longitude]).addTo(map);
                parkingMarker._icon.classList.add("huechange");
                parkingMarker.bindPopup(`Booked Parking: ${name}`).openPopup();
                
                // markers[nearestParking.id] = parkingMarker;
                //     markers[nearestParking.id].setPopupContent(`Booked Parking: ${location.name}`).openPopup();
                    // Send a mail notification after successful booking
                    return fetch(
                        `/mail?qrText=${encodeURIComponent(data.qr_text)}&filePath=${encodeURIComponent(data.file_path)}`,
                        { method: "GET" }
                    );
                } else {
                    throw new Error(data.message);
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(mailData => {
                alert(mailData.message);
    
                // Close any open popup immediately after booking
                map.closePopup();
    
                // Reload updated parking location data
                loadParkingLocations();
            })
            .catch(error => {
                console.error("Error occurred:", error);
                alert("An error occurred during the booking process. Please try again.");
            });
    };
    
    
    
    
    

    // Function to calculate distance between two points using Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        var rad = Math.PI / 180;
        var dLat = (lat2 - lat1) * rad;
        var dLon = (lon2 - lon1) * rad;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371 * c * 1000; // Distance in meters
    }


    const fileDropper = document.getElementById("fileDropper");
const imageUploader = document.getElementById("imageUploader");
const preview = document.getElementById("preview");

// Prevent dropdown from closing when interacting with the drop zone
fileDropper.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    imageUploader.click(); // Trigger file input
});

fileDropper.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileDropper.style.borderColor = "#007bff";
});

fileDropper.addEventListener("dragleave", () => {
    fileDropper.style.borderColor = "#d9d9d9";
});

fileDropper.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileDropper.style.borderColor = "#d9d9d9";

    const file = e.dataTransfer.files[0];
    handleFile(file);
});

imageUploader.addEventListener("change", () => {
    const file = imageUploader.files[0];
    handleFile(file);
});

// function handleFile(file) {
//     if (file && file.type.startsWith("image/")) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             preview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" />`;
//         };
//         reader.readAsDataURL(file);
//         console.log(file)
//     } else {
//         alert("Please upload a valid image file.");
//     }
//     imageUploader.value = ""; // Clear file input
// }

function handleFile(file) {
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                // Create a canvas to extract QR code data
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);

                // Extract image data and decode QR code
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);
                jsonString = code.data.replace(/'/g, '"')
                data=JSON.parse(jsonString)
                // document.getElementById("qrData").textContent = JSON.stringify(jsonString, null, 2);
                document.getElementById("parkingSpot").textContent = data['Parking Spot'] || "Not available";
                const bookingTime = data['Booking Time'] || "Not available";
                const formattedBookingTime = formatDate(bookingTime);
                document.getElementById("bookingTime").textContent = formattedBookingTime;
                const currentTime = getCurrentTime();

                document.getElementById("currentTime").textContent =formatDate(currentTime);
                const timeDifference = calculateTimeDifference(bookingTime, currentTime);
                        // document.getElementById("timeDifference").textContent = `Time Difference: ${timeDifference} minutes`;

                        // Calculate the cost based on the time difference
                        const cost = timeDifference * 10;
                        document.getElementById("cost").textContent = `Parking Cost: Rs${cost}`;
                document.getElementById("qrDataContainer").style.display = "block";
                // if (code) {
                //     console.log("QR Code Data:", code.data);
                //     alert(`QR Code Data: ${code.data}`);
                // } else {
                //     alert("No QR code detected in the image.");
                // }
                const uriData = {
                    parkingSpot: encodeURIComponent(data['Parking Spot']),
                    bookingTime: encodeURIComponent(bookingTime),
                    currentTime: encodeURIComponent(currentTime),
                    timeDifference: timeDifference,
                    cost: cost
                };

                // Construct URI with query parameters
                const uri = `/bill?parkingSpot=${uriData.parkingSpot}&bookingTime=${uriData.bookingTime}&currentTime=${uriData.currentTime}&timeDifference=${uriData.timeDifference}&cost=${uriData.cost}`;

                // Send the data to Flask backend via GET request
                sendDataToFlask(uri);
            };
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file.");
    }
    imageUploader.value = ""; // Clear file input
}
function formatDate(dateString) {
    const date = new Date(dateString);
    
    if (isNaN(date)) {
        return "Invalid Date";
    }

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    return date.toLocaleString('en-US', options);
}

// function getCurrentTime() {
//     const now = new Date();
//     const options = {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: true
//     };

//     return now.toLocaleString('en-US', options);
// }

function getCurrentTime() {
    const now = new Date();

    // Manually format current time as 'YYYY-MM-DD HH:mm:ss' 
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// function calculateTimeDifference(bookingTime, currentTime) {
//     const bookingDate = new Date(bookingTime);
//     const currentDate = new Date(currentTime);
//     console.log("ye")
//     // if (isNaN(bookingDate) || isNaN(currentDate)) {

//     //     return "Invalid Date";
//     // }
//     console.log(bookingDate)
//     console.log(currentDate)
//     // Calculate difference in milliseconds
//     const timeDifference = currentDate - bookingDate;

//     // Convert milliseconds to minutes
//     console.log(timeDifference)
//     const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));
//     console.log(timeDifferenceInMinutes)

//     return timeDifferenceInMinutes;
// }

function calculateTimeDifference(bookingTime, currentTime) {
    const bookingDate = parseDate(bookingTime);
    const currentDate = parseDate(currentTime);

    if (isNaN(bookingDate) || isNaN(currentDate)) {
        return "Invalid Date";
    }

    // Calculate difference in milliseconds
    const timeDifference = currentDate - bookingDate;

    // Convert milliseconds to minutes
    const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));

    return timeDifferenceInMinutes;
}

// Function to parse date string into a proper Date object
function parseDate(dateString) {
    const dateParts = dateString.split(' ');
    const date = dateParts[0].split('-'); // YYYY-MM-DD
    const time = dateParts[1].split(':'); // HH:mm:ss

    // Create a date in the format 'YYYY-MM-DD HH:mm:ss'
    const formattedDate = `${date[0]}-${date[1]}-${date[2]}T${time[0]}:${time[1]}:${time[2]}`;
    
    return new Date(formattedDate);
}

function sendDataToFlask(uri) {
    fetch(uri, {  // Send GET request with data as query parameters in the URL
        method: 'POST',
    })
    .then(response => response.json())  // Parse response as JSON if it's OK
    .then(data => {
        console.log(JSON.stringify(data, null, 2))
        alert("Mail Sent Successfully!");
        // Handle the response from Flask here (if needed)
    })
    .catch(error => {
        console.error("Error sending data to Flask:", error);
        alert("Error sending data to server: " + error.message);  // Alert the user if there's an error
    });
}

});


