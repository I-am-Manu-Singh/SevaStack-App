import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

import {
  Camera,
  Sparkles,
  RefreshCcw,
  ChevronRight,
  Upload,
  Wand2,
  BrainCircuit,
  ScanFace,
  CheckCircle2,
} from 'lucide-react-native';

import {
  Stack,
} from 'expo-router';

import {
  Spacing,
} from '@/constants/Theme';

import {
  GlassCard,
} from '@/components/GlassCard';

import {
  HaircutStyle,
} from '@/constants/Types';

import {
  useApp,
} from '@/lib/AppContext';

import {
  StatusBar,
} from 'expo-status-bar';

import {
  LinearGradient,
} from 'expo-linear-gradient';

// ======================================================
// CONFIG
// ======================================================

const BUSINESS_AI_CONFIGS: Record<
  string,
  {
    title: string;
    uploadTitle: string;
    uploadDesc: string;
    btnLabel: string;
    analyzingSteps: string[];
    resultsTitle: string;
    resultsDesc: string;
    recommendations: HaircutStyle[];
  }
> = {
  Barber: {
    title: 'AI Style Finder',

    uploadTitle:
      'Scan Your Face',

    uploadDesc:
      'Analyze face shape, hair texture and styling compatibility to discover the best haircut patterns.',

    btnLabel:
      'Start Face Scan',

    analyzingSteps: [
      'Detecting facial structure',
      'Analyzing hair density',
      'Matching trending styles',
    ],

    resultsTitle:
      'Perfect Match Found',

    resultsDesc:
      'Based on your facial structure and styling profile, these recommendations have the highest compatibility.',

    recommendations: [
      {
        id: 'b1',
        name:
          'Premium Skin Fade',
        image:
          'https://images.unsplash.com/photo-1599351431247-f10b218163e3?w=400&q=80',
        tags: [
          'Modern',
          'Sharp',
          'Low Maintenance',
        ],
      },

      {
        id: 'b2',
        name:
          'Classic Side Part',
        image:
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
        tags: [
          'Professional',
          'Timeless',
        ],
      },

      {
        id: 'b3',
        name:
          'Textured Crop',
        image:
          'https://images.unsplash.com/photo-1621605815841-28d644ef915a?w=400&q=80',
        tags: [
          'Messy',
          'Young',
          'Textured',
        ],
      },
    ],
  },

  Default: {
    title:
      'AI Business Optimizer',

    uploadTitle:
      'Analyze Your Business',

    uploadDesc:
      'Scan your catalog or business metrics to generate optimized recommendations and service insights.',

    btnLabel:
      'Analyze Portal',

    analyzingSteps: [
      'Auditing service patterns',
      'Evaluating engagement metrics',
      'Generating optimization insights',
    ],

    resultsTitle:
      'Optimization Complete',

    resultsDesc:
      'AI identified several opportunities to improve customer engagement and conversion rates.',

    recommendations: [
      {
        id: 'd1',
        name:
          'Dynamic Pricing Bundle',
        image:
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
        tags: [
          'Revenue Boost',
          'AI Pricing',
        ],
      },

      {
        id: 'd2',
        name:
          'Priority Delivery Slot',
        image:
          'https://images.unsplash.com/photo-1545180856-f2868ff128c7?w=400&q=80',
        tags: [
          'Fast Delivery',
          'Premium',
        ],
      },
    ],
  },
};

// ======================================================
// SCREEN
// ======================================================

export default function AIFinderScreen() {
  const {
    colors,
    theme,
    businessType,
  } = useApp();

  const [
    step,
    setStep,
  ] = useState<
    'upload' |
    'analyzing' |
    'results'
  >('upload');

  const [
    analyzingProgress,
    setAnalyzingProgress,
  ] = useState(0);

  const config =
    BUSINESS_AI_CONFIGS[
      businessType
    ] ||
    BUSINESS_AI_CONFIGS.Default;

  // ======================================================
  // ANALYSIS LOOP
  // ======================================================

  useEffect(() => {
    if (
      step !==
      'analyzing'
    )
      return;

    const interval =
      setInterval(() => {
        setAnalyzingProgress(
          (prev) => {
            if (
              prev >= 100
            ) {
              clearInterval(
                interval
              );

              setTimeout(() => {
                setStep(
                  'results'
                );
              }, 300);

              return 100;
            }

            return (
              prev + 5
            );
          }
        );
      }, 120);

    return () =>
      clearInterval(
        interval
      );
  }, [step]);

  // ======================================================
  // START
  // ======================================================

  const startAnalysis =
    () => {
      setAnalyzingProgress(
        0
      );

      setStep(
        'analyzing'
      );
    };

  // ======================================================
  // PROGRESS LABEL
  // ======================================================

  const currentAnalysisLabel =
    useMemo(() => {
      if (
        analyzingProgress <
        30
      )
        return config
          .analyzingSteps[0];

      if (
        analyzingProgress <
        70
      )
        return config
          .analyzingSteps[1];

      return config
        .analyzingSteps[2];
    }, [
      analyzingProgress,
      config,
    ]);

  // ======================================================
  // UPLOAD
  // ======================================================

  const renderUpload =
    () => (
      <ScrollView
        contentContainerStyle={
          styles.uploadScroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <LinearGradient
          colors={[
            colors.primary +
              '15',
            'transparent',
          ]}
          style={
            styles.heroGradient
          }
        />

        <GlassCard
          style={[
            styles.heroCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={
              styles.heroTop
            }
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  config.title
                }
              </Text>

              <Text
                style={[
                  styles.heroDesc,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                {
                  config.uploadDesc
                }
              </Text>
            </View>

            <View
              style={[
                styles.heroIconWrap,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <BrainCircuit
                size={30}
                color={
                  colors.primary
                }
              />
            </View>
          </View>

          <View
            style={
              styles.scanPreviewWrap
            }
          >
            <View
              style={[
                styles.scanPreview,
                {
                  borderColor:
                    colors.primary +
                    '35',
                  backgroundColor:
                    colors.background,
                },
              ]}
            >
              <ScanFace
                size={70}
                color={
                  colors.primary
                }
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={
              0.88
            }
            style={[
              styles.primaryBtn,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={
              startAnalysis
            }
          >
            <Camera
              size={20}
              color="#FFF"
            />

            <Text
              style={
                styles.primaryBtnText
              }
            >
              {
                config.btnLabel
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={
              0.88
            }
            style={[
              styles.secondaryBtn,
              {
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.background,
              },
            ]}
          >
            <Upload
              size={18}
              color={
                colors.text
              }
            />

            <Text
              style={[
                styles.secondaryBtnText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Upload Photo
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* TIPS */}

        <GlassCard
          style={[
            styles.tipsCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={
              styles.tipHeader
            }
          >
            <Sparkles
              size={18}
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.tipTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Scan Tips
            </Text>
          </View>

          {[
            'Ensure proper lighting',
            'Avoid blurry movement',
            'Keep face centered',
            'Remove strong shadows',
          ].map(
            (tip) => (
              <View
                key={tip}
                style={
                  styles.tipRow
                }
              >
                <CheckCircle2
                  size={14}
                  color={
                    colors.success ||
                    '#10B981'
                  }
                />

                <Text
                  style={[
                    styles.tipText,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {tip}
                </Text>
              </View>
            )
          )}
        </GlassCard>
      </ScrollView>
    );

  // ======================================================
  // ANALYZING
  // ======================================================

  const renderAnalyzing =
    () => (
      <View
        style={[
          styles.analyzeContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <LinearGradient
          colors={[
            colors.primary +
              '12',
            'transparent',
          ]}
          style={
            styles.analyzeGradient
          }
        />

        <View
          style={[
            styles.analyzeOrb,
            {
              backgroundColor:
                colors.primary +
                '12',
              borderColor:
                colors.primary +
                '25',
            },
          ]}
        >
          <Wand2
            size={56}
            color={
              colors.primary
            }
          />
        </View>

        <Text
          style={[
            styles.analyzeTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          AI Processing
        </Text>

        <Text
          style={[
            styles.analyzeDesc,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          {currentAnalysisLabel}
        </Text>

        <View
          style={[
            styles.progressBarWrap,
            {
              backgroundColor:
                colors.border +
                '25',
            },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${analyzingProgress}%`,
                backgroundColor:
                  colors.primary,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.progressText,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          {
            analyzingProgress
          }
          % Complete
        </Text>

        <View
          style={
            styles.analysisLogs
          }
        >
          {config.analyzingSteps.map(
            (
              item,
              index
            ) => {
              const completed =
                analyzingProgress >
                (index +
                  1) *
                  30;

              return (
                <View
                  key={
                    item
                  }
                  style={
                    styles.logRow
                  }
                >
                  <Text
                    style={[
                      styles.logBullet,
                      {
                        color:
                          completed
                            ? colors.success ||
                              '#10B981'
                            : colors.textMuted,
                      },
                    ]}
                  >
                    {completed
                      ? '✓'
                      : '○'}
                  </Text>

                  <Text
                    style={[
                      styles.logTxt,
                      {
                        color:
                          completed
                            ? colors.text
                            : colors.textMuted,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              );
            }
          )}
        </View>
      </View>
    );

  // ======================================================
  // RESULTS
  // ======================================================

  const renderResults =
    () => (
      <ScrollView
        contentContainerStyle={
          styles.resultsScroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <GlassCard
          style={[
            styles.resultHero,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.resultBadge,
              {
                backgroundColor:
                  colors.success +
                  '15',
              },
            ]}
          >
            <Sparkles
              size={16}
              color={
                colors.success ||
                '#10B981'
              }
            />

            <Text
              style={[
                styles.resultBadgeText,
                {
                  color:
                    colors.success ||
                    '#10B981',
                },
              ]}
            >
              AI MATCHED
            </Text>
          </View>

          <Text
            style={[
              styles.resultTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {
              config.resultsTitle
            }
          </Text>

          <Text
            style={[
              styles.resultDesc,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            {
              config.resultsDesc
            }
          </Text>
        </GlassCard>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Top Recommendations
        </Text>

        {config.recommendations.map(
          (
            item,
            index
          ) => (
            <GlassCard
              key={item.id}
              style={[
                styles.styleCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Image
                source={{
                  uri: item.image,
                }}
                style={
                  styles.styleImg
                }
              />

              <View
                style={
                  styles.styleInfo
                }
              >
                <View
                  style={[
                    styles.matchBadge,
                    {
                      backgroundColor:
                        colors.primary +
                        '15',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.matchBadgeText,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {98 -
                      index *
                        4}
                    % Match
                  </Text>
                </View>

                <Text
                  style={[
                    styles.styleName,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    item.name
                  }
                </Text>

                <View
                  style={
                    styles.tagRow
                  }
                >
                  {item.tags.map(
                    (
                      tag
                    ) => (
                      <View
                        key={
                          tag
                        }
                        style={[
                          styles.tag,
                          {
                            backgroundColor:
                              colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            {
                              color:
                                colors.textMuted,
                            },
                          ]}
                        >
                          {tag}
                        </Text>
                      </View>
                    )
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={
                    0.88
                  }
                  style={[
                    styles.selectBtn,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.selectBtnText
                    }
                  >
                    Select
                    Pattern
                  </Text>

                  <ChevronRight
                    size={16}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>
            </GlassCard>
          )
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          style={
            styles.restartBtn
          }
          onPress={() =>
            setStep(
              'upload'
            )
          }
        >
          <RefreshCcw
            size={18}
            color={
              colors.primary
            }
          />

          <Text
            style={[
              styles.restartText,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            Scan Again
          </Text>
        </TouchableOpacity>

        <View
          style={{ height: 60 }}
        />
      </ScrollView>
    );

  // ======================================================
  // UI
  // ======================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          theme === 'dark'
            ? 'light'
            : 'dark'
        }
      />

      <Stack.Screen
        options={{
          title:
            config.title,

          headerShadowVisible:
            false,

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle: {
            color:
              colors.text,
            fontWeight:
              '900',
          },

          headerTintColor:
            colors.text,
        }}
      />

      {step ===
        'upload' &&
        renderUpload()}

      {step ===
        'analyzing' &&
        renderAnalyzing()}

      {step ===
        'results' &&
        renderResults()}
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    uploadScroll: {
      padding: Spacing.md,
      paddingBottom: 40,
    },

    heroGradient: {
      position:
        'absolute',

      top: -120,
      left: -40,
      right: -40,
      height: 320,
    },

    heroCard: {
      borderRadius: 30,
      borderWidth: 1,
      padding: 22,
      overflow:
        'hidden',
    },

    heroTop: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
    },

    heroTitle: {
      fontSize: 28,
      fontWeight:
        '900',
      letterSpacing:
        -0.8,
    },

    heroDesc: {
      fontSize: 13,
      lineHeight: 21,
      marginTop: 10,
      paddingRight: 12,
      fontWeight:
        '500',
    },

    heroIconWrap: {
      width: 74,
      height: 74,
      borderRadius: 24,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    scanPreviewWrap: {
      alignItems:
        'center',
      marginTop: 26,
      marginBottom: 24,
    },

    scanPreview: {
      width: 170,
      height: 170,
      borderRadius: 85,
      borderWidth: 2,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    primaryBtn: {
      height: 58,
      borderRadius: 18,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 10,
      marginBottom: 14,
    },

    primaryBtnText: {
      color: '#FFF',
      fontSize: 15,
      fontWeight:
        '800',
    },

    secondaryBtn: {
      height: 56,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 10,
    },

    secondaryBtnText: {
      fontSize: 14,
      fontWeight:
        '700',
    },

    tipsCard: {
      marginTop: 18,
      borderRadius: 24,
      borderWidth: 1,
      padding: 18,
    },

    tipHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 8,
      marginBottom: 14,
    },

    tipTitle: {
      fontSize: 15,
      fontWeight:
        '800',
    },

    tipRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 10,
      marginBottom: 10,
    },

    tipText: {
      fontSize: 13,
      fontWeight:
        '500',
    },

    analyzeContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems:
        'center',
      padding:
        Spacing.xl,
    },

    analyzeGradient: {
      position:
        'absolute',

      top: 0,
      left: 0,
      right: 0,
      height: 400,
    },

    analyzeOrb: {
      width: 150,
      height: 150,
      borderRadius: 75,
      justifyContent:
        'center',
      alignItems:
        'center',
      borderWidth: 2,
      marginBottom: 34,
    },

    analyzeTitle: {
      fontSize: 30,
      fontWeight:
        '900',
      letterSpacing:
        -0.8,
    },

    analyzeDesc: {
      fontSize: 14,
      marginTop: 10,
      marginBottom: 28,
      textAlign:
        'center',
      fontWeight:
        '500',
    },

    progressBarWrap: {
      width: '100%',
      height: 10,
      borderRadius: 20,
      overflow:
        'hidden',
    },

    progressBar: {
      height: '100%',
      borderRadius: 20,
    },

    progressText: {
      fontSize: 13,
      marginTop: 12,
      fontWeight:
        '700',
    },

    analysisLogs: {
      marginTop: 42,
      width: '100%',
      gap: 16,
    },

    logRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 12,
    },

    logBullet: {
      fontSize: 18,
      fontWeight:
        '900',
    },

    logTxt: {
      fontSize: 14,
      fontWeight:
        '600',
    },

    resultsScroll: {
      padding:
        Spacing.md,
      paddingBottom: 30,
    },

    resultHero: {
      borderRadius: 28,
      borderWidth: 1,
      padding: 22,
      marginBottom: 22,
    },

    resultBadge: {
      alignSelf:
        'flex-start',
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 100,
      marginBottom: 16,
    },

    resultBadgeText: {
      fontSize: 10,
      fontWeight:
        '900',
      letterSpacing:
        0.5,
    },

    resultTitle: {
      fontSize: 24,
      fontWeight:
        '900',
      letterSpacing:
        -0.6,
    },

    resultDesc: {
      fontSize: 13,
      lineHeight: 20,
      marginTop: 10,
      fontWeight:
        '500',
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight:
        '900',
      marginBottom: 14,
    },

    styleCard: {
      borderRadius: 24,
      borderWidth: 1,
      overflow:
        'hidden',
      marginBottom: 16,

      ...Platform.select(
        {
          ios: {
            shadowColor:
              '#000',

            shadowOffset:
              {
                width: 0,
                height: 3,
              },

            shadowOpacity:
              0.08,

            shadowRadius: 6,
          },

          android: {
            elevation: 2,
          },
        }
      ),
    },

    styleImg: {
      width: '100%',
      height: 220,
    },

    styleInfo: {
      padding: 16,
    },

    matchBadge: {
      alignSelf:
        'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      marginBottom: 10,
    },

    matchBadgeText: {
      fontSize: 10,
      fontWeight:
        '900',
    },

    styleName: {
      fontSize: 18,
      fontWeight:
        '800',
    },

    tagRow: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap: 8,
      marginTop: 12,
    },

    tag: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },

    tagText: {
      fontSize: 11,
      fontWeight:
        '600',
    },

    selectBtn: {
      height: 48,
      borderRadius: 14,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 6,
      marginTop: 18,
    },

    selectBtnText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight:
        '800',
    },

    restartBtn: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 8,
      marginTop: 12,
      paddingVertical: 14,
    },

    restartText: {
      fontSize: 14,
      fontWeight:
        '700',
    },
  });