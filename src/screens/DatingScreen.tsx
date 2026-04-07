import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../firebase/auth';
import { getAllPets, getUserPets, likePet } from '../firebase/auth';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import PhotoCarousel from '../components/PhotoCarousel';
import LikeModal from '../components/LikeModal';

const { width, height } = Dimensions.get('window');

const GREETING_MESSAGES = [
  'Hello! Want to connect?',
  'My pet would love to meet yours',
  'Seems like a great match',
  'Your pet is adorable',
  'Would love to connect',
];

export default function DatingScreen({ navigation }: any) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [datingPets, setDatingPets] = useState<Pet[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user])
  );

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const pets = await getUserPets(user.uid);
      setMyPets(pets);
      const allPets = await getAllPets(user.uid);
      setDatingPets(allPets);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const currentPet = datingPets[currentIndex];

  const handleLike = () => {
    if (!currentPet || !user) return;

    if (myPets.length === 0) {
      Alert.alert(t('info') || 'Info', t('pleaseAddPetFirst'), [
        { text: t('addPet'), onPress: () => navigation.navigate('AddPet') },
        { text: t('cancel'), style: 'cancel' },
      ]);
      return;
    }

    if (myPets.length === 1) {
      handleSendLike(myPets[0], GREETING_MESSAGES[0]);
    } else {
      setSelectedPet(currentPet);
      setShowLikeModal(true);
    }
  };

  const handleSendLike = async (sourcePet: Pet, message: string) => {
    if (!currentPet || !user) return;

    setLoading(true);
    try {
      const result = await likePet(user.uid, sourcePet.id, currentPet.id, message);

      if (result.matched) {
        Alert.alert(t('success') || 'Success', `You matched with ${currentPet.name}!`, [
          { text: t('continueText'), onPress: () => {} }
        ]);
      } else {
        Alert.alert(t('likeSent') || 'Like sent', `Like sent to ${currentPet.name}'s owner`);
      }
      nextPet();
    } catch (error) {
      console.error('Error sending like:', error);
      Alert.alert(t('error') || 'Error', 'Failed to send like');
    }
    setLoading(false);
    setShowLikeModal(false);
  };

  const handlePass = () => {
    nextPet();
  };

  const nextPet = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentIndex < datingPets.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        Alert.alert(t('noMorePets') || 'Done', t('checkLater') || 'Check back later');
      }
    });
  };

  const calculateAge = (birthday: string) => {
    const birth = new Date(birthday);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    return `${years}y`;
  };

  const cardTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  const cardOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="heart-outline" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>{t('login') || 'Please login first'}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!currentPet) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="heart-outline" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>{t('noMorePets')}</Text>
        <Text style={styles.emptySubtitle}>{t('checkLater')}</Text>
      </View>
    );
  }

  const photos = currentPet.photos && currentPet.photos.length > 0
    ? currentPet.photos
    : [currentPet.avatar];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('datingAction')}</Text>
        <Text style={styles.headerSubtitle}>{t('findCompanion')}</Text>
      </View>

      {/* Dating Card */}
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardScrollContent}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX: cardTranslateX }],
              opacity: cardOpacity,
            },
          ]}
        >
          <View style={styles.card}>
            <PhotoCarousel photos={photos} style={styles.carousel} />

            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {datingPets.length}
              </Text>
            </View>

            <View style={styles.infoOverlay}>
              <View style={styles.nameRow}>
                <Text style={styles.petNameLarge}>{currentPet.name}</Text>
                <View style={[
                  styles.genderBadge,
                  currentPet.gender === 'male' ? styles.genderMale : styles.genderFemale
                ]}>
                  <Ionicons
                    name={currentPet.gender === 'male' ? 'male' : 'female'}
                    size={14}
                    color={currentPet.gender === 'male' ? COLORS.info : COLORS.error}
                  />
                </View>
              </View>
              <Text style={styles.petDetails}>
                {currentPet.breed} · {calculateAge(currentPet.birthday)}
              </Text>
              <View style={styles.ownerRow}>
                <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.ownerText}>{t('owner')}: {currentPet.ownerName || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>{t('personality')}</Text>
              <View style={styles.tagsRow}>
                {(currentPet.personality || []).map((trait, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>{t('about')}</Text>
              <Text style={styles.bioText}>{currentPet.bio || ''}</Text>
            </View>

            {currentPet.lookingFor && (
              <View style={styles.lookingForBlock}>
                <View style={styles.lookingForHeader}>
                  <Ionicons name="heart" size={16} color={COLORS.accent} />
                  <Text style={styles.lookingForLabel}>{t('lookingFor')}</Text>
                </View>
                <Text style={styles.lookingForText}>{currentPet.lookingFor}</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <View style={styles.likeButtonInner}>
            <Ionicons name="heart" size={32} color={COLORS.textInverse} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle" size={28} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Ionicons name="paw" size={14} color={COLORS.primary} />
        <Text style={styles.tipsText}>
          {t('tapHeartToLike')}
        </Text>
      </View>

      <LikeModal
        visible={showLikeModal}
        targetPet={selectedPet}
        myPets={myPets}
        onClose={() => setShowLikeModal(false)}
        onConfirm={handleSendLike}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: SPACING.md,
  },
  cardContainer: {
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  carousel: {
    height: height * 0.35,
  },
  counterBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  counterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  petNameLarge: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
  },
  genderBadge: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderMale: {
    backgroundColor: 'rgba(92, 122, 153, 0.4)',
  },
  genderFemale: {
    backgroundColor: 'rgba(212, 115, 107, 0.4)',
  },
  petDetails: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: SPACING.xs,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  ownerText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailsSection: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  detailBlock: {
    gap: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
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
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  lookingForBlock: {
    backgroundColor: COLORS.accentLight + '30',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
  },
  lookingForHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  lookingForLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.accentDark,
  },
  lookingForText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  passButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  likeButton: {
    width: 72,
    height: 72,
  },
  likeButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  infoButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tipsText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
