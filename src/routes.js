import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdHome,
  MdOutlineReceiptLong,
  MdOutlineRoute,
  MdOutlineShoppingCart,
} from "react-icons/md";

// Admin Imports
import MainDashboard from "views/admin/default";
import Product from "views/admin/products";
import Routes from "views/admin/routes";
import OrdersTable from "views/admin/orders";

// Auth Imports
// import SignInCentered from "views/auth/signIn";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: MainDashboard,
  },
  {
    name: "Productos",
    layout: "/admin",
    path: "/productos",
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
    name: "Ordenes",
    layout: "/admin",
    icon: <Icon as={MdOutlineReceiptLong} width='20px' height='20px' color='inherit' />,
    path: "/data-tables",
    component: OrdersTable,
  },
  {
    name: "Rutas",
    layout: "/admin",
    path: "/routes",
    icon: <Icon as={MdOutlineRoute} width='20px' height='20px' color='inherit' />,
    component: Routes,
  }
];

export default routes;
