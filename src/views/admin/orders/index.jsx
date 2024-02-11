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
  const queryParamDateValue = useQueryParam('date');

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");

  const [loading, setLoading] = useState(false);
  const ordersURL = process.env.REACT_APP_ORDERS_BASE_URL
  const productsURL = process.env.REACT_APP_PRODUCTS_BASE_URL;

  useEffect(() => {

    if (!validateJWT) {
      history.push('/auth');
    }

    const queryParams = {
      date: getDateAsQueryParam(),
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
            return { ...obj, order: "Ver detalles" };
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
      }).finally(() => {
        setLoading(false);
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

  }, [jwtToken]);

  const handleDateChange = (date) => {
    if (!validateJWT) {
      history.push('/auth');
    }

    setSelectedDate(date.value);

    setLoading(true);
    const queryParams = {
      date: date.value,
    };

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
    } finally {
      setLoading(false);
    }
  }

  const handleOrderUpdated = async (updatedOrder) => {

    if (!validateJWT) {
      history.push('/auth');
    }
    const queryParams = {
      id: updatedOrder.item.id,
      delivery_date: updatedOrder.item.delivery_date,
    };
    setLoading(true);
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
      updatedOrder.item.delivery_sequence = null;
      updatedOrder.item.order = "Ver detalles";
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
    } finally {
      setLoading(false);
    }
  }

  const handleOrderDeleted = async (order) => {

    if (!validateJWT) {
      history.push('/auth');
    }
    const queryParams = {
      id: order.item.id,
      delivery_date: order.item.delivery_date,
    };
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  const consolidateProducts = () => {
    const consolidatedProducts = [];

    tableDataOrders.forEach(order => {
      order.cart_items.forEach(item => {
        const { product, quantity } = item;
        const existingProductIndex = consolidatedProducts.findIndex(p => p.product === product);

        if (existingProductIndex !== -1) {
          consolidatedProducts[existingProductIndex].quantity += quantity;
        } else {
          consolidatedProducts.push({ product, quantity });
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
