import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Select,
    VStack,
    useColorModeValue,
    Box,
    Text,
} from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const MapModal = ({ isOpen, onClose, onConfirmRoute, orders }) => {
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedHours, setSelectedHours] = useState(null);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [confirmedOrders, setConfirmedOrders] = useState([]);
    const [loadingRequest, setLoadingRequest] = useState(false);

    const textColor = useColorModeValue("secondaryGray.900", "white");
    const bgColor = useColorModeValue('white', '#2D3748');
    const draggingColor = useColorModeValue('gray.700', 'navy.700');
    const rowBgColor = useColorModeValue('white', 'gray.800');

    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });

    const yellowStarIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
        <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="gold" stroke="black" stroke-width="1"/>
        </svg>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
    });

    useEffect(() => {
        if (selectedDriver && selectedHours) {
            const filtered = orders.filter(order =>
                order.driver === Number(selectedDriver) &&
                order.delivery_time === selectedHours
            );

            const sorted = filtered.sort((a, b) => a.delivery_sequence - b.delivery_sequence);
            setFilteredOrders(sorted);
        }
    }, [selectedDriver, selectedHours]);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedOrders = Array.from(filteredOrders);
        const [movedOrder] = reorderedOrders.splice(result.source.index, 1);
        reorderedOrders.splice(result.destination.index, 0, movedOrder);

        const updatedOrders = reorderedOrders.map((order, index) => ({
            ...order,
            delivery_sequence: index + 1,
        }));

        setFilteredOrders(updatedOrders);

        const combined = [...confirmedOrders, ...updatedOrders].reduce((acc, current) => {
            const x = acc.find(item => item.id === current.id);
            if (x) {
                return acc.map(item => item.id === current.id ? current : item);
            } else {
                return [...acc, current];
            }
        }, []);
        setConfirmedOrders(combined);
    };

    const confirmRoute = async () => {
        setLoadingRequest(true);
        try {
            await onConfirmRoute(confirmedOrders);
            onClose();
        } catch (error) {
            setLoadingRequest(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" bg={bgColor}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Mapa de entregas por repartidor</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box display="flex">
                        <Box flex="1">
                            <MapContainer center={[20.6783825, -103.348088]} zoom={11} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[20.7257943, -103.3792193]} icon={yellowStarIcon} />

                                {filteredOrders.map((position, idx) => {
                                    const defaultIcon = L.icon({
                                        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                                        iconSize: [25, 41],
                                        iconAnchor: [12, 41],
                                    });

                                    const labelIcon = L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `
                                            <div style="background-color: white; color: black; padding-top: 5px; padding-bottom: 5px; border-radius: 5px; text-align: center; box-shadow: 0px 0px 5px rgba(0,0,0,0.3);">
                                                <strong>${idx + 1}</strong>
                                            </div>
                                        `,
                                        iconSize: [40, 40],
                                        iconAnchor: [20, -5],
                                    });

                                    return (
                                        <React.Fragment key={idx}>
                                            <Marker position={[position.latitude, position.longitude]} icon={defaultIcon} />
                                            <Marker position={[position.latitude, position.longitude]} icon={labelIcon} interactive={false} />
                                        </React.Fragment>
                                    );
                                })}
                                <Polyline positions={[[20.7257943, -103.3792193], ...filteredOrders.map(pos => [pos.latitude, pos.longitude])]} color="blue" />
                            </MapContainer>
                        </Box>
                        <VStack spacing="4" flex="1" ml="8">
                            <FormControl>
                                <FormLabel>Selecciona un repartidor</FormLabel>
                                <Select
                                    placeholder="Selecciona un repartidor"
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Selecciona el horario</FormLabel>
                                <Select
                                    placeholder="Selecciona el horario"
                                    value={selectedHours}
                                    onChange={(e) => setSelectedHours(e.target.value)}
                                >
                                    <option value="9 AM - 1 PM">9 AM - 1 PM</option>
                                    <option value="1 PM - 5 PM">1 PM - 5 PM</option>
                                </Select>
                            </FormControl>

                            <Box w="full" mt="4">
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="orders">
                                        {(provided) => (
                                            <table {...provided.droppableProps} ref={provided.innerRef}>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Dirección</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrders.map((order, index) => (
                                                        <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                                                            {(provided, snapshot) => (
                                                                <tr
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        backgroundColor: snapshot.isDragging ? draggingColor : rowBgColor,
                                                                        color: textColor,
                                                                    }}
                                                                >
                                                                    {snapshot.isDragging ? (
                                                                        <td colSpan="3">{order.delivery_address}</td>
                                                                    ) : (
                                                                        <>
                                                                            <td>{index + 1}</td>
                                                                            <td>{order.delivery_address}</td>
                                                                            <td><Text as="span">&#x2630;</Text></td>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </tbody>
                                            </table>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </Box>
                        </VStack>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="brand"
                        onClick={confirmRoute}
                        isLoading={loadingRequest}
                        loadingText='Guardando...'
                        spinnerPlacement='end'>
                        Confirmar y mandar a ruta
                    </Button>
                    <Button variant="ghost" onClick={onClose} ml={3}>
                        Cancelar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MapModal;
