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
import { getPets, savePets } from '../utils/storage';
import { mockPets } from '../data/mockData';
import { useFocusEffect } from '@react-navigation/native';
import { t, addLanguageListener } from '../i18n';

const ACTION_CARDS = [
  { key: 'dating', icon: 'heart', color: '#C4A484', screen: 'Dating' },
  { key: 'expenses', icon: 'wallet', color: '#5C7A99', screen: 'Expenses' },
  { key: 'memories', icon: 'calendar', color: '#4A7C59', screen: 'Memories' },
  { key: 'addPet', icon: 'add-circle', color: '#1A1A1A', screen: 'AddPet' },
];

export default function HomeScreen({ navigation }: any) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [, forceUpdate] = useState(0);

  // Re-render when language changes
  useEffect(() => {
    const unsubscribe = addLanguageListener(() => forceUpdate(n => n + 1));
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const loadPets = async () => {
    let storedPets = await getPets();
    if (storedPets.length === 0) {
      await savePets(mockPets);
      storedPets = mockPets;
    }
    setPets(storedPets);
  };

  const calculateAge = (birthday: string) => {
    const birth = new Date(birthday);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (years === 0) {
      return `${months}mo`;
    } else if (months < 0) {
      return `${years - 1}y ${12 + months}mo`;
    } else {
      return `${years}y ${months}mo`;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
        <Text style={styles.welcomeSubtitle}>{t('welcomeSubtitle')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="paw" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{pets.length} {t('pets')}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="heart-outline" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{t('pending')}</Text>
          </View>
        </View>
      </View>

      {/* My Pets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('myPets')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddPet')}>
            <View style={styles.addLink}>
              <Text style={styles.addLinkText}>{t('add')}</Text>
              <Ionicons name="add" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="paw" size={32} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyText}>{t('noPets')}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('AddPet')}
            >
              <Text style={styles.primaryButtonText}>{t('addFirstPet')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {pets.slice(0, 2).map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                activeOpacity={0.7}
              >
                <View style={styles.petAvatarContainer}>
                  <Image source={{ uri: pet.avatar }} style={styles.petAvatar} />
                </View>
                <View style={styles.petInfo}>
                  <View style={styles.petNameRow}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <View style={[
                      styles.genderBadge,
                      pet.gender === 'male' ? styles.genderMale : styles.genderFemale
                    ]}>
                      <Ionicons
                        name={pet.gender === 'male' ? 'male' : 'female'}
                        size={12}
                        color={pet.gender === 'male' ? '#5C7A99' : '#8B3A3A'}
                      />
                    </View>
                  </View>
                  <Text style={styles.petBreed}>
                    {pet.breed} · {calculateAge(pet.birthday)}
                  </Text>
                  <View style={styles.tagsRow}>
                    {pet.personality.slice(0, 3).map((trait, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{trait}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons name="heart-outline" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
            {pets.length > 2 && (
              <TouchableOpacity style={styles.showMoreButton} onPress={() => navigation.navigate('PetList')}>
                <Text style={styles.showMoreText}>{t('viewAll')} ({pets.length - 2})</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Quick Actions - Horizontal 2x2 Grid */}
      <View style={styles.section}>
        <View style={styles.actionsGrid}>
          {ACTION_CARDS.map((card) => (
            <TouchableOpacity
              key={card.key}
              style={styles.actionCard}
              onPress={() => navigation.navigate(card.screen)}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: card.color }]}>
                <Ionicons name={card.icon as any} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionTitle}>
                {card.key === 'dating' && t('datingAction')}
                {card.key === 'expenses' && t('expensesAction')}
                {card.key === 'memories' && t('memoriesAction')}
                {card.key === 'addPet' && t('addPetAction')}
              </Text>
              <Text style={styles.actionSubtitle}>
                {card.key === 'dating' && t('datingSubtitle')}
                {card.key === 'expenses' && t('expensesSubtitle')}
                {card.key === 'memories' && t('memoriesSubtitle')}
                {card.key === 'addPet' && t('addPetSubtitle')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  welcomeSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  addLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addLinkText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  primaryButtonText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.sm,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  petAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  petAvatar: {
    width: 64,
    height: 64,
  },
  petInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  petName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  genderBadge: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderMale: {
    backgroundColor: 'rgba(92, 122, 153, 0.15)',
  },
  genderFemale: {
    backgroundColor: 'rgba(139, 58, 58, 0.15)',
  },
  petBreed: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  showMoreText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});