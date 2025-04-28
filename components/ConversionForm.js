import { useEffect, useState, useCallback } from 'react';
import { getCurrencyCodes, converter } from '../services/api';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Pressable, ActivityIndicator  } from 'react-native';
import { useConnection } from '../context/ConnectionContext';

export const ConversionForm = () => {
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCurrencies, setFilteredCurrencies] = useState([]);
    const [baseCurrency, setBaseCurrency] = useState(null);
    const [targetCurrency, setTargetCurrency] = useState(null);

    const [amount, setAmount] = useState(1); 
    const [convertedAmount, setConvertedAmount] = useState(null); 

    const [isSelectingBase, setIsSelectingBase] = useState(false);
    const [isSelectingTarget, setIsSelectingTarget] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const db = useConnection();

    // Fetch currency codes
    useEffect(() => {
        const fetchCurrencyCodes = async () => {
            try {
                const codes = await getCurrencyCodes();
                setCurrencyCodes(codes.data);
                setFilteredCurrencies(codes.data);
            } catch (error) {
                console.error('Error fetching currency codes:', error);
            }
        };

        fetchCurrencyCodes();
    }, []);

    // Filter currencies based on search query
    useEffect(() => {
        const filtered = Object.entries(currencyCodes).filter(([code, name]) =>
            code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredCurrencies(Object.fromEntries(filtered));
    }, [searchQuery, currencyCodes]);

    // Handle currency selection
    const handleCurrencySelect = useCallback((code, isBase) => {
        if (isBase) {
            setBaseCurrency(code);
            setIsSelectingBase(false);
        } else {
            setTargetCurrency(code);
            setIsSelectingTarget(false);
        }
        setSearchQuery(''); 
    }, []);

    // Handle conversion
    const handleConversion = useCallback(async () => {
        if (baseCurrency && targetCurrency && amount) {
            setIsLoading(true);
            try {
                // Check if the conversion already exists in the database
                const result = await db.getFirstAsync(
                    `SELECT rate FROM conversions WHERE base = ? AND target = ?`,
                    [baseCurrency, targetCurrency]
                );
    
                let exchangeRate;
                if (result) {
                    // If found in database use the cached result
                    exchangeRate = result.rate;
                    console.log('Used cached result:', exchangeRate);
                } else {
                    // If not found, fetch from API
                    const apiResult = await converter(baseCurrency, targetCurrency);
                    exchangeRate = apiResult;
                    await storeData(baseCurrency, targetCurrency, apiResult);
                    console.log('Fetched from API and stored:', exchangeRate);
                }

                // Convert the amount
                const convertedValue = (parseFloat(amount) * exchangeRate).toFixed(2);
                setConvertedAmount(convertedValue);
                alert(`Conversion result: ${convertedValue}`);
            } catch (error) {
                console.error('Error during conversion:', error);
                alert('Conversion failed. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            alert('Please select both base and target currencies and enter an amount.');
        }
    }, [baseCurrency, targetCurrency, amount, db, storeData]);

    // Function to check if a currency code is selected
    const isSelected = (code) => code === baseCurrency || code === targetCurrency;

    // Store selected currencies in SQLite database
    const storeData = useCallback(async (base, target, rate) => {
        if (!db || !base || !target || !rate) return;
    
        try {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS conversions (
                    id INTEGER PRIMARY KEY,
                    base TEXT,
                    target TEXT,
                    rate REAL,
                    created_at INTEGER
                )
            `);
            
            const createdAt = Date.now(); 
            
            await db.runAsync(
                `INSERT OR REPLACE INTO conversions (base, target, rate, created_at)
                VALUES (?, ?, ?, ?)`,
                [base, target, rate, createdAt]
            );
    
            console.log('Data stored successfully in SQLite:', { base, target, rate });
        } catch (e) {
            console.error('Error storing data in SQLite:', e);
        }
    }, [db]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Currency Converter</Text>

            {/* Base Currency Section */}
            <Text style={styles.label}>Base Currency:</Text>
            <TouchableOpacity
                style={styles.selectionBox}
                onPress={() => setIsSelectingBase(true)}
            >
                <Text style={styles.selectionText}>
                    {baseCurrency ? baseCurrency : 'Select Base Currency'}
                </Text>
            </TouchableOpacity>
            {isSelectingBase && (
                <View>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search currencies..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <ScrollView style={styles.scrollView}>
                        {Object.entries(filteredCurrencies).map(([code, name]) => (
                            <TouchableOpacity
                                key={code}
                                style={[
                                    styles.item,
                                    isSelected(code) ? { backgroundColor: '#e0f7fa' } : null, // Highlight selected
                                ]}
                                onPress={() => handleCurrencySelect(code, true)}
                            >
                                <Text style={styles.code}>{code}</Text>
                                <Text style={styles.name}>{name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Target Currency Section */}
            <Text style={styles.label}>Target Currency:</Text>
            <TouchableOpacity
                style={styles.selectionBox}
                onPress={() => setIsSelectingTarget(true)}
            >
                <Text style={styles.selectionText}>
                    {targetCurrency ? targetCurrency : 'Select Target Currency'}
                </Text>
            </TouchableOpacity>
            {isSelectingTarget && (
                <View>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search currencies..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <ScrollView style={styles.scrollView}>
                        {Object.entries(filteredCurrencies).map(([code, name]) => (
                            <TouchableOpacity
                                key={code}
                                style={[
                                    styles.item,
                                    isSelected(code) ? { backgroundColor: '#e0f7fa' } : null, // Highlight selected
                                ]}
                                onPress={() => handleCurrencySelect(code, false)}
                            >
                                <Text style={styles.code}>{code}</Text>
                                <Text style={styles.name}>{name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Enter Amount Section */}
            <Text style={styles.label}>Amount:</Text>
            <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="Enter amount to convert"
                value={amount}
                onChangeText={setAmount}
            />

            {/* Display Selected Currencies */}
            <Text style={styles.result}>
                Base: {baseCurrency || 'None'}, Target: {targetCurrency || 'None'}
            </Text>

            {/* Convert Button */}
            <Pressable
                onPress={handleConversion}
                style={styles.convertButton}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" /> // show spinner inside button
                ) : (
                    <Text style={styles.buttonText}>Convert</Text>
                )}
            </Pressable>

            {/* Display Converted Amount */}
            {convertedAmount && (
                <Text style={styles.convertedAmount}>
                    Converted Amount: {convertedAmount}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
    },
    selectionBox: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 8,
        justifyContent: 'center',
        marginBottom: 10,
    },
    selectionText: {
        fontSize: 16,
        color: '#555',
    },
    searchBar: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 8,
        marginBottom: 10,
    },
    scrollView: {
        maxHeight: '42%',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
    },
    code: {
        fontWeight: 'bold',
    },
    name: {
        color: '#555',
    },
    result: {
        fontSize: 16,
        marginTop: 20,
        color: '#333',
    },
    amountInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    convertButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    convertedAmount: {
        fontSize: 18,
        marginTop: 20,
        color: '#333',
    },
});

export default ConversionForm;
