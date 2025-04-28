import ScreenLayout from "../layout/ScreenLayout";
import { Text, FlatList, View, StyleSheet, Button, Alert } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useConnection } from "../context/ConnectionContext";
import { useFocusEffect } from "@react-navigation/native";
import { HistoryBookItem } from "./HistoryBookItem";

export const HistoryBook = ({ navigation }) => {
    const db = useConnection();
    const [history, setHistory] = useState([]);

    // Fetch Cached Data
    const fetchCachedData = useCallback(async () => {
        if (!db) return;

        try {
            const result = await db.getAllAsync(`SELECT * FROM conversions`);
            if (result.length > 0) {
                setHistory(result);
            }
        } catch (error) {
            console.error("Error fetching cached data:", error);
        }
    }, [db]);

    // Cleanup Old Data
    const cleanupOldData = useCallback(async () => {
        if (!db) return;
        if (!history || history.length === 0) return;
        
        try {
            const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;  // 2 days in milliseconds

            await db.runAsync(
                `DELETE FROM conversions WHERE created_at < ?`,
                [twoDaysAgo]
            );

            console.log('Old conversion data deleted successfully');
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }, [db]);

    // Delete All Records
    const deleteAllRecords = async () => {
        if (!db) return;

        try {
            // Confirm with the user before deleting everything
            Alert.alert(
                "Delete All Records",
                "Are you sure you want to delete all conversion history?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "OK", onPress: async () => {
                        await db.runAsync(`DELETE FROM conversions`);
                        setHistory([]); // Clear the local state
                        console.log('All conversion data deleted successfully');
                    } }
                ]
            );
        } catch (error) {
            console.error('Error deleting all records:', error);
        }
    };

    // Fetch data and cleanup on screen focus
    useFocusEffect(
        useCallback(() => {
            cleanupOldData();
            fetchCachedData();
        }, [fetchCachedData, cleanupOldData])
    );

    const renderItem = ({ item }) => (
        <HistoryBookItem item={item} />
    );

    return (
        <ScreenLayout>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginVertical: 10 }}>Conversion Book</Text>
            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No history available</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
            
            {/* Button to delete all records */}
            <View style={styles.buttonContainer}>
                <Button title="Delete All Records" onPress={deleteAllRecords} color="red" />
            </View>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: "#aaa",
    },
    buttonContainer: {
        marginVertical: 20,
        paddingHorizontal: 16,
    },
});
