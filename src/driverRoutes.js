import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdOutlineRoute,
} from "react-icons/md";

import Deliveries from "views/driver/deliveries";

const driverRoutes = [
  {
    name: "Repartos",
    layout: "/driver",
    path: "/deliveries",
    icon: <Icon as={MdOutlineRoute} width='20px' height='20px' color='inherit' />,
    component: Deliveries,
  }
];

export default driverRoutes;
