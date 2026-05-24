import { createContext } from "react";

interface SidebarContextType {
  toggleSidebar: boolean;
  setToggleSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SidebarContext = createContext<SidebarContextType>({} as SidebarContextType);
export const DriverSidebarContext = createContext<SidebarContextType>({} as SidebarContextType);
