import React, { useState, useEffect } from "react";
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// Chakra imports
import {
  Alert,
  AlertIcon,
  Box,
  useColorModeValue,
  SimpleGrid
} from "@chakra-ui/react";

import Orders from "views/admin/orders/components/Orders";
import {
  columnsDataOrders,
} from "views/admin/orders/variables/columnsData";

export default function OrdersView() {
  const [tableDataOrders, setTableDataOrders] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);


  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");

  useEffect(() => {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateAsQueryParam = `${year}${month}${day}`

    // const apiURL = 'https://nnhaxg8401.execute-api.us-east-1.amazonaws.com/development/orders'
    const apiURL = `https://webhook.site/89b2c7e9-26d4-4052-aa87-f9b742a98370?date=${dateAsQueryParam}`;
    console.log(apiURL)

    // axios.get(apiURL)
    //   .then(response => {
    //     console.log(response.data)
    //     const responseData = JSON.parse(response.data);
    //     if (responseData.length === 0) {
    //       setTableDataOrders([]);
    //     } else {
    //       setTableDataOrders(responseData);
    //     }
    //   })
    //   .catch(error => {
    //     console.error('API error:', error);
    //   });
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);

    // Fetch data based on the selected date
    // You may replace the API URL with the appropriate endpoint that includes the date parameter
    const apiURL = `https://webhook.site/89b2c7e9-26d4-4052-aa87-f9b742a98370?date=${date.value}`;
    console.log(apiURL)
    // axios.get(apiURL)
    //   .then(response => {
    //     console.log(response.data);
    //     const responseData = JSON.parse(response.data);
    //     if (responseData.length === 0) {
    //       setTableDataOrders([]);
    //     } else {
    //       setTableDataOrders(responseData);
    //     }
    //   })
    //   .catch(error => {
    //     console.error('API error:', error);
    //   });
  };

  const handleOrderCreated = (newOrder) => {
    console.log('Order created:', newOrder);

    axios.post('https://webhook.site/89b2c7e9-26d4-4052-aa87-f9b742a98370', newOrder, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        setTableDataOrders((prevTableData) => [...prevTableData, newOrder]);
        setAlertMessage({ type: 'success', text: 'Orden guardada en la base de datos' });
        setTimeout(() => setAlertMessage(null), 3000);
      })
      .catch(error => {
        setAlertMessage({ type: 'error', text: 'Error al crear la orden. Intenta de nuevo.' });
        setTimeout(() => setAlertMessage(null), 3000);
      });
  };

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

        <Orders
          columnsData={columnsDataOrders}
          tableData={tableDataOrders}
          onOrderCreated={handleOrderCreated}
          onDateSelect={handleDateChange}
        />
      </SimpleGrid>
    </Box>
    </>
  );
}
