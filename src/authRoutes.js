import React from "react";

import { Icon } from "@chakra-ui/react";
import {
    MdLock
} from "react-icons/md";


// Auth Imports
import SignInCentered from "views/auth/signIn";

const authRoutes = [

    {
        name: "Iniciar sesión",
        layout: "/auth",
        path: "/sign-in",
        icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
        component: SignInCentered,
    },
];

export default authRoutes;
