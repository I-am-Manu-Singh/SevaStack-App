import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  Scissors,
  BookOpen,
  ArrowRight,
  Sparkles,
  Building,
  Utensils,
  Printer,
  FileText,
} from 'lucide-react-native';

import { GlassCard } from './GlassCard';

import { useApp } from '../lib/AppContext';

// ======================================================
// TAILOR TRACKER
// ======================================================

export const StitchingTrackerWidget = ({
  order,
}: {
  order: any;
}) => {
  const { colors } = useApp();

  const styles = getStyles(colors);

  const stages = [
    'Measured',
    'Cutting',
    'Stitching',
    'Ironing',
    'Ready',
  ];

  const currentStageIdx = 2;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor:
                colors.primary + '15',
            },
          ]}
        >
          <Scissors
            size={18}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Stitching Tracker
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            Order: {order?.name}
          </Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {stages.map(
          (stage, idx) => {
            const isDone =
              idx <
              currentStageIdx;

            const isCurrent =
              idx ===
              currentStageIdx;

            return (
              <View
                key={stage}
                style={
                  styles.stageRow
                }
              >
                <View
                  style={
                    styles.lineCol
                  }
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          isDone ||
                          isCurrent
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  />

                  {idx !==
                    stages.length -
                      1 && (
                    <View
                      style={[
                        styles.line,
                        {
                          backgroundColor:
                            isDone
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.stageTxt,
                    {
                      color:
                        isCurrent
                          ? colors.text
                          : colors.textMuted,

                      fontWeight:
                        isCurrent
                          ? '800'
                          : '500',
                    },
                  ]}
                >
                  {stage}
                </Text>

                {isCurrent && (
                  <Sparkles
                    size={14}
                    color={
                      colors.accent
                    }
                    style={{
                      marginLeft: 8,
                    }}
                  />
                )}
              </View>
            );
          }
        )}
      </View>
    </GlassCard>
  );
};

// ======================================================
// LIBRARY SEAT MAP
// ======================================================

export const LibrarySeatMapWidget =
  () => {
    const { colors } =
      useApp();

    const styles =
      getStyles(colors);

    const seats =
      Array.from(
        { length: 12 },
        (_, i) => ({
          id: i + 1,
          occupied:
            Math.random() >
            0.6,
        })
      );

    return (
      <GlassCard
        style={styles.card}
      >
        <View
          style={styles.header}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <BookOpen
              size={18}
              color={
                colors.primary
              }
            />
          </View>

          <View>
            <Text
              style={[
                styles.title,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Live Seat Map
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Real-time desk
              occupancy
            </Text>
          </View>
        </View>

        <View
          style={
            styles.seatGrid
          }
        >
          {seats.map(
            (seat) => (
              <View
                key={seat.id}
                style={[
                  styles.seat,
                  {
                    backgroundColor:
                      seat.occupied
                        ? colors.primary +
                          '15'
                        : colors.surfaceLight +
                          '20',

                    borderColor:
                      seat.occupied
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.seatNum,
                    {
                      color:
                        seat.occupied
                          ? colors.primary
                          : colors.textMuted,
                    },
                  ]}
                >
                  {seat.id}
                </Text>
              </View>
            )
          )}
        </View>

        <View
          style={styles.legend}
        >
          <View
            style={
              styles.legendItem
            }
          >
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            />

            <Text
              style={[
                styles.legendTxt,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Occupied
            </Text>
          </View>

          <View
            style={
              styles.legendItem
            }
          >
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />

            <Text
              style={[
                styles.legendTxt,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Available
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  };

// ======================================================
// TIFFIN MENU
// ======================================================

export const TiffinMenuWidget =
  () => {
    const { colors } =
      useApp();

    const styles =
      getStyles(colors);

    const router =
      useRouter();

    const days = [
      {
        day: 'Mon',
        lunch:
          'Paneer, Rice, Roti',
        dinner:
          'Dal Fry, Salad',
      },

      {
        day: 'Tue',
        lunch:
          'Mix Veg Combo',
        dinner:
          'Kadhi Rice',
      },

      {
        day: 'Wed',
        lunch:
          'Aloo Gobhi',
        dinner:
          'Egg Curry',
      },
    ];

    return (
      <GlassCard
        style={styles.card}
      >
        <View
          style={[
            styles.header,
            {
              justifyContent:
                'space-between',
            },
          ]}
        >
          <View
            style={{
              flexDirection:
                'row',
              alignItems:
                'center',
            }}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor:
                    colors.accent +
                    '15',
                },
              ]}
            >
              <Utensils
                size={18}
                color={
                  colors.accent
                }
              />
            </View>

            <View
              style={{
                marginLeft: 12,
              }}
            >
              <Text
                style={[
                  styles.title,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Weekly Menu
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Student tiffin
                planning
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/business/tiffin-manager' as any
              )
            }
          >
            <ArrowRight
              size={18}
              color={
                colors.primary
              }
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          {days.map(
            (
              item,
              idx
            ) => (
              <View
                key={idx}
                style={[
                  styles.menuDayCard,
                  {
                    backgroundColor:
                      colors.surface,

                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.menuDayLabel,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {item.day}
                </Text>

                <View
                  style={
                    styles.menuMeal
                  }
                >
                  <Text
                    style={[
                      styles.mealTime,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Lunch
                  </Text>

                  <Text
                    style={[
                      styles.mealContent,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {
                      item.lunch
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.menuMeal
                  }
                >
                  <Text
                    style={[
                      styles.mealTime,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Dinner
                  </Text>

                  <Text
                    style={[
                      styles.mealContent,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {
                      item.dinner
                    }
                  </Text>
                </View>
              </View>
            )
          )}
        </ScrollView>
      </GlassCard>
    );
  };

// ======================================================
// SALON QUEUE
// ======================================================

export const SalonQueueWidget =
  () => {
    const { colors } =
      useApp();

    const styles =
      getStyles(colors);

    const router =
      useRouter();

    return (
      <GlassCard
        style={styles.card}
      >
        <View
          style={styles.header}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Scissors
              size={18}
              color={
                colors.primary
              }
            />
          </View>

          <View>
            <Text
              style={[
                styles.title,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Barber Queue
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Live chair &
              customer queue
            </Text>
          </View>
        </View>

        <View
          style={
            styles.sectionCard
          }
        >
          <Text
            style={[
              styles.statValue,
              {
                fontSize: 14,
              },
            ]}
          >
            Seat 1 & 2 Busy
          </Text>

          <Text
            style={
              styles.smallMuted
            }
          >
            Manoj &
            Vikranth are
            currently styling
            clients.
          </Text>
        </View>

        <View
          style={
            styles.metricRow
          }
        >
          <View
            style={
              styles.metricBox
            }
          >
            <Text
              style={
                styles.statLabel
              }
            >
              WAITING
            </Text>

            <Text
              style={
                styles.statValue
              }
            >
              3 Clients
            </Text>
          </View>

          <View
            style={
              styles.metricBox
            }
          >
            <Text
              style={
                styles.statLabel
              }
            >
              EST. TIME
            </Text>

            <Text
              style={[
                styles.statValue,
                {
                  color:
                    colors.accent,
                },
              ]}
            >
              25 mins
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={
            0.88
          }
          style={
            styles.primaryButton
          }
          onPress={() =>
            router.push(
              '/business/barber-manager' as any
            )
          }
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Manage Queue
          </Text>

          <ArrowRight
            size={16}
            color="#FFF"
          />
        </TouchableOpacity>
      </GlassCard>
    );
  };

// ======================================================
// STYLES
// ======================================================

const getStyles = (
  colors: any
) =>
  StyleSheet.create({
    card: {
      padding: 18,

      marginBottom: 18,

      borderRadius: 24,

      borderWidth: 1,

      borderColor:
        colors.border +
        '35',

      backgroundColor:
        colors.surface +
        'D9',

      shadowColor: '#000',

      shadowOpacity: 0.08,

      shadowRadius: 18,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      elevation: 4,
    },

    header: {
      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 18,
    },

    iconWrap: {
      width: 42,
      height: 42,

      borderRadius: 14,

      justifyContent:
        'center',

      alignItems:
        'center',
    },

    title: {
      fontSize: 16,
      fontWeight: '900',
    },

    subtitle: {
      fontSize: 12,
      marginTop: 2,
    },

    timeline: {
      paddingLeft: 4,
    },

    stageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 42,
    },

    lineCol: {
      alignItems: 'center',
      width: 24,
      height: '100%',
    },

    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      zIndex: 2,
    },

    line: {
      width: 3,
      flex: 1,
    },

    stageTxt: {
      fontSize: 14,
      marginLeft: 12,
    },

    seatGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'center',
      gap: 10,
    },

    seat: {
      width: 52,
      height: 52,

      borderRadius: 14,

      borderWidth: 1,

      justifyContent:
        'center',

      alignItems:
        'center',
    },

    seatNum: {
      fontSize: 13,
      fontWeight: '800',
    },

    legend: {
      flexDirection: 'row',
      justifyContent:
        'center',
      gap: 24,
      marginTop: 18,
    },

    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    legendTxt: {
      fontSize: 11,
      fontWeight: '700',
    },

    menuDayCard: {
      width: 170,

      padding: 14,

      borderRadius: 18,

      borderWidth: 1,

      marginRight: 12,

      gap: 10,
    },

    menuDayLabel: {
      fontSize: 15,
      fontWeight: '900',
    },

    menuMeal: {
      gap: 4,
    },

    mealTime: {
      fontSize: 10,
      textTransform:
        'uppercase',
      fontWeight: '800',
    },

    mealContent: {
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 18,
    },

    sectionCard: {
      backgroundColor:
        colors.surfaceLight +
        '25',

      borderRadius: 16,

      padding: 14,

      marginTop: 10,

      borderWidth: 1,

      borderColor:
        colors.border +
        '40',
    },

    statLabel: {
      fontSize: 10,

      fontWeight: '800',

      letterSpacing: 0.5,

      textTransform:
        'uppercase',

      color:
        colors.textMuted,
    },

    statValue: {
      fontSize: 15,

      fontWeight: '900',

      color: colors.text,

      marginTop: 4,
    },

    metricRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',

      gap: 12,

      marginTop: 14,
    },

    metricBox: {
      flex: 1,

      padding: 14,

      borderRadius: 16,

      backgroundColor:
        colors.surfaceLight +
        '25',

      borderWidth: 1,

      borderColor:
        colors.border +
        '25',
    },

    primaryButton: {
      height: 46,

      borderRadius: 14,

      backgroundColor:
        colors.primary,

      flexDirection: 'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,

      marginTop: 16,
    },

    primaryButtonText: {
      color: '#FFF',

      fontSize: 13,

      fontWeight: '800',
    },

    smallMuted: {
      fontSize: 11,

      color:
        colors.textMuted,

      lineHeight: 16,

      marginTop: 4,
    },
  });