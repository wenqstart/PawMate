import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../types';
import { getPets } from '../utils/storage';
import { t, addLanguageListener } from '../i18n';

export default function PetListScreen({ navigation }: any) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [, forceUpdate] = useState(0);

  // Re-render when language changes
  useEffect(() => {
    const unsubscribe = addLanguageListener(() => forceUpdate(n => n + 1));
    return unsubscribe;
  }, []);

  const loadPets = useCallback(async () => {
    const storedPets = await getPets();
    setPets(storedPets);
  }, []);

  React.useEffect(() => {
    loadPets();
  }, [loadPets]);

  const getPetAge = (birthday: string) => {
    const birth = new Date(birthday);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years === 0) {
      return `${months}m`;
    }
    return `${years}y ${months > 0 ? months : 0}m`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myPets')}</Text>
        <Text style={styles.headerSubtitle}>{pets.length} {t('pets')}</Text>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={60} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>{t('noPets')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Text style={styles.addButtonText}>{t('addFirstPet')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.petList}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.petCard}
              onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
              activeOpacity={0.7}
            >
              <View style={styles.petImageContainer}>
                {pet.avatar ? (
                  <Image source={{ uri: pet.avatar }} style={styles.petImage} />
                ) : (
                  <View style={styles.petImagePlaceholder}>
                    <Ionicons name="paw" size={30} color={COLORS.textTertiary} />
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
                      color={pet.gender === 'male' ? '#5C7A99' : '#8B3A3A'}
                    />
                  </View>
                </View>
                <Text style={styles.petBreed}>{pet.breed}</Text>
                <View style={styles.petTags}>
                  <View style={styles.ageTag}>
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
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
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
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  petList: {
    paddingHorizontal: SPACING.lg,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  petImageContainer: {
    marginRight: SPACING.md,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.md,
  },
  petImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  petName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  genderBadge: {
    marginLeft: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBadgeFemale: {
    backgroundColor: '#FDE8E8',
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
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  ageTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  traitTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  traitTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});