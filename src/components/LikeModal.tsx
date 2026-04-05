import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../theme';
import { Pet } from '../firebase/auth';
import { getUserPets } from '../firebase/auth';

// 预设打招呼消息
const GREETING_MESSAGES = [
  '你好呀！想认识一下',
  '我家{petName}想和你们家{petName}交个朋友',
  '看起来很有缘分哦～',
  '我家宝贝很喜欢你家的宝贝～',
  '可以认识一下吗？',
];

interface LikeModalProps {
  visible: boolean;
  targetPet: Pet | null;
  myPets: Pet[];
  onClose: () => void;
  onConfirm: (sourcePet: Pet, message: string) => void;
}

export default function LikeModal({
  visible,
  targetPet,
  myPets: propMyPets,
  onClose,
  onConfirm,
}: LikeModalProps) {
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (visible && propMyPets.length > 0) {
      setMyPets(propMyPets);
      setSelectedPet(propMyPets[0]);
      setSelectedMessage(GREETING_MESSAGES[0]);
    }
  }, [visible, propMyPets]);

  const getFormattedMessage = (template: string) => {
    if (!selectedPet) return template;
    return template.replace(/{petName}/g, selectedPet.name);
  };

  const handleConfirm = () => {
    const message = selectedMessage === 'custom' ? customMessage : getFormattedMessage(selectedMessage);
    if (selectedPet && message) {
      onConfirm(selectedPet, message);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedPet(null);
    setSelectedMessage('');
    setCustomMessage('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!targetPet) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.title}>喜欢TA</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 对方宠物信息 */}
            <View style={styles.targetPetSection}>
              <Text style={styles.sectionLabel}>你喜欢的宠物</Text>
              <View style={styles.petCard}>
                <Image source={{ uri: targetPet.avatar }} style={styles.petAvatar} />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{targetPet.name}</Text>
                  <Text style={styles.petBreed}>{targetPet.breed}</Text>
                </View>
              </View>
            </View>

            {/* 选择自家宠物 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                选择相亲的宠物 <Text style={styles.required}>*</Text>
              </Text>
              {myPets.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>还没有添加宠物</Text>
                  <Text style={styles.emptyHint}>请先添加宠物后再发起相亲</Text>
                </View>
              ) : (
                <View style={styles.petList}>
                  {myPets.map(pet => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.petOption,
                        selectedPet?.id === pet.id && styles.petOptionSelected,
                      ]}
                      onPress={() => setSelectedPet(pet)}
                    >
                      <Image source={{ uri: pet.avatar }} style={styles.petOptionAvatar} />
                      <View style={styles.petOptionInfo}>
                        <Text style={styles.petOptionName}>{pet.name}</Text>
                        <Text style={styles.petOptionBreed}>{pet.breed}</Text>
                      </View>
                      {selectedPet?.id === pet.id && (
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 选择打招呼消息 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>打招呼消息</Text>
              <View style={styles.messageList}>
                {GREETING_MESSAGES.map((msg, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.messageOption,
                      selectedMessage === msg && styles.messageOptionSelected,
                    ]}
                    onPress={() => setSelectedMessage(msg)}
                  >
                    <Text style={[
                      styles.messageText,
                      selectedMessage === msg && styles.messageTextSelected,
                    ]}>
                      {getFormattedMessage(msg)}
                    </Text>
                    {selectedMessage === msg && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.messageOption,
                    selectedMessage === 'custom' && styles.messageOptionSelected,
                  ]}
                  onPress={() => setSelectedMessage('custom')}
                >
                  <Text style={styles.customLabel}>自定义消息</Text>
                  {selectedMessage === 'custom' && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {selectedMessage === 'custom' && (
                <View style={styles.customInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="输入想说的话..."
                    value={customMessage}
                    onChangeText={setCustomMessage}
                    multiline
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedPet || (!selectedMessage && !customMessage)) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedPet || (!selectedMessage && !customMessage)}
            >
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>发送喜欢</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.lg,
  },
  targetPetSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E0',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.round,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  petBreed: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  emptyContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  emptyHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  petList: {
    gap: SPACING.sm,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: SPACING.md,
  },
  petOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE9DC',
  },
  petOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
  },
  petOptionInfo: {
    flex: 1,
  },
  petOptionName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  petOptionBreed: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  messageList: {
    gap: SPACING.sm,
  },
  messageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  messageOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE9DC',
  },
  messageText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  messageTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  customLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  customInput: {
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});