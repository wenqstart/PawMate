import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../firebase/auth';
import { deletePet as firebaseDeletePet } from '../firebase/auth';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

export default function PetDetailScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { pet } = route.params as { petId?: string; pet?: Pet };
  const [currentPet, setCurrentPet] = useState<Pet | null>(pet || null);

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
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="paw" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('noPets')}</Text>
        </View>
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('AddPet', { pet: currentPet, isEdit: true })}
          >
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
              color={currentPet.gender === 'male' ? COLORS.info : COLORS.error}
            />
          </View>
        </View>

        <Text style={styles.petBreed}>{currentPet.breed}</Text>
        <View style={styles.ageRow}>
          <Ionicons name="calendar" size={14} color={COLORS.primary} />
          <Text style={styles.petAge}>{t('age')}: {calculateAge(currentPet.birthday)}</Text>
        </View>

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
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{currentPet.bio}</Text>
          </View>
        </View>
      )}

      {/* Looking For */}
      {currentPet.lookingFor && (
        <View style={styles.section}>
          <View style={styles.lookingForHeader}>
            <Ionicons name="heart" size={18} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>{t('lookingFor')}</Text>
          </View>
          <View style={styles.lookingForCard}>
            <Text style={styles.lookingForText}>{currentPet.lookingFor}</Text>
          </View>
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
    height: 320,
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
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.info + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBadgeFemale: {
    backgroundColor: COLORS.error + '20',
  },
  petBreed: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  petAge: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '40',
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
  lookingForHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bioCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  lookingForCard: {
    backgroundColor: COLORS.accentLight + '25',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  lookingForText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.accentDark,
    lineHeight: 22,
    fontWeight: FONT_WEIGHT.medium,
  },
  actionsSection: {
    padding: SPACING.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    gap: SPACING.sm,
    backgroundColor: COLORS.error + '08',
  },
  deleteButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    fontWeight: FONT_WEIGHT.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
});
