import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, FormErrorMessage, useColorModeValue, InputRightElement, Icon, InputGroup } from "@chakra-ui/react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

const NewPasswordModal = ({ isOpen, onClose, onSubmit }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    const handleSubmit = () => {
        if (newPassword.length < 8) {
            setError('Contraseña debe ser al menos 8 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Los campos deben coincidir');
            return;
        }
        onSubmit(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Cambia tu contraseña</ModalHeader>
                <ModalBody>
                    <FormControl isInvalid={error}>
                        <FormLabel
                            ms='4px'
                            fontSize='sm'
                            fontWeight='500'
                            color={textColor}
                            display='flex'
                        >Selecciona una nueva contraseña</FormLabel>
                        <InputGroup size='md'>
                            <Input
                                isRequired={true}
                                fontSize='sm'
                                placeholder=''
                                mb='24px'
                                size='lg'
                                value={newPassword}
                                type={show ? "text" : "password"}
                                onChange={(e) => setNewPassword(e.target.value)}
                                variant='auth'
                            />
                            <InputRightElement display='flex' alignItems='center' mt='4px'>
                                <Icon
                                    color={textColorSecondary}
                                    _hover={{ cursor: "pointer" }}
                                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                                    onClick={handleClick}
                                />
                            </InputRightElement>
                        </InputGroup>

                        <FormLabel
                            ms='4px'
                            fontSize='sm'
                            fontWeight='500'
                            color={textColor}
                            display='flex'>
                            Confirma tu elección
                        </FormLabel>
                        <InputGroup size='md'>
                            <Input
                                isRequired={true}
                                fontSize='sm'
                                placeholder=''
                                mb='24px'
                                size='lg'
                                value={confirmPassword}
                                type={show ? "text" : "password"}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                variant='auth'
                            />
                            <InputRightElement display='flex' alignItems='center' mt='4px'>
                                <Icon
                                    color={textColorSecondary}
                                    _hover={{ cursor: "pointer" }}
                                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                                    onClick={handleClick}
                                />
                            </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{error}</FormErrorMessage>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="brand" mr={3} onClick={handleSubmit}>Guardar</Button>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default NewPasswordModal;
