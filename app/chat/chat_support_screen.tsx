import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  StatusBar,
} from 'react-native';

import {
  useLocalSearchParams,
  Stack,
} from 'expo-router';

import {
  Send,
  Image as ImageIcon,
  Plus,
  Info,
  Phone,
  Video,
  Smile,
  Check,
  CheckCheck,
  Mic,
  MoreVertical,
  Search,
} from 'lucide-react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  Colors,
  Spacing,
  Typography,
} from '@/constants/Theme';

// ======================================================
// TYPES
// ======================================================

type MessageType = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  image?: string;
  date?: string;
};

// ======================================================
// MOCK DATA
// ======================================================
const CHAT_MESSAGES: Record<string, MessageType[]> = {
  '1': [
    {
      id: '1',
      text: 'Hello! I wanted to ask about the haircut appointment.',
      sender: 'them',
      time: '10:00 AM',
    },
    {
      id: '2',
      text: 'Sure, how can I help you?',
      sender: 'me',
      time: '10:02 AM',
      status: 'read',
    },
    {
      id: '3',
      text: 'Is my order ready for pickup?',
      sender: 'them',
      time: '10:05 AM',
    },
  ],

  '2': [
    {
      id: '1',
      text: 'Your appointment is confirmed for 4 PM.',
      sender: 'them',
      time: '09:10 AM',
    },
    {
      id: '2',
      text: 'Perfect, thank you.',
      sender: 'me',
      time: '09:12 AM',
      status: 'read',
    },
    {
      id: '3',
      text: 'Please arrive 10 minutes early.',
      sender: 'them',
      time: '09:13 AM',
    },
  ],

  '3': [
    {
      id: '1',
      text: 'Let me check the fabric availability.',
      sender: 'them',
      time: 'Yesterday',
    },
    {
      id: '2',
      text: 'Sure, I need it before Friday.',
      sender: 'me',
      time: 'Yesterday',
      status: 'delivered',
    },
    {
      id: '3',
      text: 'I will confirm by tonight.',
      sender: 'them',
      time: 'Yesterday',
    },
  ],
};

// ======================================================
// SCREEN
// ======================================================

export default function ChatConversationScreen() {
  const {
  id,
  name,
  avatar,
  type,
} = useLocalSearchParams();
const userName =
  (name as string) || 'Unknown User';

const userAvatar =
  (avatar as string) ||
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80';

const userType =
  (type as string) || 'Customer';
  const flatListRef =
    useRef<FlatList>(null);

const [
  messages,
  setMessages,
] = useState<MessageType[]>(
  CHAT_MESSAGES[id as string] || []
);

  const [
    inputText,
    setInputText,
  ] = useState('');

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  const pulseAnim =
    useRef(
      new Animated.Value(1)
    ).current;

  // ======================================================
  // FAKE TYPING ANIMATION
  // ======================================================

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(
          pulseAnim,
          {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          pulseAnim,
          {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }
        ),
      ])
    ).start();
  }, []);

  // ======================================================
  // AUTO SCROLL
  // ======================================================

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd(
        {
          animated: true,
        }
      );
    }, 120);
  }, [messages]);

  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const sendMessage =
    () => {
      if (
        !inputText.trim()
      )
        return;

      const newMessage: MessageType =
        {
          id:
            Date.now().toString(),

          text: inputText,

          sender: 'me',

          time:
            new Date().toLocaleTimeString(
              [],
              {
                hour: '2-digit',
                minute:
                  '2-digit',
              }
            ),

          status: 'sent',
        };

      setMessages(
        (prev) => [
          ...prev,
          newMessage,
        ]
      );

      setInputText('');

      // fake delivery/read
      setTimeout(() => {
        setMessages(
          (
            prev
          ) =>
            prev.map(
              (m) =>
                m.id ===
                newMessage.id
                  ? {
                      ...m,
                      status:
                        'delivered',
                    }
                  : m
            )
        );
      }, 1000);

      setTimeout(() => {
        setMessages(
          (
            prev
          ) =>
            prev.map(
              (m) =>
                m.id ===
                newMessage.id
                  ? {
                      ...m,
                      status:
                        'read',
                    }
                  : m
            )
        );

        simulateReply();
      }, 1800);
    };

  // ======================================================
  // FAKE REPLY
  // ======================================================

  const simulateReply =
    () => {
      setIsTyping(true);

      setTimeout(() => {
        const replies = [
          'Got it 👍',
          'Sure, I can help with that.',
          'Your booking has been updated.',
          'Please arrive 10 minutes early.',
          'That timing works perfectly.',
        ];

        const reply =
          replies[
            Math.floor(
              Math.random() *
                replies.length
            )
          ];

        const botReply: MessageType =
          {
            id:
              Date.now().toString(),

            text: reply,

            sender: 'them',

            time:
              new Date().toLocaleTimeString(
                [],
                {
                  hour: '2-digit',
                  minute:
                    '2-digit',
                }
              ),
          };

        setMessages(
          (prev) => [
            ...prev,
            botReply,
          ]
        );

        setIsTyping(false);
      }, 2500);
    };

  // ======================================================
  // RENDER STATUS
  // ======================================================

  const renderStatus =
    (
      status?: string
    ) => {
      if (
        status ===
        'sent'
      ) {
        return (
          <Check
            size={12}
            color="rgba(255,255,255,0.7)"
          />
        );
      }

      if (
        status ===
        'delivered'
      ) {
        return (
          <CheckCheck
            size={12}
            color="rgba(255,255,255,0.7)"
          />
        );
      }

      if (
        status ===
        'read'
      ) {
        return (
          <CheckCheck
            size={12}
            color="#7DD3FC"
          />
        );
      }

      return null;
    };

  // ======================================================
  // MESSAGE ITEM
  // ======================================================

  const renderMessage =
    ({
      item,
      index,
    }: {
      item: MessageType;
      index: number;
    }) => {
      const isMine =
        item.sender ===
        'me';

      return (
        <View
          style={[
            styles.messageWrap,

            isMine
              ? styles.myMessageWrap
              : styles.theirMessageWrap,
          ]}
        >
          {!isMine && (
            <Image
              source={{
                uri: userAvatar,
              }}
              style={
                styles.avatar
              }
            />
          )}

          <View
            style={{
              maxWidth:
                '82%',
            }}
          >
            <LinearGradient
              colors={
                isMine
                  ? [
                      Colors.primary,
                      '#4F46E5',
                    ]
                  : [
                      '#1F2937',
                      '#111827',
                    ]
              }
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={[
                styles.messageBubble,

                isMine
                  ? styles.myBubble
                  : styles.theirBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,

                  {
                    color:
                      '#FFF',
                  },
                ]}
              >
                {item.text}
              </Text>
            </LinearGradient>

            <View
              style={[
                styles.metaRow,

                isMine && {
                  justifyContent:
                    'flex-end',
                },
              ]}
            >
              <Text
                style={
                  styles.timeText
                }
              >
                {item.time}
              </Text>

              {isMine && (
                <View
                  style={{
                    marginLeft: 4,
                  }}
                >
                  {renderStatus(
                    item.status
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      );
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
      behavior={
        Platform.OS ===
        'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS ===
        'ios'
          ? 90
          : 0
      }
    >
      <StatusBar
        barStyle="light-content"
      />

      {/* HEADER */}
<Stack.Screen
  options={{
    headerShadowVisible: false,

    headerStyle: {
      backgroundColor: '#0F172A',
    },

    headerTintColor: '#FFF',

    headerTitle: () => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: -8,
        }}
      >
        {/* AVATAR */}

        <View style={styles.headerUser}>
          <Image
            source={{
              uri: userAvatar,
            }}
            style={styles.headerAvatar}
          />

          <Animated.View
            style={[
              styles.onlineDot,
              {
                transform: [
                  {
                    scale: pulseAnim,
                  },
                ],
              },
            ]}
          />
        </View>

        {/* NAME + STATUS */}

        <View
          style={{
            marginLeft: 10,
          }}
        >
          <Text
            style={{
              color: '#FFF',
              fontSize: 16,
              fontWeight: '800',
            }}
          >
            {userName}
          </Text>

          <Text
            style={{
              color: '#22C55E',
              fontSize: 11,
              marginTop: 1,
              fontWeight: '600',
            }}
          >
            {userType} • Online
          </Text>
        </View>
      </View>
    ),

    headerRight: () => (
      <View style={styles.headerActions}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.headerBtn}
        >
          <Phone
            size={18}
            color="#FFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.headerBtn}
        >
          <Video
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.headerBtn}
        >
          <MoreVertical
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    ),
  }}
/>

      {/* BACKGROUND */}

      <LinearGradient
        colors={[
          '#0F172A',
          '#111827',
          '#1E293B',
        ]}
        style={
          styles.background
        }
      />

      {/* CHAT LIST */}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(
          item
        ) => item.id}
        renderItem={
          renderMessage
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.messageList
        }
      />

      {/* TYPING */}

      {isTyping && (
        <View
          style={
            styles.typingWrap
          }
        >
          <Image
            source={{
              uri: userAvatar,
            }}
            style={
              styles.typingAvatar
            }
          />

          <View
            style={
              styles.typingBubble
            }
          >
            <Text
              style={
                styles.typingText
              }
            >
              {userName} is typing...
            </Text>
          </View>
        </View>
      )}

      {/* INPUT */}

      <View
        style={
          styles.inputArea
        }
      >
        <TouchableOpacity
          style={
            styles.circleBtn
          }
        >
          <Plus
            size={22}
            color={
              Colors.textMuted
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.circleBtn
          }
        >
          <ImageIcon
            size={20}
            color={
              Colors.textMuted
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.inputContainer
          }
        >
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={
              Colors.textMuted
            }
            style={
              styles.input
            }
            multiline
            value={inputText}
            onChangeText={
              setInputText
            }
          />

          <TouchableOpacity>
            <Smile
              size={20}
              color={
                Colors.textMuted
              }
            />
          </TouchableOpacity>
        </View>

        {inputText.trim() ? (
          <TouchableOpacity
            activeOpacity={
              0.88
            }
            style={
              styles.sendBtn
            }
            onPress={
              sendMessage
            }
          >
            <LinearGradient
              colors={[
                Colors.primary,
                '#4F46E5',
              ]}
              style={
                styles.sendGradient
              }
            >
              <Send
                size={18}
                color="#FFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={
              styles.sendBtn
            }
          >
            <LinearGradient
              colors={[
                '#374151',
                '#1F2937',
              ]}
              style={
                styles.sendGradient
              }
            >
              <Mic
                size={20}
                color="#FFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#0F172A',
    },

    background: {
      position:
        'absolute',

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    headerUser: {
      marginLeft: 4,
    },

    headerAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },

    onlineDot: {
      position:
        'absolute',

      width: 10,
      height: 10,
      borderRadius: 5,

      backgroundColor:
        '#22C55E',

      bottom: 0,
      right: 0,

      borderWidth: 2,
      borderColor:
        '#0F172A',
    },

    headerActions: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 8,
    },

    headerBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,

      backgroundColor:
        'rgba(255,255,255,0.08)',

      justifyContent:
        'center',

      alignItems:
        'center',
    },

    messageList: {
      paddingHorizontal: 14,
      paddingTop: 20,
      paddingBottom: 20,
    },

    messageWrap: {
      marginBottom: 18,
      flexDirection: 'row',
      alignItems:
        'flex-end',
    },

    myMessageWrap: {
      justifyContent:
        'flex-end',
    },

    theirMessageWrap: {
      justifyContent:
        'flex-start',
    },

    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 8,
    },

    messageBubble: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 22,
    },

    myBubble: {
      borderBottomRightRadius: 8,
    },

    theirBubble: {
      borderBottomLeftRadius: 8,
    },

    messageText: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500',
    },

    metaRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop: 6,
      paddingHorizontal: 6,
    },

    timeText: {
      fontSize: 10,
      color:
        'rgba(255,255,255,0.5)',
      fontWeight: '600',
    },

    typingWrap: {
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 16,
      marginBottom: 10,
    },

    typingAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 8,
    },

    typingBubble: {
      backgroundColor:
        'rgba(255,255,255,0.08)',

      paddingHorizontal: 14,
      paddingVertical: 10,

      borderRadius: 18,
    },

    typingText: {
      color:
        'rgba(255,255,255,0.7)',

      fontSize: 12,
      fontStyle: 'italic',
    },

    inputArea: {
      flexDirection:
        'row',

      alignItems:
        'flex-end',

      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom:
        Platform.OS ===
        'ios'
          ? 24
          : 12,

      backgroundColor:
        'rgba(15,23,42,0.96)',

      borderTopWidth: 1,

      borderTopColor:
        'rgba(255,255,255,0.06)',
    },

    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,

      justifyContent:
        'center',

      alignItems:
        'center',

      backgroundColor:
        'rgba(255,255,255,0.06)',

      marginBottom: 4,
    },

    inputContainer: {
      flex: 1,

      minHeight: 48,
      maxHeight: 120,

      flexDirection:
        'row',

      alignItems:
        'flex-end',

      paddingHorizontal: 16,
      paddingVertical: 10,

      marginHorizontal: 10,

      borderRadius: 24,

      backgroundColor:
        'rgba(255,255,255,0.08)',

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.08)',
    },

    input: {
      flex: 1,

      color: '#FFF',

      fontSize: 15,

      lineHeight: 20,

      paddingTop: 0,
      paddingBottom: 0,

      marginRight: 10,
    },

    sendBtn: {
      width: 50,
      height: 50,
      borderRadius: 25,
      overflow: 'hidden',
    },

    sendGradient: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',
    },
  });