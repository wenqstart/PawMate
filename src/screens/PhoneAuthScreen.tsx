import React, { useState, useEffect, useRef } from 'react';
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
import { sendVerificationCode, verifyCodeWithConfirmation, createUserProfile, ConfirmationResult } from '../firebase/auth';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { t } from '../i18n';

interface PhoneAuthScreenProps {
  onLoginSuccess: (userId: string) => void;
}

export default function PhoneAuthScreen({ onLoginSuccess }: PhoneAuthScreenProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!phone || phone.length < 11) {
      Alert.alert(t('error'), t('enterPhone'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Sending verification code to:', phone);
      const confirmation = await sendVerificationCode(phone);
      console.log('Confirmation received:', confirmation);
      setConfirmationResult(confirmation);
      setStep('code');
      Alert.alert('验证码已发送', '请查看手机短信');
    } catch (err: any) {
      console.error('Send code error:', err);
      const errorMessage = err?.message || err?.code || '发送失败';
      setError(errorMessage);
      Alert.alert(t('error'), '发送失败: ' + errorMessage);
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 6) {
      Alert.alert(t('error'), t('enterCode'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Verifying code:', code);
      if (confirmationResult) {
        const user = await verifyCodeWithConfirmation(confirmationResult, code);
        console.log('User logged in:', user?.uid);
        if (user) {
          setStep('profile');
        } else {
          onLoginSuccess(user.uid);
        }
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      const errorMessage = err?.message || err?.code || '验证失败';
      setError(errorMessage);
      Alert.alert(t('error'), '验证失败: ' + errorMessage);
    }
    setLoading(false);
  };

  const handleCompleteProfile = async () => {
    if (!nickname.trim()) {
      Alert.alert(t('error'), t('nickname') + ' ' + t('required'));
      return;
    }

    setLoading(true);
    try {
      const { getCurrentUser } = await import('../firebase/auth');
      const user = getCurrentUser();
      if (user) {
        await createUserProfile(user.uid, phone, nickname.trim(), '');
        onLoginSuccess(user.uid);
      }
    } catch (err: any) {
      console.error('Profile error:', err);
      Alert.alert(t('error'), err?.message || '保存失败');
    }
    setLoading(false);
  };

  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="phone-portrait-outline" size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{t('enterPhone')}</Text>
      <Text style={styles.subtitle}>{t('login')}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="13800000000"
          placeholderTextColor={COLORS.textTertiary}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={11}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textInverse} />
        ) : (
          <Text style={styles.buttonText}>{t('sendCode')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubble-ellipses-outline" size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{t('enterCode')}</Text>
      <Text style={styles.subtitle}>+86 {phone}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor={COLORS.textTertiary}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textInverse} />
        ) : (
          <Text style={styles.buttonText}>{t('verifyCode')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSendCode} style={styles.resendButton}>
        <Text style={styles.resendText}>{t('resendCode')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{t('completeProfile')}</Text>
      <Text style={styles.subtitle}>{t('nickname')}</Text>

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

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCompleteProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textInverse} />
        ) : (
          <Text style={styles.buttonText}>{t('continueText')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'phone' && renderPhoneStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'profile' && renderProfileStep()}
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
    marginBottom: SPACING.lg,
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  resendButton: {
    marginTop: SPACING.lg,
  },
  resendText: {
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