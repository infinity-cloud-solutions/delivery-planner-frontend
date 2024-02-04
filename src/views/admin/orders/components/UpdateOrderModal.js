import React, { useState, useEffect } from 'react';
import {
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

const UpdateOrderModal = ({ isOpen, onClose, rowData, onUpdate, OnDelete, productsAvailable }) => {
  const [clientName, setClientName] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('')
  const [cartItemsSelection, setCartItemsSelection] = useState(
    (rowData.row.cart_items || []).map((item) => ({
      product: item.product,
      quantity: Number(item.quantity),
      price: Number(item.price),
    })) || [{ product: null, quantity: null }]
  );


  const [cartItems, setCartItems] = useState(rowData.row.cart_items || [{ product: '', quantity: '', price: '' }]);
  const [dateError, setDateError] = useState(null);
  const [totalAmountDisplay, setTotalAmountDisplay] = useState(rowData.row.total_amount || "0.00");
  const [isFormValid, setIsFormValid] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState(rowData.delivery_date || '');
  let isUserAdmin = false;
  isUserAdmin = isAdmin();

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: borderColor,
      boxShadow: 'none',
      backgroundColor: '#2D3748',
      width: '200px',
      maxWidth: '200px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(0, 0, 0, 0.1)' : '#2D3748',
      color: state.isFocused ? 'white' : 'white',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#2D3748',
    }),
    input: (provided) => ({
      ...provided,
      color: 'white',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
  };

  const updateOrder = async () => {


    // const order = {
    // };
    // onUpdate(order);
    // setProductName('');
    // setProductPrice('');
    // onClose();

  };

  const deleteOrder = async () => {
    // const updatedProductName = productName || rowData.row.name || '';
    // const updatedProductPrice = productPrice || rowData.row.price || '';

    // const product = {
    //   item: {
    //     name: updatedProductName,
    //     price: updatedProductPrice,
    //   },
    //   rowIndex: rowData.index
    // };
    // onDelete(product);
    // setProductName('');
    // setProductPrice('');
    // onClose();

  };

  useEffect(() => {
    calculateTotalAmount();
    checkFormValidity(); // Check form validity whenever cart items or other relevant fields change
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
    if (cartItems.length > 0) {
      const calculatedTotalAmount = cartItems.reduce((sum, item) => sum + cartItems.price * cartItems.quantity, 0)
        .toLocaleString('es-MX', {
          style: 'currency',
          currency: 'MXN',
        });
      setTotalAmountDisplay(calculatedTotalAmount);
    } else {
      setTotalAmountDisplay("0.00");
    }
  };


  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  let menuBg = useColorModeValue("white", "navy.900");

  return (
    <Modal isOpen={isOpen} onClose={onClose} bg={menuBg}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar orden</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="4">
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input type="text" color={textColor} borderColor={borderColor}
                defaultValue={rowData.row.client_name} />
            </FormControl>

            <FormControl>
              <FormLabel>Direccion</FormLabel>
              <Textarea type="text" color={textColor} borderColor={borderColor}
                defaultValue={rowData.row.address} />
            </FormControl>

            <FormControl>
              <FormLabel>Teléfono</FormLabel>
              <Textarea type="text" color={textColor} rows="1" borderColor={borderColor}
                defaultValue={rowData.row.phone_number} />
            </FormControl>

            <FormControl>
              <FormLabel>Fecha de entrega </FormLabel>
              <Input color={textColor} borderColor={borderColor} type="date" defaultValue={rowData.row.delivery_date}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Horario de entrega</FormLabel>
              <Select defaultValue={rowData.delivery_time}>
                <option value="9-1">9-1</option>
                <option value="1-5">1-5</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Método de pago</FormLabel>
              <Select defaultValue={rowData.payment_method}>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </Select>
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
                    placeholder="Busca producto"
                    noOptionsMessage={() => "No hay opción"}
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

            <Text
              color={textColor}
              fontSize='18px'
              fontWeight='700'
              lineHeight='100%'>
              Monto total: {rowData.row.total_amount}
            </Text>

          </VStack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup spacing='6'>
            {isUserAdmin && (
              <Button colorScheme='red' variant='outline' onClick={deleteOrder}>
                Eliminar
              </Button>
            )}
            <Button variant="brand" onClick={updateOrder}>
              Actualizar
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateOrderModal;
