import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from './src/theme';
import { Language, t as _t, addLanguageListener, setLanguage, getLanguage } from './src/i18n';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import DatingScreen from './src/screens/DatingScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import MemoriesScreen from './src/screens/MemoriesScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import AddPetScreen from './src/screens/AddPetScreen';
import PetDetailScreen from './src/screens/PetDetailScreen';
import PetListScreen from './src/screens/PetListScreen';
import PhoneAuthScreen from './src/screens/PhoneAuthScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function useLanguage(): Language {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    console.log('useLanguage: subscribing');
    const unsubscribe = addLanguageListener(() => {
      console.log('useLanguage: language changed');
      forceUpdate(n => n + 1);
    });
    return unsubscribe;
  }, []);

  return getLanguage();
}

function toggleLanguage() {
  const currentLang = getLanguage();
  const next = currentLang === 'en' ? 'zh' : 'en';
  setLanguage(next);
}

// Custom Header
function CustomHeader() {
  const navigation = useNavigation();
  const lang = useLanguage();
  const { user, userProfile } = useAuth();

  return (
    <View style={styles.customHeader}>
      <ExpoStatusBar style="dark" />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Ionicons name="paw" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>PawMate</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Community')}
            style={styles.headerButton}
          >
            <Ionicons name="people" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            console.log('Language button pressed');
            toggleLanguage();
          }} style={styles.langButton}>
            <Text style={styles.langButtonText}>{lang === 'en' ? 'EN' : '中'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function MainTabs() {
  useLanguage();
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Dating') iconName = focused ? 'heart' : 'heart-outline';
            else if (route.name === 'Expenses') iconName = focused ? 'wallet' : 'wallet-outline';
            else if (route.name === 'Memories') iconName = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Matches') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopColor: COLORS.border,
            paddingBottom: 5,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: _t('home') }} />
        <Tab.Screen name="Dating" component={DatingScreen} options={{ tabBarLabel: _t('dating') }} />
        <Tab.Screen name="Matches" component={MatchesScreen} options={{ tabBarLabel: _t('matches') || 'Matches' }} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ tabBarLabel: _t('expenses') }} />
        <Tab.Screen name="Memories" component={MemoriesScreen} options={{ tabBarLabel: _t('memories') }} />
      </Tab.Navigator>
    </View>
  );
}

function AuthStack() {
  const handleLoginSuccess = (userId: string) => {
    console.log('Login success:', userId);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhoneAuth">
        {() => <PhoneAuthScreen onLoginSuccess={handleLoginSuccess} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ title: _t('community'), headerBackTitle: _t('cancel') }} />
      <Stack.Screen name="AddPet" component={AddPetScreen} options={({ route }) => ({ title: (route.params as any)?.isEdit ? _t('editPet') : _t('addPet') })} />
      <Stack.Screen name="PetDetail" component={PetDetailScreen} options={{ title: _t('petInfo') }} />
      <Stack.Screen name="PetList" component={PetListScreen} options={{ title: _t('myPets') }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: _t('chat') || 'Chat' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  useLanguage();

  return (
    <>
      <ExpoStatusBar style="dark" />
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerTitle: { fontSize: 22, fontWeight: '600', color: COLORS.text },
  headerButton: { padding: 8 },
  langButton: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  langButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.textInverse },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});