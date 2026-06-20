import React, { useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";

// Sprocket hole component
function Sprocket() {
  return (
    <View style={styles.sprocketRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.sprocketHole} />
      ))}
    </View>
  );
}

type ChildProps = {
  count: number;
  onAdd: () => void;
  onMinus: () => void;
  onReset: () => void;
  startAddHold: () => void;
  startMinusHold: () => void;
  stopHold: () => void;
  flashAnim: Animated.Value;
};

function ChildComponent({
  count,
  onAdd,
  onMinus,
  onReset,
  startAddHold,
  startMinusHold,
  stopHold,
  flashAnim,
}: ChildProps) {
  const scaleAdd = useRef(new Animated.Value(1)).current;
  const scaleMinus = useRef(new Animated.Value(1)).current;
  const scaleReset = useRef(new Animated.Value(1)).current;

  const pressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const pressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 14,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.childContainer,
        {
          opacity: flashAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.7],
          }),
        },
      ]}
    >
      {/* Film strip top */}
      <Sprocket />

      <View style={styles.childBadge}>
        <Text style={styles.badgeText}>◈  FRAME  ◈</Text>
      </View>

      <Text style={styles.childTitle}>EXPOSURE</Text>

      <Text style={styles.infoText}>— SCENE DATA —</Text>

      <View style={styles.counterFrame}>
        <Text style={styles.counterFrameCorner}>▪</Text>
        <Text style={styles.counterText}>{String(count).padStart(3, "0")}</Text>
        <Text style={styles.counterFrameCorner}>▪</Text>
      </View>

      <Text style={styles.infoText}>— CONTROLS —</Text>

      <View style={styles.buttonRow}>
        {/* Minus button */}
        <Animated.View style={{ transform: [{ scale: scaleMinus }] }}>
          <TouchableOpacity
            style={[styles.circleButton, styles.minusButton]}
            onPress={onMinus}
            onPressIn={() => {
              pressIn(scaleMinus);
              startMinusHold();
            }}
            onPressOut={() => {
              pressOut(scaleMinus);
              stopHold();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.circleButtonText}>−</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Reset button */}
        <Animated.View style={{ transform: [{ scale: scaleReset }] }}>
          <TouchableOpacity
            style={[styles.circleButton, styles.resetButton]}
            onPress={onReset}
            onPressIn={() => pressIn(scaleReset)}
            onPressOut={() => pressOut(scaleReset)}
            activeOpacity={0.85}
          >
            <Text style={styles.circleResetText}>↺</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Plus button */}
        <Animated.View style={{ transform: [{ scale: scaleAdd }] }}>
          <TouchableOpacity
            style={[styles.circleButton, styles.addButton]}
            onPress={onAdd}
            onPressIn={() => {
              pressIn(scaleAdd);
              startAddHold();
            }}
            onPressOut={() => {
              pressOut(scaleAdd);
              stopHold();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.circleButtonText}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Film strip bottom */}
      <Sprocket />
    </Animated.View>
  );
}

export default function Index() {
  const [count, setCount] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ambient film flicker
  const flickerAnim = useRef(new Animated.Value(1)).current;
  // Flash on change
  const flashAnim = useRef(new Animated.Value(0)).current;
  // Reel spin
  const reelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous subtle flicker
    const flicker = () => {
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 0.93,
          duration: 80 + Math.random() * 120,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]).start(() => {
        setTimeout(flicker, 1500 + Math.random() * 3000);
      });
    };
    flicker();

    // Reel rotation
    Animated.loop(
      Animated.timing(reelAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  const triggerFlash = () => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAddHold = () => {
    stopHold();
    intervalRef.current = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 80);
  };

  const startMinusHold = () => {
    stopHold();
    intervalRef.current = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 80);
  };

  const onAdd = () => {
    setCount((prev) => prev + 1);
    triggerFlash();
  };

  const onMinus = () => {
    setCount((prev) => (prev > 0 ? prev - 1 : 0));
    triggerFlash();
  };

  const onReset = () => {
    setCount(100);
    triggerFlash();
  };

  const reelRotate = reelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0F00" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.parentContainer, { opacity: flickerAnim }]}
        >
          {/* Reel decoration */}
          <View style={styles.reelRow}>
            <Animated.Text
              style={[styles.reelEmoji, { transform: [{ rotate: reelRotate }] }]}
            >
              ◎
            </Animated.Text>
            <View style={styles.parentBadge}>
              <Text style={styles.badgeText}>◈  CINÉMA  ◈</Text>
            </View>
            <Animated.Text
              style={[styles.reelEmoji, { transform: [{ rotate: reelRotate }] }]}
            >
              ◎
            </Animated.Text>
          </View>

          <Text style={styles.parentTitle}>DIRECTOR'S CUT</Text>

          <View style={styles.stateCard}>
            <Text style={styles.stateLabel}>▸ STATE REEL ◂</Text>
            <Text style={styles.stateCount}>
              {String(count).padStart(3, "0")}
            </Text>
            <Text style={styles.stateSubLabel}>FRAMES REMAINING</Text>
          </View>

          <ChildComponent
            count={count}
            onAdd={onAdd}
            onMinus={onMinus}
            onReset={onReset}
            startAddHold={startAddHold}
            startMinusHold={startMinusHold}
            stopHold={stopHold}
            flashAnim={flashAnim}
          />

          {/* Bottom film credits */}
          <Text style={styles.credits}>
            © MMXXVI  ·  StillMotion Ave. Productions  ·  ALL FRAMES RESERVED
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BROWN_DARK = "#1A0F00";
const BROWN_MID = "#2C1A06";
const BROWN_WARM = "#4A2E0E";
const SEPIA = "#8B6340";
const SEPIA_LIGHT = "#C49A6C";
const CREAM = "#F2DEB8";
const CREAM_DIM = "#D4B896";
const AMBER = "#D4882A";
const AMBER_DARK = "#9E5F0E";
const RED_FILM = "#8B1C1C";
const REEL_GREY = "#2E2416";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BROWN_DARK,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 14,
  },

  parentContainer: {
    backgroundColor: BROWN_MID,
    borderWidth: 2,
    borderColor: SEPIA,
    borderRadius: 6,
    padding: 14,
    // Film vignette via border trick
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },

  reelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  reelEmoji: {
    fontSize: 28,
    color: SEPIA,
  },

  parentBadge: {
    backgroundColor: BROWN_WARM,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AMBER,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  badgeText: {
    color: AMBER,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },

  parentTitle: {
    color: CREAM,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 8,
    marginBottom: 14,
    textTransform: "uppercase",
  },

  stateCard: {
    backgroundColor: BROWN_DARK,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SEPIA,
    paddingVertical: 14,
    marginBottom: 14,
    alignItems: "center",
  },

  stateLabel: {
    color: SEPIA_LIGHT,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 4,
    marginBottom: 4,
  },

  stateCount: {
    color: AMBER,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 42,
    letterSpacing: 6,
    fontVariant: ["tabular-nums"],
  },

  stateSubLabel: {
    color: SEPIA,
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 2,
  },

  // Child / frame
  childContainer: {
    backgroundColor: REEL_GREY,
    borderWidth: 2,
    borderColor: SEPIA,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: "hidden",
  },

  // Sprocket holes
  sprocketRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 6,
  },

  sprocketHole: {
    width: 14,
    height: 10,
    backgroundColor: BROWN_DARK,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: SEPIA,
  },

  childBadge: {
    alignSelf: "center",
    backgroundColor: BROWN_WARM,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: SEPIA_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },

  childTitle: {
    color: CREAM_DIM,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 6,
    marginTop: 10,
  },

  infoText: {
    color: SEPIA,
    textAlign: "center",
    fontSize: 10,
    marginTop: 10,
    fontWeight: "600",
    letterSpacing: 4,
  },

  counterFrame: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },

  counterFrameCorner: {
    color: SEPIA,
    fontSize: 18,
    marginHorizontal: 10,
  },

  counterText: {
    color: CREAM,
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 8,
    fontVariant: ["tabular-nums"],
  },

  // Circular buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginVertical: 14,
  },

  circleButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },

  minusButton: {
    backgroundColor: RED_FILM,
    borderColor: "#C43030",
  },

  addButton: {
    backgroundColor: AMBER_DARK,
    borderColor: AMBER,
  },

  resetButton: {
    backgroundColor: BROWN_WARM,
    borderColor: SEPIA_LIGHT,
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  circleButtonText: {
    color: CREAM,
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 38,
    textAlign: "center",
  },

  circleResetText: {
    color: CREAM_DIM,
    fontSize: 26,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 30,
  },

  credits: {
    color: SEPIA,
    textAlign: "center",
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 14,
    fontWeight: "600",
  },
});

