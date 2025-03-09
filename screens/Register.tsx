import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableNativeFeedback, Dimensions, Alert } from 'react-native'
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database, storage } from '../config/firebase';
import { Colors } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get('window');

export default function Register({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [photo, setPhoto] = useState(null);

    const uploadImageToStorage = async (userId) => {
        if (!photo) return '';

        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const storageRef = ref(storage, `profiles/${userId}/${userId}.jpg`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            Alert.alert('Error', 'No se pudo subir la imagen');
            return '';
        }
    };

    const saveUserData = async (userId, name, photoURL, email) => {
        try {
            const userDoc = doc(database, "users", userId); // Crea o apunta al documento del usuario
            await setDoc(userDoc, {
                uid: userId,
                email: email,
                name: name || "",
                photoURL: photoURL || "",
            });
            console.log("Datos guardados en Firestore");
        } catch (error) {
            console.error("Error al guardar datos en Firestore: ", error);
        }
    };

    const onHandleSignup = async () => {
        if (email !== "" && password !== "" && name !== "") {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                    .catch((err) => Alert.alert("Signup error", err.message))
                const user = userCredential.user;

                const photoURL = await uploadImageToStorage(user.uid);

                await updateProfile(user, {
                    displayName: name,
                    photoURL: photoURL,
                });

                await saveUserData(user.uid, name, photoURL, user.email);


                Alert.alert("Registro exitoso", "Tu cuenta ha sido creada.");

                await signInWithEmailAndPassword(auth, email, password)
                    .then(() => console.log("Login success"))
                    .catch((err) => Alert.alert("Login error", err.message))
            } catch (error) {
                Alert.alert("Error", error.message);
            }

        }

    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ backgroundColor: "#FFF" }}>
                <ScrollView style={{ height: '80%' }}>
                    <View style={styles.registerContainer}>
                        <View style={styles.textContainer}>
                            <Text style={styles.subtitle}>Ingresa tus credenciales</Text>
                            <Text style={styles.paragraph}>Los datos que brindes a continuación serán usados para la creación de tu cuenta en la plataforma. </Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <View style={styles.photoInputContainer}>
                                <View style={styles.photoContainer}>
                                    {photo ? <Image source={{ uri: photo }} style={styles.image} /> : <Image source={require("../assets/user.png")} style={styles.image} />}
                                </View>
                                <TouchableOpacity style={styles.photoSelectButton} onPress={pickImage}>
                                    <FontAwesome6 name="circle-plus" size={36} color={Colors.light.detail} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                placeholder='Nombre de usuario'
                                keyboardType='default'
                                textContentType='givenName'
                                autoCapitalize='none'
                                autoFocus={false}
                                style={styles.input}
                                maxLength={20}
                                selectionColor={Colors.light.message}
                                value={name}
                                onChangeText={newText => setName(newText)}
                            ></TextInput>
                            <TextInput
                                placeholder='Correo electrónico'
                                keyboardType='email-address'
                                textContentType='emailAddress'
                                autoCapitalize='none'
                                style={styles.input}
                                maxLength={35}
                                selectionColor={Colors.light.message}
                                value={email}
                                onChangeText={newText => setEmail(newText)}
                            ></TextInput>
                            <TextInput
                                placeholder='Contraseña'
                                secureTextEntry={true}
                                textContentType='password'
                                autoCorrect={false}
                                autoCapitalize='none'
                                style={styles.input}
                                maxLength={20}
                                selectionColor={Colors.light.message}
                                value={password}
                                onChangeText={newText => setPassword(newText)}
                            ></TextInput>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(120,120,120, 0.6)', true, MAX_WIDTH - 60)}
                            onPress={onHandleSignup}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={styles.buttonText}>Siguiente</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
    registerContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
    },
    textContainer: {
        flex: 1,
        gap: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 30,
    },
    inputContainer: {
        flex: 1,
        gap: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    photoInputContainer: {
    },
    photoContainer: {
        width: 200,
        height: 200,
        borderRadius: "100%",
        margin: 15,
        overflow: 'hidden',
    },
    photoSelectButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    buttonContainer: {
        height: '20%',
        backgroundColor: "#FFF",
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 30,
        fontFamily: 'Roboto',
        fontWeight: 800
    },
    paragraph: {
        textAlign: 'center',
        fontSize: 17,
    },
    image: {
        flex: 1,
    },
    input: {
        width: MAX_WIDTH - 150,
        height: 40,
        color: Colors.light.subtext,
        textAlign: "left",
        fontSize: 17,
        backgroundColor: "#fff",
        borderBottomWidth: 2,
        borderBottomColor: Colors.light.detail,
        borderRadius: 7,
    },
    button: {
        width: MAX_WIDTH - 60,
        backgroundColor: Colors.light.button,
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
        overflow: 'hidden'
    },
    buttonText: {
        color: "#FFF",
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'Roboto',
    },
})