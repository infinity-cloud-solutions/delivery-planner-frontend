import React from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Table,
    Tbody,
    Tr,
    Td,
    Th,
    Thead,

} from '@chakra-ui/react';


function ConsolidatedModal({ isOpen, onClose, products }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Productos Consolidados</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Producto</Th>
                                <Th>Cantidad</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {products.map((product, index) => (
                                <Tr key={index}>
                                    <Td>{product.product}</Td>
                                    <Td>{product.quantity}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ConsolidatedModal;
