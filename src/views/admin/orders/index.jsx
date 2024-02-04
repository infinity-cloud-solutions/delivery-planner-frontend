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
import { Link as RouterLink, useHistory } from "react-router-dom";


import Orders from "views/admin/orders/components/Orders";
import {
  columnsDataOrders,
} from "views/admin/orders/variables/columnsData";
import { isDriver, getAccessToken, validateJWT } from 'security.js';

export default function OrdersView() {
  const brandColor = useColorModeValue("brand.500", "white");
  const [tableDataOrders, setTableDataOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const jwtToken = getAccessToken();
	const history = useHistory();

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");

  const [loading, setLoading] = useState(false);
  const ordersURL = process.env.REACT_APP_ORDERS_BASE_URL

  useEffect(() => {

    if (!validateJWT) {
      history.push('/auth');
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateAsQueryParam = `${year}-${month}-${day}`

    const ordersURL = `${process.env.REACT_APP_ORDERS_BASE_URL}?date=${dateAsQueryParam}`;
    const productsURL = `${process.env.REACT_APP_PRODUCTS_BASE_URL}`;
    setLoading(true);

    axios.get(ordersURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        const responseData = response.data;

        if (responseData.length === 0) {
          setTableDataOrders([]);
        } else {
          const updatedResponseData = responseData.map(obj => {
            return { ...obj, order: "Ver detalles" };
          });
          setTableDataOrders(updatedResponseData);
        }
      })
      .catch(error => {
        console.error('API error:', error);
      }).finally(() => {
      });

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

  }, []);

  const handleDateChange = (date) => {
    const year = date.value.substring(0, 4);
    const month = date.value.substring(4, 6);
    const day = date.value.substring(6, 8);

    const transformedDate = `${year}-${month}-${day}`;
    setSelectedDate(transformedDate);

    setLoading(true);
    const ordersURL = `${process.env.REACT_APP_ORDERS_BASE_URL}?date=${transformedDate}`;

    axios.get(ordersURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        const responseData = response.data;

        if (responseData.length === 0) {
          setTableDataOrders([]);
        } else {
          setTableDataOrders(responseData);
        }
      })
      .catch(error => {
        console.error('API error:', error);
      }).finally(() => {
        setLoading(false);
      });
  };

  const handleOrderCreated = async (newOrder) => {

    if (!validateJWT) {
      history.push('/auth');
    }

    setLoading(true);
    try {
      const response = await axios.post(process.env.REACT_APP_ORDERS_BASE_URL, newOrder, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      });

      newOrder.status = response.data.status;
      newOrder.errors = response.data.errors;

      // Check if the delivery_date is the same as today so we can add the record to the todays table
      const currentDate = new Date();
      currentDate.setHours(7, 0, 0, 0);

      const orderDate = new Date(newOrder.delivery_date + 'T00:00:00');
      orderDate.setMinutes(orderDate.getTimezoneOffset());

      if (orderDate.toDateString() === currentDate.toDateString()) {
        // Add the new order to the data table for todays
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
    } finally {
      setLoading(false);
    }
  }

  const handleOrderUpdated = async (updatedOrder) => {

    // if (!validateJWT) {
    //   history.push('/auth');
    // }

    // setLoading(true);
    // try {
    //   const response = await axios.post(process.env.REACT_APP_ORDERS_BASE_URL, newOrder, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${jwtToken}`
    //     },
    //   });

    //   updatedOrder.status = response.data.status;
    //   updatedOrder.errors = response.data.errors;

    //   // Check if the delivery_date is the same as today so we can add the record to the todays table
    //   const currentDate = new Date();
    //   currentDate.setHours(7, 0, 0, 0);

    //   const orderDate = new Date(newOrder.delivery_date + 'T00:00:00');
    //   orderDate.setMinutes(orderDate.getTimezoneOffset());

    //   if (orderDate.toDateString() === currentDate.toDateString()) {
    //     tableDataOrders.splice(updatedOrder.index, 1);
    //     const updatedTableData = [...tableDataOrders];
    //     updatedTableData.splice(updatedOrder.index, 0, updatedOrder.item);
    //     setTableDataOrders(updatedTableData);
    //   } else {
    //     console.log("Delivery date is not today. Skipping adding to the data table.");
    //   }
    //   setAlertMessage({ type: 'success', text: 'Orden guardada en la base de datos' });
    //   setTimeout(() => setAlertMessage(null), 3000);

    // } catch (error) {
    //   console.error("Error creating order:", error);
    //   setAlertMessage({ type: 'error', text: 'Error al crear la orden. Intenta de nuevo.' });
    //   setTimeout(() => setAlertMessage(null), 3000);
    // } finally {
    //   setLoading(false);
    // }
  }

  const handleOrderDeleted = async (order) => {

    if (!validateJWT) {
      history.push('/auth');
    }

    // setLoading(true);
    // try {
    //   const response = await axios.delete(`${ordersURL}?id=${order.item.id}&delivery_date=${order.item.delivery_date}`, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${jwtToken}`
    //     },
    //   });

    //   updatedOrder.status = response.data.status;
    //   updatedOrder.errors = response.data.errors;

    //   // Check if the delivery_date is the same as today so we can add the record to the todays table
    //   const currentDate = new Date();
    //   currentDate.setHours(7, 0, 0, 0);

    //   const orderDate = new Date(newOrder.delivery_date + 'T00:00:00');
    //   orderDate.setMinutes(orderDate.getTimezoneOffset());

    //   if (orderDate.toDateString() === currentDate.toDateString()) {
    //     const updatedTableData = [...tableDataOrders];
    //     updatedTableData.splice(updatedOrder.index, 1);
    //     setTableDataOrders(updatedTableData);
    //   } else {
    //     console.log("Delivery date is not today. Skipping adding to the data table.");
    //   }
    //   setAlertMessage({ type: 'success', text: 'Orden guardada en la base de datos' });
    //   setTimeout(() => setAlertMessage(null), 3000);

    // } catch (error) {
    //   console.error("Error creating order:", error);
    //   setAlertMessage({ type: 'error', text: 'Error al crear la orden. Intenta de nuevo.' });
    //   setTimeout(() => setAlertMessage(null), 3000);
    // } finally {
    //   setLoading(false);
    // }
  }

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
              onDateSelect={handleDateChange}
              productsAvailable={products}
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}
