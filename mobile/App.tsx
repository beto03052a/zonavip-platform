import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    flex: 1,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <View style={styles.container}>
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
              ZonaVIP
            </Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Benefit Plans Platform
            </Text>
            <Text style={[styles.info, { color: isDarkMode ? '#999' : '#888' }]}>
              Welcome to ZonaVIP Mobile App
            </Text>
            <Text style={[styles.info, { color: isDarkMode ? '#999' : '#888' }]}>
              This is the foundation for the mobile application.
            </Text>
            <Text style={[styles.info, { color: isDarkMode ? '#999' : '#888' }]}>
              Implement navigation, screens, and features here.
            </Text>
          </View>
        </SafeAreaView>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default App;
