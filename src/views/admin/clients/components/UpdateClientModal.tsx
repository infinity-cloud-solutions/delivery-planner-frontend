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
  Checkbox,
  Text,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { isAdmin } from 'security';
import { UpdateClientPayload, MappedClient } from 'types/client';

interface UpdateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (payload: UpdateClientPayload & { delete_old_record: boolean }) => Promise<void>;
  onDelete: (client: { phone_number: string }) => Promise<void>;
  clientData: MappedClient;
}

const UpdateClientModal = ({ isOpen, onClose, onUpdate, onDelete, clientData }: UpdateClientModalProps) => {
  const [clientPhoneNumber, setClientPhoneNumber] = useState(clientData.clientPhoneNumber || '');
  const [originalPhoneNumber] = useState(clientData.clientPhoneNumber || '');
  const [clientName, setClientName] = useState(clientData.clientName || '');
  const [clientAddress, setClientAddress] = useState(clientData.clientAddress || '');
  const [clientLatitude, setClientLatitude] = useState<string>(
    clientData.clientLatitude != null ? String(clientData.clientLatitude) : ''
  );
  const [clientLongitude, setClientLongitude] = useState<string>(
    clientData.clientLongitude != null ? String(clientData.clientLongitude) : ''
  );
  const [clientSecondAddress, setClientSecondAddress] = useState(
    clientData.clientSecondAddress || ''
  );
  const [clientSecondLatitude, setClientSecondLatitude] = useState<string>(
    clientData.clientSecondLatitude != null ? String(clientData.clientSecondLatitude) : ''
  );
  const [clientSecondLongitude, setClientSecondLongitude] = useState<string>(
    clientData.clientSecondLongitude != null ? String(clientData.clientSecondLongitude) : ''
  );
  const [clientEmail, setClientEmail] = useState(clientData.clientEmail || '');
  const [clientDiscount, setClientDiscount] = useState(
    clientData.clientDiscount != null ? String(clientData.clientDiscount) : '0'
  );
  const [loadingUpdateRequest, setLoadingUpdateRequest] = useState(false);
  const [loadingDeleteRequest, setLoadingDeleteRequest] = useState(false);
  const [showSecondAddress, setShowSecondAddress] = useState(!!clientData.clientSecondAddress);
  const [isFormValid, setIsFormValid] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [deleteOldRecord, setDeleteOldRecord] = useState(true);

  const isUserAdmin = isAdmin();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');


  useEffect(() => {
    checkFormValidity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clientPhoneNumber,
    clientName,
    clientAddress,
    clientLatitude,
    clientLongitude,
    clientSecondAddress,
    clientSecondLatitude,
    clientSecondLongitude,
    clientEmail,
    clientDiscount,
    showSecondAddress,
  ]);

  const checkFormValidity = () => {
    const isClientPhoneNumberValid = clientPhoneNumber.length === 10;
    const isClientNameValid = clientName.trim() !== '';
    const isClientAddressValid = clientAddress.trim() !== '';
    const isClientEmailValid = clientEmail === '' || /\S+@\S+\.\S+/.test(clientEmail);
    const isClientDiscountValid =
      !isNaN(Number(clientDiscount)) && Number.isInteger(Number(clientDiscount));

    setIsFormValid(
      isClientPhoneNumberValid &&
        isClientNameValid &&
        isClientAddressValid &&
        isClientEmailValid &&
        isClientDiscountValid
    );
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
    initialValue: string | number | null | undefined
  ) => {
    setter(value);
    if (value !== String(initialValue ?? '')) {
      setHasChanges(true);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setClientPhoneNumber(newValue);
    setPhoneChanged(newValue !== originalPhoneNumber);
    setHasChanges(true);
  };

  const updateClient = async () => {
    setLoadingUpdateRequest(true);

    const addressChanged = clientAddress !== clientData.clientAddress;
    const secondAddressChanged =
      showSecondAddress && clientSecondAddress !== clientData.clientSecondAddress;

    const updClient: UpdateClientPayload & { delete_old_record: boolean } = {
      phone_number: clientPhoneNumber,
      original_phone_number: originalPhoneNumber,
      name: clientName,
      address: clientAddress,
      address_geolocation: addressChanged
        ? null
        : { latitude: Number(clientLatitude), longitude: Number(clientLongitude) },
      second_address: showSecondAddress
        ? clientSecondAddress === ''
          ? null
          : clientSecondAddress
        : null,
      second_address_geolocation:
        !showSecondAddress || secondAddressChanged
          ? null
          : {
              latitude: clientSecondLatitude === '' ? null : Number(clientSecondLatitude),
              longitude: clientSecondLongitude === '' ? null : Number(clientSecondLongitude),
            },
      email: clientEmail,
      discount: clientDiscount,
      delete_old_record: deleteOldRecord,
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
    } catch {
      setLoadingUpdateRequest(false);
    }
  };

  const deleteClient = async () => {
    setLoadingDeleteRequest(true);
    const client = { phone_number: originalPhoneNumber };

    try {
      await onDelete(client);
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
    } catch {
      setLoadingDeleteRequest(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Ver Cliente</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing='4'>
            <FormControl isRequired>
              <FormLabel>Teléfono</FormLabel>
              <Input
                type='tel'
                color={textColor}
                borderColor={borderColor}
                placeholder='Ingresa el teléfono del cliente'
                value={clientPhoneNumber}
                onChange={handlePhoneNumberChange}
              />
              {phoneChanged && (
                <>
                  <Text color='red.500' mt={2}>
                    Este cambio creará un nuevo registro con la información actual.
                  </Text>
                  <Checkbox
                    isChecked={deleteOldRecord}
                    onChange={(e) => setDeleteOldRecord(e.target.checked)}
                  >
                    Eliminar el registro antiguo
                  </Checkbox>
                </>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={nameTouched && clientName.trim() === ''}>
              <FormLabel>Nombre</FormLabel>
              <Input
                type='text'
                color={textColor}
                borderColor={borderColor}
                placeholder='Ingresa el nombre del cliente'
                value={clientName}
                onChange={(e) =>
                  handleInputChange(setClientName, e.target.value, clientData.clientName)
                }
                onBlur={() => setNameTouched(true)}
              />
              <FormErrorMessage>El nombre es obligatorio.</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={addressTouched && clientAddress.trim() === ''}>
              <HStack justifyContent='space-between'>
                <FormLabel>Dirección</FormLabel>
                <Button size='sm' onClick={() => setShowSecondAddress(!showSecondAddress)}>
                  {showSecondAddress ? 'Eliminar 2da dirección' : 'Agregar 2da dirección'}
                </Button>
              </HStack>
              <Input
                type='text'
                color={textColor}
                borderColor={borderColor}
                placeholder='Ingresa la dirección primaria del cliente'
                value={clientAddress}
                onChange={(e) =>
                  handleInputChange(setClientAddress, e.target.value, clientData.clientAddress)
                }
                onBlur={() => setAddressTouched(true)}
              />
              <FormErrorMessage>La dirección es obligatoria.</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Latitud</FormLabel>
              <Input
                type='text'
                value={clientLatitude}
                isDisabled={!isUserAdmin}
                onChange={(e) =>
                  handleInputChange(setClientLatitude, e.target.value, clientData.clientLatitude)
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Longitud</FormLabel>
              <Input
                type='text'
                value={clientLongitude}
                isDisabled={!isUserAdmin}
                onChange={(e) =>
                  handleInputChange(setClientLongitude, e.target.value, clientData.clientLongitude)
                }
              />
            </FormControl>

            {showSecondAddress && (
              <FormControl>
                <FormLabel>Dirección Secundaria</FormLabel>
                <Input
                  type='text'
                  color={textColor}
                  borderColor={borderColor}
                  placeholder='Ingresa la dirección secundaria del cliente'
                  value={clientSecondAddress}
                  onChange={(e) =>
                    handleInputChange(
                      setClientSecondAddress,
                      e.target.value,
                      clientData.clientSecondAddress
                    )
                  }
                />
              </FormControl>
            )}

            {clientData.clientSecondAddress && clientData.clientSecondAddress.trim() !== '' && (
              <>
                <FormControl>
                  <FormLabel>Latitud Secundaria</FormLabel>
                  <Input
                    type='text'
                    color={textColor}
                    borderColor={borderColor}
                    placeholder='Ingresa la latitud de la dirección secundaria'
                    value={clientSecondLatitude}
                    isDisabled={!isUserAdmin}
                    onChange={(e) =>
                      handleInputChange(
                        setClientSecondLatitude,
                        e.target.value,
                        clientData.clientSecondLatitude
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Longitud Secundaria</FormLabel>
                  <Input
                    type='text'
                    color={textColor}
                    borderColor={borderColor}
                    placeholder='Ingresa la longitud de la dirección secundaria'
                    value={clientSecondLongitude}
                    isDisabled={!isUserAdmin}
                    onChange={(e) =>
                      handleInputChange(
                        setClientSecondLongitude,
                        e.target.value,
                        clientData.clientSecondLongitude
                      )
                    }
                  />
                </FormControl>
              </>
            )}

            <FormControl
              isInvalid={emailTouched && clientEmail !== '' && !/\S+@\S+\.\S+/.test(clientEmail)}
            >
              <FormLabel>Email</FormLabel>
              <Input
                type='text'
                color={textColor}
                borderColor={borderColor}
                placeholder='Ingresa la dirección de correo electrónico'
                value={clientEmail}
                onChange={(e) =>
                  handleInputChange(setClientEmail, e.target.value, clientData.clientEmail)
                }
                onBlur={() => setEmailTouched(true)}
              />
              <FormErrorMessage>Email inválido.</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Descuento</FormLabel>
              <Select
                placeholder='Selecciona opción de descuento'
                value={clientDiscount}
                onChange={(e) =>
                  handleInputChange(setClientDiscount, e.target.value, clientData.clientDiscount)
                }
              >
                <option value='0'>Sin descuento</option>
                <option value='5'>5% de descuento</option>
                <option value='10'>10% de descuento</option>
                <option value='15'>15% de descuento</option>
                <option value='100'>100% de descuento</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup spacing='6'>
            {isUserAdmin && (
              <Button
                colorScheme='red'
                variant='outline'
                onClick={deleteClient}
                isLoading={loadingDeleteRequest}
                loadingText='Eliminando'
                spinnerPlacement='end'
              >
                Eliminar
              </Button>
            )}
            <Button
              variant='brand'
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
