import {
  Button,
  ButtonGroup,
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
import UpdateProductModal from "views/admin/products/components/UpdateProductModal";
import { isAdmin, } from 'security.js';


function Products(props) {
  const { columnsData, tableData, onProductCreated, onProductUpdated, onProductDeleted } = props;

  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);
  let isUserAdmin = false;
  isUserAdmin = isAdmin();

  const onProductCreatedCallback = (newProduct) => {
    onProductCreated(newProduct);
  };

  const onProductUpdatedCallback = (updatedProduct) => {
    onProductUpdated(updatedProduct);
  };

  const onProductDeletedCallback = (product) => {
    onProductDeleted(product);
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

  const { getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex, pageSize },
    prepareRow,
    initialState
  } =
    tableInstance;
  initialState.pageSize = 10;

  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const openCreateModal = () => {
    setCreateModalOpen(true);
  };

  const openUpdateModal = (row, rowIndex) => {
    if (isUserAdmin) {
      setSelectedRowData({ row: row, index: rowIndex });
      setIsUpdateModalOpen(true);
    }

  };

  const closeUpdateModal = () => {
    setSelectedRowData(null);
    setIsUpdateModalOpen(false);
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
            Catálogo
          </Text>
          {isUserAdmin && (
            <Button variant="action" onClick={openCreateModal}>
              Crear
            </Button>
          )}
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
                const actualIndex = index + pageIndex * pageSize;
                return (
                  <Tr {...row.getRowProps()} key={actualIndex} onClick={() => openUpdateModal(row.original, actualIndex)} >
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
      {isUpdateModalOpen && (
        <UpdateProductModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          onUpdate={onProductUpdatedCallback}
          onDelete={onProductDeletedCallback}
          rowData={selectedRowData}
        />
      )}
      {isCreateModalOpen && (
        <CreateProductModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onCreate={onProductCreatedCallback}
        />
      )}
      <Flex direction="column" align="center" mt="2" mb="2">
        <ButtonGroup>
          <Button variant="outline" mr={{ base: '10px', sm: '15', md: '30px', lg: '40px', xl: '50px' }} onClick={() => previousPage()} disabled={!canPreviousPage}>
            Anterior
          </Button>
          {pageOptions.length > 0 && (
            <Text mt="auto" mr={{ base: '10px', sm: '15', md: '30px', lg: '40px', xl: '50px' }} pb="2">
              Página{' '}
              <strong>
                {pageIndex + 1} de {pageOptions.length}
              </strong>{' '}
            </Text>
          )}
          <Button variant="outline" onClick={() => nextPage()} disabled={!canNextPage}>
            Siguiente
          </Button>
        </ButtonGroup>
      </Flex>
    </>
  );
}

export default Products;
