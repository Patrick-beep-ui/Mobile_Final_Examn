import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScreenLayout from '../../layout/ScreenLayout';
import {Text, StyleSheet, View} from 'react-native';
import { getCurrencyCodes } from '../../services/api';
import { useEffect, useState } from 'react';
import { ConversionForm } from '../../components/ConversionForm';

const Converter = () => {
    return (
        <>
        <ScreenLayout>
            <ConversionForm/>
        </ScreenLayout>
        </>
    );
}

const {Navigator, Screen} = createNativeStackNavigator();

function ConverterStack() {
    return (
        <Navigator screenOptions={{headerShown: false}}>
            <Screen name="Converter" component={Converter} />
        </Navigator>
    );
}

export default ConverterStack;