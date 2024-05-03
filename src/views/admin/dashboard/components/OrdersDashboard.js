import {
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
  Tr,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import { validateJWT } from 'security.js';
import { useHistory } from "react-router-dom";

// Assets
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";
export default function ColumnsTable(props) {
  const { columnsData, tableData } = props;

  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);
  const history = useHistory();

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
    prepareRow,
    initialState,
  } = tableInstance;
  initialState.pageSize = 5;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const seeAllOrdersForToday = () => {
    if (validateJWT) {
      history.push('/admin/orders');
    }
  };

  return (
    <Card
      direction="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "scroll" }}
    >
      <Flex px="25px" justify="space-between" mb="20px" align="center">
        <Text color={textColor} fontSize={{ base: "18px", md: "22px" }} fontWeight="700" lineHeight="100%">
          Para hoy
        </Text>
        <Flex align="right">
          <ButtonGroup spacing="6">
            <Button variant="action" onClick={seeAllOrdersForToday}>
              Ver todas
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
              return (
                <Tr
                  {...row.getRowProps()}
                  key={index}
                  cursor="pointer"
                >
                  {row.cells.map((cell, index) => {
                    let data = "";
                    if (cell.column.Header === "NOMBRE") {
                      data = (
                        <Tooltip label={row.original.client_name}>
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        </Tooltip>
                      );
                    } else if (cell.column.Header === "STATUS") {
                      data = (
                        <Flex align="center">
                          <Icon
                            w="24px"
                            h="24px"
                            me="5px"
                            color={
                              (cell.value === "Programada" || cell.value === "Creada" || cell.value === "En ruta")
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
                              (cell.value === "Programada" || cell.value === "Creada" || cell.value === "En ruta" || cell.value === "Entregada")
                                ? MdCheckCircle
                                : cell.value === "Reprogramada"
                                  ? MdOutlineError
                                  : cell.value === "Error"
                                    ? MdCancel
                                    : null
                            }
                          />
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            {cell.value}
                          </Text>
                        </Flex>
                      );
                    } else if (cell.column.Header === "MONTO TOTAL") {
                      const currencyFormatter = new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      });
                      const formattedValue = currencyFormatter.format(cell.value);
                      data = (
                        <Text color={textColor} fontSize="sm" fontWeight="700">
                          {formattedValue}
                        </Text>
                      );
                    } else if (cell.column.Header === "MÉTODO DE PAGO") {
                      data = (
                        <Text color={textColor} fontSize="sm" fontWeight="700">
                          {cell.value}
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
    </Card>

  );
}
