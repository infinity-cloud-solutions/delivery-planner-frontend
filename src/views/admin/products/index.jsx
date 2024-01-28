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
import Products from "views/admin/products/components/Products";
import { isDriver, getAccessToken, validateJWT } from 'security.js';

import { tableColumnsProducts } from "views/admin/products/variables/tableColumnsProducts";

export default function ProductView() {
  const brandColor = useColorModeValue("brand.500", "white");
  const [tableDataProducts, setTableDataProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const [loading, setLoading] = useState(false);
  const productsURL = `${process.env.REACT_APP_PRODUCTS_BASE_URL}`;
  const jwtToken = getAccessToken();
	const history = useHistory();

  console.log(jwtToken)

  useEffect(() => {
    setLoading(true);
    if (!validateJWT) {
      history.push('/auth');
    }

    axios.get(productsURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        const responseData = response.data;
        console.log(responseData)

        if (responseData.length === 0) {
          setTableDataProducts([]);
        } else {

          setTableDataProducts(responseData);
        }

      })
      .catch(error => {
        console.error('API error:', error);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  const handleProductCreate = (product) => {
    console.log('Product generated:', product);

    axios.post(productsURL, product, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        setTableDataProducts((prevTableData) => [...prevTableData, product]);
        setAlertMessage({ type: 'success', text: 'Producto guardado en la base de datos' });
        setTimeout(() => setAlertMessage(null), 3000);
      })
      .catch(error => {
        setAlertMessage({ type: 'error', text: 'Error al crear producto. Intenta de nuevo.' });
        setTimeout(() => setAlertMessage(null), 3000);
      });
  };

  const handleProductUpdate = (product) => {
    console.log('Product Updated:', product);

    if (!validateJWT) {
      history.push('/auth');
    }

    axios.post(productsURL, product.item, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        tableDataProducts.splice(product.index, 1)
        const updatedTableData = [...tableDataProducts];

        updatedTableData.splice(product.index, 0, product.item);
        setTableDataProducts(updatedTableData);
        console.log(tableDataProducts)

        setAlertMessage({ type: 'success', text: 'Producto guardado en la base de datos' });
        setTimeout(() => setAlertMessage(null), 3000);
      })
      .catch(error => {
        setAlertMessage({ type: 'error', text: 'Error al crear producto. Intenta de nuevo.' });
        setTimeout(() => setAlertMessage(null), 3000);
      });
  };

  const handleProductDelete = (product) => {
    console.log('Product to be eliminated:', product);

    if (!validateJWT) {
      history.push('/auth');
    }

    axios.delete(`${productsURL}?name=${product.item.name}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    })
      .then(response => {
        const updatedTableData = [...tableDataProducts];

        updatedTableData.splice(product.index, 1);

        setTableDataProducts(updatedTableData);

        console.log(updatedTableData);
        setAlertMessage({ type: 'success', text: 'Producto eliminado en la base de datos' });
        setTimeout(() => setAlertMessage(null), 3000);
      })
      .catch(error => {
        console.error(error)
        setAlertMessage({ type: 'error', text: 'Error al eliminar producto. Intenta de nuevo.' });
        setTimeout(() => setAlertMessage(null), 3000);
      });
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
            <Products
              tableData={tableDataProducts}
              columnsData={tableColumnsProducts}
              onProductCreated={handleProductCreate}
              onProductUpdated={handleProductUpdate}
              onProductDeleted={handleProductDelete}
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}
