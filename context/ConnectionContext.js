import * as SQLite from 'expo-sqlite';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ConnectionContext = createContext();

export const useConnection = () => useContext(ConnectionContext);

export const DBContext = ({children}) => {
    const [db, setDb] = useState(null);

    useEffect(() => {
        const connectDB = async () => {
            const database = await SQLite.openDatabaseAsync('productsDB');
            setDb(database);
        }

        connectDB();
    }, []);

    if (!db) {
        return <></>; 
    }

    return (
        <ConnectionContext.Provider value={db}>
            {children}
        </ConnectionContext.Provider>
    );
};