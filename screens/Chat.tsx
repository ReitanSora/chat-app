import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { View, Text, FlatList, StyleSheet, TextInput, Dimensions, TouchableNativeFeedback, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { addDoc, collection, query, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, writeBatch, where, getDocs } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { auth, database } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { AppContext } from '../context/AppContext';

const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get('window');

export default function Chat({ route, navigation }) {

    const { contactId, contactName, contactPhotoURL } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef(null);
    const [chatLoading, setChatLoading] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    let userId = '';
    let chatId = '';



    useEffect(() => {
        setChatLoading(true);
        userId = auth.currentUser.uid;
        chatId = [userId, contactId].sort().join('_');

        const messagesRef = collection(database, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate()
                        .toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        }) || '',
                }
            });
            setMessages(loadedMessages);
            setChatLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
        const batch = writeBatch(database);
        const markAsRead = async () => {
            const userContactRef = doc(database, `users/${userId}/contacts`, contactId);
            const contactContactRef = doc(database, `users/${contactId}/contacts`, userId);

            await Promise.all([
                updateDoc(contactContactRef, { lastMessageRead: true }),
                updateDoc(userContactRef, { lastMessageRead: true })
            ]);

        };

        viewableItems.forEach((item) => {
            if (!item.item.read && item.item.senderId !== userId) {
                const messageRef = doc(database, 'chats', chatId, 'messages', item.item.id);
                batch.update(messageRef, { read: true });
                markAsRead();
            };

        });

        batch.commit().catch((error) => {
            console.error('Error marcando mensajes como leídos:', error);
        });



    }, [chatId, userId]);

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50, // Se considera visible si al menos el 50% del mensaje está en pantalla
    };

    const sendMessage = async () => {

        if (!newMessage.trim()) return;
        setSendingMessage(true);

        userId = auth.currentUser.uid;
        chatId = [userId, contactId].sort().join('_');

        try {

            const messagesRef = collection(database, 'chats', chatId, 'messages');
            const messagePromise = addDoc(messagesRef, {
                senderId: userId,
                receiverId: contactId,
                text: newMessage.trim(),
                timestamp: serverTimestamp(),
                read: false
            });

            const contactRef = doc(database, `users/${contactId}/contacts`, userId);
            const updateContactPromise = updateDoc(contactRef, {
                lastMessage: newMessage.trim(),
                lastMessageTimestamp: serverTimestamp(),
                lastMessageRead: false,
                lastMessageSenderId: userId
            });

            const userRef = doc(database, `users/${userId}/contacts`, contactId);
            const updateUserPromise = updateDoc(userRef, {
                lastMessage: newMessage.trim(),
                lastMessageTimestamp: serverTimestamp(),
                lastMessageRead: false,
                lastMessageSenderId: userId,
            });

            setNewMessage('');

            await Promise.all([messagePromise, updateContactPromise, updateUserPromise]);

            setSendingMessage(false);

        } catch (error) {
            Alert.alert('Error enviando mensaje:', error.message);
            setSendingMessage(false);
        }

    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerBackContainer}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(120,120,120, 0.2)', true)}
                            onPress={() => navigation.navigate("Home")}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <MaterialIcons name="arrow-back" size={24} color="black" />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                    <View style={styles.headerContactDetail}>
                        <View style={styles.headerContactImageContainer}>
                            {contactPhotoURL ? <Image source={{ uri: contactPhotoURL }} style={styles.headerContactImage}></Image> : <FontAwesome5 name="user-alt" size={16} color="#FFF" />}
                        </View>
                        <Text style={styles.headerContactName}>{contactName}</Text>
                    </View>
                </View>
                {chatLoading ?
                    <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={Colors.light.detail} />
                    </View> :
                    <FlatList
                        ref={flatListRef} // Asignar la referencia al FlatList
                        data={messages}
                        keyExtractor={(message) => message.id}
                        renderItem={({ item }) => {
                            userId = auth.currentUser.uid;
                            return (
                                <View key={`${item.id}.messageElement`} style={[styles.messageElement, item.senderId === userId ? styles.messageElementSent : styles.messageElementReceived]}>
                                    <Text key={`${item.id}.messageText`} style={styles.messageText}>{item.text}</Text>
                                    {item.senderId === userId ?
                                        (item.read ?
                                            (<View style={styles.messageTimeAndCheckContainer}>
                                                <Text key={`${item.id}.messageTime`} style={styles.messageTimeAndCheck}>{item.timestamp}</Text>
                                                <MaterialCommunityIcons name="check-all" size={18} color={Colors.light.lightBlue} />
                                            </View>) :
                                            (<View style={styles.messageTimeAndCheckContainer}>
                                                <Text key={`${item.id}.messageTime`} style={styles.messageTimeAndCheck}>{item.timestamp}</Text>
                                                <MaterialCommunityIcons name="check-all" size={18} color={Colors.light.gray} />
                                            </View>)) :
                                        <Text key={`${item.id}.messageTime`} style={styles.messageTime}>{item.timestamp}</Text>
                                    }
                                </View>
                            )
                        }}
                        style={{ flexGrow: 1 }}
                        contentContainerStyle={styles.messageContainer}
                        inverted
                        initialNumToRender={15}
                        maxToRenderPerBatch={15}
                        removeClippedSubviews={true}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                    />}
                <KeyboardAvoidingView style={styles.inputContainer}>
                    <View style={styles.inputElementsContainer}>
                        <MaterialCommunityIcons name="keyboard-outline" size={24} color="black" />
                        <TextInput
                            placeholder='Mensaje'
                            keyboardType='default'
                            autoCapitalize='sentences'
                            autoFocus={false}
                            style={styles.input}
                            maxLength={240}
                            selectionColor={Colors.light.message}
                            onSubmitEditing={() => sendMessage()}
                            value={newMessage}
                            onChangeText={newText => setNewMessage(newText)}
                        ></TextInput>
                        <MaterialCommunityIcons name="paperclip" size={24} color="black" />
                    </View>
                    <View style={styles.sendButton}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(120,120,120, 0.2)', true)}
                            onPress={() => { if (!sendingMessage) sendMessage(); }}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                {sendingMessage ? <ActivityIndicator size={'small'} color="#000" /> : <Ionicons name="send" size={18} color="black" />}
                            </View>
                        </TouchableNativeFeedback>

                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
    headerContainer: {
        width: MAX_WIDTH,
        height: 57,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.detail,
        paddingHorizontal: 6,
    },
    headerBackContainer: {
        width: 40,
        height: 40,
        borderRadius: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    headerContactDetail: {
        flex: 1,
        flexDirection: 'row',
        gap: 15,
        backgroundColor: '#FFF',
        alignContent: 'center',
        overflow: 'hidden',
    },
    headerContactImageContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#c6c6c6',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '100%',
        overflow: 'hidden',
    },
    headerContactImage: {
        width: 40,
        height: 40,
    },
    headerContactName: {
        fontSize: 17,
        fontWeight: 'bold',
        textAlignVertical: 'center',
    },
    messageContainer: {
        gap: 20,
        backgroundColor: '#F2F2F2',
        padding: 15,
    },
    messageElement: {
        flexDirection: 'row',
        width: MAX_WIDTH / 1.5,
        elevation: 1,
        borderRadius: 7,
        padding: 10,
        paddingBottom: 25,
    },
    messageElementSent: {
        backgroundColor: Colors.light.tint,
        alignSelf: 'flex-end'
    },
    messageElementReceived: {
        backgroundColor: '#FFF',
        alignSelf: 'flex-start'
    },
    messageText: {
        flex: 1,
        flexWrap: 'wrap',
        fontSize: 15,
    },
    messageTime: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        fontSize: 11,
        color: Colors.light.gray,
    },
    messageTimeAndCheckContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    messageTimeAndCheck: {
        fontSize: 11,
        color: Colors.light.gray,
    },
    inputContainer: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#F2F2F2',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    inputElementsContainer: {
        flex: 1,
        height: 40,
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 40,
        color: Colors.light.subtext,
        textAlign: "left",
        fontSize: 17,
        backgroundColor: "#fff",
    },
    sendButton: {
        width: 40,
        height: 40,
        backgroundColor: Colors.light.detail,
        borderRadius: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    }
})