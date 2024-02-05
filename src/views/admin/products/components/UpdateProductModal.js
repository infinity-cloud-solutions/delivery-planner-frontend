import React, { useState } from 'react';
import {
    Button,
    ButtonGroup,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';

import { isAdmin, } from 'security.js';

const UpdateProductModal = ({ isOpen, onClose, onUpdate, onDelete, rowData }) => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    let isUserAdmin = false;
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    let menuBg = useColorModeValue('white', 'navy.900');

    const updateProduct = async () => {
        const updatedProductName = productName || rowData.row.name || '';
        const updatedProductPrice = productPrice || rowData.row.price || '';

        const product = {
            item: {
                name: updatedProductName,
                price: updatedProductPrice,
            },
            rowIndex: rowData.index
        };
        onUpdate(product);
        setProductName('');
        setProductPrice('');
        onClose();

    };

    const deleteProduct = async () => {
        const updatedProductName = productName || rowData.row.name || '';
        const updatedProductPrice = productPrice || rowData.row.price || '';

        const product = {
            item: {
                name: updatedProductName,
                price: updatedProductPrice,
            },
            rowIndex: rowData.index
        };
        onDelete(product);
        setProductName('');
        setProductPrice('');
        onClose();

    };
    isUserAdmin = isAdmin();

    return (
        <Modal isOpen={isOpen} onClose={onClose} bg={menuBg}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Editar Producto</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                        <FormControl>
                            <FormLabel>Nombre del Producto</FormLabel>
                            <Input
                                type="text"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa el nombre del producto"

                                defaultValue={rowData.row.name}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Precio del Producto</FormLabel>
                            <Input
                                type="number"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa el precio del producto"
                                defaultValue={rowData.row.price}
                                onChange={(e) => setProductPrice(e.target.value)}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup spacing='6'>
                        {isUserAdmin && (
                            <Button colorScheme='red' variant='outline' onClick={deleteProduct}>
                                Eliminar
                            </Button>
                        )}
                        <Button variant="brand" onClick={updateProduct}>
                            Actualizar
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpdateProductModal;
