import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Text,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from 'axios';

import CreateClientModal from "views/admin/clients/components/CreateClientModal";
import UpdateClientModal from "views/admin/clients/components/UpdateClientModal";
import { isAdmin } from 'security.js';

function Clients(props) {
  const { onClientCreated, onClientUpdated, onClientDeleted, onClientFetched } = props;

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [fetchedClientData, setFetchedClientData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchButtonEnable, setIsSearchButtonEnable] = useState(false);
  const [loadingSearchForClient, setLoadingSearchForClient] = useState(false);
  const [isError, setIsError] = useState(false)

  let isUserAdmin = false;
  isUserAdmin = isAdmin();

  const onClientCreatedCallback = async (newClient) => {
    try {
      await onClientCreated(newClient);
    } catch (error) {
      throw error;
    }
  };

  const onClientUpdatedCallback = async (updatedClient) => {
    try {
      await onClientUpdated(updatedClient);
    } catch (error) {
      throw error;
    }
  };

  const onClientDeletedCallback = async (client) => {
    onClientDeleted(client);
    try {
      await onClientDeleted(client);
    } catch (error) {
      throw error;
    }
  };

  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");

  const openCreateModal = () => {
    setCreateModalOpen(true);
  };

  const openUpdateModal = (clientData) => {
      setFetchedClientData(clientData)
      setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchButtonEnable(value.length === 10);
    setIsError(!value.length === 0);
  };

  const handleSearch = async () => {
    setLoadingSearchForClient(true)
    const clientData = await onClientFetched(searchQuery);
    if (clientData) {
      openUpdateModal(clientData)
      setSearchQuery('');
      setIsError(false);
    } else {
      setIsError(true);

    }
    setLoadingSearchForClient(false)
  };

  const onClientExistsCheckCallback = async (searchQuery) => {
    const clientData = await onClientFetched(searchQuery);
    if (clientData) {
      return clientData;
    } else {
      return null;
    }
  }

  return (
    <>
      <Flex
        direction='column'
        w='100%'
        maxW={{ base: "100%", sm: "450px", md: "750px", lg: "1200px" }}
        minW={{ base: "100%", sm: "350px", md: "550px", lg: "800px" }}
        mx='auto'
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
            Clientes
          </Text>
            <Button variant="action" onClick={openCreateModal}>
              Crear
            </Button>
        </Flex>

        <Box px="22px">
          <FormControl isRequired isInvalid={isError}>
            <FormLabel htmlFor='phone'>Teléfono a 10 dígitos</FormLabel>
            <Input
              type="number"
              id="phone"
              placeholder="Ingresa solo números"
              value={searchQuery}
              color={textColor}
              onChange={handleInputChange}
            />
            {!isError ? (
              <FormHelperText>
                Ingresa el número que deseas buscar en la base de datos.
              </FormHelperText>
            ) : (
              <FormErrorMessage>Cliente no encontrado.</FormErrorMessage>
            )}
            <ButtonGroup>
              <Button
                mt="20px"
                variant="outline"
                onClick={handleSearch}
                isLoading={loadingSearchForClient}
                loadingText='Buscando'
                spinnerPlacement='end'
                isDisabled={!isSearchButtonEnable}
              >
                Buscar
              </Button>
            </ButtonGroup>
          </FormControl>
        </Box>
      </Flex>

      {isUpdateModalOpen && (
        <UpdateClientModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          onUpdate={onClientUpdatedCallback}
          onDelete={onClientDeletedCallback}
          clientData={fetchedClientData}
        />
      )}
      {isCreateModalOpen && (
        <CreateClientModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onCreate={onClientCreatedCallback}
          onClientExistsCheck={onClientExistsCheckCallback}
        />
      )}
    </>
  );
}

export default Clients;
