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
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../firebase/auth';
import { getUserPets } from '../firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

const ACTION_CARDS: { key: string; icon: string; gradient: string[]; screen: string; translationKey: string }[] = [
  { key: 'dating', icon: 'heart', gradient: ['#FF8A65', '#FF6B6B'], screen: 'Dating', translationKey: 'datingAction' },
  { key: 'expenses', icon: 'wallet', gradient: ['#F5B041', '#E07B5A'], screen: 'Expenses', translationKey: 'expensesAction' },
  { key: 'memories', icon: 'calendar', gradient: ['#A8D8B9', '#81C784'], screen: 'Memories', translationKey: 'memoriesAction' },
  { key: 'addPet', icon: 'add-circle', gradient: ['#E07B5A', '#C45A3A'], screen: 'AddPet', translationKey: 'addPetAction' },
];

export default function HomeScreen({ navigation }: any) {
  const { user, userProfile } = useAuth();
  const { t } = useI18n();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPets = useCallback(async () => {
    if (!user) {
      setPets([]);
      return;
    }
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

  const calculateAge = (birthday: string) => {
    if (!birthday) return '0y';
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadPets} tintColor={COLORS.primary} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
            <Text style={styles.welcomeSubtitle}>{userProfile?.nickname || t('welcomeSubtitle')}</Text>
          </View>
          {user && (
            <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-circle" size={44} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="paw" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{pets.length} {t('pets')}</Text>
          </View>
          {user && (
            <View style={styles.statPill}>
              <Ionicons name="heart" size={14} color={COLORS.accent} />
              <Text style={styles.statText}>{pets.filter(p => p.lookingFor).length} {t('lookingOn')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>{t('pets')}</Text>
        <View style={styles.actionsGrid}>
          {ACTION_CARDS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[styles.actionCard, { backgroundColor: action.gradient[0] }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={styles.actionIconBg}>
                <Ionicons name={action.icon as any} size={24} color="#FFF" />
              </View>
              <Text style={styles.actionText}>{t(action.translationKey as any)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* My Pets Section */}
      <View style={styles.petsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('myPets')}</Text>
          {pets.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('PetList')}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {pets.length === 0 ? (
          <TouchableOpacity style={styles.emptyPetCard} onPress={() => navigation.navigate('AddPet')}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="paw" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyPetTitle}>{t('addFirstPet')}</Text>
            <Text style={styles.emptyPetSubtitle}>{t('addPetSubtitle')}</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
            {pets.slice(0, 4).map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { petId: pet.id, pet })}
              >
                <View style={styles.petImageContainer}>
                  <Image
                    source={{ uri: pet.photos?.[0] || pet.avatar || 'https://via.placeholder.com/100' }}
                    style={styles.petImage}
                  />
                  {pet.lookingFor && (
                    <View style={styles.lookingForBadge}>
                      <Ionicons name="heart" size={10} color="#FFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Quick Stats */}
      {pets.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.statsLabel}>{t('age')}</Text>
            <Text style={styles.statsValue}>{calculateAge(pets[0]?.birthday || '')}</Text>
          </View>
          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <Ionicons name={pets[0]?.gender === 'male' ? 'male' : 'female'} size={18} color={COLORS.accent} />
            </View>
            <Text style={styles.statsLabel}>{t('gender')}</Text>
            <Text style={styles.statsValue}>{t(pets[0]?.gender || 'male')}</Text>
          </View>
          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="star" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.statsLabel}>{t('personality')}</Text>
            <Text style={styles.statsValue}>{pets[0]?.personality?.[0] || '-'}</Text>
          </View>
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
  welcomeSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  avatarButton: {
    padding: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  actionsSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    color: '#FFF',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  petsSection: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  petScroll: {
    marginTop: SPACING.sm,
  },
  petCard: {
    marginRight: SPACING.lg,
    alignItems: 'center',
    width: 110,
  },
  petImageContainer: {
    position: 'relative',
  },
  petImage: {
    width: 88,
    height: 88,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.divider,
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lookingForBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  petName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  petBreed: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyPetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyPetTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  emptyPetSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statsLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statsValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
});
