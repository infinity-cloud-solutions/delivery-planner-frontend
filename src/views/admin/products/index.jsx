import React, { useState, useEffect } from "react";
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

// Custom components
import Products from "views/admin/products/components/Products";

import { tableColumnsProducts } from "views/admin/products/variables/tableColumnsProducts";

export default function ProductView() {
  const [tableDataProducts, setTableDataProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");

  useEffect(() => {
    const productsMock = [{"sku": "001FAB", "name": "Fresas", "price": 195.00}, {"sku": "001AAE", "name": "Mix Berries", "price": 210.00}, {"sku": "001ACF", "name": "Bluberry - Arandano", "price": 210.00}, {"sku": "001EAF", "name": "Mango", "price": 160.00}, {"sku": "001EBB", "name": "Mix Verde", "price": 210.00}, {"sku": "001ACC", "name": "Frambuesa", "price": 240.00}, {"sku": "001ECF", "name": "Mix Fresa + Mango", "price": 190.00}]
    setTableDataProducts(productsMock);
    // axios.get('https://webhook.site/89b2c7e9-26d4-4052-aa87-f9b742a98370')
    //   .then(response => {

    //     setTableDataProducts([]);
    //   })
    //   .catch(error => {
    //     console.error('API error:', error);
    //   });
  }, []);

  const handleProductCreated = (newProduct) => {
    console.log('Product created:', newProduct);

    axios.post('https://webhook.site/89b2c7e9-26d4-4052-aa87-f9b742a98370', newProduct, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        setTableDataProducts((prevTableData) => [...prevTableData, newProduct]);
        setAlertMessage({ type: 'success', text: 'Producto guardado en la base de datos' });
        setTimeout(() => setAlertMessage(null), 3000);
      })
      .catch(error => {
        setAlertMessage({ type: 'error', text: 'Error al crear producto. Intenta de nuevo.' });
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

      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}
        display="flex"
        justifyContent={{ base: "center", xl: "center" }}
      >
        <SimpleGrid
          mb='20px'
          columns={{ sm: 1, md: 1 }}
          spacing={{ base: "20px", xl: "20px" }}>
          <Products
            tableData={tableDataProducts}
            columnsData={tableColumnsProducts}
            onProductCreated={handleProductCreated}
          />
        </SimpleGrid>
      </Box>
    </>
  );
}
