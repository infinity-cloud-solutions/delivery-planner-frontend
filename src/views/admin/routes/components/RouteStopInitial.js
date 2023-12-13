// Chakra imports
import {
    Box,
    Button,
    ButtonGroup,
    Badge,
    Flex,
    Text,
    Textarea,
    useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
// Assets

export default function RouteStopInitial(props) {
    const { used, total, ...rest } = props;
    // Chakra Color Mode
    const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
    // const brandColor = useColorModeValue("brand.500", "white");
    // const textColorSecondary = "gray.400";
    // const property = {
    //     imageUrl: "https://bit.ly/2Z4KKcF",
    //     imageAlt: "Google Maps",
    //     beds: 3,
    //     baths: 2,
    //     title: "Modern home in city center in the heart of historic Los Angeles",
    //     formattedPrice: "$1,900.00",
    //     reviewCount: 34,
    //     rating: 4,
    // }

    return (
        <Card {...rest} mb='20px' align='center' p='20px'>
            <Flex maxW={{ base: "sm", lg: "2xl", "2xl": "2xl" }} direction={{ base: "column", "2xl": "row" }}>
                <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Box p="6">
                        <Box d="flex" alignItems="baseline">
                            {/* <Badge borderRadius="full" px="2" colorScheme="brand">
                  New
                </Badge> */}
                            <Box
                                color="gray.500"
                                fontWeight="semibold"
                                letterSpacing="wide"
                                fontSize="xs"
                                textTransform="uppercase"
                                ml="2"
                            >
                                Av Juárez 123, Col: Hidalgo, CP 20150 &bull; Ver en Google Maps
                            </Box>
                        </Box>
                        <Box
                            mt="1"
                            fontWeight="semibold"
                            as="h4"
                            lineHeight="tight"
                            isTruncated
                        >
                            Entregar a: Marco Burgos
                        </Box>
                        <Box>
                            Mix Berries
                            <Box as="span" color="gray.600" fontSize="sm">
                                &bull; 1 / bolsa
                            </Box>
                        </Box>
                        <Box>
                            Mango
                            <Box as="span" color="gray.600" fontSize="sm">
                                &bull; 2 / bolsas
                            </Box>
                        </Box>
                        <Box>
                            Piña
                            <Box as="span" color="gray.600" fontSize="sm">
                                &bull; 4 / bolsas
                            </Box>
                        </Box>
                        <Box display='flex' alignItems='baseline'>
                            <Badge borderRadius='full' px='2' colorScheme='linkedin'>
                                Efectivo
                            </Badge>
                            <Box
                                color='gray.500'
                                fontWeight='semibold'
                                letterSpacing='wide'
                                fontSize='xs'
                                textTransform='uppercase'
                                ml='2'
                            >
                                Total: $450.00
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Flex direction='column' pe='44px'>
                    <Text
                        color={textColorPrimary}
                        fontWeight='bold'
                        textAlign='start'
                        fontSize='2xl'
                        mt={{ base: "20px", "2xl": "50px" }}>
                        Información de cargada
                    </Text>
                    {/* <Button
                me='100%'
                mb='50px'
                w='140px'
                minW='140px'
                mt={{ base: "20px", "2xl": "auto" }}
                variant='brand'
                fontWeight='500'>
                Entregado
              </Button> */}

                </Flex>
                <br />
                <Textarea placeholder="Agrega notas sobre el reparto" rows="3" borderRadius="16px" />
                <br />
                <ButtonGroup variant="outline" spacing="6">
                    <Button variant="brand">Agregar a ruta</Button>
                </ButtonGroup>
            </Flex>
        </Card>
    );
}
