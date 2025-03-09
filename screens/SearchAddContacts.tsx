import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TouchableNativeFeedback, TextInput, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { Image } from 'expo-image';
import { algoliasearch } from 'algoliasearch';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Colors } from '../constants/Colors';
import Constants from 'expo-constants'

const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get('window');
export default function SearchAddContacts() {

    const [contacts, setContacts] = useState([]);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAddLoading, setIsAddLoading] = useState(false);
    const [alreadyContact, setAlreadyContact] = useState(false);
    const [areResults, setAreResults] = useState(false);

    useEffect(() => {
        setLoading(true);
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const contactsRef = collection(database, `users/${userId}/contacts`);
        const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
            const loadedContacts = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
            setContacts(loadedContacts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSearchUsers = async () => {
        const userId = auth.currentUser?.uid;
        const client = algoliasearch(Constants.expoConfig?.extra?.algolia_app_id, Constants.expoConfig?.extra?.algolia_api_id);
        if (!userId || !searchName) return;


        try {
            const response = await client.searchSingleIndex({
                indexName: Constants.expoConfig?.extra?.algolia_index,
                searchParams: {
                    query: searchName
                }
            });
            const users = response.hits;
            setSearchedUsers(users);

            const exists = contacts.some(contact => users.some(user => user.uid === contact.uid));
            setAlreadyContact(exists);
            setAreResults(true);
        } catch (error) {
            setAreResults(false);
        }
    };

    const addContact = async (contact) => {

        try {
            setIsAddLoading(true);

            const userId = auth.currentUser?.uid;
            if (!userId) {
                Alert.alert('error', "No autentificado")
                return;
            }

            const contactRef = doc(database, `users/${userId}/contacts`, contact.uid);

            await setDoc(contactRef, {
                uid: contact.uid,
                email: contact.email,
                name: contact.name,
                photoURL: contact.photoURL || '',
                lastMessage: '',
                lastMessageTimestamp: null,
            });

            // También actualizar la colección de contactos del receptor (el otro usuario)
            const reverseContactRef = doc(database, `users/${contact.uid}/contacts`, userId);
            await setDoc(reverseContactRef, {
                uid: userId,
                email: auth.currentUser.email,
                name: auth.currentUser.displayName || 'Unknown', // Nombre del usuario actual
                photoURL: auth.currentUser.photoURL || '',
                lastMessage: '',
                lastMessageTimestamp: null,
            });

            setIsAddLoading(false);
            setAlreadyContact(true);
        } catch (error) {
            Alert.alert('error', error.message);
        }
    };

    return (

        <SafeAreaProvider>
            <SafeAreaView>
                <View style={styles.modalContainer}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="search" size={24} color="black" />
                        <TextInput
                            placeholder="Nombre"
                            keyboardType='default'
                            textContentType='givenName'
                            autoCapitalize='none'
                            maxLength={35}
                            selectionColor={Colors.light.message}
                            onChangeText={newText => setSearchName(newText)}
                            onSubmitEditing={() => handleSearchUsers()}
                            value={searchName}
                            returnKeyType='search'
                            enablesReturnKeyAutomatically={true}
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.searchResultContainer}>
                        {searchedUsers.length && !areResults ? <Text style={styles.paragraph}>Contactos en la aplicación</Text> : <></>}
                        {areResults ? <Text style={styles.paragraph}>Sin resultados</Text> : <></>}
                        {searchedUsers.map((user) => {
                            if (user.uid === auth.currentUser.uid) return;
                            return (
                                <View style={styles.chatCard} key={`${user.uid}.chatCard`}>
                                    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(Colors.light.tint, true)} key={`${user.uid}.touchable`}>
                                        <View style={styles.chatCardContent} key={`${user.uid}.chatCardContent`}>
                                            <View style={styles.chatImageContainer} key={`${user.uid}.chatImageContainer`}>
                                                {user.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.chatImage} key={`${user.uid}.chatImage`} /> : <FontAwesome5 name="user-alt" size={24} color="#FFF" key={`${user.uid}.chatImage`} />}
                                            </View>
                                            <View style={styles.chatUser} key={`${user.uid}.chatUser`}>
                                                <Text style={styles.chatUserName} key={`${user.uid}.chatUserName`}>{user.name}</Text>
                                                <Text style={styles.chatUserMessage} key={`${user.uid}.chatUserMessage`}>{user.email}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => {
                                                if (alreadyContact) {
                                                    Alert.alert('Información', 'Ya tienes agregado a este usuario')
                                                } else { addContact(user); }
                                            }}
                                                style={styles.buttonAddContact}
                                                key={`${user.uid}.chatUserMessage`}>
                                                {!alreadyContact ? (
                                                    !isAddLoading ? (
                                                        <MaterialIcons name="person-add" size={24} color="#FFF" key={`${user.uid}.person-addIcon`} />) : (<ActivityIndicator size={'small'} color='#FFF'></ActivityIndicator>)) :
                                                    (
                                                        <MaterialIcons name="check" size={24} color="#FFF" key={`${user.uid}.checkIcon`} />
                                                    )}
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )
                        })}
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        height: MAX_HEIGHT,
        backgroundColor: '#FFF',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.light.detail,
    },
    inputContainer: {
        width: MAX_WIDTH - 24,
        height: 40,
        backgroundColor: '#f2f2f2',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginVertical: 15,
    },
    searchResultContainer: {
        gap: 15,
        marginTop: 15,
    },
    paragraph: {
        textAlign: 'left',
        fontWeight: 'bold',
        fontSize: 17,
        marginLeft: 15,
    },
    input: {
        height: 40,
        color: Colors.light.subtext,
        textAlign: "left",
        textAlignVertical: 'center',
        fontSize: 17,
        backgroundColor: '#f2f2f2',
    },
    chatCard: {
        backgroundColor: "#FFF",
        overflow: 'hidden',
    },
    chatCardContent: {
        width: MAX_WIDTH,
        height: 75,
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 20,
        overflow: 'hidden',
    },
    chatImageContainer: {
        width: 55,
        height: 55,
        backgroundColor: '#c6c6c6',
        borderRadius: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    chatImage: {
        width: 55,
        height: 55,
    },
    chatUser: {
        flex: 1,
        flexDirection: 'column',
        gap: 10,
    },
    chatUserName: {
        textAlign: 'left',
        fontSize: 16,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: Colors.light.text
    },
    chatUserMessage: {
        textAlign: 'left',
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: 'light',
        color: Colors.light.subtext
    },
    buttonAddContact: {
        width: 36,
        height: 36,
        backgroundColor: Colors.light.detail,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '100%',
    },
});