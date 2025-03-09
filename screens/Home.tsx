import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableNativeFeedback, StyleSheet, Dimensions, ActivityIndicator, TextInput } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { Colors } from '../constants/Colors';
const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get('window');

export default function Home({ navigation }) {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setLoading(true);
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const contactsRef = collection(database, `users/${userId}/contacts`);
        const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
            const loadedContacts = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
            const sortedContacts = loadedContacts.sort((a, b) => {
                const timestampA = a.lastMessageTimestamp ? a.lastMessageTimestamp.toDate() : new Date(0);
                const timestampB = b.lastMessageTimestamp ? b.lastMessageTimestamp.toDate() : new Date(0);
                return timestampB - timestampA;
            })
            setContacts(sortedContacts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);




    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View style={styles.homeHeader}>
                    <Text style={styles.title}>ChatApp</Text>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <View style={styles.buttonContacts}>
                            <TouchableNativeFeedback
                                background={TouchableNativeFeedback.Ripple('rgba(120,120,120, 0.6)', true)}
                                onPress={() => {
                                    navigation.navigate("SearchAddContacts")
                                }}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialIcons name="group-add" size={24} color={Colors.light.text} />
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableNativeFeedback
                                background={TouchableNativeFeedback.Ripple('rgba(120,120,120, 0.6)', true)}
                                onPress={() => {
                                    navigation.navigate("ProfileEdit")
                                }}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                </View>
                <ScrollView>
                    <View style={styles.homeContainer}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="search" size={24} color="black" />
                            <TextInput
                                placeholder="Buscar nombre"
                                keyboardType='default'
                                textContentType='givenName'
                                autoCapitalize='none'
                                maxLength={35}
                                selectionColor={Colors.light.message}
                                onChangeText={newText => setSearchTerm(newText)}
                                value={searchTerm}
                                returnKeyType='search'
                                enablesReturnKeyAutomatically={true}
                                style={styles.input}
                            />
                        </View>
                        {loading ?
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size={'large'} color={Colors.light.detail}></ActivityIndicator>
                            </View> :
                            <View style={styles.chatContainer}>

                                {filteredContacts.map((contact) => {
                                    return (
                                        <View style={styles.chatCard} key={`${contact.uid}.chatCard`}>
                                            <TouchableNativeFeedback
                                                background={TouchableNativeFeedback.Ripple(Colors.light.tint, true)}
                                                key={`${contact.uid}.touchable`}
                                                onPress={() => navigation.navigate("Chat", {
                                                    contactId: contact.uid,
                                                    contactName: contact.name,
                                                    contactPhotoURL: contact.photoURL

                                                })}
                                            >
                                                <View style={styles.chatCardContent} key={`${contact.uid}.chatCardContent`}>
                                                    <View style={styles.chatImageContainer} key={`${contact.uid}.chatImageContainer`}>
                                                        {contact.photoURL ? <Image source={{ uri: contact.photoURL }} style={styles.chatImage} key={`${contact.uid}.chatImage`} /> : <FontAwesome5 name="user-alt" size={24} color="#FFF" key={`${contact.uid}.chatImage`} />}
                                                    </View>
                                                    <View style={styles.chatUser} key={`${contact.uid}.chatUser`}>
                                                        <Text style={styles.chatUserName} key={`${contact.uid}.chatUserName`}>{contact.name}</Text>
                                                        <Text style={styles.chatUserMessage} key={`${contact.uid}.chatUserMessage`}>{contact.lastMessage}</Text>
                                                    </View>
                                                    {contact.lastMessageSenderId === auth.currentUser.uid ?
                                                        (contact.lastMessageRead ?
                                                            (<View style={styles.chatTimestampContainer}>
                                                                {contact.lastMessageTimestamp ? <Text key={`${contact.uid}.chatUserMessage`} style={styles.chatTimestamp}>
                                                                    {contact.lastMessageTimestamp
                                                                        .toDate()
                                                                        .toLocaleString('es-ES', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            hour12: false,
                                                                        })}
                                                                </Text> : <></>}
                                                                <MaterialCommunityIcons name="check-all" size={18} color={Colors.light.lightBlue} />
                                                            </View>) :
                                                            (<View style={styles.chatTimestampContainer}>
                                                                {contact.lastMessageTimestamp ? <Text key={`${contact.uid}.chatUserMessage`} style={styles.chatTimestamp}>
                                                                    {contact.lastMessageTimestamp
                                                                        .toDate()
                                                                        .toLocaleString('es-ES', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            hour12: false,
                                                                        })}
                                                                </Text> : <></>}
                                                                <MaterialCommunityIcons name="check-all" size={18} color={Colors.light.gray} />
                                                            </View>)) :
                                                        <View style={styles.chatTimestampContainer}>
                                                            {contact.lastMessageTimestamp ? <Text key={`${contact.uid}.chatUserMessage`} style={styles.chatTimestamp}>
                                                                {contact.lastMessageTimestamp
                                                                    .toDate()
                                                                    .toLocaleString('es-ES', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: false,
                                                                    })}
                                                            </Text> : <></>}
                                                        </View>
                                                    }
                                                </View>
                                            </TouchableNativeFeedback>
                                        </View>
                                    );
                                })}
                            </View>
                        }
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
    homeContainer: {
        height: MAX_HEIGHT,
        backgroundColor: "#FFF",
        flexDirection: 'column',
        alignItems: 'center',
    },
    homeHeader: {
        position: 'relative',
        height: 57,
        backgroundColor: "#FFF",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.detail,
        paddingHorizontal: 15
    },
    chatContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
    },
    title: {
        textAlign: 'center',
        fontSize: 32,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: Colors.light.detail
    },
    buttonContainer: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: "100%"
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
    button: {
        width: MAX_WIDTH - 60,
        backgroundColor: Colors.light.button,
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
        overflow: 'hidden'
    },
    buttonContacts: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '100%',
        overflow: 'hidden',
    },
    inputContainer: {
        width: MAX_WIDTH - 24,
        backgroundColor: '#f2f2f2',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginVertical: 15,
    },
    input: {
        height: 40,
        color: Colors.light.subtext,
        textAlign: "left",
        fontSize: 17,
        backgroundColor: '#f2f2f2',
    },
    chatTimestampContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    chatTimestamp: {
        width: 70,
        flexWrap: 'wrap',
        fontSize: 11,
        textAlign: 'center',
        color: '#a0a0a0'
    },
})