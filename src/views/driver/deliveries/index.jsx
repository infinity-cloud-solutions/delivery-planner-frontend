import { Box, Grid, Spinner, Text } from "@chakra-ui/react";

import RouteStop from "views/driver/deliveries/components/RouteStop";
import DeliveryCard from "views/driver/deliveries/components/Delivery";

import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function DeliveriesView() {
  const [tableDataOrders, setTableDataOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coolerInfo, setCoolerInfo] = useState({});

  useEffect(() => {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateAsQueryParam = `${year}${month}${day}`

    // const apiURL = `https://81s54o7mzc.execute-api.us-east-1.amazonaws.com/development/orders?date=${dateAsQueryParam}`;
    const apiURL = "https://webhook.site/1153f212-1d3e-44a7-a249-0b3cd544c6f9";

    axios.get(apiURL)
      .then(response => {
        const responseData = response.data;
        console.log(responseData)

        if (responseData.length === 0) {
          setTableDataOrders([]);
        } else {
          console.log(responseData)
          setTableDataOrders(responseData);
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
      setLoading(true);

      const response = await axios.post('https://webhook.site/1153f212-1d3e-44a7-a249-0b3cd544c6f9', {
        order
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
      setLoading(false);
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
