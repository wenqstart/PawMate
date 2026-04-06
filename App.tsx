import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from './src/theme';
import { I18nProvider, useI18n } from './src/i18n';
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
import LikesScreen from './src/screens/LikesScreen';
import ChatScreen from './src/screens/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Header
function CustomHeader() {
  const navigation = useNavigation();
  const { language, setLanguage } = useI18n();
  const { user } = useAuth();

  const handleLogout = async () => {
    const { signOut } = await import('./src/firebase/auth');
    await signOut();
  };

  return (
    <View style={styles.customHeader}>
      <ExpoStatusBar style="dark" />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Ionicons name="paw" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>PawMate</Text>
        </View>
        <View style={styles.headerRight}>
          {user && (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.headerButton}
            >
              <Ionicons name="log-out-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Community')}
            style={styles.headerButton}
          >
            <Ionicons name="people" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            console.log('Language button pressed');
            setLanguage(language === 'en' ? 'zh' : 'en');
          }} style={styles.langButton}>
            <Text style={styles.langButtonText}>{language === 'en' ? 'EN' : '中'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function MainTabs() {
  const { t } = useI18n();
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
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
        <Tab.Screen name="Dating" component={DatingScreen} options={{ tabBarLabel: t('dating') }} />
        <Tab.Screen name="Matches" component={MatchesScreen} options={{ tabBarLabel: t('matches') || 'Matches' }} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ tabBarLabel: t('expenses') }} />
        <Tab.Screen name="Memories" component={MemoriesScreen} options={{ tabBarLabel: t('memories') }} />
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
  const { t } = useI18n();

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
      <Stack.Screen name="Community" component={CommunityScreen} options={{ title: t('community'), headerBackTitle: t('cancel') }} />
      <Stack.Screen name="AddPet" component={AddPetScreen} options={({ route }) => ({ title: (route.params as any)?.isEdit ? t('editPet') : t('addPet') })} />
      <Stack.Screen name="PetDetail" component={PetDetailScreen} options={{ title: t('petInfo') }} />
      <Stack.Screen name="PetList" component={PetListScreen} options={{ title: t('myPets') }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: t('chat') || 'Chat' }} />
      <Stack.Screen name="Likes" component={LikesScreen} options={{ title: t('receivedLikes') }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <ExpoStatusBar style="dark" />
      <I18nProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </I18nProvider>
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