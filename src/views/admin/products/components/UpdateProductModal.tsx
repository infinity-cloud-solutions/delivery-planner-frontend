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

import { isAdmin } from 'security';
import { Product } from 'types/product';
import { UpdateProductArgs, DeleteProductArgs } from 'views/admin/products/hooks/useProductsCRUD';

interface UpdateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (args: UpdateProductArgs) => Promise<void>;
    onDelete: (args: DeleteProductArgs) => Promise<void>;
    rowData: { row: Product; index: number };
}

const UpdateProductModal = ({ isOpen, onClose, onUpdate, onDelete, rowData }: UpdateProductModalProps) => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isUserAdmin = isAdmin();
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');


    const updateProduct = async () => {
        const updatedProductName = productName || rowData.row.name || '';
        const updatedPrice = productPrice !== '' ? parseFloat(productPrice) : rowData.row.price;

        const product: UpdateProductArgs = {
            item: {
                name: updatedProductName,
                price: typeof updatedPrice === 'number' ? updatedPrice : parseFloat(String(updatedPrice)),
                id: rowData.row.id || '',
            },
            rowIndex: rowData.index
        };
        setIsUpdating(true);
        try {
            await onUpdate(product);
            setProductName('');
            setProductPrice('');
            onClose();
        } catch {
            // parent already shows the alert; don't close on failure
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteProduct = async () => {
        const updatedProductName = productName || rowData.row.name || '';
        const updatedPrice = productPrice !== '' ? parseFloat(productPrice) : rowData.row.price;

        const product: DeleteProductArgs = {
            item: {
                name: updatedProductName,
                price: typeof updatedPrice === 'number' ? updatedPrice : parseFloat(String(updatedPrice)),
                id: rowData.row.id || '',
            },
            rowIndex: rowData.index
        };
        setIsDeleting(true);
        try {
            await onDelete(product);
            setProductName('');
            setProductPrice('');
            onClose();
        } catch {
            // parent already shows the alert; don't close on failure
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
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
                            <Button
                                colorScheme='red'
                                variant='outline'
                                onClick={deleteProduct}
                                isLoading={isDeleting}
                                isDisabled={isUpdating || isDeleting}
                            >
                                Eliminar
                            </Button>
                        )}
                        <Button
                            variant="brand"
                            onClick={updateProduct}
                            isLoading={isUpdating}
                            isDisabled={isUpdating || isDeleting}
                        >
                            Actualizar
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpdateProductModal;
