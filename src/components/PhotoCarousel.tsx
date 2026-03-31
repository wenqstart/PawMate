import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const { width } = Dimensions.get('window');

interface PhotoCarouselProps {
  photos: string[];  // 照片数组
  showDots?: boolean;  // 是否显示底部圆点
  autoPlay?: boolean;  // 是否自动播放（暂未实现）
  style?: object;
}

export default function PhotoCarousel({
  photos,
  showDots = true,
  style,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // 确保有照片显示
  const displayPhotos = photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1747045170511-9f0f4f3859e8?w=400'];

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index >= 0 && index < displayPhotos.length) {
      setCurrentIndex(index);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex - 1) * width,
        animated: true,
      });
    }
  };

  const goToNext = () => {
    if (currentIndex < displayPhotos.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {displayPhotos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* 左右箭头按钮 */}
      {displayPhotos.length > 1 && (
        <>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.arrowButton, styles.arrowLeft]}
              onPress={goToPrevious}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
          {currentIndex < displayPhotos.length - 1 && (
            <TouchableOpacity
              style={[styles.arrowButton, styles.arrowRight]}
              onPress={goToNext}
            >
              <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* 底部圆点指示器 */}
      {showDots && displayPhotos.length > 1 && (
        <View style={styles.dotsContainer}>
          {displayPhotos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: width,
    height: '100%',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLeft: {
    left: SPACING.md,
  },
  arrowRight: {
    right: SPACING.md,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
});