import React, { useState } from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Text,
    Select,
    VStack,
    HStack,
    useColorModeValue
} from '@chakra-ui/react';

const CreateOrderModal = ({ isOpen, onClose, onCreate }) => {
    const [clientName, setClientName] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cartItems, setCartItems] = useState([{ product: '', quantity: 0, price: 0 }]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [totalAmount, setTotalAmount] = useState(0.0)
    const [paymentMethod, setPaymentMethod] = useState('')
    const [dateError, setDateError] = useState(null);

    const addCartItem = () => {
        setCartItems([...cartItems, { product: '', quantity: 0, price: 0 }]);
    };

    const textColor = useColorModeValue("secondaryGray.900", "white");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    let menuBg = useColorModeValue("white", "navy.900");

    const createOrder = async () => {

        const newOrder = {
            client_name: clientName,
            delivery_address: deliveryAddress,
            delivery_date: deliveryAddress,
            delivery_time: deliveryTime,
            phone_number: phoneNumber,
            total_amount: totalAmount,
            cart_items: cartItems,
            payment_method: paymentMethod,
            status: "Creada",
            order: "Ver detalles"
        };
        onCreate(newOrder);
        setClientName('');
        setDeliveryTime('');
        setDeliveryAddress('');
        setPhoneNumber('');
        setTotalAmount('');
        setPaymentMethod('');
        onClose();

    };

    const calculateTotalAmount = () => {
        if (cartItems.length > 0) {
            return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                });
        } else {
            return "0.00";
        }
    };

    const handleDateChange = (selectedDate) => {
        setDeliveryDate(selectedDate);

        const currentDate = new Date();
        const selectedDateObj = new Date(selectedDate);

        if (selectedDateObj < currentDate) {
            setDateError('La fecha de entrega no puede ser en el pasado');
        } else {
            setDateError(null);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} bg={menuBg}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Crear orden</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                        <FormControl>
                            <FormLabel>Nombre</FormLabel>
                            <Input type="text" color={textColor} borderColor={borderColor} placeholder="Ingresa el nombre del cliente" value={clientName}
                                onChange={(e) => setClientName(e.target.value)} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Dirección</FormLabel>
                            <Textarea type="text" color={textColor} rows="2" borderColor={borderColor} placeholder="Ingresa la dirección del cliente" value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Teléfono</FormLabel>
                            <Textarea type="text" color={textColor} rows="1" borderColor={borderColor} placeholder="Ingresa el teléfono del cliente" value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Fecha de entrega</FormLabel>
                            <Input
                                color={textColor}
                                borderColor={borderColor}
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                            {dateError && (
                                <Text color="red.500" fontSize="sm" mt="2">
                                    {dateError}
                                </Text>
                            )}
                        </FormControl>


                        <FormControl>
                            <FormLabel>Horario de entrega</FormLabel>
                            <Select placeholder="Selecciona un horario" value={deliveryTime}
                                onChange={(e) => setDeliveryTime(e.target.value)}>
                                <option value="9-1">9-1</option>
                                <option value="1-5">1-5</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Método de pago</FormLabel>
                            <Select placeholder="Selecciona un método de pago" value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                            </Select>
                        </FormControl>

                        <FormLabel>Lista de productos en pedido</FormLabel>
                        {cartItems.map((item, index) => (
                            <HStack key={index} spacing="4">
                                <FormControl>
                                    <FormLabel>Producto</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="Ingresa el nombre del producto"
                                        value={item.product}
                                        color={textColor} borderColor={borderColor}
                                        onChange={(e) => {
                                            const updatedItems = [...cartItems];
                                            updatedItems[index].product = e.target.value;
                                            setCartItems(updatedItems);
                                        }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Cantidad</FormLabel>
                                    <Input
                                        type="number"
                                        placeholder="Ingresa la cantidad"
                                        value={item.quantity}
                                        color={textColor} borderColor={borderColor}
                                        onChange={(e) => {
                                            const updatedItems = [...cartItems];
                                            updatedItems[index].quantity = parseInt(e.target.value, 10);
                                            setCartItems(updatedItems);
                                        }}
                                    />
                                </FormControl>
                            </HStack>
                        ))}

                        <Button variant="outline" onClick={addCartItem}>
                            Agregar más al carrito
                        </Button>

                        <Text
                            color={textColor}
                            fontSize='18px'
                            fontWeight='700'
                            lineHeight='100%'>
                            Monto total: {calculateTotalAmount()}
                        </Text>

                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="brand" onClick={createOrder}>Crear</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateOrderModal;
