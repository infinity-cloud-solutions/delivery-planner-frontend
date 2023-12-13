import { Box, SimpleGrid } from "@chakra-ui/react";
import OrdersTable from "views/admin/orders/components/OrdersTable";
import {

  columnsDataOrders,
} from "views/admin/orders/variables/columnsData";
import tableDataOrders from "views/admin/orders/variables/tableDataOrders.json";
import React from "react";

export default function OrdersView() {
  // Chakra Color Mode
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb='20px'
        columns={{ sm: 1, md: 1 }}
        spacing={{ base: "20px", xl: "20px" }}>

        <OrdersTable
          columnsData={columnsDataOrders}
          tableData={tableDataOrders}
        />
      </SimpleGrid>
    </Box>
  );
}
