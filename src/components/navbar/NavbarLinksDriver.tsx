// Chakra Imports
import {
	Avatar,
	Flex,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	useColorModeValue
} from '@chakra-ui/react';

import { useNavigate } from "react-router-dom";

import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React from 'react';

import routes from 'driverRoutes';
import { getFullNameFromLocalStorage, logout } from 'security'

export default function DriverHeaderLinks(props) {
	const { secondary } = props;
	// Chakra Color Mode
	let menuBg = useColorModeValue('white', 'navy.800');
	const textColor = useColorModeValue('secondaryGray.900', 'white');

	const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');

	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);

	const navigate = useNavigate();
	const handleLogout = () => {
		logout()
		navigate('/auth');
	};

	const firstName = getFullNameFromLocalStorage().split(' ');

	return (
		<Flex
			w={{ sm: '100%', md: 'auto' }}
			justifyContent={{ base: 'space-between', md: 'center' }}
			alignItems="center"
			flexDirection="row"
			bg={menuBg}
			flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
			p="10px"
			borderRadius="30px"
			boxShadow={shadow}>

			<Flex>
			<SidebarResponsive routes={routes} />

			</Flex>

			<Flex alignItems="center">

			<Menu>
				<MenuButton p="0px">
					<Avatar
						_hover={{ cursor: 'pointer' }}
						color="white"
						name={getFullNameFromLocalStorage()}
						bg="#11047A"
						size="sm"
						w="40px"
						h="40px"
					/>
				</MenuButton>
				<MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
					<Flex w="100%" mb="0px">
						<Text
							ps="20px"
							pt="16px"
							pb="10px"
							w="100%"
							borderBottom="1px solid"
							borderColor={borderColor}
							fontSize="sm"
							fontWeight="700"
							color={textColor}>
							👋&nbsp; Hola, {firstName}
						</Text>
					</Flex>
					<Flex flexDirection="column" p="10px">
						<MenuItem
							_hover={{ bg: 'none' }}
							_focus={{ bg: 'none' }}
							color="red.400"
							borderRadius="8px"
							px="14px"
							onClick={handleLogout}>
							<Text fontSize="sm">Cerrar sesión</Text>
						</MenuItem>
					</Flex>
				</MenuList>
			</Menu>
			</Flex>

		</Flex>
	);
}

DriverHeaderLinks.propTypes = {
	variant: PropTypes.string,
	fixed: PropTypes.bool,
	secondary: PropTypes.bool,
	onOpen: PropTypes.func
};
