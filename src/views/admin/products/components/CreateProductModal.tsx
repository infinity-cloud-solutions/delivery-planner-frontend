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
    Spinner,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { CreateProductPayload } from 'types/product';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (payload: CreateProductPayload) => Promise<void>;
}

const CreateProductModal = ({ isOpen, onClose, onCreate }: CreateProductModalProps) => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');


    const createProduct = async () => {
        const parsedPrice = parseFloat(productPrice);
        if (Number.isNaN(parsedPrice)) return;
        setIsLoading(true);
        try {
            await onCreate({ name: productName, price: parsedPrice });
            setProductName('');
            setProductPrice('');
            onClose();
        } catch {
            // parent already shows the alert; don't close on failure
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Crear Producto</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="4">
                    {/* <FormControl>
                            <FormLabel>SKU</FormLabel>
                            <Input
                                type="text"
                                color={textColor}
                                borderColor={borderColor}
                                placeholder="SKU debe coincidir con el SKU en Shopify"
                                value={productSKU}
                                onChange={(e) => setProductSKU(e.target.value)}
                            />
                        </FormControl> */}
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
                    <Button variant="brand" onClick={createProduct} isDisabled={isLoading}>
                        {isLoading ? <><Spinner size="sm" mr={2} />Guardando...</> : 'Crear Producto'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateProductModal;
