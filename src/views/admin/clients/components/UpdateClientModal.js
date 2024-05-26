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
    FormErrorMessage,
    Input,
    VStack,
    HStack,
    useColorModeValue,
} from '@chakra-ui/react';

import { isAdmin, } from 'security.js';

const UpdateClientModal = ({ isOpen, onClose, onUpdate, onDelete, clientData }) => {

    const [clientPhoneNumber, setClientPhoneNumber] = useState(clientData.clientPhoneNumber || '');
    const [clientName, setClientName] = useState(clientData.clientName || '');
    const [clientAddress, setClientAddress] = useState(clientData.clientAddress || '');
    const [clientLatitude, setClientLatitude] = useState(clientData.clientLatitude || '');
    const [clientLongitude, setClientLongitude] = useState(clientData.clientLongitude || '');
    const [clientSecondAddress, setClientSecondAddress] = useState(clientData.clientSecondAddress || '');
    const [clientSecondLatitude, setClientSecondLatitude] = useState(clientData.clientSecondLatitude || '');
    const [clientSecondLongitude, setClientSecondLongitude] = useState(clientData.clientSecondLongitude || '');
    const [clientEmail, setClientEmail] = useState(clientData.clientEmail || '');
    const [clientDiscount, setClientDiscount] = useState(clientData.clientDiscount || '0');
    const [loadingUpdateRequest, setLoadingUpdateRequest] = useState(false);
    const [showSecondAddress, setShowSecondAddress] = useState(!!clientData.clientSecondAddress);
    const [isFormValid, setIsFormValid] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);
    const [addressTouched, setAddressTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [discountTouched, setDiscountTouched] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    let isUserAdmin = false;
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    let menuBg = useColorModeValue('white', 'navy.900');

    useEffect(() => {
        checkFormValidity();
    }, [clientPhoneNumber, clientName, clientAddress, clientLatitude, clientLongitude, clientSecondAddress, clientSecondLatitude, clientSecondLongitude, clientEmail, clientDiscount, showSecondAddress]);

    const checkFormValidity = () => {
        const isClientPhoneNumberValid = clientPhoneNumber.length === 10;
        const isClientNameValid = clientName.trim() !== '';
        const isClientAddressValid = clientAddress.trim() !== '';
        const isClientEmailValid = clientEmail === '' || /\S+@\S+\.\S+/.test(clientEmail);
        const isClientDiscountValid = !isNaN(clientDiscount) && Number.isInteger(Number(clientDiscount));

        setIsFormValid(isClientPhoneNumberValid && isClientNameValid && isClientAddressValid  && isClientEmailValid && isClientDiscountValid);
    };

    const handleInputChange = (setter, value, initialValue) => {
        setter(value);
        if (value !== initialValue) {
            setHasChanges(true);
        }
    };

    const updateClient = async () => {
        setLoadingUpdateRequest(true);

        const addressChanged = clientAddress !== clientData.clientAddress;

        const secondAddressChanged = showSecondAddress && clientSecondAddress !== clientData.clientSecondAddress;

        const updClient = {
            phone_number: clientPhoneNumber,
            name: clientName,
            address: clientAddress,
            address_geolocation: addressChanged
                ? { latitude: null, longitude: null }
                : { latitude: clientLatitude, longitude: clientLongitude },
            second_address: showSecondAddress ? (clientSecondAddress === '' ? null : clientSecondAddress) : null,
            second_address_geolocation: !showSecondAddress || secondAddressChanged
                ? null
                : {
                    latitude: clientSecondLatitude === '' ? null : clientSecondLatitude,
                    longitude: clientSecondLongitude === '' ? null : clientSecondLongitude
                },
            email: clientEmail,
            discount: clientDiscount
        };
        try {
            await onUpdate(updClient);
            setClientPhoneNumber('');
            setClientName('');
            setClientAddress('');
            setClientLongitude('');
            setClientLatitude('');
            setClientSecondAddress('');
            setClientSecondLatitude('');
            setClientSecondLongitude('');
            setClientEmail('');
            setClientDiscount('');
            onClose();
        } catch (error) {
            setLoadingUpdateRequest(false);
        }


    };


    const deleteClient = async () => {
        // const updatedClientName = clientName || clientData.name || '';
        // const updatedClientPrice = clientPrice || clientData.price || '';

        // const client = {
        //     item: {
        //         name: updatedClientName,
        //         price: updatedClientPrice,
        //         id: clientData.id || '',
        //     },
        //     rowIndex: rowData.index
        // };
        // onDelete(client);
        // setClientName('');
        // setClientPrice('');
        onClose();
    };

    isUserAdmin = isAdmin();

    return (
        <Modal isOpen={isOpen} onClose={onClose} bg={menuBg}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Ver Cliente</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                        <FormControl isRequired>
                            <FormLabel>Teléfono</FormLabel>
                            <Input
                                type="number"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa el teléfono del cliente"
                                value={clientPhoneNumber}
                                isDisabled={true}
                                onChange={(e) => setClientPhoneNumber(e.target.value)}
                            />
                        </FormControl>

                        <FormControl isRequired isInvalid={nameTouched && clientName.trim() === ''}>
                            <FormLabel>Nombre</FormLabel>
                            <Input
                                type="text"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa el nombre del cliente"
                                defaultValue={clientName}
                                onChange={(e) => handleInputChange(setClientName, e.target.value, clientData.clientName)}
                                onBlur={() => {
                                    setNameTouched(true);
                                }}
                            />
                            <FormErrorMessage>El nombre es obligatorio.</FormErrorMessage>

                        </FormControl>

                        <FormControl isRequired isInvalid={addressTouched && clientAddress.trim() === ''}>
                            <HStack justifyContent="space-between">
                                <FormLabel>Dirección</FormLabel>
                                <Button size="sm" onClick={() => setShowSecondAddress(!showSecondAddress)}>
                                    {showSecondAddress ? 'Eliminar 2da dirección' : 'Agregar 2da dirección'}
                                </Button>
                            </HStack>
                            <Input
                                type="text"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa la dirección primaria del cliente"
                                value={clientAddress}
                                onChange={(e) => handleInputChange(setClientAddress, e.target.value, clientData.clientAddress)}
                                onBlur={() => {
                                    setAddressTouched(true);
                                }}
                            />
                            <FormErrorMessage>La dirección es obligatoria.</FormErrorMessage>

                        </FormControl>

                        <FormControl>
                            <FormLabel>Latitud</FormLabel>
                            <Input
                                type="number"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa la latitud de la dirección primaria"
                                defaultValue={clientLatitude}
                                isDisabled={!isUserAdmin}
                                onChange={(e) => handleInputChange(setClientLatitude, e.target.value, clientData.clientLatitude)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Longitud</FormLabel>
                            <Input
                                type="number"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa la longitud del cliente"
                                defaultValue={clientLongitude}
                                isDisabled={!isUserAdmin}
                                onChange={(e) => handleInputChange(setClientLongitude, e.target.value, clientData.clientLongitude)}
                            />
                        </FormControl>
                        {showSecondAddress && (
                            <>
                                <FormControl>
                                    <FormLabel>Dirección Secundaria</FormLabel>
                                    <Input
                                        type="text"
                                        color={textColor}
                                        borderColor={borderColor}
                                        placeholder="Ingresa la dirección secundaria del cliente"
                                        value={clientSecondAddress}
                                        onChange={(e) => handleInputChange(setClientSecondAddress, e.target.value, clientData.clientSecondAddress)}
                                    />
                                </FormControl>
                            </>
                        )}
                        {clientData.clientSecondAddress && clientData.clientSecondAddress.trim() !== '' && (
                            <>
                                <FormControl>
                                    <FormLabel>Latitud Secundaria</FormLabel>
                                    <Input
                                        type="number"
                                        color={textColor}
                                        borderColor={borderColor}
                                        placeholder="Ingresa la latitud de la dirección secundaria"
                                        value={clientSecondLatitude}
                                        isDisabled={!isUserAdmin}
                                        onChange={(e) => handleInputChange(setClientSecondLatitude, e.target.value, clientData.clientSecondLatitude)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Longitud Secundaria</FormLabel>
                                    <Input
                                        type="number"
                                        color={textColor}
                                        borderColor={borderColor}
                                        placeholder="Ingresa la longitud de la dirección secundaria"
                                        value={clientSecondLongitude}
                                        isDisabled={!isUserAdmin}
                                        onChange={(e) => handleInputChange(setClientSecondLongitude, e.target.value, clientData.clientSecondLongitude)}
                                    />
                                </FormControl>
                            </>
                        )}

                        <FormControl isInvalid={emailTouched &&
                            clientEmail !== '' &&
                            clientEmail !== null &&
                            clientEmail !== undefined &&
                            !/\S+@\S+\.\S+/.test(clientEmail)}>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="text"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa la dirección de correo electrónico"
                                defaultValue={clientEmail}
                                onChange={(e) => handleInputChange(setClientEmail, e.target.value, clientData.clientEmail)}
                                onBlur={() => {
                                    setEmailTouched(true);
                                }}
                            />
                            <FormErrorMessage>Email inválido.</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={discountTouched &&
                            ((Number(clientDiscount) < 0 || Number(clientDiscount) > 100) ||
                            (isNaN(clientDiscount) ||
                                !Number.isInteger(Number(clientDiscount))))}>
                            <FormLabel>Descuento</FormLabel>
                            <Input
                                type="number"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Solo válido números enteros"
                                defaultValue={clientDiscount}
                                onChange={(e) => handleInputChange(setClientDiscount, e.target.value, clientData.clientDiscount)}
                                onBlur={() => {
                                    setDiscountTouched(true);
                                }}
                            />
                            <FormErrorMessage>Descuento debe ser un entero entre 0 y 100.</FormErrorMessage>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <ButtonGroup spacing='6'>
                        {isUserAdmin && (
                            <Button colorScheme='red' variant='outline' onClick={deleteClient}>
                                Eliminar
                            </Button>
                        )}
                        <Button
                            variant="brand"
                            onClick={updateClient}
                            isLoading={loadingUpdateRequest}
                            loadingText='Actualizando'
                            spinnerPlacement='end'
                            isDisabled={!isFormValid || !hasChanges}
                        >
                            Actualizar
                        </Button>
                    </ButtonGroup>
                </ModalFooter>

            </ModalContent>
        </Modal>
    );
};

export default UpdateClientModal;
