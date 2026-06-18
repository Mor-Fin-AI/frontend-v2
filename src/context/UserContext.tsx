"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  name: string;
  address: string;
  fullAddress?: string;
  role: string;
  isWalletConnected?: boolean;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  name: "",
  address: "Not connected",
  role: "",
  isWalletConnected: false,
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
