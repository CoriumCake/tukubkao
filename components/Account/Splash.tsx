import { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import { router } from "expo-router";
import { useFonts } from "expo-font";

export default function Splash() {

    const [fontsLoaded] = useFonts({
        'YsabeauOffice': require('../../assets/fonts/YsabeauOffice-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null; 
    }

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/images/splash-pic.png')} style={{ width: 300, height: 300, alignSelf: 'center', marginTop: 100 }} />
            
            <Text style={{ ...styles.title, fontFamily: 'YsabeauOffice'}}>TuKubKao</Text>

            <PrimaryButton text="Log in" onClick={() => router.push('/(auth)/login')} />
            <PrimaryButton text="Sign up" onClick={() => router.push('/(auth)/signup')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F2E6',
        padding: 16,
    },
    title: {
        fontSize: 50,   
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 50,
        color: '#000000',
        fontFamily: 'YsabeauOffice',
      },
    subtitle: {
        fontSize: 20,   
        textAlign: 'center',
        marginTop: 0,
        color: '#000000',
      },
});
