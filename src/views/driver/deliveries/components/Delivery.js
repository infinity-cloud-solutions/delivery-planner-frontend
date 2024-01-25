import {
    AbsoluteCenter,
    Box,
    Button,
    ButtonGroup,
    Badge,
    Divider,
    Flex,
    HStack,
    Text,
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
    FaRegCalendarMinus
} from "react-icons/fa6";

import Card from "components/card/Card.js";
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function DeliveryCard(props) {
    const { order, coolerInfo, onUpdateDelivery, ...rest } = props;
    const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
    const [cooler, setCooler] = useState('');
    const [loadingAddToDelivery, setLoadingAddToDelivery] = useState(false);
    const [loadingCompleteDelivery, setLoadingCompleteDelivery] = useState(false);
    const [loadingRescheduleDelivery, setLoadingRescheduleDelivery] = useState(false);
    const [orderStatus, setOrderStatus] = useState(order.status);

    useEffect(() => {
        console.log(order, cooler)
        setOrderStatus(order.status);
    }, [order.status]);

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

        order.cooler = cooler
        await onUpdateDelivery(order, order.id, "En ruta");
        setOrderStatus('En ruta');

        setLoadingAddToDelivery(false);
    };

    const handleCompleteDeliveryClick = async () => {
        setLoadingCompleteDelivery(true);

        order.status = "Entregada"
        await onUpdateDelivery(order, order.id, "Entregada");
        setOrderStatus('Entregada');

        setLoadingCompleteDelivery(false);
    };

    const handleRescheduleDeliveryClick = async () => {
        setLoadingRescheduleDelivery(true);

        await onUpdateDelivery(order, order.id, "Reprogramada");
        setOrderStatus('Reprogramada');

        setLoadingRescheduleDelivery(false);
    };

    const screenSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' });
    const API_KEY = "AIzaSyCdDrdjCvg5wpOQGPC8Y9VhNNdw7n839Wc"
    const handleClickMarker = () => {
        // Open Google Maps with the order address
        const addressQuery = encodeURIComponent(order.address);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

        // Open the link in a new tab
        window.open(googleMapsUrl, '_blank');
    };

    return (
        <Card {...rest} mb='20px' align='center' p='20px'>
            <Flex maxW={{ base: "sm", lg: "2xl", "2xl": "2xl" }} direction={{ base: "column", "2xl": "row" }}>

                <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p="6" flex="1">
                    <Box mb='21px'>
                        <APIProvider apiKey={API_KEY} libraries={['marker']}>
                            <Map
                                mapId={'bf51a910020fa25a'}
                                zoom={15}
                                center={{ lat: parseFloat(order.latitude), lng: parseFloat(order.longitude) }}
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                                onClick={handleClickMarker}
                                style={{ height: '100%', minHeight: '150px' }} // Adjust the minHeight as needed
                            >
                                <Marker
                                    position={{ lat: parseFloat(order.latitude), lng: parseFloat(order.longitude) }}
                                    clickable={true}
                                    title={'clickable google.maps.Marker'}
                                />
                            </Map>
                        </APIProvider>
                    </Box>
                    <Box display="flex" alignItems="flex-start" mb="2">
                        <FaMapLocationDot color="gray.500" size={25} />
                        <Box
                            // color="gray.500"
                            fontWeight="semibold"
                            letterSpacing={{ base: "normal", md: "wide", lg: "wider" }}
                            fontSize={{ base: "xs", sm: "sm", md: "md" }}
                            ml={{ base: "2", md: "4" }}
                        >
                            {order.address}
                        </Box>
                        <Badge ml="auto" colorScheme="green">
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
                            Total: ${order.total_amount}
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
                        Orden en hielera: {coolerInfo}
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
                                onClick={handleCompleteDeliveryClick}
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
                                onClick={handleRescheduleDeliveryClick}
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
        </Card>
    );
}
