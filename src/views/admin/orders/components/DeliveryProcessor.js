import { TravelPlanner } from "./TravelPlanner";

export const DeliveryProcessor = (selectedDrivers, ordersForToday) => {

    const selectOrdersByDeliveryRangeTime = (orderRecords, deliveryTimeToMatch, driverToMatch) => {
        return orderRecords.filter(order =>
            order.delivery_time === deliveryTimeToMatch && Number(order.driver) === driverToMatch
        );
    };

    const processRecordsForDriver = (driverNumber, ordersForToday) => {
        const planner = new TravelPlanner();

        const morningRecords = selectOrdersByDeliveryRangeTime(ordersForToday, "9 AM - 1 PM", Number(driverNumber));
        let morningOrderedLocations = [];
        if (morningRecords.length > 0) {
            morningOrderedLocations = planner.findShortestPath(morningRecords, { latitude: 20.7257943, longitude: -103.3792193 });
            const reducedMorningOrderedLocations = morningOrderedLocations.map(location => ({
                id: location.id,
                delivery_date: location.delivery_date,
                delivery_sequence: location.delivery_sequence,
                driver: location.driver
            }));

            ordersForToday = ordersForToday.map(order => {
                const updatedOrder = reducedMorningOrderedLocations.find(loc => loc.id === order.id);
                return updatedOrder ? { ...order, ...updatedOrder } : order;
            });
        }

        const afternoonRecords = selectOrdersByDeliveryRangeTime(ordersForToday, "1 PM - 5 PM",  Number(driverNumber));
        if (afternoonRecords.length > 0) {

            // const afternoonStartingPoint = morningOrderedLocations.length > 0
            //     ? {
            //         latitude: morningOrderedLocations[morningOrderedLocations.length - 1].latitude,
            //         longitude: morningOrderedLocations[morningOrderedLocations.length - 1].longitude
            //     }
            //     : { latitude: 20.7257943, longitude: -103.3792193 };

            const afternoonOrderedLocations = planner.findShortestPath(afternoonRecords, { latitude: 20.7257943, longitude: -103.3792193 });
            const reducedAfternoonOrderedLocations = afternoonOrderedLocations.map(location => ({
                id: location.id,
                delivery_date: location.delivery_date,
                delivery_sequence: location.delivery_sequence,
                driver: location.driver
            }));

            ordersForToday = ordersForToday.map(order => {
                const updatedOrder = reducedAfternoonOrderedLocations.find(loc => loc.id === order.id);
                return updatedOrder ? { ...order, ...updatedOrder } : order;
            });
        }

        return ordersForToday;
    };

    selectedDrivers.forEach(driverNumber => {
        ordersForToday = processRecordsForDriver(driverNumber, ordersForToday);
    });

    return ordersForToday;
};
