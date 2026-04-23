import React, { useState } from "react";
import Calendar from "react-calendar";
import es from 'date-fns/locale/es';
import "react-calendar/dist/Calendar.css";
import "assets/css/MiniCalendar.css";
import { Text, Icon } from "@chakra-ui/react";
// Chakra imports
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
// Custom components
import Card from "components/card/Card.js";

export default function MiniCalendar(props) {
  const { selectRange, ...rest } = props;
  const [value, onChange] = useState(new Date());
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  return (
    <Card
      align='center'
      direction='column'
      w='100%'
      maxW='max-content'
      p='20px 15px'
      h='max-content'
      {...rest}>
      <Calendar
        onChange={onChange}
        value={value}
        selectRange={selectRange}
        view={"month"}
        tileContent={<Text color='brand.500'></Text>}
        prevLabel={<Icon as={MdChevronLeft} w='24px' h='24px' mt='4px' />}
        nextLabel={<Icon as={MdChevronRight} w='24px' h='24px' mt='4px' />}
        locale={es}
        formatMonthYear={(locale, date) =>
          capitalizeFirstLetter(
            date.toLocaleDateString(locale, {
              month: 'long',
              year: 'numeric',
            })
          )
        }
        formatShortWeekday={(locale, date) =>
          capitalizeFirstLetter(
            date.toLocaleDateString(locale, {
              weekday: 'short',
            }).slice(0, 1)
          )
        }
      />
    </Card>
  );
}
