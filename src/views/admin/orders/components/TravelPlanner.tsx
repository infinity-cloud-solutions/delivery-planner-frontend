export class TravelPlanner {

    calculateDistance(point1, point2) {
        const lat1 = parseFloat(point1.latitude);
        const lon1 = parseFloat(point1.longitude);
        const lat2 = parseFloat(point2.latitude);
        const lon2 = parseFloat(point2.longitude);
        return Math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2);
    }

    findShortestPath(locations, startPoint) {
        let unvisited = [...locations];
        let currentLocation = startPoint;
        const path = [];

        while (unvisited.length > 0) {
            const nearestLocation = unvisited.reduce((closest, loc) => {
                const distanceToLoc = this.calculateDistance(currentLocation, loc);
                const distanceToClosest = this.calculateDistance(currentLocation, closest);
                return distanceToLoc < distanceToClosest ? loc : closest;
            });

            path.push(nearestLocation);
            currentLocation = nearestLocation;
            unvisited = unvisited.filter(loc => loc !== nearestLocation);
        }
        const result = path.map((loc, index) => ({ ...loc, delivery_sequence: index + 1 }));
        return result;
    }
}
