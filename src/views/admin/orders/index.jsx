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
import { Link as RouterLink } from "react-router-dom";


import Orders from "views/admin/orders/components/Orders";
import {
  columnsDataOrders,
} from "views/admin/orders/variables/columnsData";
import { isDriver } from 'security.js';

export default function OrdersView() {
  const brandColor = useColorModeValue("brand.500", "white");
  const [tableDataOrders, setTableDataOrders] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const products = [{ "label": "Cuatro", "value": "Cuatro", "price": 40.00 }, { "label": "Tres", "value": "Tres", "price": 30.00 }, { "label": "Fresas", "value": "Fresas", "price": 20.00 }, { "label": "Mango", "value": "Mango", "price": 10.00 }]
  const productsMock = [{"label": "Fresas", "value": "Fresas", "price": 195.00}, {"label": "Mix Berries", "value": "Mix Berries", "price": 210.00}, {"label": "Bluberry - Arandano", "value": "Bluberry - Arandano", "price": 210.00}, {"label": "Mango", "value": "Mango", "price": 160.00}, {"label": "Mix Verde", "value": "Mix Verde", "price": 210.00}, {"label": "Frambuesa", "value": "Frambuesa", "price": 240.00}, {"label": "Mix Fresa + Mango", "value": "Mix Fresa + Mango", "price": 190.00}]

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateAsQueryParam = `${year}${month}${day}`

    const apiURL = `https://81s54o7mzc.execute-api.us-east-1.amazonaws.com/development/orders?date=${dateAsQueryParam}`;
    setLoading(true);

    axios.get(apiURL)
      .then(response => {
        const responseData = response.data;

        if (responseData.length === 0) {
          setTableDataOrders([]);
        } else {
          const updatedResponseData = responseData.map(obj => {
            return { ...obj, order: "Ver detalles" };
          });
          console.log(updatedResponseData)
          setTableDataOrders(updatedResponseData);
        }
      })
      .catch(error => {
        console.error('API error:', error);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);

    const apiURL = `https://81s54o7mzc.execute-api.us-east-1.amazonaws.com/development/orders?date=${date.value}`;
    setLoading(true);

    axios.get(apiURL)
      .then(response => {
        console.log(response.data)
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
    console.log('Order created:', newOrder);

    try {
      const response = await axios.post('https://81s54o7mzc.execute-api.us-east-1.amazonaws.com/development/orders', newOrder, {
        headers: {
          'Content-Type': 'application/json',
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
    }
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
          <Link as={RouterLink} to="/driver" color={brandColor} fontWeight="bold" mt={ "20px" }>
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
              onDateSelect={handleDateChange}
              productsAvailable={productsMock}
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}
