import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmail, registerWithEmail, createUserProfile } from '../firebase/auth';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { t } from '../i18n';

interface PhoneAuthScreenProps {
  onLoginSuccess: (userId: string) => void;
}

export default function PhoneAuthScreen({ onLoginSuccess }: PhoneAuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'register' | 'profile'>('login');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('enterEmail') + ' / ' + t('enterPassword'));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t('error'), t('enterEmail'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await signInWithEmail(email, password);
      console.log('User logged in:', user?.uid);
      if (user) {
        onLoginSuccess(user.uid);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      if (err.code === 'auth/invalid-email') {
        Alert.alert(t('error'), t('enterEmail'));
      } else if (err.code === 'auth/user-not-found') {
        Alert.alert(t('error'), t('noAccount') + ' ' + t('signUp'));
      } else if (err.code === 'auth/wrong-password') {
        Alert.alert(t('error'), t('enterPassword'));
      } else {
        Alert.alert(t('error'), err.message || t('loginFailed'));
      }
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !nickname.trim()) {
      Alert.alert(t('error'), t('required'));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t('error'), t('enterEmail'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), t('enterPassword') + ' (min 6 chars)');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await registerWithEmail(email, password);
      console.log('User registered:', user?.uid);

      // Create user profile
      await createUserProfile(user.uid, email, nickname.trim(), '', '');
      onLoginSuccess(user.uid);
    } catch (err: any) {
      console.error('Register error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      if (err.code === 'auth/email-already-in-use') {
        Alert.alert(t('error'), 'Email already in use');
      } else if (err.code === 'auth/invalid-email') {
        Alert.alert(t('error'), t('enterEmail'));
      } else {
        Alert.alert(t('error'), err.message || t('loginFailed'));
      }
    }
    setLoading(false);
  };

  const renderLoginStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="mail-outline" size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{t('signIn')}</Text>
      <Text style={styles.subtitle}>{t('enterEmail')}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('enterEmail')}
          placeholderTextColor={COLORS.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('enterPassword')}
          placeholderTextColor={COLORS.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textInverse} />
        ) : (
          <Text style={styles.buttonText}>{t('signIn')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { setStep('register'); setError(''); }}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          {t('noAccount')} {t('signUp')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="person-add-outline" size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{t('signUp')}</Text>
      <Text style={styles.subtitle}>{t('completeProfile')}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('enterEmail')}
          placeholderTextColor={COLORS.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('enterPassword')}
          placeholderTextColor={COLORS.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={COLORS.textTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('nickname')}
          placeholderTextColor={COLORS.textTertiary}
          value={nickname}
          onChangeText={setNickname}
          maxLength={20}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textInverse} />
        ) : (
          <Text style={styles.buttonText}>{t('signUp')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { setStep('login'); setError(''); }}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          {t('haveAccount')} {t('signIn')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'login' && renderLoginStep()}
        {step === 'register' && renderRegisterStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  switchButton: {
    marginTop: SPACING.xl,
  },
  switchText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
});