import {
  Box,
  Flex,
  Icon,
  Link,
  SimpleGrid,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";

// Custom components
import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  MdAttachMoney,
  MdPriceChange,
  MdNoAccounts
} from "react-icons/md";
import { FaCreditCard, FaCashRegister, FaFileCircleExclamation, FaFileInvoiceDollar, FaMoneyBills } from "react-icons/fa6";
import OrdersDashboard from "views/admin/dashboard/components/OrdersDashboard";
import {
  columnsOrdersDashboard,
} from "views/admin/dashboard/variables/columnsData";
import { isDriver, validateJWT, getAccessToken } from 'security.js';
import { Link as RouterLink, useHistory } from "react-router-dom";
import { getDateAsQueryParam } from "utils/Utility"

export default function Dashboard() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const userIsDriver = isDriver();
  const [loading, setLoading] = useState(false);
  const jwtToken = getAccessToken();
  const history = useHistory();
  const [tableDataOrdersDashboard, setTableDataOrdersDashboard] = useState([]);
  const ordersURL = process.env.REACT_APP_ORDERS_BASE_URL

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
        const responseData = response.data.map(order => {
          const words = order.client_name.split(' ');
          const abbreviatedName = words.shift() + ' ' + words.map(word => word[0]).join('');
          return {
            ...order,
            name_display: abbreviatedName
          };
        });

        if (responseData.length === 0) {
          setTableDataOrdersDashboard([]);
        } else {

          responseData.sort((a, b) => {
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
          setTableDataOrdersDashboard(responseData.slice(0, 5));
        }
      })
      .catch(error => {
        console.error('API error:', error);
      }).finally(() => {
        setLoading(false);
      });

  }, [jwtToken]);

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
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap='20px'
        mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={FaMoneyBills} color={brandColor} />
              }
            />
          }
          name='Ventas con efectivo hoy'
          value='$0.00'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={FaCreditCard} color={brandColor} />
              }
            />
          }
          name='Ventas con tarjeta hoy'
          value='$0.00'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdPriceChange} color={brandColor} />
              }
            />
          }
          name='Ventas con transferencia hoy'
          value='$0.00'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={FaCashRegister} color={brandColor} />
              }
            />
          }
          name='Total de ventas'
          value='$0.00'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={<Icon w='32px' h='32px' as={FaFileInvoiceDollar} color={brandColor} />}
            />
          }
          name='Total de ordenes programadas'
          value='0'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={FaFileCircleExclamation} color={brandColor} />
              }
            />
          }
          name='Total de ordenes con error o reprogramadas'
          value='0'
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
      {loading ? (
        <Flex justify="center">
          <Spinner size="xl"
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500" />
        </Flex>
      ) : (<OrdersDashboard
            columnsData={columnsOrdersDashboard}
            tableData={tableDataOrdersDashboard}
          />)}
          <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px'>
            <MiniCalendar h='100%' minW='100%' maxW='550px' selectRange={false} />
          </SimpleGrid>
        </SimpleGrid>
    </Box>
  );
}
