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
    VStack,
    useColorModeValue,
    FormErrorMessage,
    Spinner,
    Text,
} from '@chakra-ui/react';

const CreateClientModal = ({ isOpen, onClose, onCreate, onClientExistsCheck }) => {
    const [clientPhoneNumber, setClientPhoneNumber] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientDiscount, setClientDiscount] = useState('0');
    const [isFormValid, setIsFormValid] = useState(false);
    const [loadingCreateRequest, setLoadingCreateRequest] = useState(false);
    const [loadingCheck, setLoadingCheck] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isAnExistingId, setIsAnExistingId] = useState(false);
    const [isValidationCompleted, setIsValidationCompleted] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);
    const [addressTouched, setAddressTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [discountTouched, setDiscountTouched] = useState(false);

    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    const menuBg = useColorModeValue('white', 'navy.900');

    useEffect(() => {
        checkFormValidity();
    }, [clientPhoneNumber, clientName, clientAddress, clientEmail, clientDiscount]);

    const checkFormValidity = () => {
        const isClientPhoneNumberValid = clientPhoneNumber.length === 10;
        const isClientNameValid = clientName.trim() !== '';
        const isClientAddressValid = clientAddress.trim() !== '';
        const isClientEmailValid = clientEmail === '' || /\S+@\S+\.\S+/.test(clientEmail);
        const isClientDiscountValid = !isNaN(clientDiscount) && Number.isInteger(Number(clientDiscount));

        setIsFormValid(isClientPhoneNumberValid && isClientNameValid && isClientAddressValid && isClientEmailValid && isClientDiscountValid);
    };

    const handlePhoneBlur = async () => {
        if (clientPhoneNumber.length === 10) {
            setLoadingCheck(true);
            setErrorMessage('');
            try {
                const clientData = await onClientExistsCheck(clientPhoneNumber);
                setIsValidationCompleted(true)
                if (clientData) {
                    setClientName(clientData.clientName)
                    setClientAddress(clientData.clientAddress)
                    setClientEmail(clientData.clientEmail)
                    setClientDiscount(Number(clientData.clientDiscount))
                    setNameTouched(true);
                    setAddressTouched(true);
                    setEmailTouched(true);
                    setDiscountTouched(true);
                    setErrorMessage('El cliente con este número de teléfono ya existe.');
                    setIsAnExistingId(true);
                }
            } catch (error) {
                setErrorMessage('Error al verificar el cliente.');
            }
            setLoadingCheck(false);
        }
    };

    const createClient = async () => {
        setLoadingCreateRequest(true);
        setErrorMessage('');

        const newClient = {
            phone_number: clientPhoneNumber,
            name: clientName,
            address: clientAddress,
            address_geolocation: null,
            second_address: null,
            second_address_geolocation: null,
            email: clientEmail,
            discount: clientDiscount
        };

        try {
            await onCreate(newClient);
            setClientPhoneNumber('');
            setClientName('');
            setClientAddress('');
            setClientEmail('');
            setClientDiscount('');
            onClose();
        } catch (error) {
            setErrorMessage('Hubo un error al crear el cliente. Por favor, inténtelo de nuevo.');
            setLoadingCreateRequest(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} bg={menuBg}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Crear Cliente</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                        <FormControl isRequired isInvalid={phoneTouched && clientPhoneNumber.length !== 10}>
                            <FormLabel>Teléfono</FormLabel>
                            <Input
                                type="number"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Identificador único de cada cliente"
                                value={clientPhoneNumber}
                                onChange={(e) => setClientPhoneNumber(e.target.value)}
                                onBlur={() => {
                                    setPhoneTouched(true);
                                    handlePhoneBlur();
                                }}
                                isDisabled={isValidationCompleted}
                            />
                            {loadingCheck && <Spinner
                                mt='5px'
                                thickness='5px'
                                speed='0.65s'
                                emptyColor={borderColor}
                                color={textColor}
                                size='lg'
                            />}
                            {phoneTouched && clientPhoneNumber.length !== 10 && (
                                <FormErrorMessage>El número de teléfono debe tener 10 dígitos.</FormErrorMessage>
                            )}
                        </FormControl>
                        {errorMessage && (
                            <Text color="red.500" mt="4">
                                {errorMessage}
                            </Text>
                        )}
                        {isValidationCompleted && (
                            <>
                                <FormControl isRequired isInvalid={nameTouched && clientName.trim() === ''}>
                                    <FormLabel>Nombre</FormLabel>
                                    <Input
                                        type="text"
                                        color={textColor}
                                        borderColor={borderColor}
                                        placeholder="Nombre y apellido"
                                        value={clientName}
                                        isDisabled={isAnExistingId}
                                        onChange={(e) => setClientName(e.target.value)}
                                        onBlur={() => {
                                            setNameTouched(true);
                                        }}
                                    />
                                    <FormErrorMessage>El nombre es obligatorio.</FormErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={addressTouched && clientAddress.trim() === ''}>
                                    <FormLabel>Dirección</FormLabel>
                                    <Input
                                        type="text"
                                        color={textColor}
                                        borderColor={borderColor}
                                        placeholder="Formato similar al que aparece en Google Maps"
                                        value={clientAddress}
                                        isDisabled={isAnExistingId}
                                        onChange={(e) => setClientAddress(e.target.value)}
                                        onBlur={() => {
                                            setAddressTouched(true);
                                        }}
                                    />
                                    <FormErrorMessage>La dirección es obligatoria.</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={emailTouched &&
                                    clientEmail !== '' &&
                                    clientEmail !== null &&
                                    clientEmail !== undefined &&
                                    !/\S+@\S+\.\S+/.test(clientEmail)}>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        type="email"
                                        color={textColor}
                                        borderColor={borderColor}
                                        placeholder="Ingresa la dirección de correo electrónico"
                                        value={clientEmail}
                                        isDisabled={isAnExistingId}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        onBlur={() => {
                                            setEmailTouched(true);
                                        }}
                                    />
                                    <FormErrorMessage>Email inválido.</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={discountTouched &&
                                    (Number(clientDiscount) < 0 || Number(clientDiscount) > 100) ||
                                    (isNaN(clientDiscount) ||
                                        !Number.isInteger(Number(clientDiscount)))}>
                                    <FormLabel>Descuento</FormLabel>
                                    <Input
                                        type="number"
                                        color={textColor}
                                        borderColor={borderColor}
                                        placeholder="Solo válido números enteros"
                                        value={clientDiscount}
                                        isDisabled={isAnExistingId}
                                        onChange={(e) => setClientDiscount(e.target.value)}
                                        onBlur={() => {
                                            setDiscountTouched(true);
                                        }}
                                    />
                                    <FormErrorMessage>Descuento debe ser un entero entre 0 y 100.</FormErrorMessage>
                                </FormControl>
                            </>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="brand"
                        onClick={createClient}
                        isLoading={loadingCreateRequest}
                        loadingText="Guardando"
                        spinnerPlacement="end"
                        isDisabled={!isFormValid || !isValidationCompleted}
                    >
                        Guardar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateClientModal;
