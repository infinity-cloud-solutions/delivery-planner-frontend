import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionIcon,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
  Text,
  Select,
  VStack,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import ReactSelect from 'react-select'
import { FaTrash } from 'react-icons/fa';
import { isAdmin, } from 'security.js';

const UpdateOrderModal = ({ isOpen, onClose, rowData, onUpdate, onDelete, productsAvailable }) => {
  const [clientName, setClientName] = useState(rowData.row.client_name || '');
  const [deliveryTime, setDeliveryTime] = useState(rowData.row.delivery_time || '');
  const [deliveryAddress, setDeliveryAddress] = useState(rowData.row.delivery_address || '');
  const [deliveryLatitude, setDeliveryLatitude] = useState(String(rowData.row.latitude) || '');
  const [deliveryLongitude, setDeliveryLongitude] = useState(String(rowData.row.longitude) || '');
  const [phoneNumber, setPhoneNumber] = useState(rowData.row.phone_number || '');
  const [paymentMethod, setPaymentMethod] = useState(rowData.row.payment_method || '')
  const [cartItemsSelection, setCartItemsSelection] = useState(
    (rowData.row.cart_items || []).map((item) => ({
      product: item.product,
      quantity: Number(item.quantity),
      price: Number(item.price),
    })) || [{ product: null, quantity: null }]
  );

  const [cartItems, setCartItems] = useState(
    (rowData.row.cart_items || []).map((item) => ({
      product: item.product,
      quantity: Number(item.quantity),
      price: Number(item.price),
    })) || [{ product: null, quantity: null }]
  );
  const [dateError, setDateError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(rowData.row.driver || '');
  const [totalAmountDisplay, setTotalAmountDisplay] = useState(rowData.row.total_amount || "0.00");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loadingUpdateRequest, setLoadingUpdateRequest] = useState(false);
  const [loadingDeleteRequest, setLoadingDeleteRequest] = useState(false);
  const [availableDeliveryTimes, setAvailableDeliveryTimes] = useState([]);
  const [discount, setDiscount] = useState(rowData.row.discount || '');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [deliveryAddressTouched, setDeliveryAddressTouched] = useState(false);
  const [deliveryDateTouched, setDeliveryDateTouched] = useState(false);
  const [deliveryTimeTouched, setDeliveryTimeTouched] = useState(false);
  const [paymentMethodTouched, setPaymentMethodTouched] = useState(false);

  const [apiError, setApiError] = useState(null);

  const [deliveryDate, setDeliveryDate] = useState(rowData.row.delivery_date || '');
  const [deliveryNotes, setDeliveryNotes] = useState(rowData.row.notes || '');
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  let isUserAdmin = false;
  isUserAdmin = isAdmin();

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

  const updateOrder = async () => {
    setLoadingUpdateRequest(true)
    const formattedNotes = deliveryNotes === "" ? null : deliveryNotes;
    const formattedDiscount = discount === "" ? null : discount;
    const updOrder = {
      item: {
        id: rowData.row.id,
        client_name: clientName,
        delivery_address: deliveryAddress,
        geolocation: (deliveryLatitude && deliveryLongitude) ? {
          latitude: Number(deliveryLatitude),
          longitude: Number(deliveryLongitude)
        } : null,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        phone_number: phoneNumber,
        total_amount: parseFloat(totalAmountDisplay.replace(/[^\d.]/g, '')),
        cart_items: cartItems,
        payment_method: paymentMethod,
        notes: formattedNotes,
        status: "Creada",
        order: "Ver detalles",
        original_date: rowData.row.delivery_date,
        driver: Number(selectedDriver),
        original_driver: Number(rowData.row.driver),
        discount: formattedDiscount
      },
      rowIndex: rowData.index
    };
    updOrder.item.cart_items = updOrder.item.cart_items.filter(item => item.product !== "");
    updOrder.item.cart_items.forEach(item => {
      if (item.price !== undefined) {
        item.price = Number(item.price) || 0;
      }
    });

    try {
      await onUpdate(updOrder);
      setClientName('');
      setDeliveryTime('');
      setDeliveryAddress('');
      setPhoneNumber('');
      setTotalAmountDisplay('');
      setPaymentMethod('');
      setDeliveryNotes('');
      setSelectedDriver('');
      setDiscount('');
      setLoadingUpdateRequest(false)
      onClose();
    } catch (error) {
      const responseData = error.response.data;
      const responseBody = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
      const errorMessage = responseBody.message;

      if (errorMessage === "Order could not be processed due: No drivers available") {
        setApiError("No hay repartidores disponible para esta fecha/hora. Intenta cambiar de día de entrega u horario.");
      }
      setLoadingUpdateRequest(false)
    }
  };

  const deleteOrder = async () => {
    setLoadingDeleteRequest(true)
    const order = {
      item: {
        id: rowData.row.id,
        delivery_date: rowData.row.delivery_date
      },
      rowIndex: rowData.index
    };
    try {
      await onDelete(order);
      setClientName('');
      setDeliveryTime('');
      setDeliveryAddress('');
      setPhoneNumber('');
      setTotalAmountDisplay('');
      setPaymentMethod('');
      setDeliveryNotes('');
      setSelectedDriver('');
      setLoadingDeleteRequest(false)
      onClose();
    } catch (error) {
      setLoadingDeleteRequest(false)
    }
  };

  useEffect(() => {
    validateDate(deliveryDate);
    setScheduleTimesBasedOnDate(deliveryDate);
    calculateTotalAmount();
    checkFormValidity(); // Check form validity whenever cart items or other relevant fields change
  }, [cartItems, clientName, deliveryAddress, phoneNumber, deliveryDate, deliveryTime, paymentMethod, deliveryLongitude, deliveryLatitude, dateError, apiError, discount]);

  const checkFormValidity = () => {
    const isCartItemsValid = cartItems.length >= 1;
    const isClientNameValid = clientName.trim() !== '';
    const isDeliveryAddressValid = deliveryAddress.trim() !== '';
    const isPhoneNumberValid = phoneNumber.trim() !== '';
    const isLatitudeValid = deliveryLatitude.trim() !== '';
    const isLongitudeValid = deliveryLongitude.trim() !== '';
    const isDeliveryDateValid = !dateError;
    const isApiRequestValid = !apiError;

    setIsFormValid(isCartItemsValid && isClientNameValid && isDeliveryAddressValid && isPhoneNumberValid && isDeliveryDateValid && isLatitudeValid && isLongitudeValid && isApiRequestValid);
  };

  const addCartItem = () => {
    const isProductSelected = cartItemsSelection.every(item => item.product !== null);
    const isQuantitySelected = cartItemsSelection.every(item => item.quantity !== null);

    if (isProductSelected && isQuantitySelected) {
      const newCartItem = {
        product: cartItemsSelection[0].product.value || cartItemsSelection[0].product,
        quantity: cartItemsSelection[0].quantity,
        price: cartItemsSelection[0].product.price || cartItemsSelection[0].price || 0,
      };

      // Check if the product already exists in cartItems
      const existingCartItemIndex = cartItems.findIndex(item => item.product === newCartItem.product);

      if (existingCartItemIndex !== -1) {
        // Update the existing item in cartItems
        setCartItems(prevCartItems => {
          const updatedCartItems = [...prevCartItems];
          updatedCartItems[existingCartItemIndex] = newCartItem;
          return updatedCartItems;
        });
      } else {
        // Add the newCartItem to cartItems
        setCartItems(prevCartItems => [...prevCartItems, newCartItem]);
      }

      setCartItemsSelection((prevCartItemsSelection) => [
        { product: null, quantity: null, price: null },
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
      updatedCartItemsSelection.splice(index, 1);
      return updatedCartItemsSelection;
    });

    calculateTotalAmount();
  };

  const handleProductSelect = (selectedOption, index) => {
    setCartItemsSelection((prevCartItemsSelection) => {
      const updatedCartItemsSelection = [...prevCartItemsSelection];
      updatedCartItemsSelection[index] = {
        ...updatedCartItemsSelection[index],
        product: selectedOption.value || selectedOption.label || selectedOption,
        price: Number(selectedOption.price)
      };
      return updatedCartItemsSelection;
    });
  };

  const handleQuantityChange = (index, newQuantity) => {
    setCartItemsSelection((prevCartItemsSelection) => {
      const updatedCartItemsSelection = [...prevCartItemsSelection];
      updatedCartItemsSelection[index] = {
        ...updatedCartItemsSelection[index],
        quantity: newQuantity,
      };
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
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta orden?
          </ModalBody>
          <ModalFooter>
            <Button
              variant="brand"
              mr={3}
              onClick={() => {
                setIsConfirmationModalOpen(false);
                deleteOrder();
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
    <Modal isOpen={isOpen} onClose={onClose} bg={menuBg}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar orden</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="4">
            <FormControl isRequired isInvalid={phoneTouched && phoneNumber.length !== 10}>
              <FormLabel>Teléfono</FormLabel>
              <Input
                type="number"
                color={textColor}
                borderColor={borderColor}
                placeholder="Si el cliente existe, usaramos la información previamente salvada"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => {
                  setPhoneTouched(true);
                }}
              />

              {phoneTouched && phoneNumber.length !== 10 && (
                <FormErrorMessage>El número de teléfono debe tener 10 dígitos.</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={nameTouched && clientName.trim() === ''}>
              <FormLabel>Nombre</FormLabel>
              <Input
                type="text"
                color={textColor}
                borderColor={borderColor}
                placeholder="Nombre y apellido"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                onBlur={() => {
                  setNameTouched(true);
                }} />
              <FormErrorMessage>El nombre es obligatorio.</FormErrorMessage>
            </FormControl>

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

            <FormControl isRequired isInvalid={deliveryAddressTouched && deliveryAddress.trim() === ''}>
              <FormLabel>Dirección</FormLabel>
              <Textarea
                type="text"
                color={textColor}
                rows="2"
                borderColor={borderColor}
                placeholder="Formato similar al de Google Maps"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                onBlur={() => {
                  setDeliveryAddressTouched(true);
                }}
              />
              <FormErrorMessage>La dirección es obligatoria.</FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Repartidor</FormLabel>
              <Select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(Number(e.target.value))}
                placeholder='Elegir a un repartidor'>
                <option value="1">Repartidor 1</option>
                <option value="2">Repartidor 2</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Latitud</FormLabel>
              <Textarea
                type="text"
                color={textColor}
                rows="1"
                borderColor={borderColor}
                value={deliveryLatitude}
                isDisabled={!isUserAdmin}
                onChange={(e) => setDeliveryLatitude(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Longitud</FormLabel>
              <Textarea
                type="text"
                color={textColor}
                rows="1"
                borderColor={borderColor}
                value={deliveryLongitude}
                isDisabled={!isUserAdmin}
                onChange={(e) => setDeliveryLongitude(e.target.value)} />
            </FormControl>

            <FormControl isRequired isInvalid={deliveryDateTouched && deliveryDate.trim() === ''}>
              <FormLabel>Fecha de entrega</FormLabel>
              <Input
                color={textColor}
                borderColor={borderColor}
                type="date"
                value={deliveryDate}
                onChange={(e) => handleDateChange(e.target.value)}
                onBlur={() => {
                  setDeliveryDateTouched(true);
                }}
              />
              {dateError && (
                <Text color="red.500" fontSize="sm" mt="2">{dateError}</Text>
              )}
              {apiError && (
                <Text color="red.500" fontSize="sm" mt="2">{apiError}</Text>

              )}
              <FormErrorMessage>Fecha de entrega es obligatoria.</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={deliveryTimeTouched && deliveryTime.trim() === ''}>
              <FormLabel>Horario de entrega</FormLabel>
              <Select
                placeholder="Selecciona un horario"
                value={deliveryTime}
                onChange={(e) => {
                  setDeliveryTime(e.target.value);
                  setApiError(false);
                }}
                onBlur={() => {
                  setDeliveryTimeTouched(true);
                }}
              >
                {availableDeliveryTimes.map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </Select>
              <FormErrorMessage>Horario es obligatorio.</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={paymentMethodTouched && paymentMethod.trim() === ''}>
              <FormLabel>Método de pago</FormLabel>
              <Select
                placeholder="Selecciona un método de pago"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                onBlur={() => {
                  setPaymentMethodTouched(true);
                }}>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </Select>
              <FormErrorMessage>Método de pago es obligatorio.</FormErrorMessage>
            </FormControl>

            <FormLabel>Lista de productos en pedido</FormLabel>
            {cartItemsSelection.map((item, index) => (
              <HStack key={index} spacing="4">
                <FormControl isRequired>
                  <FormLabel>Producto</FormLabel>
                  <ReactSelect
                    isSearchable={true}
                    styles={customStyles}
                    options={productsAvailable}
                    placeholder="Buscar producto"
                    noOptionsMessage={() => "No hay opción"}
                    isDisabled={index !== 0}
                    value={{ label: cartItemsSelection[index]?.product, value: cartItemsSelection[index] }}
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

            <Button variant="outline" onClick={addCartItem}>Agregar más al carrito</Button>

            <FormControl>
              <Accordion allowToggle>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        {deliveryNotes ? "Ver notas" : "Agregar notas"}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Textarea
                      type="text"
                      color={textColor}
                      rows="1"
                      borderColor={borderColor}
                      placeholder="Instrucciones para la entrega"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
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

          </VStack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup spacing='6'>
            {isUserAdmin && (
              <Button
                colorScheme='red'
                variant='outline'
                onClick={() => setIsConfirmationModalOpen(true)}
                isLoading={loadingDeleteRequest}
                loadingText='Eliminando'
                spinnerPlacement='end'
              >
                Eliminar
              </Button>
            )}
            <Button
              variant="brand"
              onClick={updateOrder}
              isLoading={loadingUpdateRequest}
              loadingText='Actualizando'
              spinnerPlacement='end'
              isDisabled={!isFormValid}
            >
              Actualizar
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
      <ConfirmationModal />
    </Modal>
  );
};

export default UpdateOrderModal;
