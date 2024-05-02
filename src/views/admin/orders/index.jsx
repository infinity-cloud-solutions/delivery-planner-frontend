import React, { useState, useEffect } from "react";
import axios from 'axios';
import { motion } from 'framer-motion';

// Chakra imports
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Icon,
  Link,
  useColorModeValue,
  SimpleGrid,
  Spinner
} from "@chakra-ui/react";
import {
  MdNoAccounts
} from "react-icons/md";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";


import Orders from "views/admin/orders/components/Orders";
import {
  columnsDataOrders,
} from "views/admin/orders/variables/columnsData";
import { useQueryParam, getDateAsQueryParam } from "utils/Utility"
import { isDriver, getAccessToken, validateJWT } from 'security.js';

export default function OrdersView() {
  const brandColor = useColorModeValue("brand.500", "white");
  const [tableDataOrders, setTableDataOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const jwtToken = getAccessToken();
  const history = useHistory();
  const location = useLocation();
  const queryParamDateValue = useQueryParam('date');

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");

  const [loading, setLoading] = useState(false);
  const ordersURL = process.env.REACT_APP_ORDERS_BASE_URL
  const productsURL = process.env.REACT_APP_PRODUCTS_BASE_URL;

  useEffect(() => {

    if (!validateJWT()) {
      history.push('/auth');
      return;
    }
    if (!queryParamDateValue) {
      fetchOrdersData(getDateAsQueryParam());
    }

    axios.get(productsURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        const responseData = response.data;

        if (responseData.length === 0) {
          setProducts([]);
        } else {
          const transformedData = responseData.map(item => ({
            ...item,
            label: item.name,
            value: item.name,
          }));

          setProducts(transformedData);
        }
      })
      .catch(error => {
        console.error('API error:', error);
      }).finally(() => {
        setLoading(false);
      });

  }, [jwtToken, location]);

  const handleDateChange = (date) => {
    if (!validateJWT()) {
      history.push('/auth');
      return;
    }

    setSelectedDate(date.value);
    const newUrl = `/admin/orders?date=${date.value}`;
    history.push(newUrl)

    fetchOrdersData(date.value);
  };

  const fetchOrdersData = (dateValue) => {
    const queryParams = {
      date: dateValue,
    };

    setLoading(true);

    axios.get(ordersURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      params: queryParams
    })
      .then(response => {
        const responseData = response.data;

        if (responseData.length === 0) {
          setTableDataOrders([]);
        } else {
          const updatedResponseData = responseData.map(obj => {
            const updatedRecord = { ...obj };
            updatedRecord.order = "Ver detalles";
            if (updatedRecord.payment_method.toUpperCase() === "PAID") {
              updatedRecord.payment_method = "Pagada";
            }
            return updatedRecord;
          });

          updatedResponseData.sort((a, b) => {
            const statusOrder = {
              "Error": 1,
              "Reprogramada": 2,
            };
            const statusA = a.status || '';
            const statusB = b.status || '';
            const orderA = statusOrder[statusA] || 99; // set a high order if status not found
            const orderB = statusOrder[statusB] || 99;
            return orderA - orderB;
          });
          setTableDataOrders(updatedResponseData);
        }
      })
      .catch(error => {
        console.error('API error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOrderCreated = async (newOrder) => {
    if (!validateJWT()) {
      history.push('/auth');
      return;
    }

    // setLoading(true);
    try {
      const response = await axios.post(ordersURL, newOrder, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      });

      newOrder.status = response.data.status;
      newOrder.errors = response.data.errors;
      newOrder.driver = response.data.driver;
      newOrder.delivery_sequence = null;
      newOrder.latitude = response.data.latitude
      newOrder.longitude = response.data.longitude
      newOrder.id = response.data.id
      newOrder.order = "Ver detalles";

      if (newOrder.delivery_date === queryParamDateValue) {
        setTableDataOrders((prevTableData) => [...prevTableData, newOrder]);
      } else {
        console.log("Delivery date is not today. Skipping adding to the data table.");
      }
      setAlertMessage({ type: 'success', text: 'Orden guardada en la base de datos' });
      setTimeout(() => setAlertMessage(null), 3000);

    } catch (error) {
      console.error("Error creating order:", error);
      setAlertMessage({ type: 'error', text: 'Error al crear la orden. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const handleOrderUpdated = async (updatedOrder) => {

    if (!validateJWT()) {
      history.push('/auth');
      return;
    }
    const queryParams = {
      id: updatedOrder.item.id,
      delivery_date: updatedOrder.item.delivery_date,
    };
    // setLoading(true);
    try {
      const response = await axios.put(ordersURL, updatedOrder.item, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        params: queryParams
      });

      updatedOrder.item.status = response.data.status;
      updatedOrder.item.errors = response.data.errors;
      updatedOrder.item.driver = response.data.driver;
      updatedOrder.item.latitude = response.data.latitude
      updatedOrder.item.longitude = response.data.longitude
      updatedOrder.item.delivery_sequence = null;
      updatedOrder.item.order = "Ver detalles";
      updatedOrder.item.id = response.data.id
      if (updatedOrder.item.delivery_date === updatedOrder.item.original_date) {
        // Updating an element, since its in the UI
        setTableDataOrders(prevTableData => {
          const updatedTableData = [...prevTableData];
          updatedTableData[updatedOrder.rowIndex] = { ...updatedOrder.item };
          return updatedTableData;
        });
      } else {
        // Removing element, since its no longer in the UI, since changed delivery_date
        setTableDataOrders(prevTableData => {
          const updatedTableData = [...prevTableData];
          updatedTableData.splice(updatedOrder.rowIndex, 1);
          return updatedTableData;
        });
      }

      setAlertMessage({ type: 'success', text: 'Orden actualizada en la base de datos' });
      setTimeout(() => setAlertMessage(null), 3000);

    } catch (error) {
      console.error("Error creating order:", error);
      setAlertMessage({ type: 'error', text: 'Error al actualizar la orden. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const handleOrderDeleted = async (order) => {

    if (!validateJWT()) {
      history.push('/auth');
      return;
    }
    const queryParams = {
      id: order.item.id,
      delivery_date: order.item.delivery_date,
    };
    // setLoading(true);
    try {
      const response = await axios.delete(ordersURL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        params: queryParams
      });

      setTableDataOrders(prevTableData => {
        const updatedTableData = [...prevTableData];
        updatedTableData.splice(order.rowIndex, 1);
        return updatedTableData;
      });

      setAlertMessage({ type: 'success', text: 'Orden eliminada en la base de datos' });
      setTimeout(() => setAlertMessage(null), 3000);

    } catch (error) {
      console.error("Error creating order:", error);
      setAlertMessage({ type: 'error', text: 'Error al eliminar la orden. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const handleScheduleOrders = async (selectedDrivers) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    if (!validateJWT()) {
      history.push('/auth');
      return;
    }
    const body = {
      date: formattedDate,
      available_drivers: selectedDrivers
    };

    try {
      const response = await axios.post(process.env.REACT_APP_SCHEDULE_ORDERS_BASE_URL, body, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },

      });
      console.log('Scheduled successfully:', response.data);
      setTableDataOrders(prevTableData => {
        const updatedTableData = prevTableData.map(order => ({
          ...order,
          status: "Programada",
          driver: selectedDrivers.length === 1 ? selectedDrivers[0] : order.driver
        }));
        return updatedTableData;
      });
      setAlertMessage({ type: 'success', text: 'Las ordenes fueron programadas con éxito' });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error scheduling:', error);
      setAlertMessage({ type: 'error', text: 'Error al programar ordenes. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
    } finally {
    }
  };

  const consolidateProducts = () => {
    const consolidatedProducts = {};

    tableDataOrders.forEach(order => {
      const { driver, cart_items } = order;

      cart_items.forEach(item => {
        const { product, quantity } = item;
        const numericQuantity = parseInt(quantity, 10);

        if (!consolidatedProducts[driver]) {
          consolidatedProducts[driver] = {};
        }

        if (consolidatedProducts[driver][product]) {
          consolidatedProducts[driver][product] += numericQuantity;
        } else {
          consolidatedProducts[driver][product] = numericQuantity;
        }
      });
    });
    return consolidatedProducts;
  };


  const consolidatedProducts = consolidateProducts();
  const userIsDriver = isDriver();

  if (userIsDriver) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Flex align="center" justify="center" direction="column">
          <Icon as={MdNoAccounts} color="red.500" boxSize={12} />
          <Box mt={4} color="red.500" fontSize="lg" textAlign="center">
            El contenido está restringido para administradores y mesa de control.
          </Box>
          <Link as={RouterLink} to="/driver" color={brandColor} fontWeight="bold" mt={"20px"}>
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
          style={{
            position: 'fixed',
            zIndex: 1000,
          }}
        >
          <Alert status={alertMessage.type} mb={4}>
            <AlertIcon />
            {alertMessage.text}
          </Alert>
        </motion.div>
      )}
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <SimpleGrid
          mb='20px'
          columns={{ sm: 1, md: 1 }}
          spacing={{ base: "20px", xl: "20px" }}>
          {loading ? (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            />
          ) : (
            <Orders
              columnsData={columnsDataOrders}
              tableData={tableDataOrders}
              onOrderCreated={handleOrderCreated}
              onOrderUpdated={handleOrderUpdated}
              onOrderDeleted={handleOrderDeleted}
              onOrdersScheduled={handleScheduleOrders}
              onDateSelect={handleDateChange}
              productsAvailable={products}
              listOfConsolidatedProducts={consolidatedProducts}
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}
