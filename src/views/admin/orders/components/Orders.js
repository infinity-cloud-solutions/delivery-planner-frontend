import {
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Table,
  Icon,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useMemo, useState } from "react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
  nextPage,
  previousPage,
  canNextPage,
  canPreviousPage,
  pageOptions
} from "react-table";

// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import UpdateOrderModal from "./UpdateOrderModal";
import CreateOrderModal from "./CreateOrderModal";
import ConsolidatedModal from "./ConsolidatedModal";
import { useQueryParam } from "utils/Utility"
import { getAccessToken, validateJWT } from 'security.js';
import { useHistory } from "react-router-dom";

// Assets
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";

function Orders(props) {
  const { columnsData, tableData, onOrderCreated, onOrderUpdated, onOrderDeleted, onDateSelect, productsAvailable, listOfConsolidatedProducts } = props;

  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isConsolidatedModalOpen, setIsConsolidatedModalOpen] = useState(false);
  const jwtToken = getAccessToken();
  const history = useHistory();

  const isButtonDisabled = () => {
    return data.length === 0 || data.some(row => row.status !== 'Creada' || row.errors.length > 0);
  };

  const handleScheduleButtonClick = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    if (!validateJWT) {
      history.push('/auth');
    }
    const queryParams = {
      date: formattedDate,
    };

    setIsScheduling(true);

    try {
      const response = await axios.post(process.env.REACT_APP_SCHEDULE_ORDERS_BASE_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        params: queryParams
      });
      console.log('Scheduled successfully:', response.data);
      setAlertMessage({ type: 'success', text: 'Las ordenes fueron programadas con éxito' });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error scheduling:', error);
      setAlertMessage({ type: 'error', text: 'Error al programar ordenes. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
    } finally {
      setIsScheduling(false);
    }
  };

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedRowData, setSelectedRowData] = useState(null);

  const openUpdateModal = (row, rowIndex) => {
    const allowedStatuses = ["Creada", "Reprogramada", "Error"];
    if (!allowedStatuses.includes(row.status)) {
      setAlertMessage({ type: 'error', text: 'No se puede editar una orden con estado diferente a "Creada" o "Reprogramada".' });
      setTimeout(() => setAlertMessage(null), 6000);
    } else {
      setSelectedRowData({ row: row, index: rowIndex });
      setIsUpdateModalOpen(true);
    }

  };

  const closeUpdateModal = () => {
    setSelectedRowData(null);
    setIsUpdateModalOpen(false);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const onOrderCreatedCallback = (newOrder) => {
    onOrderCreated(newOrder);
  };

  const openConsolidatedModal = () => {
    setIsConsolidatedModalOpen(true);
  };

  const closeConsolidatedModal = () => {
    setIsConsolidatedModalOpen(false);
  };

  const onOrderUpdatedCallback = (order) => {
    onOrderUpdated(order);
  };

  const onOrderDeletedCallback = (order) => {
    onOrderDeleted(order);
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

  const {
    getTableProps,
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
    initialState,
  } = tableInstance;
  initialState.pageSize = 10;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const dateQueryParam = useQueryParam('date');
  let displayText;

  if (dateQueryParam) {
    const [year, month, day] = dateQueryParam.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCHours(date.getUTCHours() + 10);
    const options = { month: 'long', day: 'numeric' };
    displayText = `Pedidos para el ${date.toLocaleDateString('es-ES', options)}`;
  } else {
    displayText = 'Pedidos para hoy';
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
      <Card
        direction="column"
        w="100%"
        px="0px"
        overflowX={{ sm: "scroll", lg: "scroll" }}
      >
        <Flex px="25px" justify="space-between" mb="20px" align="center">
          <Text color={textColor} fontSize={{ base: "18px", md: "22px" }} fontWeight="700" lineHeight="100%">
            {displayText}
          </Text>
          <Menu onDateSelect={onDateSelect} />
        </Flex>
        <Flex px="25px" justify="space-between" mb="20px" align="right" justifyContent="flex-end">
          <Flex align="right">
            <ButtonGroup spacing="6">
              <Button variant="outline" onClick={openConsolidatedModal}>
                Ver consolidado
              </Button>
              <Button variant="action" onClick={openCreateModal}>
                Crear
              </Button>
            </ButtonGroup>
          </Flex>
        </Flex>
        {data.length === 0 ? (
          <Box mt="4" px="4" mb={{ base: '50px', md: '75px', lg: '115px', xl: '130px' }}>
            <Text color={textColor}>
              No hay registros para mostrar.
            </Text>
          </Box>
        ) : (
          <Table {...getTableProps()} variant="simple" color="gray.500" mb="24px">
            <Thead>
              {headerGroups.map((headerGroup, index) => (
                <Tr {...headerGroup.getHeaderGroupProps()} key={index}>
                  {headerGroup.headers.map((column, index) => (
                    <Th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      pe="10px"
                      key={index}
                      cursor="pointer"
                      borderColor={borderColor}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        fontSize={{ sm: "10px", lg: "12px" }}
                        color="gray.400"
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
                const totalAmount = row.original.cart_items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
                const formattedTotalAmount = totalAmount.toLocaleString('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                });
                const tooltipContent = (
                  <Table variant="simple" key={index}>
                    <Thead>
                      <Tr>
                        <Th>Producto</Th>
                        <Th>Cantidad</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {row.original.cart_items.map((item, itemIndex) => (
                        <Tr key={itemIndex}>
                          <Td>{item.product}</Td>
                          <Td>{item.price.toLocaleString('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          })}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                );
                const tooltipErrorContent = (
                  <Table variant="simple" key={index}>
                    <Thead>
                      <Tr>
                        <Th>Errores</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {row.original.errors.length > 0 ? (
                        row.original.errors.map((error, errorIndex) => (
                          <Tr key={errorIndex}>
                            <Td>{error.value}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={1}>No hay errores</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                );

                return (
                  <Tr
                    {...row.getRowProps()}
                    key={actualIndex}
                    onClick={() => openUpdateModal(row.original, actualIndex)} // Open modal on row click
                    cursor="pointer"
                  >
                    {row.cells.map((cell, index) => {
                      let data = "";
                      if (cell.column.Header === "NOMBRE") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        );
                      } else if (cell.column.Header === "STATUS") {
                        data = (
                          <Flex align="center">
                            <Icon
                              w="24px"
                              h="24px"
                              me="5px"
                              color={
                                (cell.value === "Programada" || cell.value === "Creada" || cell.value === "En ruta" || cell.value === "Entregada")
                                  ? "green.500"
                                  : cell.value === "Error"
                                    ? "red.500"
                                    : cell.value === "Reprogramada"
                                      ? "orange.500"
                                      : null
                              }
                              as={
                                (cell.value === "Programada" || cell.value === "Creada" || cell.value === "En ruta" || cell.value === "Entregada")
                                  ? MdCheckCircle
                                  : cell.value === "Reprogramada"
                                    ? MdOutlineError
                                    : cell.value === "Error"
                                      ? MdCancel
                                      : null
                              }
                            />
                            {cell.value === "Error" ? (
                              <Tooltip label={tooltipErrorContent} hasArrow placement="top" arrowSize={10}>
                                <Text color={textColor} fontSize="sm" fontWeight="700">
                                  {cell.value}
                                </Text>
                              </Tooltip>
                            ) : (
                              <Text color={textColor} fontSize="sm" fontWeight="700">
                                {cell.value}
                              </Text>
                            )}
                          </Flex>
                        );
                      } else if (cell.column.Header === "HORARIO") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        );
                      } else if (cell.column.Header === 'PEDIDO') {
                        data = (
                          <Tooltip label={tooltipContent} hasArrow placement="top" arrowSize={10}>
                            <Text color={textColor} fontSize="sm" fontWeight="700">
                              {cell.value}
                            </Text>
                          </Tooltip>
                        );
                      } else if (cell.column.Header === "MONTO TOTAL") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {formattedTotalAmount}
                          </Text>
                        );
                      } else if (cell.column.Header === "MÉTODO DE PAGO") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        );
                      } else if (cell.column.Header === "DIRECCIÓN") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        );
                      } else if (cell.column.Header === "FECHA") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        );
                      } else if (cell.column.Header === "REPARTIDOR") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        );
                      } else if (cell.column.Header === "SECUENCIA") {
                        data = (
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value !== null && cell.value !== undefined ? (
                              <>{cell.value}</>
                            ) : (
                              <>---</>
                            )}
                          </Text>
                        );
                      }
                      return (
                        <Td
                          {...cell.getCellProps()}
                          key={index}
                          fontSize={{ sm: "14px" }}
                          minW={{ sm: "150px", md: "200px", lg: "auto" }}
                          borderColor="transparent"
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
        {isUpdateModalOpen && (
          <UpdateOrderModal
            isOpen={isUpdateModalOpen}
            onClose={closeUpdateModal}
            onUpdate={onOrderUpdatedCallback}
            onDelete={onOrderDeletedCallback}
            productsAvailable={productsAvailable}
            rowData={selectedRowData}
          />
        )}
        {isCreateModalOpen && (
          <CreateOrderModal
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            onCreate={onOrderCreatedCallback}
            productsAvailable={productsAvailable}
          />
        )}
        {isConsolidatedModalOpen && (
          <ConsolidatedModal
            isOpen={isConsolidatedModalOpen}
            onClose={closeConsolidatedModal}
            products={listOfConsolidatedProducts}
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
        <Button
          variant="action"
          mt="4"
          onClick={handleScheduleButtonClick}
          isDisabled={isScheduling || isButtonDisabled()}
          isLoading={isScheduling}
          spinnerPlacement="end"
        >
          Programar pedidos para ir a ruta
        </Button>
      </Card>
    </>
  );
}

export default Orders;