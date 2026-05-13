import React, { useState } from 'react';
import { motion } from 'framer-motion';

import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Icon,
  Link,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { MdNoAccounts } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';

import Clients from 'views/admin/clients/components/Clients';
import { isDriver } from 'security';
import { useAuthGuard } from 'hooks/useAuthGuard';
import { useClients } from 'views/admin/clients/hooks/useClients';
import { CreateClientPayload, UpdateClientPayload } from 'types/client';

export default function ClientView() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useAuthGuard();

  const { fetchClient, createClient, updateClient, deleteClient } = useClients();

  const handleClientFetch = (phoneNumber: string) => fetchClient(phoneNumber);

  const handleClientCreate = async (payload: CreateClientPayload): Promise<void> => {
    try {
      await createClient(payload);
      setAlertMessage({ type: 'success', text: 'Cliente guardado en la base de datos.' });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (err) {
      setAlertMessage({ type: 'error', text: 'Error al crear cliente. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw err;
    }
  };

  const handleClientUpdate = async (
    payload: UpdateClientPayload & { delete_old_record: boolean }
  ): Promise<void> => {
    try {
      await updateClient(payload);
      setAlertMessage({ type: 'success', text: 'Cliente guardado en la base de datos.' });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (err) {
      setAlertMessage({ type: 'error', text: 'Error al actualizar cliente. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw err;
    }
  };

  const handleClientDelete = async (client: { phone_number: string }): Promise<void> => {
    try {
      await deleteClient(client.phone_number);
      setAlertMessage({ type: 'success', text: 'Cliente eliminado en la base de datos' });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (err) {
      setAlertMessage({ type: 'error', text: 'Error al eliminar el cliente. Intenta de nuevo.' });
      setTimeout(() => setAlertMessage(null), 3000);
      throw err;
    }
  };

  const userIsDriver = isDriver();

  if (userIsDriver) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Flex align='center' justify='center' direction='column'>
          <Icon as={MdNoAccounts} color='red.500' boxSize={12} />
          <Box mt={4} color='red.500' fontSize='lg' textAlign='center'>
            El contenido está restringido para administradores y mesa de control.
          </Box>
          <Link as={RouterLink} to='/driver' color={brandColor} fontWeight='bold' mt={'20px'}>
            Volver a la sección de repartidor
          </Link>
        </Flex>
      </Box>
    );
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

      <Box
        pt={{ base: '130px', md: '80px', xl: '80px' }}
        display='flex'
        justifyContent={{ base: 'center', xl: 'center' }}
      >
        <SimpleGrid
          mb='20px'
          columns={{ sm: 1, md: 1 }}
          spacing={{ base: '20px', xl: '20px' }}
        >
          <Clients
            onClientCreated={handleClientCreate}
            onClientUpdated={handleClientUpdate}
            onClientDeleted={handleClientDelete}
            onClientFetched={handleClientFetch}
          />
        </SimpleGrid>
      </Box>
    </>
  );
}
