import { useEffect, useState } from 'react';
import { Alert, ScrollView, View, Text, TouchableNativeFeedback, Dimensions, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { updateDoc, collection, query, where, getDocs, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, storage, database } from '../config/firebase';
import { Colors } from '../constants/Colors';

const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get('window');

export default function ProfileEdit({ navigation }) {

    const [name, setName] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const loadUserData = async () => {

            try {
                const user = auth.currentUser;

                if (user) {
                    await setName(user.displayName);
                    await setPhoto(user.photoURL);
                };
            } catch (error) {
                Alert.alert('Error', 'Error al cargar sus datos');
            } finally {
                setLoading(false);
            }
        };
        loadUserData();

    }, []);

    const updateProfileInfo = async () => {
        setUpdateLoading(true);
        const user = auth.currentUser;
        const userDocRef = doc(database, 'users', user.uid);
        let photoURL = photo;
        try {
            if (photo && photo !== user.photoURL) {
                const storageRef = ref(storage, `profiles/${user.uid}/${user.uid}.jpg`);
                const img = await fetch(photo);
                const bytes = await img.blob();
                await uploadBytes(storageRef, bytes);
                photoURL = await getDownloadURL(storageRef);
            }


            await updateProfile(user, {
                displayName: name,
                photoURL: photoURL,
            });

            await updateDoc(userDocRef, {
                name: name,
                photoURL: photoURL,
            });

            const usersSnapshot = await getDocs(collection(database, "users"));

            for (const userDoc of usersSnapshot.docs) {
                const userContactsRef = collection(database, `users/${userDoc.id}/contacts`);
                const contactsQuery = query(userContactsRef, where("uid", "==", user.uid));
                const contactsSnapshot = await getDocs(contactsQuery);

                for (const contactDoc of contactsSnapshot.docs) {
                    const contactDocRef = doc(database, `users/${userDoc.id}/contacts/${contactDoc.id}`);
                    await updateDoc(contactDocRef, { name: name, photoURL: photoURL });
                }
            }

            Alert.alert("Éxito", "Perfil actualizado correctamente.");
        } catch (error) {
            Alert.alert("Error", error.message);
        }

        setUpdateLoading(false);
    };

    const pickImage = async () => {
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
                    <View style={styles.profileContainer}>
                        <View style={styles.textContainer}>
                            <Text style={styles.subtitle}>Editar tu perfil</Text>
                            <Text style={styles.paragraph}>Puedes cambiar tu foto y tu nombre de usuario</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <View style={styles.photoInputContainer}>
                                <View style={styles.photoContainer}>
                                    {loading ? (
                                        <ActivityIndicator size="large" color={Colors.light.detail} />
                                    ) : photo ? (
                                        <Image source={{ uri: photo }} style={styles.image} />
                                    ) : (
                                        <Image source={require("../assets/user.png")} style={styles.image} />
                                    )}
                                </View>
                                <TouchableOpacity style={styles.photoSelectButton} onPress={pickImage}>
                                    <FontAwesome6 name="circle-plus" size={36} color={Colors.light.detail} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                placeholder='Nombre de usuario'
                                keyboardType='default'
                                textContentType='givenName'
                                autoCapitalize='words'
                                autoFocus={false}
                                style={styles.input}
                                maxLength={20}
                                selectionColor={Colors.light.message}
                                value={name}
                                onChangeText={newText => setName(newText)}
                            ></TextInput>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        {updateLoading ? <ActivityIndicator size={'small'} color='#FFF'></ActivityIndicator>
                            : <TouchableNativeFeedback
                                background={TouchableNativeFeedback.Ripple('rgba(120,120,120, 0.6)', true, MAX_WIDTH - 60)}
                                onPress={updateProfileInfo}>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={styles.buttonText}>Guardar</Text>
                                </View>
                            </TouchableNativeFeedback>}
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
    profileContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.light.detail,
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
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    photoInputContainer: {
    },
    photoContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: "100%",
        margin: 15,
        overflow: 'hidden',
    },
    photoSelectButton: {
        position: 'absolute',
        bottom: 22,
        right: 22,
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
        width: 200,
        height: 200,
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