import React, { useState } from 'react';
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
} from '@chakra-ui/react';

import CreateClientModal from 'views/admin/clients/components/CreateClientModal';
import UpdateClientModal from 'views/admin/clients/components/UpdateClientModal';
import { isAdmin } from 'security';
import { CreateClientPayload, UpdateClientPayload, MappedClient } from 'types/client';

interface ClientsProps {
  onClientCreated: (payload: CreateClientPayload) => Promise<void>;
  onClientUpdated: (payload: UpdateClientPayload & { delete_old_record: boolean }) => Promise<void>;
  onClientDeleted: (client: { phone_number: string }) => Promise<void>;
  onClientFetched: (phoneNumber: string) => Promise<MappedClient | null>;
}

function Clients(props: ClientsProps) {
  const { onClientCreated, onClientUpdated, onClientDeleted, onClientFetched } = props;

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [fetchedClientData, setFetchedClientData] = useState<MappedClient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchButtonEnable, setIsSearchButtonEnable] = useState(false);
  const [loadingSearchForClient, setLoadingSearchForClient] = useState(false);
  const [isError, setIsError] = useState(false);

  const isUserAdmin = isAdmin();

  const onClientCreatedCallback = async (newClient: CreateClientPayload): Promise<void> => {
    try {
      await onClientCreated(newClient);
    } catch (error) {
      throw error;
    }
  };

  const onClientUpdatedCallback = async (
    updatedClient: UpdateClientPayload & { delete_old_record: boolean }
  ): Promise<void> => {
    try {
      await onClientUpdated(updatedClient);
    } catch (error) {
      throw error;
    }
  };

  const onClientDeletedCallback = async (client: { phone_number: string }): Promise<void> => {
    try {
      await onClientDeleted(client);
    } catch (error) {
      throw error;
    }
  };

  const textColor = useColorModeValue('navy.700', 'white');

  const openCreateModal = () => {
    setCreateModalOpen(true);
  };

  const openUpdateModal = (clientData: MappedClient) => {
    setFetchedClientData(clientData);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchButtonEnable(value.length === 10);
    setIsError(!value.length === false);
  };

  const handleSearch = async () => {
    setLoadingSearchForClient(true);
    const clientData = await onClientFetched(searchQuery);
    if (clientData) {
      openUpdateModal(clientData);
      setSearchQuery('');
      setIsError(false);
    } else {
      setIsError(true);
    }
    setLoadingSearchForClient(false);
  };

  const onClientExistsCheckCallback = async (phoneNumber: string): Promise<MappedClient | null> => {
    return onClientFetched(phoneNumber);
  };

  return (
    <>
      <Flex
        direction='column'
        w='100%'
        maxW={{ base: '100%', sm: '450px', md: '750px', lg: '1200px' }}
        minW={{ base: '100%', sm: '350px', md: '550px', lg: '800px' }}
        mx='auto'
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex
          align={{ sm: 'flex-start', lg: 'center' }}
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
          <Button variant='action' onClick={openCreateModal}>
            Crear
          </Button>
        </Flex>

        <Box px='22px'>
          <FormControl isRequired isInvalid={isError}>
            <FormLabel htmlFor='phone'>Teléfono a 10 dígitos</FormLabel>
            <Input
              type='number'
              id='phone'
              placeholder='Ingresa solo números'
              value={searchQuery}
              color={textColor}
              onChange={handleInputChange}
            />
            {!isError ? (
              <FormHelperText>
                Ingresa el número que deseas buscar en la base de datos
              </FormHelperText>
            ) : (
              <FormErrorMessage>Cliente no encontrado.</FormErrorMessage>
            )}
            <ButtonGroup>
              <Button
                mt='20px'
                variant='outline'
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

      {isUpdateModalOpen && fetchedClientData && (
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
