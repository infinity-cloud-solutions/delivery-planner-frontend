import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdHome,
  MdOutlineReceiptLong,
  MdOutlineRoute,
  MdOutlineShoppingCart,
  MdLock
} from "react-icons/md";
import { FaHandshake } from "react-icons/fa6";

// Admin Imports
import MainDashboard from "views/admin/dashboard";
import Product from "views/admin/products";
import Client from "views/admin/clients";
import Deliveries from "views/driver/deliveries";
import Orders from "views/admin/orders";

// Auth Imports
import SignInCentered from "views/auth/signIn";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: MainDashboard,
  },
  {
    name: "Productos",
    layout: "/admin",
    path: "/products",
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: Product,
    secondary: true,
  },
  {
    name: "Clientes",
    layout: "/admin",
    path: "/clients",
    icon: (
      <Icon
        as={FaHandshake}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: Client,
    secondary: true,
  },
  {
    name: "Órdenes",
    layout: "/admin",
    icon: <Icon as={MdOutlineReceiptLong} width='20px' height='20px' color='inherit' />,
    path: "/orders",
    component: Orders,
  }
];

export default routes;
