import { StyleSheet, Text, View, TouchableNativeFeedback, ScrollView, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Dimensions } from "react-native";

import WhatsAppLogin from '../assets/Whatsapp-login-svg';
import { Colors } from '../constants/Colors';


const { width, height } = Dimensions.get('window');

export default function Welcome({ navigation }) {

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <ScrollView>
                    <View style={styles.loginContainer}>
                        <View style={styles.imageContainer}>
                            <WhatsAppLogin />
                        </View>
                        <View style={styles.detailsContainer}>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>Te damos la bienvenida a la aplicación</Text>
                                <Text style={styles.paragraph}>Este es un ejemplo práctico sobre la Arquitectura de WhatsApp. Toca Aceptar y Continuar para registrarte en la aplicación</Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableNativeFeedback
                                    background={TouchableNativeFeedback.Ripple('rgba(120,120,120, 0.6)', true, width - 60)}
                                    onPress={() => navigation.navigate("Register")}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={styles.buttonText}>Aceptar y Continuar</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView >
        </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
    loginContainer: {
        height: height,
        backgroundColor: "#FFF"
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {
        flex: 1,
        gap: 30,
        margin: 20,
        marginTop: 0,
    },
    buttonContainer: {
        width: width - 60,
        backgroundColor: Colors.light.button,
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
        overflow: 'hidden'
    },
    title: {
        textAlign: 'center',
        fontSize: 40,
        fontFamily: 'Roboto',
        fontWeight: 800
    },
    paragraph: {
        textAlign: 'center',
        fontSize: 17,
    },
    buttonText: {
        color: "#FFF",
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'Roboto',
    },
});