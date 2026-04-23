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
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Order } from 'types/order';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRoute: (orders: Order[]) => Promise<void>;
  orders: Order[];
}

const MapResizer = ({ isOpen }: { isOpen: boolean }) => {
    const map = useMap();
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    }, [isOpen, map]);
    return null;
};

const MapModal = ({ isOpen, onClose, onConfirmRoute, orders }: MapModalProps) => {
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [selectedHours, setSelectedHours] = useState<string | null>(null);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [confirmedOrders, setConfirmedOrders] = useState<any[]>([]);
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const textColor = useColorModeValue("secondaryGray.900", "white");
    const bgColor = useColorModeValue('white', '#2D3748');
    const draggingColor = useColorModeValue('gray.700', 'navy.700');
    const rowBgColor = useColorModeValue('white', 'gray.800');

    delete (L.Icon.Default.prototype as any)._getIconUrl;

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
                Number(order.driver) === Number(selectedDriver) &&
                order.delivery_time === selectedHours
            );

            const sorted = filtered.sort((a: any, b: any) => (a.delivery_sequence ?? 0) - (b.delivery_sequence ?? 0));
            setFilteredOrders(sorted);
        }
    }, [selectedDriver, selectedHours]);

    const onDragEnd = (result: any) => {
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
            const x = acc.find((item: any) => item.id === current.id);
            if (x) {
                return acc.map((item: any) => item.id === current.id ? current : item);
            } else {
                return [...acc, current];
            }
        }, []);
        setConfirmedOrders(combined);
    };

    const confirmRoute = async () => {
        setLoadingRequest(true);
        try {
            const updatedOrders = orders.map(order => {
                const matchingOrder = confirmedOrders.find(filteredOrder => filteredOrder.id === order.id);
                if (matchingOrder) {
                    return {
                        id: order.id,
                        delivery_date: order.delivery_date,
                        status: "Programada",
                        driver: Number(matchingOrder.driver),
                        delivery_sequence: Number(matchingOrder.delivery_sequence),
                    };
                }
                return order;
            })
            const finalOrders = updatedOrders.map(order => {
                return {
                    id: order.id,
                    delivery_date: order.delivery_date,
                    status: "Programada",
                    driver: Number(order.driver),
                    delivery_sequence: Number(order.delivery_sequence),
                };
            });
            await onConfirmRoute(finalOrders as any);
            onClose();
        } catch (error) {
            setLoadingRequest(false);
        }
    };

    const ConfirmationModal = () => {
        return (
            <Modal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmar Acción</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Esta acción bloqueará la edición de los pedidos programados para hoy. ¿Estás seguro de que deseas programar todas las órdenes?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="brand"
                            mr={3}
                            onClick={() => {
                                setIsConfirmationModalOpen(false);
                                confirmRoute();
                            }}
                        >
                            Confirmar
                        </Button>
                        <Button variant="ghost" onClick={() => setIsConfirmationModalOpen(false)}>
                            Cancelar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay />
            <ModalContent bg={bgColor}>
                <ModalHeader>Mapa de entregas por repartidor</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box display="flex">
                        <Box flex="1">
                            <MapContainer center={[20.6783825, -103.348088]} zoom={11} style={{ height: '500px', width: '100%' }}>
                                <MapResizer isOpen={isOpen} />
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[20.7257943, -103.3792193] as any} icon={yellowStarIcon} />

                                {filteredOrders.map((position, idx) => {
                                    const defaultIcon = L.icon({
                                        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                                        iconSize: [18, 27],
                                        iconAnchor: [8, 27],
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
                                            <Marker position={[position.latitude, position.longitude] as any} icon={defaultIcon} />
                                            <Marker position={[position.latitude, position.longitude] as any} icon={labelIcon} interactive={false} />
                                        </React.Fragment>
                                    );
                                })}
                                <Polyline
                                    positions={
                                        (selectedHours === '9 AM - 1 PM'
                                            ? [[20.7257943, -103.3792193], ...filteredOrders.map(order => [order.latitude, order.longitude])]
                                            : [...filteredOrders.map(order => [order.latitude, order.longitude]), [20.7257943, -103.3792193]]) as any
                                    }
                                    color="blue"
                                    weight={2}
                                    opacity={1}
                                    lineJoin="round"
                                />
                            </MapContainer>
                        </Box>
                        <VStack spacing="4" flex="1" ml="8">
                            <FormControl>
                                <FormLabel>Selecciona un repartidor</FormLabel>
                                <Select
                                    placeholder="Selecciona un repartidor"
                                    value={selectedDriver ?? undefined}
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
                                    value={selectedHours ?? undefined}
                                    onChange={(e) => setSelectedHours(e.target.value)}
                                >
                                    <option value="9 AM - 1 PM">9 AM - 1 PM</option>
                                    <option value="1 PM - 5 PM">1 PM - 5 PM</option>
                                </Select>
                            </FormControl>

                            <Box w="full" mt="4">
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="orders">
                                        {(provided: any) => (
                                            <table {...provided.droppableProps} ref={provided.innerRef} style={{ width: '100%' }}>
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
                                                            {(provided: any, snapshot: any) => (
                                                                <tr
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        backgroundColor: snapshot.isDragging ? draggingColor : rowBgColor,
                                                                        color: textColor,
                                                                        borderBottom: snapshot.isDragging ? 'none' : '1px solid',
                                                                        borderBottomColor: rowBgColor,
                                                                    }}
                                                                >
                                                                    {snapshot.isDragging ? (
                                                                        <td colSpan={3}>{order.delivery_address}</td>
                                                                    ) : (
                                                                        <>
                                                                            <td style={{
                                                                                borderRight: '1px solid',
                                                                                borderRightColor: rowBgColor,
                                                                                padding: '8px',
                                                                            }}>{index + 1}</td>
                                                                            <td style={{ padding: '8px' }}>{order.delivery_address}</td>
                                                                            <td style={{ padding: '8px' }}><Text as="span">&#x2630;</Text></td>
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
                        onClick={() => setIsConfirmationModalOpen(true)}
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
            <ConfirmationModal />
        </Modal>
    );
};

export default MapModal;
