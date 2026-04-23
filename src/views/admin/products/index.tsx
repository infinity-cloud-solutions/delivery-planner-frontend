import React, { useState } from "react";
import { motion } from 'framer-motion';
import { AlertStatus } from '@chakra-ui/react';

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
import { MdNoAccounts } from "react-icons/md";
import { Link as RouterLink } from "react-router-dom";

// Custom components
import Products from "views/admin/products/components/Products";
import { isDriver } from 'security';
import { useAuthGuard } from 'hooks/useAuthGuard';
import { useProductsCRUD, UpdateProductArgs, DeleteProductArgs } from 'views/admin/products/hooks/useProductsCRUD';
import { CreateProductPayload } from 'types/product';
import { AlertMessage } from 'types/ui';
import { tableColumnsProducts } from "views/admin/products/variables/tableColumnsProducts";

export default function ProductView() {
  const brandColor = useColorModeValue("brand.500", "white");
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  useAuthGuard();

  const { products, loading, createProduct, updateProduct, deleteProduct } = useProductsCRUD();

  const showAlert = (type: AlertStatus, text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleProductCreate = async (product: CreateProductPayload): Promise<void> => {
    try {
      await createProduct(product);
      showAlert('success', 'Producto guardado en la base de datos');
    } catch {
      showAlert('error', 'Error al crear producto. Intenta de nuevo.');
    }
  };

  const handleProductUpdate = async (args: UpdateProductArgs): Promise<void> => {
    try {
      await updateProduct(args);
      showAlert('success', 'Producto guardado en la base de datos');
    } catch {
      showAlert('error', 'Error al crear producto. Intenta de nuevo.');
    }
  };

  const handleProductDelete = async (args: DeleteProductArgs): Promise<void> => {
    try {
      await deleteProduct(args);
      showAlert('success', 'Producto eliminado en la base de datos');
    } catch {
      showAlert('error', 'Error al eliminar producto. Intenta de nuevo.');
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
            <Products
              tableData={products}
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
