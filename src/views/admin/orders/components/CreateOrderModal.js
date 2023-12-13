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

const CreateOrderModal = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState([{ product: '', quantity: 0, price: 0 }]);

    const [deliveryDate, setDeliveryDate] = useState('');

    const addCartItem = () => {
        setCartItems([...cartItems, { product: '', quantity: 0, price: 0 }]);
    };

    const textColor = useColorModeValue("secondaryGray.900", "white");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    let menuBg = useColorModeValue("white", "navy.900");

    const calculateTotalAmount = () => {
        // Check if cartItems is not empty before calculating total amount
        if (cartItems.length > 0) {
            return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                });
        } else {
            return "0.00"; // or any default value when there are no products
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
                            <Input type="text" color={textColor} borderColor={borderColor} placeholder="Ingresa el nombre del cliente" />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Dirección</FormLabel>
                            <Textarea type="text" color={textColor} borderColor={borderColor} placeholder="Ingresa la dirección del cliente" />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Teléfono</FormLabel>
                            <Textarea type="text" color={textColor} rows="1" borderColor={borderColor} placeholder="Ingresa el teléfono del cliente" />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Fecha de entrega</FormLabel>
                            <Input
                                color={textColor}
                                borderColor={borderColor}
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Horario de entrega</FormLabel>
                            <Select placeholder="Selecciona un horario">
                                <option value="9-1">9-1</option>
                                <option value="1-5">1-5</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Método de pago</FormLabel>
                            <Select placeholder="Selecciona un método de pago">
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
                    <Button variant="brand">Crear</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateOrderModal;
