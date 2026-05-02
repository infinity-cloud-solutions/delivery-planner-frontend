import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import React from "react";
import { MdAdd, MdClear } from "react-icons/md";

interface ScheduleButtonProps {
  isToday: boolean;
  isDisabled: boolean;
  isScheduling: boolean;
  selectedAvailableDrivers: number[];
  onDriverChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSchedule: () => void;
}

function ScheduleButton({
  isToday,
  isDisabled,
  isScheduling,
  selectedAvailableDrivers,
  onDriverChange,
  onSchedule,
}: ScheduleButtonProps) {
  if (!isToday) return null;

  return (
    <>
      {!isDisabled && (
        <Accordion allowMultiple>
          <AccordionItem>
            {({ isExpanded }: { isExpanded: boolean }) => (
              <>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    Ver opciones avanzadas
                  </Box>
                  {isExpanded ? <MdClear /> : <MdAdd />}
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <FormControl mt={"4"}>
                    <FormLabel>Programar todas las órdenes para un solo repartidor</FormLabel>
                    <Select
                      value={selectedAvailableDrivers.length === 1 ? String(selectedAvailableDrivers[0]) : ''}
                      onChange={onDriverChange}
                      placeholder="Elegir a un repartidor"
                    >
                      <option value="1">Repartidor 1</option>
                      <option value="2">Repartidor 2</option>
                    </Select>
                  </FormControl>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        </Accordion>
      )}
      <Button
        variant="action"
        mt="4"
        onClick={onSchedule}
        isDisabled={isScheduling || isDisabled}
        isLoading={isScheduling}
        spinnerPlacement="end"
      >
        {selectedAvailableDrivers.length === 2
          ? "Crear ruta sugerida"
          : `Crear ruta sugerida usando repartidor ${selectedAvailableDrivers[0]}`}
      </Button>
    </>
  );
}

export default ScheduleButton;
