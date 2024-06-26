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

// Custom components
import Clients from "views/admin/clients/components/Clients";
import { isDriver, getAccessToken, validateJWT } from 'security.js';


export default function ClientView() {
  const brandColor = useColorModeValue("brand.500", "white");
  const [alertMessage, setAlertMessage] = useState(null);
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const [loading, setLoading] = useState(false);
  const clientsURL = `${process.env.REACT_APP_CLIENTS_BASE_URL}`;
  const jwtToken = getAccessToken();
  const history = useHistory();

  useEffect(() => {

    if (!validateJWT()) {
      history.push('/auth');
      return;
    }
  }, []);

  const handleClientFetch = async (searchQuery) => {
    if (!validateJWT()) {
      history.push('/auth');
      return;
    }

    const queryParams = {
      phone_number: searchQuery,
    };

    try {
      const response = await axios.get(clientsURL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        params: queryParams
      });
      const responseData = response.data;

      if (responseData) {
        const clientMapped = {
          clientPhoneNumber: responseData.phone_number,
          clientName: responseData.name,
          clientAddress: responseData.address,
          clientLatitude: responseData.address_latitude,
          clientLongitude: responseData.address_longitude,
          clientSecondAddress: responseData.second_address,
          clientSecondLatitude: responseData.second_address_latitude,
          clientSecondLongitude: responseData.second_address_longitude,
          clientEmail: responseData.email,
          clientDiscount: responseData.discount
        };
        return clientMapped;
      } else {
        console.log("No client data found.");
        return null;
      }
    } catch (error) {
      console.error('API error:', error);
      return null;
    }
  };

  const handleClientCreate = async (client) => {

    if (!validateJWT()) {
      history.push('/auth');
      return;
    }
    try {
      const response = await axios.post(clientsURL, client, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      });
      setAlertMessage({ type: 'success', text: 'Cliente guardado en la base de datos.' });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Error al crear cliente. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw error;
    }
  };

  const handleClientUpdate = async (client) => {
    if (!validateJWT()) {
      history.push('/auth');
      return;
    }

    try {
      const repsonse = await axios.put(clientsURL, client, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      });
      setAlertMessage({ type: 'success', text: 'Cliente guardado en la base de datos.' });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Error al actualizar cliente. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw error;
    }
  };

  const handleClientDelete = async (client) => {

    if (!validateJWT()) {
      history.push('/auth');
      return;
    }

    const queryParam = {
      phone_number: client.phone_number
    };

    try {
      const response = await axios.delete(clientsURL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        params: queryParam
      });

      setAlertMessage({ type: 'success', text: 'Cliente eliminado en la base de datos' });
      setTimeout(() => setAlertMessage(null), 3000);

    } catch (error) {
      console.error("Error creating client:", error);
      setAlertMessage({ type: 'error', text: 'Error al eliminar el cliente. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw error;
    } finally {
    }
  };

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

      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}
        display="flex"
        justifyContent={{ base: "center", xl: "center" }}
      >
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
            <Clients
              onClientCreated={handleClientCreate}
              onClientUpdated={handleClientUpdate}
              onClientDeleted={handleClientDelete}
              onClientFetched={handleClientFetch}
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}
