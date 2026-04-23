import React, { useState } from 'react';
import { Alert, AlertIcon, Box, Grid, Spinner, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import DeliveryCard from 'views/driver/deliveries/components/Delivery';
import { useDeliveries } from 'views/driver/deliveries/hooks/useDeliveries';
import { AlertMessage } from 'types/ui';
import { Delivery, DeliveryStatus } from 'types/delivery';

export default function DeliveriesView() {
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
  const { deliveries, loading, error, consolidatedProducts, updateDelivery } = useDeliveries();

  const showAlert = (type: AlertMessage['type'], text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleUpdateDelivery = async (order: Delivery, orderId: string, statusText: DeliveryStatus): Promise<void> => {
    try {
      await updateDelivery({ order, orderId, statusText });
      showAlert('success', 'Orden actualizada en la base de datos');
    } catch {
      showAlert('error', 'Error al actualizar la orden. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Text fontSize="xl" fontWeight="bold" color="red.500">
          {error}
        </Text>
      </Box>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p="6" flex="1">
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">
            Aún no hay órdenes programadas para este día. Vuelve más tarde.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {alertMessage && (
        <motion.div
          initial={{ x: '100%', right: '8px', top: '20%' }}
          animate={{ x: 0, right: '8px', top: '20%' }}
          exit={{ x: '100%' }}
          transition={{ duration: 1 }}
          style={{ position: 'fixed', zIndex: 1000 }}
        >
          <Alert status={alertMessage.type} mb={4}>
            <AlertIcon />
            {alertMessage.text}
          </Alert>
        </motion.div>
      )}
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Grid>
          <AnimatePresence initial={false}>
            {deliveries.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <DeliveryCard
                  gridArea={`${index + 1} / 1 / ${index + 2} / 2`}
                  minH={{ base: 'auto', lg: '420px', '2xl': '365px' }}
                  pe="20px"
                  pb={{ base: '25px', lg: '20px' }}
                  mx="auto"
                  maxW={{ base: 'sm', lg: '2xl', '2xl': '2xl' }}
                  order={order}
                  onUpdateDelivery={handleUpdateDelivery}
                  listOfConsolidatedProducts={consolidatedProducts}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Grid>
      </Box>
    </>
  );
}
