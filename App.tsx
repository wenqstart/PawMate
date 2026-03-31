import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/theme';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import DatingScreen from './src/screens/DatingScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import MemoriesScreen from './src/screens/MemoriesScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import AddPetScreen from './src/screens/AddPetScreen';
import PetDetailScreen from './src/screens/PetDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 自定义顶部导航栏
function CustomHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.customHeader}>
      <ExpoStatusBar style="dark" />
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>🐾 PawMate</Text>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Community')}
          style={styles.headerButton}
        >
          <Ionicons name="people" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Dating') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Expenses') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Memories') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            }

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
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: '首页' }}
        />
        <Tab.Screen
          name="Dating"
          component={DatingScreen}
          options={{ tabBarLabel: '相亲' }}
        />
        <Tab.Screen
          name="Expenses"
          component={ExpensesScreen}
          options={{ tabBarLabel: '记账' }}
        />
        <Tab.Screen
          name="Memories"
          component={MemoriesScreen}
          options={{ tabBarLabel: '纪念日' }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <>
      <ExpoStatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
            headerTintColor: COLORS.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false, headerTitle: '首页' }}
          />
          <Stack.Screen
            name="Community"
            component={CommunityScreen}
            options={{
              title: '宠物社区',
              headerBackTitle: '返回'
            }}
          />
          <Stack.Screen
            name="AddPet"
            component={AddPetScreen}
            options={({ route }) => ({
              title: (route.params as any)?.isEdit ? '编辑宠物' : '添加宠物'
            })}
          />
          <Stack.Screen
            name="PetDetail"
            component={PetDetailScreen}
            options={{ title: '宠物详情' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerButton: {
    padding: 8,
  },
});
