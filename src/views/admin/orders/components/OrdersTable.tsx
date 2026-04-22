import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
// @ts-ignore
import { TableInstance } from "react-table";
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";
import { Order } from "types/order";

interface OrdersTableProps {
  tableInstance: TableInstance<Order>;
  onRowClick: (row: Order, actualIndex: number) => void;
}

function OrdersTable({ tableInstance, onRowClick }: OrdersTableProps) {
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
    // @ts-ignore
    state: { pageIndex, pageSize },
    prepareRow,
  } = tableInstance;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  if (!page || page.length === 0) {
    return (
      <Box mt="4" px="4" mb={{ base: "50px", md: "75px", lg: "115px", xl: "130px" }}>
        <Text color={textColor}>No hay registros para mostrar.</Text>
      </Box>
    );
  }

  return (
    <>
      <Table {...getTableProps()} variant="simple" color="gray.500" mb="24px">
        <Thead>
          {headerGroups.map((headerGroup: any, index: number) => (
            <Tr {...headerGroup.getHeaderGroupProps()} key={index}>
              {headerGroup.headers.map((column: any, index: number) => (
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
          {page.map((row: any, index: number) => {
            prepareRow(row);
            const actualIndex = index + pageIndex * pageSize;
            let totalAmount = row.original.cart_items.reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0
            );
            if (row.original.discount > 0) {
              totalAmount *= 1 - row.original.discount / 100;
            }
            const formattedTotalAmount = totalAmount.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
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
                  {row.original.cart_items.map((item: any, itemIndex: number) => (
                    <Tr key={itemIndex}>
                      <Td>{item.product}</Td>
                      <Td>{item.quantity}</Td>
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
                    row.original.errors.map((error: any, errorIndex: number) => (
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
                onClick={() => onRowClick(row.original, actualIndex)}
                cursor="pointer"
              >
                {row.cells.map((cell: any, index: number) => {
                  let data: React.ReactNode = "";
                  if (cell.column.Header === "NOMBRE") {
                    data = (
                      <Text color={textColor} fontSize="sm" fontWeight="700">
                        {cell.value}
                      </Text>
                    );
                  } else if (cell.column.Header === "TELÉFONO") {
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
                            cell.value === "Programada" ||
                            cell.value === "Creada" ||
                            cell.value === "En ruta"
                              ? "green.500"
                              : cell.value === "Entregada"
                              ? "blue.500"
                              : cell.value === "Error"
                              ? "red.500"
                              : cell.value === "Reprogramada"
                              ? "orange.500"
                              : null
                          }
                          as={
                            cell.value === "Programada" ||
                            cell.value === "Creada" ||
                            cell.value === "En ruta" ||
                            cell.value === "Entregada"
                              ? MdCheckCircle
                              : cell.value === "Reprogramada"
                              ? MdOutlineError
                              : cell.value === "Error"
                              ? MdCancel
                              : null
                          }
                        />
                        {cell.value === "Error" ? (
                          <Tooltip
                            label={tooltipErrorContent}
                            hasArrow
                            placement="top"
                            arrowSize={10}
                          >
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
                  } else if (cell.column.Header === "PEDIDO") {
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
                  } else if (cell.column.Header === "CREADA") {
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
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
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
      <Flex direction="column" align="center" mt="2" mb="2">
        <ButtonGroup>
          <Button
            variant="outline"
            mr={{ base: "10px", sm: "15", md: "30px", lg: "40px", xl: "50px" }}
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            Anterior
          </Button>
          {pageOptions.length > 0 && (
            <Text
              mt="auto"
              mr={{ base: "10px", sm: "15", md: "30px", lg: "40px", xl: "50px" }}
              pb="2"
            >
              Página{" "}
              <strong>
                {pageIndex + 1} de {pageOptions.length}
              </strong>{" "}
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

export default OrdersTable;
