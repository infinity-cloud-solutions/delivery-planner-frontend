import React from "react";

// Chakra imports
import {
  Icon,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import {
  MdOutlineMoreHoriz
} from "react-icons/md";

import { format, addDays } from "date-fns";
import es from "date-fns/locale/es";
import { useHistory } from "react-router-dom";

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const generateDateOptions = () => {
  const today = new Date();
  const dateOptions = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(today, i);
    const formattedDate = format(currentDate, "d 'de' MMMM", { locale: es });
    const capitalizedDate = capitalizeFirstLetter(formattedDate.split(" ")[2]); // Capitalize the month
    const finalDate = `${formattedDate.split(" ")[0]} de ${capitalizedDate}`;

    const dateObject = {
      label: finalDate,
      value: format(currentDate, "yyyy-MM-dd"),
    };

    dateOptions.push(dateObject);
  }

  return dateOptions;
};

export default function Banner(props) {
  const { onDateSelect, ...rest } = props;
  const history = useHistory();

  const handleDateSelect = (date) => {
    onDateSelect(date);
    history.push(`/admin/orders?date=${date.value}`);
    onClose1();
  };

  const textColor = useColorModeValue("secondaryGray.500", "white");
  const textHover = useColorModeValue(
    { color: "secondaryGray.900", bg: "unset" },
    { color: "secondaryGray.500", bg: "unset" }
  );
  const iconColor = useColorModeValue("brand.500", "white");
  const bgList = useColorModeValue("white", "whiteAlpha.100");
  const bgShadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
    "unset"
  );
  const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bgHover = useColorModeValue(
    { bg: "secondaryGray.400" },
    { bg: "whiteAlpha.50" }
  );
  const bgFocus = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.100" }
  );

  // Ellipsis modals
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();

  const dateOptions = generateDateOptions();

  return (
    <Menu isOpen={isOpen1} onClose={onClose1}>
      <MenuButton
        align='center'
        justifyContent='center'
        bg={bgButton}
        _hover={bgHover}
        _focus={bgFocus}
        _active={bgFocus}
        w='37px'
        h='37px'
        lineHeight='100%'
        onClick={onOpen1}
        borderRadius='10px'
        {...rest}>
        <Icon as={MdOutlineMoreHoriz} color={iconColor} w='24px' h='24px' />
      </MenuButton>
      <MenuList
        w='150px'
        minW='unset'
        maxW='150px !important'
        border='transparent'
        backdropFilter='blur(63px)'
        bg={bgList}
        boxShadow={bgShadow}
        borderRadius='20px'
        p='15px'>
        {dateOptions.map((date, index) => (
          <MenuItem
            key={index}
            transition='0.2s linear'
            color={textColor}
            _hover={textHover}
            p='0px'
            borderRadius='8px'
            _active={{
              bg: "transparent",
            }}
            _focus={{
              bg: "transparent",
            }}
            mb='10px'
            onClick={() => handleDateSelect(date)}>
            <Flex align='center'>
              <Text fontSize='sm' fontWeight='400'>
                {date.label}
              </Text>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
