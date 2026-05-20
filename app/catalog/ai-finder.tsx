import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Camera, Sparkles, RefreshCcw, Check, ChevronRight, Upload } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { HaircutStyle } from '@/constants/Types';

const HAIRCUT_STYLES: HaircutStyle[] = [
  { id: 'h1', name: 'Premium Skin Fade', image: 'https://images.unsplash.com/photo-1599351431247-f10b218163e3?w=400&q=80', tags: ['Modern', 'Sharp', 'Low Maintenance'] },
  { id: 'h2', name: 'Classic Side Part', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80', tags: ['Professional', 'Timeless'] },
  { id: 'h3', name: 'Textured Crop', image: 'https://images.unsplash.com/photo-1621605815841-28d644ef915a?w=400&q=80', tags: ['Messy', 'Young', 'Textured'] },
  { id: 'h4', name: 'Long Flow', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80', tags: ['Natural', 'Casual'] },
];

export default function AIFinderScreen() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (step === 'analyzing') {
      const interval = setInterval(() => {
        setAnalyzingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('results');
            return 100;
          }
          return prev + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  const startAnalysis = () => {
    setStep('analyzing');
    setAnalyzingProgress(0);
  };

  const renderUpload = () => (
    <View style={styles.centerContent}>
      <GlassCard style={styles.uploadCard}>
        <View style={styles.iconContainer}>
          <Camera size={48} color={Colors.primary} />
        </View>
        <Text style={styles.uploadTitle}>Scan Your Face</Text>
        <Text style={styles.uploadDesc}>
          Our AI will analyze your face shape, hair type, and features to recommend the perfect styles.
        </Text>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={startAnalysis}>
          <Camera size={20} color="#FFF" />
          <Text style={styles.btnText}>Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn}>
          <Upload size={20} color={Colors.text} />
          <Text style={[styles.btnText, { color: Colors.text }]}>Upload Photo</Text>
        </TouchableOpacity>
      </GlassCard>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Pro Tips:</Text>
        <Text style={styles.tipText}>• Ensure good lighting</Text>
        <Text style={styles.tipText}>• Look directly into the camera</Text>
        <Text style={styles.tipText}>• Keep a neutral expression</Text>
      </View>
    </View>
  );

  const renderAnalyzing = () => (
    <View style={styles.centerContent}>
      <View style={styles.analysisContainer}>
        <View style={styles.pulseContainer}>
          <Sparkles size={60} color={Colors.primary} />
        </View>
        <Text style={styles.analyzingTitle}>Analyzing Features...</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${analyzingProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{analyzingProgress}% Complete</Text>
        
        <View style={styles.logContainer}>
          <Text style={styles.logText}>{analyzingProgress > 20 ? ' Detecting face shape' : '○ Detecting face shape'}</Text>
          <Text style={styles.logText}>{analyzingProgress > 50 ? ' Analyzing hair density' : '○ Analyzing hair density'}</Text>
          <Text style={styles.logText}>{analyzingProgress > 80 ? ' Matching with top styles' : '○ Matching with top styles'}</Text>
        </View>
      </View>
    </View>
  );

  const renderResults = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.resultsHeader}>
        <GlassCard style={styles.matchCard}>
          <Sparkles size={24} color={Colors.secondary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.matchTitle}>Perfect Match Found!</Text>
            <Text style={styles.matchDesc}>Based on your diamond face shape, we recommend these 3 styles.</Text>
          </View>
        </GlassCard>
      </View>

      <Text style={styles.sectionTitle}>Top Recommendations</Text>
      {HAIRCUT_STYLES.slice(0, 3).map((item, index) => (
        <GlassCard key={item.id} style={styles.styleCard}>
          <Image source={{ uri: item.image }} style={styles.styleImg} />
          <View style={styles.styleInfo}>
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{98 - index * 5}% Match</Text>
            </View>
            <Text style={styles.styleName}>{item.name}</Text>
            <View style={styles.tagRow}>
              {item.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>Try This Style</Text>
              <ChevronRight size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </GlassCard>
      ))}

      <TouchableOpacity style={styles.restartBtn} onPress={() => setStep('upload')}>
        <RefreshCcw size={20} color={Colors.primary} />
        <Text style={styles.restartBtnText}>Scan Again</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'AI Style Finder', headerTransparent: true, headerTintColor: '#FFF' }} />
      {step === 'upload' && renderUpload()}
      {step === 'analyzing' && renderAnalyzing()}
      {step === 'results' && renderResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: 100, // For transparent header
  },
  uploadCard: {
    width: '100%',
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  uploadDesc: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  btnText: {
    ...Typography.body,
    fontWeight: '700',
    color: '#FFF',
  },
  tipsContainer: {
    marginTop: 32,
    width: '100%',
    paddingHorizontal: 12,
  },
  tipsTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
    fontSize: 14,
  },
  analysisContainer: {
    alignItems: 'center',
    width: '100%',
  },
  pulseContainer: {
    marginBottom: 32,
  },
  analyzingTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 24,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    marginTop: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  logContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
    gap: 12,
  },
  logText: {
    color: Colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  resultsHeader: {
    marginBottom: Spacing.xl,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: Colors.secondary,
    borderWidth: 1,
  },
  matchTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  matchDesc: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  styleCard: {
    padding: 0,
    flexDirection: 'row',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  styleImg: {
    width: 120,
    height: 160,
  },
  styleInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  matchBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  matchBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
  },
  styleName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    marginTop: 12,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 12,
  },
  restartBtnText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
