import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Alert, AlertIcon, Box, Flex, Icon, Link, SimpleGrid, Spinner, useColorModeValue } from '@chakra-ui/react';
import { MdNoAccounts } from 'react-icons/md';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

import Orders from 'views/admin/orders/components/Orders';
import { columnsDataOrders } from 'views/admin/orders/variables/columnsData';
import { useQueryParam, getDateAsQueryParam } from 'utils/Utility';
import { isDriver } from 'security';
import { useAuthGuard } from 'hooks/useAuthGuard';
import { useOrders } from 'views/admin/orders/hooks/useOrders';
import type { UpdateOrderArgs, DeleteOrderArgs } from 'views/admin/orders/hooks/useOrders';
import type { CreateOrderPayload, Order } from 'types/order';
import { useProducts } from 'views/admin/hooks/useProducts';
import { useClientLookup } from 'views/admin/hooks/useClientLookup';
import { AlertMessage } from 'types/ui';

export default function OrdersView() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParamDateValue = useQueryParam('date');

  useAuthGuard();

  const initialDate = queryParamDateValue ?? getDateAsQueryParam();
  const { orders, loading, fetchOrders, createOrder, updateOrder, deleteOrder, scheduleOrders, saveRoute, consolidatedProducts } =
    useOrders(initialDate);
  const { products, fetchProducts } = useProducts();
  const { lookupClient } = useClientLookup();

  useEffect(() => { fetchProducts(); }, [location, fetchProducts]);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDateChange = (date: { value: string }) => {
    navigate(`/admin/orders?date=${date.value}`);
    fetchOrders(date.value);
  };

  const handleOrderCreated = async (payload: CreateOrderPayload): Promise<void> => {
    try {
      await createOrder(payload);
      showAlert('success', 'Orden guardada en la base de datos');
    } catch (err) {
      showAlert('error', 'Error al crear la orden. Intenta de nuevo.');
      throw err;
    }
  };

  const handleOrderUpdated = async (args: UpdateOrderArgs): Promise<void> => {
    try {
      await updateOrder(args);
      showAlert('success', 'Orden actualizada en la base de datos');
    } catch (err) {
      showAlert('error', 'Error al actualizar la orden. Intenta de nuevo.');
      throw err;
    }
  };

  const handleOrderDeleted = async (args: DeleteOrderArgs): Promise<void> => {
    try {
      await deleteOrder(args);
      showAlert('success', 'Orden eliminada en la base de datos');
    } catch (err) {
      showAlert('error', 'Error al eliminar la orden. Intenta de nuevo.');
      throw err;
    }
  };

  const handleScheduleOrders = (selectedDrivers: number[]) => scheduleOrders(selectedDrivers);

  const handleSaveRoute = async (routeOrders: Order[]): Promise<void> => {
    try {
      await saveRoute(routeOrders);
      showAlert('success', 'Ruta creada con éxito.');
    } catch (err) {
      showAlert('error', 'Error al guardar la ruta.');
      throw err;
    }
  };

  if (isDriver()) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Flex align="center" justify="center" direction="column">
          <Icon as={MdNoAccounts} color="red.500" boxSize={12} />
          <Box mt={4} color="red.500" fontSize="lg" textAlign="center">
            El contenido está restringido para administradores y mesa de control.
          </Box>
          <Link as={RouterLink} to="/driver" color={brandColor} fontWeight="bold" mt="20px">
            Volver a la sección de repartidor
          </Link>
        </Flex>
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
          transition={{ duration: 0.5 }}
          style={{ position: 'fixed', zIndex: 1000 }}
        >
          <Alert status={alertMessage.type} mb={4}>
            <AlertIcon />
            {alertMessage.text}
          </Alert>
        </motion.div>
      )}
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <SimpleGrid mb="20px" columns={{ sm: 1, md: 1 }} spacing={{ base: '20px', xl: '20px' }}>
          {loading ? (
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl"
              position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" />
          ) : (
            <Orders
              columnsData={columnsDataOrders}
              tableData={orders}
              onOrderCreated={handleOrderCreated}
              onOrderUpdated={handleOrderUpdated}
              onOrderDeleted={handleOrderDeleted}
              onOrdersScheduled={handleScheduleOrders}
              onDateSelect={handleDateChange}
              productsAvailable={products}
              listOfConsolidatedProducts={consolidatedProducts}
              onValidateClient={lookupClient}
              onRouteSelected={handleSaveRoute}
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}
