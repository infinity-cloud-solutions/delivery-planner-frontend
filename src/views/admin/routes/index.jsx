import { Box, Grid } from "@chakra-ui/react";

import RouteStop from "views/admin/routes/components/RouteStop";
import RouteStopInitial from "views/admin/routes/components/RouteStopInitial";

import React from "react";

export default function Overview() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Main Fields */}
      <Grid
      >
        {/* <Banner
          gridArea='1 / 1 / 2 / 2'
          banner={banner}
          avatar={avatar}
          name='Adela Parkson'
          job='Product Designer'
          posts='17'
          followers='9.7k'
          following='274'
        /> */}
        {/* <Storage
          gridArea={{ base: "2 / 1 / 3 / 2", lg: "1 / 2 / 2 / 3" }}
          used={25.6}
          total={50}
        /> */}
        <RouteStopInitial
          gridArea='1 / 1 / 1 / 1'
          minH={{ base: "auto", lg: "420px", "2xl": "365px" }}
          pe='20px'
          pb={{ base: "25px", lg: "20px" }}
          mx="auto" // Add this line to center horizontally
          maxW={{ base: "sm", lg: "2xl", "2xl": "2xl" }}
        />
      </Grid>
      <Grid
      >
        {/* <Banner
          gridArea='1 / 1 / 2 / 2'
          banner={banner}
          avatar={avatar}
          name='Adela Parkson'
          job='Product Designer'
          posts='17'
          followers='9.7k'
          following='274'
        /> */}
        {/* <Storage
          gridArea={{ base: "2 / 1 / 3 / 2", lg: "1 / 2 / 2 / 3" }}
          used={25.6}
          total={50}
        /> */}
        <RouteStop
          gridArea='1 / 1 / 1 / 1'
          minH={{ base: "auto", lg: "420px", "2xl": "365px" }}
          pe='20px'
          pb={{ base: "100px", lg: "20px" }}
        />
      </Grid>

    </Box>
  );
}
