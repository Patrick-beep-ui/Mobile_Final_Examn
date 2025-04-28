import {Text, View, StyleSheet} from 'react-native';

export const HistoryBookItem = ({ item }) => {
    return (
        <View style={styles.card}>
                <Text style={styles.baseText}>{item.base} → {item.target}</Text>
                <Text style={styles.rateText}>Rate: {item.rate}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
    },
    baseText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    rateText: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
});