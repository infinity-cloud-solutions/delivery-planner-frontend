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
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [availableDeliveryTimes, setAvailableDeliveryTimes] = useState([]);
    const [discount, setDiscount] = useState("");
    const [notes, setNotes] = useState("");

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
    }, [cartItems, clientName, deliveryAddress, phoneNumber, deliveryDate, deliveryTime, paymentMethod, discount]);

    const checkFormValidity = () => {
        const isCartItemsValid = cartItems.length > 1;
        const isClientNameValid = clientName.trim() !== '';
        const isDeliveryAddressValid = deliveryAddress.trim() !== '';
        const isPhoneNumberValid = phoneNumber.trim() !== '';
        const isDeliveryDateValid = !dateError;
        const isApiRequestValid = !apiError;

        setIsFormValid(isCartItemsValid && isClientNameValid && isDeliveryAddressValid && isPhoneNumberValid && isDeliveryDateValid && isApiRequestValid);
    };

    const addCartItem = () => {
        const isProductSelected = cartItemsSelection.every(item => item.product !== null);
        const isQuantitySelected = cartItemsSelection.every(item => item.quantity !== null);

        if (isProductSelected && isQuantitySelected) {
            const newCartItem = {
                product: cartItemsSelection[0].product.value,
                quantity: Number(cartItemsSelection[0].quantity),
                price: Number(cartItemsSelection[0].product.price) || 0,
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
        let totalAmount = 0;
        if (cartItems.length > 0) {
            totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            if (discount === "5") {
                totalAmount *= 0.95;
            } else if (discount === "10") {
                totalAmount *= 0.9;
            }
        }
        const calculatedTotalAmount = totalAmount.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
        });

        setTotalAmountDisplay(calculatedTotalAmount);
    };

    const createOrder = async () => {
        setLoadingRequest(true)

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
            order: "Ver detalles",
            notes: notes,
            discount: discount
        };
        newOrder.cart_items = newOrder.cart_items.filter(item => item.product !== "");
        newOrder.cart_items.forEach(item => {
            if (item.price !== undefined) {
                item.price = Number(item.price) || 0;
            }
        });
        try {
            await onCreate(newOrder);
            setClientName('');
            setDeliveryTime('');
            setDeliveryAddress('');
            setPhoneNumber('');
            setTotalAmountDisplay('');
            setPaymentMethod('');
            setLoadingRequest(false);
            setNotes('');
            setDiscount('');
            onClose();
        } catch (error) {
            const responseData = error.response.data;
            const responseBody = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
            const errorMessage = responseBody.message;

            if (errorMessage === "Order could not be processed due: No drivers available") {
                setApiError("No hay repartidores disponible para esta fecha/hora. Intenta cambiar de día de entrega u horario.");
            }
            setLoadingRequest(false)
        }
    };

    const validateDate = (selectedDate) => {
        const selectedDateObj = new Date(selectedDate + 'T00:00:00');

        selectedDateObj.setHours(0, 0, 0, 0);

        const currentDate = new Date();
        const currentTime = currentDate.getTime();

        const nineAMTimestamp = new Date(currentDate);
        nineAMTimestamp.setHours(9, 0, 0, 0);

        const nextDayTimestamp = new Date(currentDate);
        nextDayTimestamp.setDate(nextDayTimestamp.getDate() + 1);
        nextDayTimestamp.setHours(0, 0, 0, 0);

        if (selectedDateObj.toDateString() === currentDate.toDateString()) {
            if (currentTime > nineAMTimestamp.getTime()) {
                setDateError('No se puede crear orden después de las 9 am');
                checkFormValidity();
                return;
            }
        } else if (selectedDateObj.getTime() < currentDate.getTime()) {
            setDateError('No se puede programar una orden en el pasado');
            checkFormValidity();
            return;
        } else if (selectedDateObj.getDay() === 0) {
            setDateError('No hay entregas los domingos');
            checkFormValidity();
            return;
        }

        setDateError(null);
        checkFormValidity();
    };

    const setScheduleTimesBasedOnDate = (selectedDate) => {
        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek = selectedDateObj.getDay();
        if (dayOfWeek === 6) { // saturday
            setAvailableDeliveryTimes(["9 AM - 1 PM"]);
        } else if (dayOfWeek === 0) { // sunday
            setAvailableDeliveryTimes([]);
        } else { // mon-fri
            setAvailableDeliveryTimes(["9 AM - 1 PM", "1 PM - 5 PM"]);
        }
    }

    const handleDateChange = (selectedDate) => {
        setDeliveryDate(selectedDate);
        setApiError(false)
        validateDate(selectedDate);
        setScheduleTimesBasedOnDate(selectedDate);
    };

    const handleDiscount = (selectedDiscount) => {
        setDiscount(selectedDiscount)
        calculateTotalAmount();
    }

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
                            {apiError && (
                                <Text color="red.500" fontSize="sm" mt="2">
                                    {apiError}
                                </Text>
                            )}
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Horario de entrega</FormLabel>
                            <Select placeholder="Selecciona un horario" value={deliveryTime}
                                onChange={(e) => {
                                    setDeliveryTime(e.target.value);
                                    setApiError(false);
                                }}
                            >
                                {availableDeliveryTimes.map((time, index) => (
                                    <option key={index} value={time}>{time}</option>
                                ))}
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

                        <FormControl>
                            <FormLabel>Notas</FormLabel>
                            <Textarea type="text" color={textColor} rows="3" borderColor={borderColor} placeholder="Notas sobre el pedido" value={notes}
                                onChange={(e) => setNotes(e.target.value)} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Descuento</FormLabel>
                            <Select
                                placeholder="Selecciona un descuento"
                                value={discount}
                                onChange={(e) => handleDiscount(e.target.value)}
                            >
                                <option value="5">5% de descuento</option>
                                <option value="10">10% de descuento</option>
                            </Select>
                        </FormControl>

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
                    <Button variant="brand" onClick={createOrder} isLoading={loadingRequest}
                        loadingText='Guardando'
                        spinnerPlacement='end'
                        isDisabled={!isFormValid}>Guardar orden</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateOrderModal;
