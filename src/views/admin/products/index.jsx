import React from "react";

// Chakra imports
import {
  Box,
  useColorModeValue,
  SimpleGrid
} from "@chakra-ui/react";

// Custom components
import Products from "views/admin/products/components/Products";

import tableDataProducts from "views/admin/products/variables/tableDataProducts.json";
import { tableColumnsProducts } from "views/admin/products/variables/tableColumnsProducts";

export default function ProductView() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  return (
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
        />
      </SimpleGrid>
    </Box>
  );
}
