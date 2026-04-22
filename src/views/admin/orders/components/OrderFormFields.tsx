import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface OrderFormFieldsProps {
  // Phone field
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onPhoneNumberBlur?: () => void;
  phoneTouched?: boolean;
  isPhoneDisabled?: boolean;
  isLoadingPhoneCheck?: boolean;

  // Client name field
  clientName: string;
  onClientNameChange: (value: string) => void;
  onClientNameBlur?: () => void;
  nameTouched?: boolean;
  isNameDisabled?: boolean;

  // Delivery address field
  deliveryAddress: string;
  onDeliveryAddressChange: (value: string) => void;
  onDeliveryAddressBlur?: () => void;
  deliveryAddressTouched?: boolean;
  isAddressDisabled?: boolean;

  // Delivery date field
  deliveryDate: string;
  onDeliveryDateChange: (value: string) => void;
  onDeliveryDateBlur?: () => void;
  deliveryDateTouched?: boolean;
  dateError?: string | null;
  apiError?: string | null | boolean;

  // Delivery time field
  deliveryTime: string;
  onDeliveryTimeChange: (value: string) => void;
  onDeliveryTimeBlur?: () => void;
  deliveryTimeTouched?: boolean;
  availableDeliveryTimes: string[];

  // Payment method field
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  onPaymentMethodBlur?: () => void;
  paymentMethodTouched?: boolean;

  /**
   * When false, only the phone field is rendered (used by CreateOrderModal before
   * phone validation completes). Defaults to true — all 6 fields are shown.
   */
  showClientFields?: boolean;

  /** Controls which section(s) to render. Defaults to 'all'. */
  part?: 'A' | 'B' | 'all';

  /** Rendered between clientName and deliveryAddress when Part A is shown. */
  discountSlot?: React.ReactNode;
}

const OrderFormFields: React.FC<OrderFormFieldsProps> = ({
  phoneNumber,
  onPhoneNumberChange,
  onPhoneNumberBlur,
  phoneTouched,
  isPhoneDisabled,
  isLoadingPhoneCheck,
  clientName,
  onClientNameChange,
  onClientNameBlur,
  nameTouched,
  isNameDisabled,
  deliveryAddress,
  onDeliveryAddressChange,
  onDeliveryAddressBlur,
  deliveryAddressTouched,
  isAddressDisabled,
  deliveryDate,
  onDeliveryDateChange,
  onDeliveryDateBlur,
  deliveryDateTouched,
  dateError,
  apiError,
  deliveryTime,
  onDeliveryTimeChange,
  onDeliveryTimeBlur,
  deliveryTimeTouched,
  availableDeliveryTimes,
  paymentMethod,
  onPaymentMethodChange,
  onPaymentMethodBlur,
  paymentMethodTouched,
  showClientFields = true,
  part = 'all',
  discountSlot,
}) => {
  const showA = part !== 'B';
  const showB = part !== 'A';
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  return (
    <>
      {showA && (
        <>
          <FormControl isRequired isInvalid={phoneTouched && phoneNumber.length !== 10}>
            <FormLabel>Teléfono</FormLabel>
            <Input
              type="number"
              color={textColor}
              borderColor={borderColor}
              placeholder="Si el cliente existe, usaramos la información previamente salvada"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              onBlur={onPhoneNumberBlur}
              isDisabled={isPhoneDisabled}
            />
            {isLoadingPhoneCheck && (
              <Spinner
                mt="5px"
                thickness="5px"
                speed="0.65s"
                emptyColor={borderColor}
                color={textColor}
                size="lg"
              />
            )}
            {phoneTouched && phoneNumber.length !== 10 && (
              <FormErrorMessage>El número de teléfono debe tener 10 dígitos.</FormErrorMessage>
            )}
          </FormControl>

          {showClientFields && (
            <>
              <FormControl isRequired isInvalid={nameTouched && clientName.trim() === ''}>
                <FormLabel>Nombre</FormLabel>
                <Input
                  type="text"
                  color={textColor}
                  borderColor={borderColor}
                  placeholder="Nombre y apellido"
                  value={clientName}
                  isDisabled={isNameDisabled}
                  onChange={(e) => onClientNameChange(e.target.value)}
                  onBlur={onClientNameBlur}
                />
                <FormErrorMessage>El nombre es obligatorio.</FormErrorMessage>
              </FormControl>

              {discountSlot}

              <FormControl isRequired isInvalid={deliveryAddressTouched && deliveryAddress.trim() === ''}>
                <FormLabel>Dirección</FormLabel>
                <Textarea
                  // @ts-ignore — Chakra Textarea forwards type prop via rest
                  type="text"
                  color={textColor}
                  rows={2}
                  borderColor={borderColor}
                  placeholder="Formato similar al de Google Maps"
                  value={deliveryAddress}
                  isDisabled={isAddressDisabled}
                  onChange={(e) => onDeliveryAddressChange(e.target.value)}
                  onBlur={onDeliveryAddressBlur}
                />
                <FormErrorMessage>La dirección es obligatoria.</FormErrorMessage>
              </FormControl>
            </>
          )}
        </>
      )}

      {showB && showClientFields && (
        <>
          <FormControl isRequired isInvalid={deliveryDateTouched && deliveryDate.trim() === ''}>
            <FormLabel>Fecha de entrega</FormLabel>
            <Input
              color={textColor}
              borderColor={borderColor}
              type="date"
              value={deliveryDate}
              onChange={(e) => onDeliveryDateChange(e.target.value)}
              onBlur={onDeliveryDateBlur}
            />
            {dateError && (
              <Text color="red.500" fontSize="sm" mt="2">{dateError}</Text>
            )}
            {apiError && (
              <Text color="red.500" fontSize="sm" mt="2">{apiError as string}</Text>
            )}
            <FormErrorMessage>Fecha de entrega es obligatoria.</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={deliveryTimeTouched && deliveryTime.trim() === ''}>
            <FormLabel>Horario de entrega</FormLabel>
            <Select
              placeholder="Selecciona un horario"
              value={deliveryTime}
              onChange={(e) => onDeliveryTimeChange(e.target.value)}
              onBlur={onDeliveryTimeBlur}
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
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              onBlur={onPaymentMethodBlur}
            >
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </Select>
            <FormErrorMessage>Método de pago es obligatorio.</FormErrorMessage>
          </FormControl>
        </>
      )}
    </>
  );
};

export { OrderFormFields };
