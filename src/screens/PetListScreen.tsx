import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../firebase/auth';
import { getUserPets } from '../firebase/auth';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

export default function PetListScreen({ navigation }: any) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const storedPets = await getUserPets(user.uid);
      setPets(storedPets);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  const getPetAge = (birthday: string) => {
    if (!birthday) return '0y';
    const birth = new Date(birthday);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years === 0) {
      return `${months}m`;
    }
    return `${years}y ${months > 0 ? months : 0}m`;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="paw" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('login')}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadPets} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myPets')}</Text>
        <Text style={styles.headerSubtitle}>{pets.length} {t('pets')}</Text>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="paw" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('noPets')}</Text>
          <Text style={styles.emptySubtitle}>{t('addFirstPet')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
            <Text style={styles.addButtonText}>{t('addPet')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.petList}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.petCard}
              onPress={() => navigation.navigate('PetDetail', { petId: pet.id, pet })}
              activeOpacity={0.7}
            >
              <View style={styles.petImageContainer}>
                {pet.photos && pet.photos.length > 0 ? (
                  <Image source={{ uri: pet.photos[0] }} style={styles.petImage} />
                ) : (
                  <View style={styles.petImagePlaceholder}>
                    <Ionicons name="paw" size={28} color={COLORS.primary} />
                  </View>
                )}
                {pet.lookingFor && (
                  <View style={styles.lookingBadge}>
                    <Ionicons name="heart" size={10} color={COLORS.textInverse} />
                  </View>
                )}
              </View>
              <View style={styles.petInfo}>
                <View style={styles.petNameRow}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <View style={[styles.genderBadge, pet.gender === 'female' && styles.genderBadgeFemale]}>
                    <Ionicons
                      name={pet.gender === 'male' ? 'male' : 'female'}
                      size={12}
                      color={pet.gender === 'male' ? COLORS.info : COLORS.error}
                    />
                  </View>
                </View>
                <Text style={styles.petBreed}>{pet.breed}</Text>
                <View style={styles.petTags}>
                  <View style={styles.ageTag}>
                    <Ionicons name="calendar" size={10} color={COLORS.primary} />
                    <Text style={styles.ageTagText}>{getPetAge(pet.birthday)}</Text>
                  </View>
                  {pet.personality && pet.personality.slice(0, 2).map((trait, index) => (
                    <View key={index} style={styles.traitTag}>
                      <Text style={styles.traitTagText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
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
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  petList: {
    paddingHorizontal: SPACING.lg,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  petImageContainer: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  petImage: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primaryLight + '30',
  },
  petImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lookingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  petInfo: {
    flex: 1,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  genderBadge: {
    marginLeft: SPACING.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.info + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBadgeFemale: {
    backgroundColor: COLORS.error + '20',
  },
  petBreed: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  petTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  ageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  ageTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  traitTag: {
    backgroundColor: COLORS.accentLight + '30',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  traitTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHT.medium,
  },
});
