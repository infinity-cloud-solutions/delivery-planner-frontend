import { Alert, AlertIcon, AlertStatus, Button, ButtonGroup, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";
// @ts-ignore
import { Column, useGlobalFilter, usePagination, useSortBy, useTable } from "react-table";
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import UpdateOrderModal from "./UpdateOrderModal";
import CreateOrderModal from "./CreateOrderModal";
import ConsolidatedModal from "./ConsolidatedModal";
import MapModal from "./MapModal";
import OrdersTable from "./OrdersTable";
import ScheduleButton from "./ScheduleButton";
import { useQueryParam, getDateAsQueryParam } from "utils/Utility";
import { UpdateOrderArgs, DeleteOrderArgs } from "views/admin/orders/hooks/useOrders";
import { CreateOrderPayload, Order, ConsolidatedProducts } from "types/order";
import { Product } from "types/product";
import { MappedClient } from "types/client";

interface OrdersProps {
  columnsData: Column<Order>[];
  tableData: Order[];
  onOrderCreated: (payload: CreateOrderPayload) => Promise<void>;
  onOrderUpdated: (args: UpdateOrderArgs) => Promise<void>;
  onOrderDeleted: (args: DeleteOrderArgs) => Promise<void>;
  onOrdersScheduled: (drivers: number[]) => void;
  onDateSelect: (date: { value: string }) => void;
  productsAvailable: Product[];
  listOfConsolidatedProducts: ConsolidatedProducts;
  onValidateClient: (phone: string) => Promise<MappedClient | null>;
  onRouteSelected: (orders: Order[]) => Promise<void>;
}

function Orders({
  columnsData, tableData, onOrderCreated, onOrderUpdated, onOrderDeleted,
  onOrdersScheduled, onDateSelect, productsAvailable, listOfConsolidatedProducts,
  onValidateClient, onRouteSelected,
}: OrdersProps) {
  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: AlertStatus; text: string } | null>(null);
  const [selectedAvailableDrivers, setSelectedAvailableDrivers] = useState([1, 2]);
  const [isConsolidatedModalOpen, setIsConsolidatedModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<{ row: Order; index: number } | null>(null);

  const isButtonDisabled = () => {
    return data.length === 0 || data.some((row) => row.status !== "Creada" || row.errors.length > 0);
  };

  const onOrderScheduledCallback = async () => {
    setIsScheduling(true);
    try {
      await onOrdersScheduled(selectedAvailableDrivers);
      setIsMapModalOpen(true);
    } catch (error) {
      setIsScheduling(false);
    }
    setIsScheduling(false);
    setSelectedAvailableDrivers([1, 2]);
  };

  const openUpdateModal = (row: Order, rowIndex: number) => {
    const allowedStatuses = ["Creada", "Reprogramada", "Error"];
    if (!allowedStatuses.includes(row.status)) {
      setAlertMessage({
        type: "error",
        text: 'No se puede editar una orden con estado diferente a "Creada" o "Reprogramada".',
      });
      setTimeout(() => setAlertMessage(null), 6000);
    } else {
      setSelectedRowData({ row: row, index: rowIndex });
      setIsUpdateModalOpen(true);
    }
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedRowData(null);
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  const openConsolidatedModal = () => setIsConsolidatedModalOpen(true);
  const closeConsolidatedModal = () => setIsConsolidatedModalOpen(false);
  const closeMapModal = () => setIsMapModalOpen(false);

  const handleAvailableDriversChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      setSelectedAvailableDrivers([Number(event.target.value)]);
    } else {
      setSelectedAvailableDrivers([1, 2]);
    }
  };

  const tableInstance = useTable(
    { columns, data, initialState: { pageSize: 30 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const textColor = useColorModeValue("secondaryGray.900", "white");

  const dateQueryParam = useQueryParam("date");
  let displayText: string;

  if (dateQueryParam) {
    const [year, month, day] = dateQueryParam.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCHours(date.getUTCHours() + 10);
    const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
    displayText = `Pedidos para el ${date.toLocaleDateString("es-ES", options)}`;
  } else {
    displayText = "Pedidos para hoy";
  }

  const isToday = () => {
    if (!dateQueryParam) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      const currentDateValue = getDateAsQueryParam();
      return formattedDate === currentDateValue;
    } else {
      const currentDateValue = getDateAsQueryParam();
      return dateQueryParam === currentDateValue;
    }
  };

  return (
    <>
      {alertMessage && (
        <motion.div
          initial={{ x: "100%", right: "8px", top: "20%" }}
          animate={{ x: 0, right: "8px", top: "20%" }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5 }}
          style={{ position: "fixed", zIndex: 1000 }}
        >
          <Alert status={alertMessage.type} mb={4}>
            <AlertIcon />
            {alertMessage.text}
          </Alert>
        </motion.div>
      )}
      <Card direction="column" w="100%" px="0px" overflowX={{ sm: "scroll", lg: "scroll" }}>
        <Flex px="25px" justify="space-between" mb="20px" align="center">
          <Text
            color={textColor}
            fontSize={{ base: "18px", md: "22px" }}
            fontWeight="700"
            lineHeight="100%"
          >
            {displayText}
          </Text>
          <Menu onDateSelect={onDateSelect} />
        </Flex>
        <Flex
          px="25px"
          justify="space-between"
          mb="20px"
          align="right"
          justifyContent="flex-end"
        >
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
        <OrdersTable
          tableInstance={tableInstance}
          onRowClick={openUpdateModal}
        />
        {isUpdateModalOpen && (
          <UpdateOrderModal
            isOpen={isUpdateModalOpen}
            onClose={closeUpdateModal}
            onUpdate={onOrderUpdated}
            onDelete={onOrderDeleted}
            productsAvailable={productsAvailable}
            rowData={selectedRowData}
          />
        )}
        {isCreateModalOpen && (
          <CreateOrderModal
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            onCreate={onOrderCreated}
            productsAvailable={productsAvailable}
            onClientExistsCheck={onValidateClient}
          />
        )}
        {isConsolidatedModalOpen && (
          <ConsolidatedModal
            isOpen={isConsolidatedModalOpen}
            onClose={closeConsolidatedModal}
            products={listOfConsolidatedProducts}
          />
        )}
        {isMapModalOpen && (
          <MapModal
            isOpen={isMapModalOpen}
            onClose={closeMapModal}
            onConfirmRoute={onRouteSelected}
            orders={data}
          />
        )}
        <ScheduleButton
          isToday={isToday()}
          isDisabled={isButtonDisabled()}
          isScheduling={isScheduling}
          selectedAvailableDrivers={selectedAvailableDrivers}
          onDriverChange={handleAvailableDriversChange}
          onSchedule={onOrderScheduledCallback}
        />
      </Card>
    </>
  );
}

export default Orders;