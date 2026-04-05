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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet, MatchRequest } from '../types';
import { mockDatingPets } from '../data/mockData';
import { getPets, addMatchRequest, isPetsMatched } from '../utils/storage';
import { t, addLanguageListener } from '../i18n';
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
  const [datingPets, setDatingPets] = useState<Pet[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [, forceUpdate] = useState(0);

  // Re-render when language changes
  useEffect(() => {
    const unsubscribe = addLanguageListener(() => forceUpdate(n => n + 1));
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    let pets = mockDatingPets;
    pets = pets.map(p => ({
      ...p,
      photos: p.photos || [p.avatar],
    }));
    setDatingPets(pets);

    const myPetsData = await getPets();
    setMyPets(myPetsData);
  };

  const currentPet = datingPets[currentIndex];

  const handleLike = () => {
    if (!currentPet) return;

    if (myPets.length === 0) {
      Alert.alert('Info', 'Please add a pet first', [
        { text: 'Add Pet', onPress: () => navigation.navigate('AddPet') },
        { text: 'Cancel', style: 'cancel' },
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
    if (!currentPet) return;

    const alreadyMatched = await isPetsMatched(sourcePet.id, currentPet.id);
    if (alreadyMatched) {
      Alert.alert('Info', 'Already matched!');
      return;
    }

    const matchRequest: MatchRequest = {
      id: Date.now().toString(),
      targetPet: currentPet,
      sourcePet: sourcePet,
      sourceMessage: message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await addMatchRequest(matchRequest);

    Alert.alert('Sent', `Like sent to ${currentPet.name}'s owner`);
    nextPet();
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
        Alert.alert('Done', 'You\'ve seen all pets');
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

  if (!currentPet) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="heart-outline" size={40} color={COLORS.textTertiary} />
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
                    color={currentPet.gender === 'male' ? '#5C7A99' : '#8B3A3A'}
                  />
                </View>
              </View>
              <Text style={styles.petDetails}>
                {currentPet.breed} · {calculateAge(currentPet.birthday)}
              </Text>
              <View style={styles.ownerRow}>
                <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.ownerText}>{t('owner')}: {currentPet.owner}</Text>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>{t('personality')}</Text>
              <View style={styles.tagsRow}>
                {currentPet.personality.map((trait, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>{t('about')}</Text>
              <Text style={styles.bioText}>{currentPet.bio}</Text>
            </View>

            <View style={styles.lookingForBlock}>
              <View style={styles.lookingForHeader}>
                <Ionicons name="heart" size={16} color={COLORS.accent} />
                <Text style={styles.lookingForLabel}>{t('lookingFor')}</Text>
              </View>
              <Text style={styles.lookingForText}>{currentPet.lookingFor}</Text>
            </View>
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
          <Ionicons name="information-circle" size={28} color={COLORS.info} />
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Ionicons name="bulb-outline" size={14} color={COLORS.textTertiary} />
        <Text style={styles.tipsText}>
          {t('tapHeartToLike')}
        </Text>
      </View>

      <LikeModal
        visible={showLikeModal}
        targetPet={selectedPet}
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
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
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
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textInverse,
  },
  genderBadge: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderMale: {
    backgroundColor: 'rgba(92, 122, 153, 0.3)',
  },
  genderFemale: {
    backgroundColor: 'rgba(139, 58, 58, 0.3)',
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
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  lookingForBlock: {
    backgroundColor: COLORS.divider,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  lookingForHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  lookingForLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    width: 72,
    height: 72,
  },
  likeButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});