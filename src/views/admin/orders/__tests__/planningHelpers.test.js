import { DeliveryProcessor } from '../components/DeliveryProcessor';
import { TravelPlanner } from '../components/TravelPlanner';

describe('TravelPlanner', () => {
	test('calculates distances using latitude and longitude values', () => {
		const planner = new TravelPlanner();

		expect(planner.calculateDistance({ latitude: '0', longitude: '0' }, { latitude: '3', longitude: '4' })).toBe(5);
	});

	test('finds a nearest-neighbor path and assigns delivery_sequence values', () => {
		const planner = new TravelPlanner();
		const locations = [
			{ id: 'far', latitude: '10', longitude: '10' },
			{ id: 'near', latitude: '1', longitude: '1' },
			{ id: 'mid', latitude: '2', longitude: '2' }
		];

		const result = planner.findShortestPath(locations, { latitude: 0, longitude: 0 });

		expect(result).toEqual([
			expect.objectContaining({ id: 'near', delivery_sequence: 1 }),
			expect.objectContaining({ id: 'mid', delivery_sequence: 2 }),
			expect.objectContaining({ id: 'far', delivery_sequence: 3 })
		]);
	});
});

describe('DeliveryProcessor', () => {
	test('processes morning and afternoon orders per selected driver and preserves other orders', () => {
		const ordersForToday = [
			{
				id: 'morning-near',
				delivery_date: '2024-10-10',
				delivery_time: '9 AM - 1 PM',
				driver: 1,
				latitude: 20.726,
				longitude: -103.379,
				delivery_sequence: null
			},
			{
				id: 'morning-far',
				delivery_date: '2024-10-10',
				delivery_time: '9 AM - 1 PM',
				driver: 1,
				latitude: 20.73,
				longitude: -103.39,
				delivery_sequence: null
			},
			{
				id: 'afternoon-near-last-morning-stop',
				delivery_date: '2024-10-10',
				delivery_time: '1 PM - 5 PM',
				driver: 1,
				latitude: 20.731,
				longitude: -103.391,
				delivery_sequence: null
			},
			{
				id: 'driver-two-afternoon',
				delivery_date: '2024-10-10',
				delivery_time: '1 PM - 5 PM',
				driver: 2,
				latitude: 20.727,
				longitude: -103.38,
				delivery_sequence: null
			},
			{
				id: 'unselected-driver',
				delivery_date: '2024-10-10',
				delivery_time: '9 AM - 1 PM',
				driver: 3,
				latitude: 20.8,
				longitude: -103.5,
				delivery_sequence: 9
			}
		];

		const result = DeliveryProcessor([1, 2], ordersForToday);

		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'morning-near', driver: 1, delivery_sequence: 1 }),
				expect.objectContaining({ id: 'morning-far', driver: 1, delivery_sequence: 2 }),
				expect.objectContaining({ id: 'afternoon-near-last-morning-stop', driver: 1, delivery_sequence: 1 }),
				expect.objectContaining({ id: 'driver-two-afternoon', driver: 2, delivery_sequence: 1 }),
				expect.objectContaining({ id: 'unselected-driver', driver: 3, delivery_sequence: 9 })
			])
		);
	});
});