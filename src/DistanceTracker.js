import React, { useEffect, useState } from 'react';

function DistanceTracker() {
  const [coordinates, setCoordinates] = useState([]);
  const [totalWalkDistance, setTotalWalkDistance] = useState(0);
  const [totalCycleDistance, setTotalCycleDistance] = useState(0);
  const [trackingError, setTrackingError] = useState(null);

  useEffect(() => {
    let watchId = null;

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates((prevCoordinates) => [...prevCoordinates, { latitude, longitude }]);
        },
        (error) => {
          setTrackingError(`Error tracking location: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 300000, // 5 minutes
        }
      );
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (coordinates.length < 2) {
      return;
    }

    let walkDistance = 0;
    let cycleDistance = 0;

    for (let i = 1; i < coordinates.length; i++) {
      const prevCoord = coordinates[i - 1];
      const currCoord = coordinates[i];

      const distance = calculateHaversineDistance(prevCoord, currCoord);

      // Assuming a walking speed of 5 km/h and a cycling speed of 20 km/h
      if (distance <= 0.05) {
        walkDistance += distance;
      } else {
        cycleDistance += distance;
      }
    }

    setTotalWalkDistance(walkDistance);
    setTotalCycleDistance(cycleDistance);
  }, [coordinates]);

  const calculateHaversineDistance = (coord1, coord2) => {
    const R = 6371; // Radius of Earth in kilometers
    const lat1 = coord1.latitude;
    const lon1 = coord1.longitude;
    const lat2 = coord2.latitude;
    const lon2 = coord2.longitude;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  return (
    <div>
      <h2>Distance Tracker</h2>
      {trackingError ? <p>{trackingError}</p> : null}
      <p>Total Walk Distance: {totalWalkDistance.toFixed(2)} km</p>
      <p>Total Cycle Distance: {totalCycleDistance.toFixed(2)} km</p>
    </div>
  );
}

export default DistanceTracker;
