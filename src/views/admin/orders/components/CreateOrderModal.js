import React, { useState, useEffect } from 'react';
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
    useColorModeValue,
    useTheme
} from '@chakra-ui/react';
import ReactSelect from 'react-select'
import { FaTrash } from 'react-icons/fa';

const CreateOrderModal = ({ isOpen, onClose, onCreate, productsAvailable }) => {

    const [clientName, setClientName] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('')
    const [cartItemsSelection, setCartItemsSelection] = useState([{ product: null, quantity: null }]);
    const [cartItems, setCartItems] = useState([{ product: '', quantity: '', price: '' }]);
    const [dateError, setDateError] = useState(null);
    const [totalAmountDisplay, setTotalAmountDisplay] = useState("0.00");
    const [isFormValid, setIsFormValid] = useState(false);

    const textColor = useColorModeValue("secondaryGray.900", "white");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    let menuBg = useColorModeValue("white", "navy.900");
    const bgColor = useColorModeValue('white', '#2D3748');

    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderColor: borderColor,
            boxShadow: 'none',
            backgroundColor: menuBg,
            width: '200px',
            maxWidth: '200px'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? 'rgba(0, 0, 0, 0.1)' : bgColor,
            color: state.isFocused ? textColor : 'grey',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: bgColor,
        }),
        input: (provided) => ({
            ...provided,
            color: textColor,
        }),
        singleValue: (provided) => ({
            ...provided,
            color: textColor,
        }),
    };

    useEffect(() => {
        calculateTotalAmount();
        checkFormValidity();
    }, [cartItems, clientName, deliveryAddress, phoneNumber, deliveryDate, deliveryTime, paymentMethod]);

    const checkFormValidity = () => {
        const isCartItemsValid = cartItems.length > 1;
        const isClientNameValid = clientName.trim() !== '';
        const isDeliveryAddressValid = deliveryAddress.trim() !== '';
        const isPhoneNumberValid = phoneNumber.trim() !== '';
        const isDeliveryDateValid = !dateError;

        setIsFormValid(isCartItemsValid && isClientNameValid && isDeliveryAddressValid && isPhoneNumberValid && isDeliveryDateValid);
    };

    const addCartItem = () => {
        const isProductSelected = cartItemsSelection.every(item => item.product !== null);
        const isQuantitySelected = cartItemsSelection.every(item => item.quantity !== null);

        if (isProductSelected && isQuantitySelected) {
            const newCartItem = {
                product: cartItemsSelection[0].product.value,
                quantity: cartItemsSelection[0].quantity,
                price: cartItemsSelection[0].product.price || 0,
            };

            setCartItems(prevCartItems => [...prevCartItems, newCartItem]);

            setCartItemsSelection(prevCartItemsSelection => [
                { product: null, quantity: null },
                ...prevCartItemsSelection
            ]);

            calculateTotalAmount();
            checkFormValidity();
        } else {
            console.log("Please select a product and quantity before adding to the cart.");
        }
    };


    const removeCartItem = (index) => {
        setCartItems((prevCartItems) => {
            const updatedCartItems = [...prevCartItems];
            updatedCartItems.splice(index, 1);
            return updatedCartItems;
        });

        setCartItemsSelection((prevCartItemsSelection) => {
            const updatedCartItemsSelection = [...prevCartItemsSelection];
            const currentSelection = updatedCartItemsSelection[index]?.product;

            const isObjectProduct = currentSelection && typeof currentSelection === 'object' && currentSelection.label && currentSelection.value;

            if (isObjectProduct) {
                updatedCartItemsSelection.splice(index, 1);
            } else {
                updatedCartItemsSelection.splice(index - 1, 1);
            }

            return updatedCartItemsSelection;
        });

        calculateTotalAmount();
    };

    const handleProductSelect = (selectedOption, index) => {
        setCartItemsSelection(prevCartItemsSelection => {
            const updatedCartItemsSelection = [...prevCartItemsSelection];
            updatedCartItemsSelection[index] = { ...updatedCartItemsSelection[index], product: selectedOption };
            return updatedCartItemsSelection;
        });
    };

    const handleQuantityChange = (index, newQuantity) => {
        setCartItemsSelection(prevCartItemsSelection => {
            const updatedCartItemsSelection = [...prevCartItemsSelection];
            updatedCartItemsSelection[index] = { ...updatedCartItemsSelection[index], quantity: newQuantity };
            return updatedCartItemsSelection;
        });
    };

    const calculateTotalAmount = () => {
        if (cartItems.length > 0) {
            const calculatedTotalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                });
            setTotalAmountDisplay(calculatedTotalAmount);
        } else {
            setTotalAmountDisplay("0.00");
        }
    };

    const createOrder = async () => {

        const newOrder = {
            client_name: clientName,
            delivery_address: deliveryAddress,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            phone_number: phoneNumber,
            total_amount: parseFloat(totalAmountDisplay.replace(/[^\d.]/g, '')),
            cart_items: cartItems,
            payment_method: paymentMethod,
            status: "Creada",
            order: "Ver detalles"
        };
        newOrder.cart_items = newOrder.cart_items.filter(item => item.product !== "");
        newOrder.cart_items.forEach(item => {
            if (item.price !== undefined) {
                item.price = Number(item.price) || 0;
            }
        });
        onCreate(newOrder);
        setClientName('');
        setDeliveryTime('');
        setDeliveryAddress('');
        setPhoneNumber('');
        setTotalAmountDisplay('');
        setPaymentMethod('');
        onClose();

    };

    const handleDateChange = (selectedDate) => {
        setDeliveryDate(selectedDate);

        const currentDate = new Date();
        currentDate.setHours(6, 59, 0, 0);

        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        selectedDateObj.setMinutes(selectedDateObj.getTimezoneOffset());

        if (selectedDateObj < currentDate) {
            setDateError('La fecha de entrega no puede ser en el pasado');
        } else {
            setDateError(null);
        }
        checkFormValidity();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} bg={bgColor}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Crear orden</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                        <FormControl isRequired>
                            <FormLabel>Nombre</FormLabel>
                            <Input type="text" color={textColor} borderColor={borderColor} placeholder="Ingresa el nombre del cliente" value={clientName}
                                onChange={(e) => setClientName(e.target.value)} />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Dirección</FormLabel>
                            <Textarea type="text" color={textColor} rows="2" borderColor={borderColor} placeholder="Ingresa la dirección del cliente" value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)} />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Teléfono</FormLabel>
                            <Textarea type="text" color={textColor} rows="1" borderColor={borderColor} placeholder="Ingresa el teléfono del cliente" value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)} />
                        </FormControl>

                        <FormControl isRequired>
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

                        <FormControl isRequired>
                            <FormLabel>Horario de entrega</FormLabel>
                            <Select placeholder="Selecciona un horario" value={deliveryTime}
                                onChange={(e) => setDeliveryTime(e.target.value)}>
                                <option value="8 AM - 1 PM">8 AM - 1 PM</option>
                                <option value="1 PM - 5 PM">1 PM - 5 PM</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Método de pago</FormLabel>
                            <Select placeholder="Selecciona un método de pago" value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                            </Select>
                        </FormControl>

                        <FormLabel
                            color={textColor}
                            fontSize='18px'
                            fontWeight='700'
                            lineHeight='100%'
                        >Lista de productos en pedido</FormLabel>
                        {cartItems.map((item, index) => (
                            <HStack key={index} spacing="4">
                                <FormControl isRequired>
                                    <FormLabel>Producto</FormLabel>
                                    <ReactSelect
                                        isSearchable={true}
                                        styles={customStyles}
                                        options={productsAvailable}
                                        placeholder="Busca producto"
                                        noOptionsMessage={() => "No hay opción"}
                                        value={cartItemsSelection[index]?.product || null}
                                        onChange={(selectedOption) => handleProductSelect(selectedOption, index)}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Cantidad</FormLabel>
                                    <Input
                                        type="number"
                                        placeholder="Ingresa la cantidad"
                                        color={textColor}
                                        borderColor={borderColor}
                                        value={cartItemsSelection[index]?.quantity ?? ''}
                                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Acción</FormLabel>
                                    <Button variant="outline" onClick={() => removeCartItem(index)} isDisabled={cartItems[index]?.product === ""} leftIcon={<FaTrash />}>
                                    </Button>
                                </FormControl>
                            </HStack>
                        ))}

                        <Button variant="outline" onClick={addCartItem}>
                            Agregar al carrito
                        </Button>

                        <Text
                            color={textColor}
                            fontSize='18px'
                            fontWeight='700'
                            lineHeight='100%'>
                            Monto total: {totalAmountDisplay}
                        </Text>

                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="brand" onClick={createOrder} isDisabled={!isFormValid}>Crear</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateOrderModal;
