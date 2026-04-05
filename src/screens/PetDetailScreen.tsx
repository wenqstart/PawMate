import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../theme';
import { Pet } from '../firebase/auth';
import { deletePet as firebaseDeletePet, updatePet as firebaseUpdatePet } from '../firebase/auth';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

interface PetDetailScreenProps {
  route: any;
  navigation: any;
}

export default function PetDetailScreen({ route, navigation }: PetDetailScreenProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { pet } = route.params as { petId?: string; pet?: Pet };
  const [currentPet, setCurrentPet] = useState<Pet | null>(pet || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDelete = () => {
    if (!currentPet || !user) return;

    Alert.alert(t('delete') || 'Delete', t('confirm') + '?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await firebaseDeletePet(user.uid, currentPet.id);
            navigation.goBack();
          } catch (error) {
            console.error('Error deleting pet:', error);
            Alert.alert(t('error') || 'Error', 'Failed to delete pet');
          }
        },
      },
    ]);
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return '0y';
    const birth = new Date(birthday);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (years === 0) {
      return `${months}mo`;
    }
    return `${years}y ${months > 0 ? months : 0}mo`;
  };

  if (!currentPet) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('noPets')}</Text>
      </View>
    );
  }

  const photos = currentPet.photos && currentPet.photos.length > 0
    ? currentPet.photos
    : currentPet.avatar ? [currentPet.avatar]
    : ['https://via.placeholder.com/300'];

  return (
    <ScrollView style={styles.container}>
      {/* Pet Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: photos[0] }} style={styles.petImage} />
        <View style={styles.imageOverlay}>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="pencil" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pet Info */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{currentPet.name}</Text>
          <View style={[styles.genderBadge, currentPet.gender === 'female' && styles.genderBadgeFemale]}>
            <Ionicons
              name={currentPet.gender === 'male' ? 'male' : 'female'}
              size={16}
              color={currentPet.gender === 'male' ? '#5C7A99' : '#8B3A3A'}
            />
          </View>
        </View>

        <Text style={styles.petBreed}>{currentPet.breed}</Text>
        <Text style={styles.petAge}>{t('age')}: {calculateAge(currentPet.birthday)}</Text>

        {/* Personality Tags */}
        {currentPet.personality && currentPet.personality.length > 0 && (
          <View style={styles.tagsContainer}>
            {currentPet.personality.map((trait, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{trait}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bio */}
      {currentPet.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          <Text style={styles.bioText}>{currentPet.bio}</Text>
        </View>
      )}

      {/* Looking For */}
      {currentPet.lookingFor && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lookingFor')}</Text>
          <Text style={styles.lookingForText}>{currentPet.lookingFor}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={styles.deleteButtonText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  infoSection: {
    padding: SPACING.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  petName: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  genderBadge: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBadgeFemale: {
    backgroundColor: '#FDE8E8',
  },
  petBreed: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  petAge: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  section: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  lookingForText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    lineHeight: 22,
  },
  actionsSection: {
    padding: SPACING.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: SPACING.sm,
  },
  deleteButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    fontWeight: FONT_WEIGHT.medium,
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});