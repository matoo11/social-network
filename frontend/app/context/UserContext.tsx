'use client';

import { createContext, useContext, useState } from 'react';

type User = {
    userName: string | null;
    nickName?: string | null;
    email?: string | null;
    profileImageID?: number | null;
};

type UserContextType = {
    user: User;
    setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>({
        userName: 'Guest',
        nickName: 'Guest',
        email: 'Not Logged In',
        profileImageID: 0,
    });

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used inside UserProvider');
    return ctx;
};
