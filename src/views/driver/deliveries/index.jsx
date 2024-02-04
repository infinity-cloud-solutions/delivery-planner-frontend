import { Box, Grid, Spinner, Text } from "@chakra-ui/react";

import RouteStop from "views/driver/deliveries/components/RouteStop";
import DeliveryCard from "views/driver/deliveries/components/Delivery";

import React, { useState, useEffect } from "react";
import axios from 'axios';
import { isDriver, getAccessToken, validateJWT, getEmailFromToken } from 'security.js';
import { Link as RouterLink, useHistory } from "react-router-dom";

const getDriverValue = () => {
  const driverEnvValue = process.env.REACT_APP_DRIVERS_MAP || {};
  const driversMap = JSON.parse(driverEnvValue || '{}');
  const userEmail = getEmailFromToken()
  if (userEmail in driversMap) {
    return driversMap[userEmail];
  } else {
    return 999;
  }

};

export default function DeliveriesView() {
  const [tableDataOrders, setTableDataOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coolerInfo, setCoolerInfo] = useState({});
  const [initialLoading, setInitialLoading] = useState(false);
  const jwtToken = getAccessToken();
  const history = useHistory();

  useEffect(() => {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateAsQueryParam = `${year}-${month}-${day}`

    // const ordersURL = `${process.env.REACT_APP_ORDERS_BASE_URL}?date=${dateAsQueryParam}`;
    const ordersURL = "https://webhook.site/c9b30832-828b-4e9d-b80b-af6ad243f52d"
    setInitialLoading(true);

    axios.get(ordersURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        const responseData = response.data;

        const filteredData = responseData.filter(order =>
          (order.status === "Programada" || order.status === "En ruta") &&
          order.delivery_date === dateAsQueryParam &&
          order.driver === getDriverValue()
        );

        const sortedData = filteredData.sort((a, b) => a.delivery_sequence - b.delivery_sequence);

        if (sortedData.length === 0) {
          setTableDataOrders([]);
        } else {
          setTableDataOrders(sortedData);

        }
      })
      .catch(error => {
        console.error('API error:', error);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUpdateDelivery = async (order, orderId, statusText) => {
    try {

      const response = await axios.put(process.env.REACT_APP_ORDERS_BASE_URL, order, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      });

      if (response.status === 200) {
        let updatedOrders;
        if (statusText === 'Entregada' || statusText === 'Reprogramada') {
          updatedOrders = tableDataOrders.filter((order) => order.id !== orderId);
          const { [orderId]: removedCooler, ...restCoolerInfo } = coolerInfo;
          setCoolerInfo(restCoolerInfo);
        } else {
          updatedOrders = tableDataOrders.map((order) =>
            order.id === orderId ? { ...order, status: statusText } : order
          );
          setCoolerInfo((prevCoolerInfo) => ({
            ...prevCoolerInfo,
            [orderId]: order.cooler,
          }));
        }

        setTableDataOrders(updatedOrders);
      } else {
        console.error('Error updating order:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {

    }
  };

  if (loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (tableDataOrders.length === 0) {
    return (
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p="6" flex="1">
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">
            Aún no hay órdenes programadas para este día.
            Vuelve más tarde.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Grid>
        {tableDataOrders.map((order, index) => (
          <DeliveryCard
            key={index}
            gridArea={`${index + 1} / 1 / ${index + 2} / 2`}
            minH={{ base: "auto", lg: "420px", "2xl": "365px" }}
            pe='20px'
            pb={{ base: "25px", lg: "20px" }}
            mx="auto"
            maxW={{ base: "sm", lg: "2xl", "2xl": "2xl" }}
            order={order}
            coolerInfo={coolerInfo[order.id]}
            onUpdateDelivery={handleUpdateDelivery}
          />
        ))}
      </Grid>
    </Box>
  );
}
