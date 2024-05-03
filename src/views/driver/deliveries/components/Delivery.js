import {
    AbsoluteCenter,
    Box,
    Button,
    ButtonGroup,
    Badge,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Text,
    Textarea,
    Select,
    useColorModeValue,
    Table,
    Tag,
    TagLabel,
    TagRightIcon,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useBreakpointValue
} from "@chakra-ui/react";
import {
    FaMapLocationDot,
    FaUser,
    FaTruckMoving,
    FaPhone,
    FaCreditCard,
    FaMoneyBillTransfer,
    FaMoneyBill1Wave,
    FaClipboardCheck,
    FaRegCalendarMinus,
    FaMoneyCheckDollar,
    FaNoteSticky
} from "react-icons/fa6";

import Card from "components/card/Card.js";
import ConsolidatedDeliveryModal from "./ConsolidatedModalDeliver";
import React, { useState, useEffect, useRef } from 'react';

export default function DeliveryCard(props) {
    const { order, onUpdateDelivery, listOfConsolidatedProducts, ...rest } = props;
    const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
    const [cooler, setCooler] = useState('');
    const [loadingAddToDelivery, setLoadingAddToDelivery] = useState(false);
    const [loadingCompleteDelivery, setLoadingCompleteDelivery] = useState(false);
    const [loadingRescheduleDelivery, setLoadingRescheduleDelivery] = useState(false);
    const [orderStatus, setOrderStatus] = useState(order.status);
    const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const rescheduleReasonRef = useRef('');
    const [isConsolidatedModalOpen, setIsConsolidatedModalOpen] = useState(false);

    useEffect(() => {
        setOrderStatus(order.status);
        setCooler(order.cooler)
    }, [order.status]);

    useEffect(() => {
    }, [rescheduleReasonRef]);

    const RenderTag = ({ size, paymentMethod }) => {
        let icon, colorScheme;

        switch (paymentMethod) {
            case 'Efectivo':
                icon = FaMoneyBill1Wave;
                colorScheme = 'green';
                break;
            case 'Tarjeta':
                icon = FaCreditCard;
                colorScheme = 'purple';
                break;
            case 'Transferencia':
                icon = FaMoneyBillTransfer;
                colorScheme = 'blue';
                break;
            case 'Pagada':
                icon = FaMoneyCheckDollar;
                colorScheme = 'orange';
                break;
            default:
                icon = FaMoneyBill1Wave;
                colorScheme = 'green';
        }

        return (
            <Tag size={size} variant='outline' colorScheme={colorScheme}>
                <TagLabel>{paymentMethod}</TagLabel>
                <TagRightIcon as={icon} />
            </Tag>
        );
    };

    const handleAddToDeliveryClick = async () => {
        setLoadingAddToDelivery(true);
        const updatedOrder = {
            client_name: order.client_name,
            delivery_address: order.delivery_address,
            delivery_date: order.delivery_date,
            original_date: order.delivery_date,
            delivery_time: order.delivery_time,
            phone_number: order.phone_number,
            total_amount: parseFloat(order.total_amount),
            cart_items: order.cart_items,
            payment_method: order.payment_method,
            status: "En ruta",
            order: "Ver detalles",
            cooler: Number(cooler),
            created_at: order.created_at,
            created_by: order.created_by,
            delivery_sequence: Number(order.delivery_sequence),
            driver: Number(order.driver),
            errors: order.errors,
            id: order.id,
            latitude: order.latitude,
            longitude: order.longitude,
            notes: order.notes,
        };
        await onUpdateDelivery(updatedOrder, updatedOrder.id, "En ruta");

        setLoadingAddToDelivery(false);
    };

    const handleCompleteDeliveryClick = async () => {
        setLoadingCompleteDelivery(true);

        const updatedOrder = {
            client_name: order.client_name,
            delivery_address: order.delivery_address,
            delivery_date: order.delivery_date,
            original_date: order.delivery_date,
            delivery_time: order.delivery_time,
            phone_number: order.phone_number,
            total_amount: parseFloat(order.total_amount),
            cart_items: order.cart_items,
            payment_method: order.payment_method,
            status: "Entregada",
            order: "Ver detalles",
            cooler: Number(cooler),
            created_at: order.created_at,
            created_by: order.created_by,
            delivery_sequence: Number(order.delivery_sequence),
            driver: Number(order.driver),
            errors: order.errors,
            id: order.id,
            latitude: order.latitude,
            longitude: order.longitude,
            notes: order.notes,
        };
        await onUpdateDelivery(updatedOrder, updatedOrder.id, "Entregada");

        setLoadingCompleteDelivery(false);
        setIsCompletedModalOpen(false);
    };

    const handleRescheduleDeliveryClick = async () => {
        setLoadingRescheduleDelivery(true);
        const updatedOrder = {
            client_name: order.client_name,
            delivery_address: order.delivery_address,
            delivery_date: order.delivery_date,
            original_date: order.delivery_date,
            delivery_time: order.delivery_time,
            phone_number: order.phone_number,
            total_amount: parseFloat(order.total_amount),
            cart_items: order.cart_items,
            payment_method: order.payment_method,
            status: "Reprogramada",
            order: "Ver detalles",
            cooler: Number(cooler),
            created_at: order.created_at,
            created_by: order.created_by,
            delivery_sequence: Number(order.delivery_sequence),
            driver: Number(order.driver),
            errors: order.errors,
            id: order.id,
            latitude: order.latitude,
            longitude: order.longitude,
            notes: rescheduleReasonRef.current
        };
        closeRescheduleModal()
        await onUpdateDelivery(updatedOrder, updatedOrder.id, "Reprogramada");
    };

    const closeRescheduleModal = () => {
        setIsRescheduleModalOpen(false);
    };

    const CompletedModal = () => {
        return (
            <Modal
                isOpen={isCompletedModalOpen}
                onClose={() => setIsCompletedModalOpen(false)}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmar Acción</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        ¿Estás seguro de que deseas marcar la orden como "Entregada"?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="brand"
                            mr={3}
                            onClick={() => {
                                setIsCompletedModalOpen(false);
                                handleCompleteDeliveryClick();
                            }}
                        >
                            Confirmar
                        </Button>
                        <Button variant="ghost" onClick={() => setIsCompletedModalOpen(false)}>
                            Cancelar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    };

    const handleOnChange = (e) => {
        rescheduleReasonRef.current = e.target.value;
    }

    const RescheduleModal = () => {
        return (
            <Modal
                isOpen={isRescheduleModalOpen}
                onClose={closeRescheduleModal}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmar acción</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Motivo de la reprogramación</FormLabel>
                            <Textarea

                                placeholder="Motivo de la reprogramación"

                                onChange={handleOnChange}
                                type="text"
                                id="reschedule-reason"
                                name="reschedule-reason"
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="brand"
                            mr={3}
                            onClick={() => {
                                handleRescheduleDeliveryClick();
                            }}

                        >
                            Reprogramar
                        </Button>
                        <Button variant="ghost" onClick={closeRescheduleModal}>
                            Cancelar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    };

    const screenSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' });
    const handleClickMarker = () => {
        const lat = order.latitude;
        const long = order.longitude;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;

        window.open(googleMapsUrl, '_blank');
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });

    const openConsolidatedModal = () => {
        setIsConsolidatedModalOpen(true);
    };

    const closeConsolidatedModal = () => {
        setIsConsolidatedModalOpen(false);
    };

    return (
        <Card {...rest} mb='20px' align='center' p='20px'>
            <Flex px="25px" justify="space-between" mb="20px" align="right" justifyContent="flex-end">
                <Flex align="right">
                    <ButtonGroup spacing="6">
                        <Button variant="outline" onClick={openConsolidatedModal}>
                            Ver consolidado
                        </Button>
                    </ButtonGroup>
                </Flex>
            </Flex>
            <Flex maxW={{ base: "sm", lg: "2xl", "2xl": "2xl" }} direction={{ base: "column", "2xl": "row" }}>

                <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p="6" flex="1" mb={{ base: "10px", sm: "5px", md: "15px" }}>
                    <Button colorScheme='teal' variant='ghost' onClick={handleClickMarker}>
                        Ver en Google Maps
                    </Button>
                    <Box display="flex" alignItems="flex-start" mb="2">
                        <FaMapLocationDot color="gray.500" size={25} />
                        <Box
                            // color="gray.500"
                            fontWeight="semibold"
                            letterSpacing={{ base: "normal", md: "wide", lg: "wider" }}
                            fontSize={{ base: "xs", sm: "sm", md: "md" }}
                            ml={{ base: "2", md: "4" }}
                            textAlign="left"
                        >
                            {order.delivery_address}
                        </Box>
                        <Badge ml={{ base: "10px", md: "20px" }} colorScheme="green">
                            {order.delivery_time}
                        </Badge>
                    </Box>
                    <Box
                        mt="1"
                        fontWeight="semibold"
                        as="h4"
                        isTruncated
                        color="gray.500"
                        fontSize={{ base: "sm", md: "md", lg: "lg" }}
                    >
                        <Flex alignItems="center">
                            <FaUser color="gray.600" size={14} />
                            <Text ml={{ base: "2", md: "4", lg: "6" }}>{order.client_name}</Text>
                        </Flex>
                    </Box>
                    <Box
                        mt="1"
                        fontWeight="semibold"
                        as="h4"
                        isTruncated
                        color="gray.500"
                        fontSize={{ base: "sm", md: "md", lg: "lg" }}
                    >
                        <Flex alignItems="center">
                            <FaPhone color="gray.600" size={14} />
                            <Text ml={{ base: "2", md: "4", lg: "6" }}>{order.phone_number}</Text>
                        </Flex>
                    </Box>
                    {order.notes && (
                        <Box
                            mt="1"
                            fontWeight="semibold"
                            as="h4"
                            isTruncated
                            color="gray.500"
                            fontSize={{ base: "sm", md: "md", lg: "lg" }}
                        >
                            <Flex alignItems="center">
                                <FaNoteSticky color="gray.600" size={14} />
                                <Text ml={{ base: "2", md: "4", lg: "6" }}>{order.notes}</Text>
                            </Flex>
                        </Box>
                    )}
                    <Box position='relative' padding={{ base: '4', md: '8', lg: '10' }}>
                        <Divider />
                        <AbsoluteCenter
                            px={{ base: '2', md: '4', lg: '6' }}
                            fontSize={{ base: 'xs', md: 'sm', lg: 'md' }}
                            fontWeight="bold"
                            textTransform="uppercase"
                            mb={{ base: '1', md: '2', lg: '3' }}
                            bgColor={useColorModeValue("gray.100", "gray.700")}
                        >
                            Detalles del pedido
                        </AbsoluteCenter>
                    </Box>
                    <Box overflowX="auto" mt="1">
                        <Table variant="unstyled">
                            <Thead>
                                <Tr>
                                    <Th color="gray.500" textAlign={{ base: 'center', md: 'left' }} p={{ base: '1.5', md: '2.5', lg: '3' }}>Producto</Th>
                                    <Th color="gray.500" textAlign={{ base: 'center', md: 'left' }} p={{ base: '1.5', md: '2.5', lg: '3' }}>Cantidad</Th>
                                    <Th color="gray.500" textAlign={{ base: 'center', md: 'left' }} p={{ base: '1.5', md: '2.5', lg: '3' }}>Precio unitario</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {order.cart_items.map((item, index) => (
                                    <Tr key={index}>
                                        <Td fontSize={{ base: 'sm', md: 'md' }} p={{ base: '1', md: '2' }}>{item.product}</Td>
                                        <Td fontSize={{ base: 'sm', md: 'md' }} textAlign={{ base: 'center', md: 'center' }} p={{ base: '1', md: '2' }}>{item.quantity}</Td>
                                        <Td fontSize={{ base: 'sm', md: 'md' }} textAlign={{ base: 'center', md: 'center' }} p={{ base: '1', md: '2' }}>{`$${item.price}.00`}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>

                    <Box display='flex' alignItems='baseline' justifyContent="space-between" mt="4">
                        <HStack spacing={4}>
                            {screenSize && <RenderTag size={screenSize} paymentMethod={order.payment_method} />}
                        </HStack>
                        <Box
                            color='white.500'
                            fontWeight='semibold'
                            letterSpacing='wide'
                            fontSize={screenSize}
                            textTransform='uppercase'
                            ml='2'
                        >
                            Total: {formatter.format(order.total_amount)}
                        </Box>
                    </Box>
                </Box>
                <Flex direction='column' pe='44px'>
                    <Text
                        color={textColorPrimary}
                        fontWeight='bold'
                        textAlign='start'
                        fontSize='l'
                        mt={{ base: "20px", "2xl": "50px" }}
                    >
                        Información de cargada
                    </Text>
                </Flex>
                {orderStatus === 'Programada' ? (
                    <Select
                        placeholder="En qué hielera va"
                        value={cooler}
                        onChange={(e) => setCooler(e.target.value)}
                        mt="2"
                    >
                        {[...Array(10).keys()].map((value) => (
                            <option key={value + 1} value={value + 1}>
                                {value + 1}
                            </option>
                        ))}
                    </Select>
                ) : (
                    <Text
                        color={textColorPrimary}
                        textAlign='start'
                        fontSize='m'
                        mt={{ base: "10px", "xl": "20px" }}
                    >
                        Orden en hielera: {cooler || ""}
                    </Text>
                )}
                {orderStatus === 'Programada' && (
                    <Button
                        spacing={{ base: 2, md: 4, lg: 6 }}
                        mt={{ base: 4, md: 6 }}
                        leftIcon={<FaTruckMoving />}
                        variant="brand"
                        onClick={handleAddToDeliveryClick}
                        isLoading={loadingAddToDelivery}
                        loadingText='Actualizando'
                        spinnerPlacement='end'
                        isDisabled={!cooler}
                    >
                        Agregar a ruta
                    </Button>
                )}

                {orderStatus === 'En ruta' && (
                    <div>
                        <ButtonGroup variant="outline" spacing="6">
                            <Button
                                spacing={{ base: 2, md: 4, lg: 6 }}
                                mt={{ base: 4, md: 6 }}
                                leftIcon={<FaClipboardCheck />}
                                variant="brand"
                                onClick={() => setIsCompletedModalOpen(true)}
                                isLoading={loadingCompleteDelivery}
                                loadingText='Actualizando'
                                spinnerPlacement='end'
                            >
                                Entregada
                            </Button>
                            <Button
                                spacing={{ base: 2, md: 4, lg: 6 }}
                                mt={{ base: 4, md: 6 }}
                                leftIcon={<FaRegCalendarMinus />}
                                variant="outline"
                                onClick={() => setIsRescheduleModalOpen(true)}
                                isLoading={loadingRescheduleDelivery}
                                loadingText='Actualizando'
                                spinnerPlacement='end'
                            >
                                Reprogramar
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
            </Flex>
            <CompletedModal />
            <RescheduleModal />
            {isConsolidatedModalOpen && (
                <ConsolidatedDeliveryModal
                    isOpen={isConsolidatedModalOpen}
                    onClose={closeConsolidatedModal}
                    products={listOfConsolidatedProducts}
                />
            )}
        </Card>
    );
}
