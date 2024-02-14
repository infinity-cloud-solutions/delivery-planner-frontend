import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import DefaultAuth from "layouts/auth/Default";
import NewPasswordModal from "views/auth/components/SetNewPasswordModal"

import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { validateJWT, isDriver, getAccessToken } from 'security.js';

function SignIn() {
  const history = useHistory();

  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";

  const brandStars = useColorModeValue("brand.500", "brand.400");

  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => setShow(!show);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userAtt, setUserAtt] = useState("");
  const [error, setError] = useState(null);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [isNewPasswordModalOpen, setNewPasswordModalOpen] = useState(false);
  const [cognitoUsr, setCognitoUsr] = useState(null);

  useEffect(() => {
    let isTokenValid = getAccessToken()
    if (isTokenValid) {
      isTokenValid = validateJWT();

      if (isTokenValid) {
        const isInDriverGroup = isDriver();
        const redirectToPath = isInDriverGroup ? '/driver/deliveries' : '/admin/dashboard';

        history.push(redirectToPath);
      } else {
        setError("No estás autenticado. Inicia sesión para entrar al sistema");

      }
    }
  }, [history]);

  const signIn = () => {
    setIsLoading(true)
    setIsNewPasswordRequired(false);
    const poolData = {
      UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    };

    const userPool = new CognitoUserPool(poolData);

    const authenticationData = {
      Username: email,
      Password: password,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    setCognitoUsr(cognitoUser);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        console.log('Authentication Successful!', session);
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);
        setIsLoading(false)
        const isInDriverGroup = isDriver();
        const redirectToPath = isInDriverGroup ? '/driver/deliveries' : '/admin/dashboard';
        history.push(redirectToPath);

      },
      newPasswordRequired: (userAttributes) => {
        setIsLoading(false);
        setIsNewPasswordRequired(true);
        setNewPasswordModalOpen(true);
        setUserAtt(userAttributes)
      },
      onFailure: (err) => {
        console.error('Authentication failed:', err);
        setError("Credenciales erróneas");
        setIsLoading(false)
      },
    });

  };

  const handleNewPasswordSubmit = (newPassword) => {
    setIsLoading(true);

    cognitoUsr.completeNewPasswordChallenge(newPassword, null, {
      onSuccess: (session) => {
        console.log('New password submitted successfully!', session);
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);

        setIsLoading(false);

        const isInDriverGroup = isDriver();
        const redirectToPath = isInDriverGroup ? '/driver/deliveries' : '/admin/dashboard';
        history.push(redirectToPath);
      },
      onFailure: (err) => {
        console.error('Failed to submit new password:', err);
        setError("Error al guardar la nueva contraseña. Intenta de nuevo.");
        setIsLoading(false);
      },
    });

    setNewPasswordModalOpen(false);
};



  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w='100%'
        mx={{ base: "auto", lg: "0px" }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection='column'>
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>
            Iniciar sesión
          </Heading>
          <Text
            mb='36px'
            ms='4px'
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            Ingresa tu correo y contraseña para entrar al sistema
          </Text>
        </Box>
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: "100%", md: "420px" }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: "auto", lg: "unset" }}
          me='auto'
          mb={{ base: "20px", md: "auto" }}>
          <FormControl>
            <FormLabel
              display='flex'
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              mb='8px'>
              Correo electrónico<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              id="email"
              isRequired={true}
              variant='auth'
              fontSize='sm'
              ms={{ base: "0px", md: "0px" }}
              type='email'
              placeholder='email@ejemplo.com'
              mb='24px'
              fontWeight='500'
              size='lg'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormLabel
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              display='flex'>
              Contraseña<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size='md'>
              <Input
                isRequired={true}
                fontSize='sm'
                placeholder=''
                mb='24px'
                size='lg'
                value={password}
                type={show ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
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
            <Button
              fontSize='sm'
              variant='brand'
              fontWeight='500'
              w='100%'
              h='50'
              mb='24px'
              isLoading={isLoading}
              loadingText='Cargando'
              _hover={!isLoading ? { bg: brandStars, color: "white" } : {}}
              onClick={signIn
              }>
              Iniciar sesión
            </Button>
            {error && (
              <Text color="red.500" mt="2" textAlign="center">
                {error}
              </Text>
            )}
          </FormControl>
        </Flex>
      </Flex>
      <NewPasswordModal
        isOpen={isNewPasswordModalOpen}
        onClose={() => setNewPasswordModalOpen(false)}
        onSubmit={handleNewPasswordSubmit}
      />
    </DefaultAuth>
  );
}

export default SignIn;
