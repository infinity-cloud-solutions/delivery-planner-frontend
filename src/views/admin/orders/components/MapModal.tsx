import React, { useState, useEffect, useMemo } from 'react';
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
    HStack,
    Checkbox,
    useColorModeValue,
    Box,
    Text,
} from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Order } from 'types/order';

// React 18 StrictMode double-invokes effects. react-leaflet v3's cleanup is a
// no-op on the first invoke (map state not yet committed), leaving an orphaned
// Leaflet instance with stale DOM and active event handlers on the container.
// Fix: patch _initContainer to call .remove() on any orphaned instance before
// re-initializing (properly tears down DOM + event handlers), and store the new
// instance on the container element so the next invocation can find and clean it up.
(function patchLeafletForStrictMode() {
    const proto = L.Map.prototype as any;
    if (proto._patchedForStrictMode) return;
    proto._patchedForStrictMode = true;

    type LeafletContainer = HTMLElement & { _leafletMapInstance?: L.Map };

    const originalInitContainer = proto._initContainer as (this: L.Map, id: string | HTMLElement) => void;
    const originalInitialize = proto.initialize as (this: L.Map, id: string | HTMLElement, opts: any) => void;

    proto._initContainer = function(id: string | HTMLElement) {
        const el = (typeof id === 'string' ? L.DomUtil.get(id) : id) as LeafletContainer;
        if (el) {
            if (el._leafletMapInstance) {
                el._leafletMapInstance.remove();
                delete el._leafletMapInstance;
            }
            delete (el as any)._leaflet_id;
        }
        originalInitContainer.call(this, id);
    };

    proto.initialize = function(id: string | HTMLElement, opts: any) {
        originalInitialize.call(this, id, opts);
        const container = (this as any)._container as LeafletContainer;
        if (container) container._leafletMapInstance = this;
    };
}());

function normalizeSequences(orders: Order[], driver: number, time: string): Order[] {
    const group = orders
        .filter(o => Number(o.driver) === driver && o.delivery_time === time && o.status !== "Programada")
        .sort((a, b) => (a.delivery_sequence ?? 0) - (b.delivery_sequence ?? 0));
    const updates = new Map<any, number>(group.map((o, idx) => [o.id, idx + 1]));
    return orders.map(o => updates.has(o.id) ? { ...o, delivery_sequence: updates.get(o.id)! } : o);
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRoute: (orders: Order[]) => Promise<void>;
  orders: Order[];
  availableDriverIds: number[];
}

const MapResizer = ({ isOpen }: { isOpen: boolean }) => {
    const map = useMap();
    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(timer);
    }, [isOpen, map]);
    return null;
};

const MapModal = ({ isOpen, onClose, onConfirmRoute, orders, availableDriverIds }: MapModalProps) => {
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [selectedHours, setSelectedHours] = useState<string | null>(null);
    const [draftOrders, setDraftOrders] = useState<Order[]>([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [moveTargetDriver, setMoveTargetDriver] = useState('');
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

    // Initialize draft on open; intentionally excludes `orders` to avoid clobbering edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (isOpen) {
            setDraftOrders(orders);
            setSelectedOrderIds([]);
            setMoveTargetDriver('');
            setSelectedDriver(null);
            setSelectedHours(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const visibleOrders = useMemo(() => {
        if (!selectedDriver || !selectedHours) return [];
        return draftOrders
            .filter(o =>
                Number(o.driver) === Number(selectedDriver) &&
                o.delivery_time === selectedHours &&
                o.status !== "Programada"
            )
            .sort((a: any, b: any) => (a.delivery_sequence ?? 0) - (b.delivery_sequence ?? 0));
    }, [draftOrders, selectedDriver, selectedHours]);

    const allVisibleSelected =
        visibleOrders.length > 0 &&
        visibleOrders.every(o => selectedOrderIds.includes(String(o.id)));

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const reordered = Array.from(visibleOrders);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);

        const updated = reordered.map((o, idx) => ({ ...o, delivery_sequence: idx + 1 }));
        const updateMap = new Map(updated.map(o => [o.id, o]));
        setDraftOrders(prev => prev.map(o => updateMap.has(o.id) ? updateMap.get(o.id)! : o));
    };

    const toggleOrderSelection = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (allVisibleSelected) {
            const visibleIds = visibleOrders.map(o => String(o.id));
            setSelectedOrderIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            const visibleIds = visibleOrders.map(o => String(o.id));
            setSelectedOrderIds(prev => [...new Set([...prev, ...visibleIds])]);
        }
    };

    const moveSelectedToDriver = () => {
        if (!moveTargetDriver || selectedOrderIds.length === 0 || !selectedHours || !selectedDriver) return;

        let updated = draftOrders.map(o =>
            selectedOrderIds.includes(String(o.id)) ? { ...o, driver: Number(moveTargetDriver) } : o
        );
        updated = normalizeSequences(updated, Number(selectedDriver), selectedHours);
        updated = normalizeSequences(updated, Number(moveTargetDriver), selectedHours);

        setDraftOrders(updated);
        setSelectedOrderIds([]);
        setMoveTargetDriver('');
    };

    const confirmRoute = async () => {
        setLoadingRequest(true);
        try {
            const finalOrders = draftOrders
                .filter(o => o.status !== "Programada")
                .map(o => ({
                    id: o.id,
                    delivery_date: o.delivery_date,
                    status: "Programada",
                    driver: Number(o.driver),
                    delivery_sequence: Number(o.delivery_sequence),
                }));
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

    const moveTargetOptions = availableDriverIds.filter(id => String(id) !== selectedDriver);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay />
            <ModalContent bg={bgColor}>
                <ModalHeader>Mapa de entregas por repartidor</ModalHeader>
                <ModalCloseButton onKeyDown={(e: React.KeyboardEvent) => { if (e.key === ' ') e.preventDefault(); }} />
                <ModalBody>
                    <Box display="flex">
                        <Box flex="1">
                            <MapContainer center={[20.6783825, -103.348088]} zoom={11} style={{ height: '500px', width: '100%' }}>
                                <MapResizer isOpen={isOpen} />
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[20.7257943, -103.3792193] as any} icon={yellowStarIcon} />

                                {visibleOrders.map((position, idx) => {
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
                                        [[20.7257943, -103.3792193], ...visibleOrders.map(order => [order.latitude, order.longitude])] as any
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
                                    onChange={(e) => {
                                        setSelectedDriver(e.target.value);
                                        setSelectedOrderIds([]);
                                        setMoveTargetDriver('');
                                    }}
                                >
                                    {availableDriverIds.map(id => (
                                        <option key={id} value={String(id)}>Repartidor {id}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Selecciona el horario</FormLabel>
                                <Select
                                    placeholder="Selecciona el horario"
                                    value={selectedHours ?? undefined}
                                    onChange={(e) => {
                                        setSelectedHours(e.target.value);
                                        setSelectedOrderIds([]);
                                        setMoveTargetDriver('');
                                    }}
                                >
                                    <option value="9 AM - 1 PM">9 AM - 1 PM</option>
                                    <option value="1 PM - 5 PM">1 PM - 5 PM</option>
                                </Select>
                            </FormControl>

                            {visibleOrders.length > 0 && availableDriverIds.length > 1 && (
                                <FormControl>
                                    <FormLabel>Mover seleccionados a</FormLabel>
                                    <HStack>
                                        <Select
                                            placeholder="Elegir repartidor"
                                            value={moveTargetDriver}
                                            onChange={(e) => setMoveTargetDriver(e.target.value)}
                                            flex="1"
                                        >
                                            {moveTargetOptions.map(id => (
                                                <option key={id} value={String(id)}>Repartidor {id}</option>
                                            ))}
                                        </Select>
                                        <Button
                                            variant="brand"
                                            isDisabled={!moveTargetDriver || selectedOrderIds.length === 0}
                                            onClick={moveSelectedToDriver}
                                            flexShrink={0}
                                        >
                                            Mover ({selectedOrderIds.filter(id =>
                                                visibleOrders.some(o => String(o.id) === id)
                                            ).length})
                                        </Button>
                                    </HStack>
                                </FormControl>
                            )}

                            <Box w="full" mt="4">
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="orders">
                                        {(provided: any) => (
                                            <table {...provided.droppableProps} ref={provided.innerRef} style={{ width: '100%' }}>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <Checkbox
                                                                isChecked={allVisibleSelected}
                                                                isIndeterminate={
                                                                    !allVisibleSelected &&
                                                                    visibleOrders.some(o => selectedOrderIds.includes(String(o.id)))
                                                                }
                                                                onChange={toggleSelectAll}
                                                            />
                                                        </th>
                                                        <th>#</th>
                                                        <th>Dirección</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {visibleOrders.map((order, index) => (
                                                        <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                                                            {(provided: any, snapshot: any) => (
                                                                <tr
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        backgroundColor: snapshot.isDragging ? draggingColor : rowBgColor,
                                                                        color: textColor,
                                                                        borderBottom: snapshot.isDragging ? 'none' : '1px solid',
                                                                        borderBottomColor: rowBgColor,
                                                                    }}
                                                                >
                                                                    {snapshot.isDragging ? (
                                                                        <td colSpan={4}>{order.delivery_address}</td>
                                                                    ) : (
                                                                        <>
                                                                            <td style={{ padding: '8px' }}>
                                                                                <Checkbox
                                                                                    isChecked={selectedOrderIds.includes(String(order.id))}
                                                                                    onChange={() => toggleOrderSelection(String(order.id))}
                                                                                />
                                                                            </td>
                                                                            <td style={{
                                                                                borderRight: '1px solid',
                                                                                borderRightColor: rowBgColor,
                                                                                padding: '8px',
                                                                            }}>{index + 1}</td>
                                                                            <td style={{ padding: '8px' }}>{order.delivery_address}</td>
                                                                            <td style={{ padding: '8px' }} {...provided.dragHandleProps}>
                                                                                <Text as="span">&#x2630;</Text>
                                                                            </td>
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
