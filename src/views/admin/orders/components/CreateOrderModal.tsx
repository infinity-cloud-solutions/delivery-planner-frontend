import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Box,
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
    RadioGroup,
    Radio,
    VStack,
    HStack,
    useColorModeValue
} from '@chakra-ui/react';
import ReactSelect from 'react-select'
import { FaTrash } from 'react-icons/fa';
import { MappedClient } from 'types/client';
import { CreateOrderPayload } from 'types/order';
import { Product } from 'types/product';
import { OrderFormFields } from './OrderFormFields';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateOrderPayload) => Promise<void>;
  productsAvailable: Product[];
  onClientExistsCheck: (phone: string) => Promise<MappedClient | null>;
}

const CreateOrderModal = ({ isOpen, onClose, onCreate, productsAvailable, onClientExistsCheck }: CreateOrderModalProps) => {

    const [clientName, setClientName] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryAddressLatitude, setDeliveryAddressLatitude] = useState<number | null>(null);
    const [deliveryAddressLongitude, setDeliveryAddressLongitude] = useState<number | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [addressLatitude, setAddressLatitude] = useState<number | null>(null);
    const [addressLongitude, setAddressLongitude] = useState<number | null>(null);
    const [secondAddress, setSecondAddress] = useState<string | null>(null);
    const [secondAddressLatitude, setSecondAddressLatitude] = useState<number | null>(null);
    const [secondAddressLongitude, setSecondAddressLongitude] = useState<number | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('')
    const [cartItemsSelection, setCartItemsSelection] = useState<Array<{product: any; quantity: any}>>([{ product: null, quantity: null }]);
    const [cartItems, setCartItems] = useState<Array<{product: string; quantity: number | string; price: number | string}>>([{ product: '', quantity: '', price: '' }]);
    const [dateError, setDateError] = useState<string | null>(null);
    const [totalAmountDisplay, setTotalAmountDisplay] = useState("0.00");
    const [isFormValid, setIsFormValid] = useState(false);
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [availableDeliveryTimes, setAvailableDeliveryTimes] = useState<string[]>([]);
    const [discount, setDiscount] = useState("");
    const [notes, setNotes] = useState("");
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [loadingCheck, setLoadingCheck] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);
    const [deliveryAddressTouched, setDeliveryAddressTouched] = useState(false);
    const [deliveryDateTouched, setDeliveryDateTouched] = useState(false);
    const [deliveryTimeTouched, setDeliveryTimeTouched] = useState(false);
    const [paymentMethodTouched, setPaymentMethodTouched] = useState(false);

    const [isValidationCompleted, setIsValidationCompleted] = useState(false);
    const [isAnExistingId, setIsAnExistingId] = useState(false);
    const [clientErrorMessage, setClientErrorMessage] = useState<string | boolean>(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedAddressOption, setSelectedAddressOption] = useState('1');
    const [phoneToCheck, setPhoneToCheck] = useState<string | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);


    const textColor = useColorModeValue("secondaryGray.900", "white");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    let menuBg = useColorModeValue("white", "navy.900");
    const bgColor = useColorModeValue('white', '#2D3748');

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            borderColor: borderColor,
            boxShadow: 'none',
            backgroundColor: menuBg,
            width: '200px',
            maxWidth: '200px'
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? 'rgba(0, 0, 0, 0.1)' : bgColor,
            color: state.isFocused ? textColor : 'grey',
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: bgColor,
        }),
        input: (provided: any) => ({
            ...provided,
            color: textColor,
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: textColor,
        }),
    };

    useEffect(() => {
        calculateTotalAmount();
        checkFormValidity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItems, clientName, deliveryAddress, phoneNumber, deliveryDate, deliveryTime, paymentMethod, discount, dateError, apiError]);

    // Handle async phone lookup in a separate effect to avoid state update batching issues
    useEffect(() => {
        if (!phoneToCheck || phoneToCheck.length !== 10) return;
        
        let isMounted = true;

        setLoadingCheck(true);
        
        onClientExistsCheck(phoneToCheck)
            .then((clientData) => {

                if (!isMounted) return;
                
                if (clientData) {
                    setClientName(clientData.clientName);
                    setAddress(clientData.clientAddress);
                    setDeliveryAddress(clientData.clientAddress);
                    setDeliveryAddressLatitude(clientData.clientLatitude ?? null);
                    setDeliveryAddressLongitude(clientData.clientLongitude ?? null);
                    setAddressLongitude(clientData.clientLongitude ?? null);
                    setAddressLatitude(clientData.clientLatitude ?? null);
                    setNameTouched(true);
                    setIsAnExistingId(true);
                    setDiscount(String(clientData.clientDiscount || ''));
                    
                    if (clientData.clientSecondAddress) {
                        setSecondAddress(clientData.clientSecondAddress);
                        setSecondAddressLatitude(clientData.clientSecondLatitude ?? null);
                        setSecondAddressLongitude(clientData.clientSecondLongitude ?? null);
                        setSelectedAddressOption('1');
                        setIsAlertOpen(true);
                    }
                }
                setIsValidationCompleted(true);
            })
            .catch((error) => {

                if (!isMounted) return;
                setClientErrorMessage('Error al verificar el cliente.');
                setIsValidationCompleted(true);
            })
            .finally(() => {
                if (isMounted) setLoadingCheck(false);
            });
        
        return () => {

            isMounted = false;
        };
    }, [phoneToCheck]); // Remove onClientExistsCheck from dependencies to prevent effect re-running

    const checkFormValidity = () => {
        const isCartItemsValid = cartItems.length > 1;
        const isClientNameValid = clientName.trim() !== '';
        const isDeliveryAddressValid = deliveryAddress.trim() !== '';
        const isPhoneNumberValid = phoneNumber.trim() !== '';
        const isDeliveryDateValid = !dateError;
        const isApiRequestValid = !apiError;
        const isPaymentMethodValid = paymentMethod.trim() !== '';

        setIsFormValid(isCartItemsValid && isClientNameValid && isDeliveryAddressValid && isPhoneNumberValid && isDeliveryDateValid && isApiRequestValid && isPaymentMethodValid);
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
        }
    };

    const removeCartItem = (index: any) => {
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

    const handleProductSelect = (selectedOption: any, index: any) => {
        setCartItemsSelection(prevCartItemsSelection => {
            const updatedCartItemsSelection = [...prevCartItemsSelection];
            updatedCartItemsSelection[index] = { ...updatedCartItemsSelection[index], product: selectedOption };
            return updatedCartItemsSelection;
        });
    };

    const handleQuantityChange = (index: any, newQuantity: any) => {
        setCartItemsSelection(prevCartItemsSelection => {
            const updatedCartItemsSelection = [...prevCartItemsSelection];
            updatedCartItemsSelection[index] = { ...updatedCartItemsSelection[index], quantity: newQuantity };
            return updatedCartItemsSelection;
        });
    };

    const calculateTotalAmount = () => {
        const discountMultipliers: Record<string, number> = {
            "5": 0.95,
            "10": 0.90,
            "15": 0.85,
            "20": 0.80,
            "100": 0.00,
        };

        let totalAmount = 0;
        if (cartItems.length > 0) {
            totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

            if (discount && discountMultipliers.hasOwnProperty(discount)) {
                totalAmount *= discountMultipliers[discount];
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
        const formattedNotes = notes === "" ? null : notes;
        const formattedDiscount = discount === "" ? null : discount;
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
            notes: formattedNotes,
            discount: formattedDiscount,
            geolocation: (deliveryAddressLatitude && deliveryAddressLongitude) ? {
                latitude: Number(deliveryAddressLatitude),
                longitude: Number(deliveryAddressLongitude)
            } : null
        };
        newOrder.cart_items = newOrder.cart_items.filter(item => item.product !== "");
        newOrder.cart_items.forEach(item => {
            if (item.price !== undefined) {
                item.price = Number(item.price) || 0;
            }
        });
        try {
            await onCreate(newOrder as any);
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
            const responseData = (error as any).response.data;
            const responseBody = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
            const errorMessage = responseBody.message;

            if (errorMessage === "Order could not be processed due: No drivers available") {
                setApiError("No hay repartidores disponible para esta fecha/hora. Intenta cambiar de día de entrega u horario.");
            }
            setLoadingRequest(false)
        }
    };

    const validateDate = (selectedDate: any) => {
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

    const setScheduleTimesBasedOnDate = (selectedDate: any) => {
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

    const handleDateChange = (selectedDate: any) => {
        setDeliveryDate(selectedDate);
        setApiError(null)
        validateDate(selectedDate);
        setScheduleTimesBasedOnDate(selectedDate);
    };

    const handleDiscount = (selectedDiscount: any) => {
        setDiscount(selectedDiscount)
        calculateTotalAmount();
    }

    const handlePhoneBlur = useCallback(() => {
        setPhoneTouched(true);
        if (phoneNumber.length === 10) {
            setPhoneToCheck(phoneNumber);
        }
    }, [phoneNumber]);

    const handleAddressSelection = () => {

        switch (selectedAddressOption) {
            case '1':
                setDeliveryAddress(address ?? '');
                setDeliveryAddressLatitude(addressLatitude);
                setDeliveryAddressLongitude(addressLongitude);
                setDeliveryAddressTouched(true);
                break;
            case '2':
                setDeliveryAddress(secondAddress ?? '');
                setDeliveryAddressLatitude(secondAddressLatitude);
                setDeliveryAddressLongitude(secondAddressLongitude);
                setDeliveryAddressTouched(true);
                break;
            case 'none':
                setDeliveryAddress('');
                setDeliveryAddressLatitude(null);
                setDeliveryAddressLongitude(null);
                setDeliveryAddressTouched(true);
                break;
            default:
                break;
        }

        setIsAlertOpen(false);
    };

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Crear orden</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                        <OrderFormFields
                            part="all"
                            discountSlot={
                                <FormControl>
                                    <FormLabel>Descuento</FormLabel>
                                    <Select
                                        placeholder="Selecciona un descuento"
                                        value={discount}
                                        onChange={(e) => handleDiscount(e.target.value)}
                                    >
                                        <option value="0">Sin descuento</option>
                                        <option value="5">5% de descuento</option>
                                        <option value="10">10% de descuento</option>
                                        <option value="15">15% de descuento</option>
                                        <option value="100">100% de descuento</option>
                                    </Select>
                                </FormControl>
                            }
                            phoneNumber={phoneNumber}
                            onPhoneNumberChange={setPhoneNumber}
                            onPhoneNumberBlur={handlePhoneBlur}
                            phoneTouched={phoneTouched}
                            isPhoneDisabled={isValidationCompleted}
                            isLoadingPhoneCheck={loadingCheck}
                            clientName={clientName}
                            onClientNameChange={setClientName}
                            onClientNameBlur={() => setNameTouched(true)}
                            nameTouched={nameTouched}
                            isNameDisabled={isAnExistingId}
                            deliveryAddress={deliveryAddress}
                            onDeliveryAddressChange={setDeliveryAddress}
                            onDeliveryAddressBlur={() => setDeliveryAddressTouched(true)}
                            deliveryAddressTouched={deliveryAddressTouched}
                            isAddressDisabled={isAnExistingId && deliveryAddress !== ''}
                            deliveryDate={deliveryDate}
                            onDeliveryDateChange={handleDateChange}
                            onDeliveryDateBlur={() => setDeliveryDateTouched(true)}
                            deliveryDateTouched={deliveryDateTouched}
                            dateError={dateError}
                            apiError={apiError}
                            availableDeliveryTimes={availableDeliveryTimes}
                            deliveryTime={deliveryTime}
                            onDeliveryTimeChange={(v) => { setDeliveryTime(v); setApiError(null); }}
                            onDeliveryTimeBlur={() => setDeliveryTimeTouched(true)}
                            deliveryTimeTouched={deliveryTimeTouched}
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            onPaymentMethodBlur={() => setPaymentMethodTouched(true)}
                            paymentMethodTouched={paymentMethodTouched}
                            showClientFields={isValidationCompleted}
                        />
                        {clientErrorMessage && (
                            <Text color="red.500" mt="4">
                                {clientErrorMessage}
                            </Text>
                        )}
                        {isValidationCompleted && (
                            <>
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
                                                placeholder="Buscar producto"
                                                noOptionsMessage={() => "No hay opción"}
                                                value={cartItemsSelection[index]?.product || null}
                                                isDisabled={index !== 0}
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
                                                isDisabled={index !== 0}
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
                                    <Accordion allowToggle>
                                        <AccordionItem>
                                            <h2>
                                                <AccordionButton>
                                                    <Box flex="1" textAlign="left">
                                                        Agregar notas
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                <Textarea
                                                    color={textColor}
                                                    rows={1}
                                                    borderColor={borderColor}
                                                    placeholder="Instrucciones para la entrega"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                />
                                            </AccordionPanel>
                                        </AccordionItem>
                                    </Accordion>
                                </FormControl>

                                <Text
                                    color={textColor}
                                    fontSize='18px'
                                    fontWeight='700'
                                    lineHeight='100%'>
                                    Monto total: {totalAmountDisplay}
                                </Text>
                            </>
                        )}
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
        <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsAlertOpen(false)}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Cliente encontrado
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text fontSize="md" fontWeight="thin" mb={{ sm: '5px', md: '8px', lg: '15px' }}> Seleccione una de las direcciones guardadas</Text>
                        <RadioGroup onChange={setSelectedAddressOption} value={selectedAddressOption}>
                            <VStack align="start">
                                <Radio value="1">{address}</Radio>
                                <Radio value="2">{secondAddress}</Radio>
                                <Radio value="none">No usar ninguna</Radio>
                            </VStack>
                        </RadioGroup>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                            Cancelar
                        </Button>
                        <Button colorScheme="blue" onClick={handleAddressSelection} ml={3}>
                            Aceptar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>
    );
};

export default CreateOrderModal;
