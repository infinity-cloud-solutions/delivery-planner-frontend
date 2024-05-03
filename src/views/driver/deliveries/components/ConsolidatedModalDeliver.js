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


function ConsolidatedDeliveryModal({ isOpen, onClose, products }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Productos Consolidados</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {Object.keys(products).map((driver, index) => (
                        <React.Fragment key={index}>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th colSpan={2}>Repartidor {driver}</Th>
                                    </Tr>
                                    <Tr>
                                        <Th>Producto</Th>
                                        <Th>Cantidad</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Object.entries(products[driver]).map(([product, quantity]) => (
                                        <Tr key={product}>
                                            <Td>{product}</Td>
                                            <Td>{quantity}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                            <br />
                        </React.Fragment>
                    ))}
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


export default ConsolidatedDeliveryModal;
