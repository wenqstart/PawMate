import React, { useState, useEffect, useCallback } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../theme';
import { Pet, MatchRequest } from '../types';
import { mockDatingPets } from '../data/mockData';
import { getPets, addMatchRequest, isPetsMatched, getMatches } from '../utils/storage';
import PhotoCarousel from '../components/PhotoCarousel';
import LikeModal from '../components/LikeModal';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.md * 2;

// 打招呼消息模板
const GREETING_MESSAGES = [
  '你好呀！想认识一下',
  '我家{petName}想和你们家{petName}交个朋友',
  '看起来很有缘分哦～',
  '我家宝贝很喜欢你家的宝贝～',
  '可以认识一下吗？',
];

export default function DatingScreen({ navigation }: any) {
  const [datingPets, setDatingPets] = useState<Pet[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    // 加载相亲宠物列表
    let pets = mockDatingPets;
    // 为每只宠物添加默认照片（如果没有 photos 字段）
    pets = pets.map(p => ({
      ...p,
      photos: p.photos || [p.avatar],
    }));
    setDatingPets(pets);

    // 加载我的宠物
    const myPetsData = await getPets();
    setMyPets(myPetsData);
  };

  const currentPet = datingPets[currentIndex];

  const handleLike = () => {
    if (!currentPet) return;

    // 如果没有宠物，提示添加
    if (myPets.length === 0) {
      Alert.alert('提示', '还没有添加宠物，请先添加宠物后再发起相亲', [
        { text: '去添加', onPress: () => navigation.navigate('AddPet') },
        { text: '取消', style: 'cancel' },
      ]);
      return;
    }

    // 如果只有一只宠物，直接发起配对
    if (myPets.length === 1) {
      handleSendLike(myPets[0], GREETING_MESSAGES[0]);
    } else {
      // 多只宠物，弹出选择面板
      setSelectedPet(currentPet);
      setShowLikeModal(true);
    }
  };

  const handleSendLike = async (sourcePet: Pet, message: string) => {
    if (!currentPet) return;

    // 检查是否已经匹配过
    const alreadyMatched = await isPetsMatched(sourcePet.id, currentPet.id);
    if (alreadyMatched) {
      Alert.alert('提示', '你们已经匹配过了！');
      return;
    }

    // 创建配对请求
    const matchRequest: MatchRequest = {
      id: Date.now().toString(),
      targetPet: currentPet,
      sourcePet: sourcePet,
      sourceMessage: message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await addMatchRequest(matchRequest);

    Alert.alert('❤️', `已向 ${currentPet.name} 的主人发送喜欢！\n等待对方回应`);
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
        Alert.alert('😊', '已经看完所有宠物啦！\n稍后会有更多宠物');
      }
    });
  };

  const calculateAge = (birthday: string) => {
    const birth = new Date(birthday);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    return `${years}岁`;
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
        <Ionicons name="heart-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>暂时没有更多宠物了</Text>
        <Text style={styles.emptySubtitle}>稍后再来看看吧～</Text>
      </View>
    );
  }

  // 使用宠物照片或默认头像数组
  const photos = currentPet.photos && currentPet.photos.length > 0
    ? currentPet.photos
    : [currentPet.avatar];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>宠物相亲</Text>
        <Text style={styles.headerSubtitle}>为你的宠物找到合适的伴侣</Text>
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
            {/* 照片轮播 */}
            <PhotoCarousel photos={photos} style={styles.carousel} />

            {/* Counter Badge */}
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {datingPets.length}
              </Text>
            </View>

            {/* Gradient Overlay with Info */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.petInfoOverlay}>
                <View style={styles.nameContainer}>
                  <Text style={styles.petNameLarge}>{currentPet.name}</Text>
                  <Text style={styles.genderEmoji}>
                    {currentPet.gender === 'male' ? '🦁' : '🌸'}
                  </Text>
                </View>
                <Text style={styles.petDetails}>
                  {currentPet.breed} · {calculateAge(currentPet.birthday)}
                </Text>
                <View style={styles.ownerInfo}>
                  <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.ownerText}>主人: {currentPet.owner}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            {/* Personality Tags */}
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>性格标签</Text>
              <View style={styles.tagsContainer}>
                {currentPet.personality.map((trait, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bio */}
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>自我介绍</Text>
              <Text style={styles.bioText}>{currentPet.bio}</Text>
            </View>

            {/* Looking For */}
            <View style={styles.lookingForCard}>
              <View style={styles.lookingForHeader}>
                <Ionicons name="heart" size={16} color={COLORS.primary} />
                <Text style={styles.lookingForLabel}>期望对象</Text>
              </View>
              <Text style={styles.lookingForText}>{currentPet.lookingFor}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Ionicons name="close" size={32} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.likeButtonGradient}
          >
            <Ionicons name="heart" size={36} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle" size={32} color={COLORS.info} />
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsText}>
          💡 点击 ❤️ 表示喜欢，点击 ✖️ 查看下一个
        </Text>
      </View>

      {/* Like Modal */}
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
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: SPACING.md,
  },
  cardContainer: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  carousel: {
    height: height * 0.35,
  },
  counterBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  counterText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  petInfoOverlay: {
    gap: SPACING.xs,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  petNameLarge: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  genderEmoji: {
    fontSize: FONT_SIZE.xxl,
  },
  petDetails: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ownerText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailsSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  detailBlock: {
    gap: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: '#FFE9DC',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: FONT_SIZE.md * 1.5,
  },
  lookingForCard: {
    backgroundColor: '#FFF4E0',
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
    color: COLORS.text,
    fontWeight: '600',
  },
  lookingForText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  likeButton: {
    width: 80,
    height: 80,
  },
  likeButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  infoButton: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  tipsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFF4E0',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});