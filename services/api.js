import axios from "axios";

const CodesAPI = axios.create({
    baseURL: "https://openexchangerates.org/api/currencies.json",
})

export const getCurrencyCodes = () => CodesAPI.get();

const ExchangeAPI = axios.create({
    baseURL: "https://v6.exchangerate-api.com/v6/27a988cda4607a489a14244a",
})

export const converter = async (base, target) => {
    try {
        const response = await ExchangeAPI.get(`/pair/${base}/${target}`);
        const exchangeRate = response.data.conversion_rate;
        console.log(`Exchange rate from ${base} to ${target}: ${exchangeRate}`);
        return exchangeRate;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        throw error; 
    }
};
