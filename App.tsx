import { StatusBar } from 'expo-status-bar';
import Main from './screens/Main';
import { AuthenticatedUserProvider } from './screens/Navigation';

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <StatusBar animated={true} hidden={false} backgroundColor='#FFFFFF'></StatusBar>
      <Main></Main>
    </AuthenticatedUserProvider>

  );
}