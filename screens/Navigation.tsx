import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import Welcome from './Welcome';
import Register from './Register';
import ProfileEdit from './ProfileEdit';
import Home from './Home';
import SearchAddContacts from './SearchAddContacts';
import Chat from './Chat';
import { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native'
import { Colors } from '../constants/Colors';


const Stack = createNativeStackNavigator();
const AuthenticatedUserContext = createContext({});
export const AuthenticatedUserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    return (
        <AuthenticatedUserContext.Provider value={{ user, setUser }}>
            {children}
        </AuthenticatedUserContext.Provider>
    )
}

function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='Home'
                component={Home}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='SearchAddContacts'
                component={SearchAddContacts}
                options={{
                    headerTitle: 'Buscar Contactos',
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen
                name='ProfileEdit'
                component={ProfileEdit}
                options={{
                    headerTitle: 'Perfil',
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen
                name='Chat'
                component={Chat}
                options={{
                    headerShown: false,
                    headerShadowVisible: false,
                }}
            />
        </Stack.Navigator>
    )
}

function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='Welcome'
                component={Welcome}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='Register'
                component={Register}
                options={{
                    headerTitle: 'Registro',
                }}
            />
        </Stack.Navigator>
    )
}

export default function Navigation() {

    const { user, setUser } = useContext(AuthenticatedUserContext)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth,
            async authenticatedUser => {
                authenticatedUser ? setUser(authenticatedUser) : setUser(null);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} color={Colors.light.detail}></ActivityIndicator>
            </View>
        )
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    )
};