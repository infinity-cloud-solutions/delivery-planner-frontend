import {
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Box
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

import CreateProductModal from "views/admin/products/components/CreateProductModal";

function Products(props) {
  const { columnsData, tableData, onProductCreated } = props;

  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);

  const onProductCreatedCallback = (newProduct) => {
    onProductCreated(newProduct);
  };

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } =
    tableInstance;

  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const openCreateModal = () => {
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  return (
    <>
      <Flex
        direction='column'
        w='100%'
        overflowX={{ sm: "scroll", lg: "hidden" }}
      >
        <Flex
          align={{ sm: "flex-start", lg: "center" }}
          justify='space-between'
          w='100%'
          px='22px'
          pb='20px'
          mb='10px'
          boxShadow='0px 40px 58px -20px rgba(112, 144, 176, 0.26)'
        >
          <Text color={textColor} fontSize='xl' fontWeight='600'>
            Productos
          </Text>
          <Button variant="action" onClick={openCreateModal}>
            Crear
          </Button>
        </Flex>
        {data.length === 0 ? (
          <Box mt="4" px="4">
            <Text color={textColorSecondary}>
              No hay registros para mostrar.
            </Text>
          </Box>
        ) : (
          <Table {...getTableProps()} variant='simple' color='gray.500'>
            <Thead>
              {headerGroups.map((headerGroup, index) => (
                <Tr {...headerGroup.getHeaderGroupProps()} key={index}>
                  {headerGroup.headers.map((column, index) => (
                    <Th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      pe='10px'
                      key={index}
                      borderColor='transparent'
                    >
                      <Flex
                        justify='space-between'
                        align='center'
                        fontSize={{ sm: "10px", lg: "12px" }}
                        color='gray.400'
                      >
                        {column.render("Header")}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>

            <Tbody {...getTableBodyProps()}>
              {page.map((row, index) => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()} key={index}>
                    {row.cells.map((cell, index) => {
                      let data = "";
                      if (cell.column.Header === "Nombre") {
                        data = (
                          <Flex align='center'>
                            <Text
                              color={textColor}
                              fontSize='sm'
                              fontWeight='600'
                            >
                              {cell.value}
                            </Text>
                          </Flex>
                        );
                      } else if (cell.column.Header === "Precio") {
                        const formattedPrice = new Intl.NumberFormat(
                          "es-MX",
                          {
                            style: "currency",
                            currency: "MXN",
                            minimumFractionDigits: 2,
                          }
                        ).format(cell.value);
                        data = (
                          <Text
                            color={textColorSecondary}
                            fontSize='sm'
                            fontWeight='500'
                          >
                            {formattedPrice}
                          </Text>
                        );
                      }
                      return (
                        <Td
                          {...cell.getCellProps()}
                          key={index}
                          fontSize={{ sm: "14px" }}
                          minW={{ sm: "175px", md: "200px", lg: "300px" }}
                          borderColor='transparent'
                        >
                          {data}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Flex>
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreate={onProductCreatedCallback}
      />
    </>
  );
}

export default Products;
