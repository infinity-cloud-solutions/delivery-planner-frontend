import React, { useState } from 'react';
import {
    Button,
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

const CreateProductModal = ({ isOpen, onClose, onCreate }) => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');

    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    let menuBg = useColorModeValue('white', 'navy.900');

    const createProduct = async () => {

        const newProduct = {
            name: productName,
            price: productPrice,
        };
        onCreate(newProduct);
        setProductName('');
        setProductPrice('');
        onClose();

    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} bg={menuBg}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Crear Producto</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                    <FormControl>
                            <FormLabel>SKU</FormLabel>
                            <Input
                                type="text"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="SKU debe coincidir con el SKU en Shopify"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Nombre del Producto</FormLabel>
                            <Input
                                type="text"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="Ingresa el nombre del producto"
                                value={productName}
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
                                value={productPrice}
                                onChange={(e) => setProductPrice(e.target.value)}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="brand" onClick={createProduct}>
                        Crear Producto
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateProductModal;
