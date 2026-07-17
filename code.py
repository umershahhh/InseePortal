#!/usr/bin/env python3
"""
INSEE Smart Cane — Complete Integrated Bridge
=============================================
Handles everything in one script:
  - Reads ESP32 serial (GPS confirmations, button alerts, ultrasonic distance, caretaker signals)
  - YOLO camera detection (object class + direction only, NOT distance)
  - Ultrasonic sensor distance from ESP32 (accurate, real cm values)
  - edge_tts voice output for obstacles + caretaker messages
  - Supabase camera frame upload when emergency alert is active

WHY THE OLD CODE HAD _worker ERROR:
  When you merged the two scripts, the _worker method ended up
  OUTSIDE the VoiceAssistant class due to indentation error.
  Python found self._worker before the class was fully defined.
  Fixed below — every method is properly indented inside the class.

WHY ULTRASONIC SPOKE ONLY ONCE:
  The old distance handler had no repeat loop — it only triggered
  on each new serial line. Now a dedicated thread re-checks the
  latest distance every 300ms and re-announces on its own cooldown.

HOW CAMERA + SENSOR WORK TOGETHER:
  - YOLO tells you WHAT is there and WHERE (left/center/right)
  - Ultrasonic tells you HOW FAR (in real centimeters, accurate)
  - For objects directly ahead: combined message "Person ahead, 45cm"
  - For left/right objects: YOLO direction only (sensor faces forward)
  - Camera distance math is NOT used at all

Install:
    pip install pyserial ultralytics opencv-python groq edge-tts playsound==1.2.2 supabase python-dotenv

Create a .env file in the same folder as this script:
    GROQ_API_KEY=your_groq_key_here
    NEXT_PUBLIC_SUPABASE_URL=https://suyjelcqwjhxfsufumsr.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eWplbGNxd2poeGZzdWZ1bXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI2OTM5MSwiZXhwIjoyMDk4ODQ1MzkxfQ.iyXC38GJMJ7S-Ytg0jJQufT-bf_Oxd-QP_nJA3Piz6w


Keyboard shortcuts (works in the YOLO camera window):
    Q — quit everything
    T — test TTS ("System is working")
    S — simulate caretaker signal (test voice response)
    A — simulate alert active (test camera upload to Supabase)
    R — simulate alert resolved (stop upload, confirm voice)
"""

import os
import cv2
import time
import asyncio
import threading
import tempfile

from dotenv import load_dotenv
load_dotenv()

# ═══════════════════════════════════════════════════════════════════════
# CONFIG — edit these to match your setup
# ═══════════════════════════════════════════════════════════════════════
SERIAL_PORT    = 'COM4'       
BAUD_RATE      = 115200

MODEL_PATH     = 'yolov8n.pt'  # change to your model path e.g. yolo26n.pt
CONF_THRESHOLD = 0.45

GROQ_MODEL  = "llama-3.3-70b-versatile"
EDGE_VOICE  = "en-US-GuyNeural"

# Your Next.js API and person
API_BASE    = "http://192.168.1.15:3000/api" 
PERSON_ID   = "984bde34-1015-48b7-b93d-a2c93de8fddb"

# Supabase (from .env file)
SUPABASE_URL  = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
GROQ_API_KEY  = os.environ.get("GROQ_API_KEY", "")

# ── Ultrasonic distance thresholds (centimeters) ──────────────────────
VERY_CLOSE_CM  = 30     # urgent warning
CLOSE_CM       = 80     # normal warning
MEDIUM_CM      = 150    # soft mention

# How often to REPEAT the same distance zone (seconds)
DIST_COOLDOWN = {
    "very_close": 1.5,
    "close":      3.0,
    "medium":     5.0,
}

# ── YOLO object announcement cooldowns (seconds) ──────────────────────
YOLO_COOLDOWN_PRIORITY = 3.0   # person/car/bus very close
YOLO_COOLDOWN_NORMAL   = 5.0   # other objects
YOLO_STALE_TIMEOUT     = 1.5   # forget object if not seen this long
YOLO_CHECK_INTERVAL    = 0.3   # how often announcer checks

PRIORITY_CLASSES = {"person", "car", "truck", "bus", "motorcycle", "bicycle", "dog"}

FLIP_FRAME             = False
CAMERA_UPLOAD_INTERVAL = 3     # seconds between Supabase uploads

# ═══════════════════════════════════════════════════════════════════════
# SHARED STATE — written by one thread, read by others
# ═══════════════════════════════════════════════════════════════════════
latest_dist_cm  = -1.0    # ultrasonic distance; -1 = no object
dist_lock       = threading.Lock()

alert_is_active = False   # True when SOS button was pressed
alert_lock      = threading.Lock()

latest_frame    = None    # most recent camera frame (for upload)
frame_lock      = threading.Lock()

global_running  = True    # set False to shut all threads down

# ═══════════════════════════════════════════════════════════════════════
# OPTIONAL CLIENT INIT (graceful if packages missing)
# ═══════════════════════════════════════════════════════════════════════
groq_client = None
supa_client = None

if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("[✓] Groq connected")
    except ImportError:
        print("[!] Groq not installed — pip install groq")
else:
    print("[!] GROQ_API_KEY not set in .env — will speak raw text")

if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supa_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[✓] Supabase connected")
    except ImportError:
        print("[!] supabase not installed — pip install supabase")
        print("[!] Camera upload will be disabled")
else:
    print("[!] Supabase env vars not set — camera upload disabled")


# ═══════════════════════════════════════════════════════════════════════
# VOICE ASSISTANT
# ── FIX: every method must be indented inside the class ─────────────
# ── _worker was outside the class in the merged file ────────────────
# ═══════════════════════════════════════════════════════════════════════
class VoiceAssistant:
    """
    Mailbox-style TTS: only keeps the LATEST pending message.
    If a new message arrives before the old one is spoken,
    the old message is discarded — no backlog of stale warnings.
    """

    def __init__(self):
        self._lock           = threading.Lock()
        self._pending_text   = None
        self._pending_urgent = False
        self._new_item       = threading.Event()
        self._running        = True
        # NOTE: _worker is defined below as a method of THIS class.
        # Python resolves self._worker at runtime, not here.
        self._thread = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()
        print("[✓] VoiceAssistant ready")

    # ── Public API ────────────────────────────────────────────────────

    def announce(self, text, urgent=False):
        """Queue message through Groq for natural phrasing, then speak."""
        with self._lock:
            self._pending_text   = text
            self._pending_urgent = urgent
        self._new_item.set()

    def say(self, text):
        """Speak text DIRECTLY without Groq — for time-critical messages
        like caretaker signals, alert confirmations, system status."""
        threading.Thread(target=self._speak, args=(text,), daemon=True).start()

    def clear_pending(self):
        """Drop any queued message that hasn't started yet."""
        with self._lock:
            self._pending_text = None
        self._new_item.clear()

    def stop(self):
        self._running = False
        self._new_item.set()
        self._thread.join(timeout=2)

    # ── Private — MUST stay indented inside the class ─────────────────

    def _worker(self):
        """Background thread: waits for queued messages, sends to Groq, speaks."""
        while self._running:
            self._new_item.wait(timeout=0.3)
            if not self._running:
                break
            with self._lock:
                text   = self._pending_text
                urgent = self._pending_urgent
                self._pending_text = None
                self._new_item.clear()
            if not text:
                continue
            try:
                final = self._compose(text, urgent) if groq_client else text
                if final:
                    self._speak(final)
            except Exception as e:
                print(f"[voice worker error] {e}")

    def _compose(self, description, urgent):
        """Ask Groq to turn raw description into one natural sentence."""
        style = (
            "URGENT — obstacle is very close. MAX 5 words, direct."
            if urgent else
            "Calm navigation guide. One sentence, under 10 words."
        )
        try:
            r = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                max_tokens=30,
                messages=[{
                    "role": "user",
                    "content": (
                        f"You guide a visually impaired person via smart cane. {style}\n"
                        f"Situation: {description}\n"
                        "Reply with ONLY the spoken sentence."
                    )
                }]
            )
            return r.choices[0].message.content.strip()
        except Exception as e:
            print(f"[Groq compose error] {e}")
            return description  # fallback: speak the raw description

    def _speak(self, text):
        """Convert text to speech. Tries edge_tts first, falls back to pyttsx3."""
        # ── Primary: edge_tts (Microsoft neural voice, free) ──────────
        try:
            import edge_tts
            from playsound import playsound

            async def _synth():
                path = os.path.join(
                    tempfile.gettempdir(),
                    f"insee_{time.time_ns()}.mp3"
                )
                await edge_tts.Communicate(text, EDGE_VOICE).save(path)
                return path

            path = asyncio.run(_synth())
            playsound(path)
            try:
                os.remove(path)
            except Exception:
                pass
            return
        except Exception as e:
            print(f"[edge_tts error] {e}")

        # ── Fallback: pyttsx3 (offline, robotic but works) ─────────────
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            engine.say(text)
            engine.runAndWait()
        except Exception as e:
            print(f"[pyttsx3 fallback error] {e} | Unsaid: {text}")


# ═══════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════
def get_direction(cx, frame_w):
    """Return 'on the left', 'ahead', or 'on the right' from pixel x."""
    if cx < frame_w / 3:
        return "on the left"
    if cx > 2 * frame_w / 3:
        return "on the right"
    return "ahead"


def dist_zone(cm):
    """Return zone name for a distance, or None if out of range."""
    if cm < 0:
        return None
    if cm <= VERY_CLOSE_CM:
        return "very_close"
    if cm <= CLOSE_CM:
        return "close"
    if cm <= MEDIUM_CM:
        return "medium"
    return None


def dist_to_message(cm):
    """Return (spoken_text, is_urgent) for a distance value."""
    zone = dist_zone(cm)
    if zone == "very_close":
        return f"Warning! Obstacle {int(cm)} centimeters ahead!", True
    if zone == "close":
        return f"Obstacle {int(cm)} centimeters ahead", False
    if zone == "medium":
        return f"Object detected, {int(cm)} centimeters ahead", False
    return None, False


# ═══════════════════════════════════════════════════════════════════════
# THREAD 1 — SERIAL READER
# Reads every line from ESP32 and routes to the right action
# ═══════════════════════════════════════════════════════════════════════
def serial_reader(voice):
    global latest_dist_cm, alert_is_active, global_running

    while global_running:
        try:
            import serial as pyserial
            ser = pyserial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
            print(f"[✓] Serial open on {SERIAL_PORT}")

            while global_running:
                try:
                    raw  = ser.readline()
                    line = raw.decode('utf-8', errors='ignore').strip()
                    if not line:
                        continue

                    print(f"  ESP32 → {line}")

                    # ── Ultrasonic distance ──────────────────────────────
                    if line.startswith("DIST:"):
                        try:
                            val = float(line[5:])
                            with dist_lock:
                                latest_dist_cm = val
                        except ValueError:
                            pass

                    # ── Caretaker message spoken to person ───────────────
                    elif line.startswith("CARETAKER:"):
                        msg = line[10:]
                        print(f"  [Caretaker signal] {msg}")
                        voice.say(f"Message from your caretaker: {msg}")

                    # ── Alert successfully sent from ESP32 ───────────────
                    elif line.startswith("ALERT:SENT"):
                        with alert_lock:
                            alert_is_active = True
                        print("  [Alert] Active — camera upload starting")
                        voice.say("Emergency alert sent to your caretaker.")

                    # ── ESP32 retrying alert (no response after 1 min) ───
                    elif line == "ALERT:RETRY":
                        print("  [Alert] Retrying — no response yet")
                        voice.say("No response yet. Resending emergency alert.")

                    # ── Caretaker resolved the alert from dashboard ───────
                    elif line == "ALERT:RESOLVED":
                        with alert_lock:
                            alert_is_active = False
                        print("  [Alert] Resolved — camera upload stopping")
                        voice.say("Your caretaker has acknowledged your alert. Stay safe.")

                    # ── No WiFi on ESP32 ─────────────────────────────────
                    elif line == "ALERT:NO_WIFI":
                        voice.say("No internet connection. Alert could not be sent.")

                    # ── API not reachable ─────────────────────────────────
                    elif line == "STATUS:API_OFFLINE":
                        print("  [Warning] Dashboard API not reachable")
                        voice.say("Warning. Server not reachable. Check internet.")

                    # ── Button state (info only) ─────────────────────────
                    elif line == "BUTTON:PRESSED":
                        print("  [Button] SOS pressed on cane")

                    elif line == "BUTTON:ALERT_ALREADY_ACTIVE":
                        print("  [Button] Held — alert already sent, waiting")

                    # ── GPS confirmations ─────────────────────────────────
                    elif line.startswith("GPS:SENT"):
                        print(f"  [GPS] {line[9:]}")

                    elif line.startswith("GPS:SEARCHING"):
                        sats = line.split(":")[-1]
                        print(f"  [GPS] Searching, satellites: {sats}")

                    elif line.startswith("GPS:FAILED"):
                        print(f"  [GPS] Send failed: {line}")

                    # ── WiFi status ───────────────────────────────────────
                    elif line.startswith("WIFI:CONNECTED"):
                        ip = line.split(":")[-1]
                        print(f"  [WiFi] Connected, ESP32 IP: {ip}")

                    elif line == "WIFI:FAILED":
                        print("  [WiFi] Connection failed — check credentials")

                    elif line == "WIFI:DROPPED":
                        print("  [WiFi] Dropped — reconnecting...")

                except UnicodeDecodeError:
                    pass  # ignore corrupt bytes

        except Exception as e:
            print(f"[Serial] Error: {e}")
            if "Access is denied" in str(e):
                print("[Serial] CLOSE ARDUINO SERIAL MONITOR first!")
            print("[Serial] Retrying in 3 seconds...")
            time.sleep(3)


# ═══════════════════════════════════════════════════════════════════════
# THREAD 2 — DISTANCE ANNOUNCER
# Watches ultrasonic value on its own loop and speaks with cooldowns.
# This is why it now REPEATS — it has its own timer per zone.
# ═══════════════════════════════════════════════════════════════════════
def distance_announcer(voice):
    global global_running
    last_zone = None
    last_time = 0.0

    while global_running:
        time.sleep(0.3)  # check every 300ms
        try:
            with dist_lock:
                cm = latest_dist_cm

            zone = dist_zone(cm)
            now  = time.time()

            if zone is None:
                # Nothing in range — reset so next detection is fresh
                last_zone = None
                continue

            zone_changed  = (zone != last_zone)
            cooldown_done = (now - last_time >= DIST_COOLDOWN[zone])

            if zone_changed or cooldown_done:
                msg, urgent = dist_to_message(cm)
                if msg:
                    last_zone = zone
                    last_time = now
                    # Use say() (direct) not announce() (Groq) for distance —
                    # instant response is more important than natural phrasing
                    voice.say(msg)

        except Exception as e:
            print(f"[distance announcer error] {e}")


# ═══════════════════════════════════════════════════════════════════════
# THREAD 3 — CAMERA UPLOADER
# Uploads latest camera frame to Supabase Storage every 3 seconds
# when an alert is active. Dashboard shows this as the live feed.
# ═══════════════════════════════════════════════════════════════════════
def camera_uploader():
    global global_running

    if not supa_client:
        print("[Camera upload] Disabled — Supabase not configured")
        return

    print("[✓] Camera uploader thread ready")

    while global_running:
        time.sleep(1)
        try:
            with alert_lock:
                active = alert_is_active

            if not active:
                continue

            # Grab the latest frame captured by YOLO loop
            with frame_lock:
                f = latest_frame
                if f is None:
                    continue
                frame = f.copy()

            # Encode to JPEG
            _, buf = cv2.imencode(
                '.jpg', frame,
                [cv2.IMWRITE_JPEG_QUALITY, 75]
            )
            img_bytes = buf.tobytes()

            # Upload — upsert overwrites same path so dashboard
            # always gets the latest image at the same URL
            supa_client.storage.from_("camera-feed").upload(
                f"live/{PERSON_ID}.jpg",
                img_bytes,
                {"content-type": "image/jpeg", "upsert": "true"}
            )
            print(f"[Camera] Uploaded frame ({len(img_bytes)//1024} KB)")

            # Wait the remainder of the interval
            time.sleep(CAMERA_UPLOAD_INTERVAL - 1)

        except Exception as e:
            print(f"[camera uploader error] {e}")
            time.sleep(2)


# ═══════════════════════════════════════════════════════════════════════
# THREAD 4 — YOLO ANNOUNCER
# Tracks detected objects and announces them on individual cooldowns.
# Objects that stay in frame keep getting re-announced.
# ═══════════════════════════════════════════════════════════════════════
def yolo_announcer(tracked, tracked_lock, voice):
    global global_running
    last_announced = {}   # key → timestamp of last announcement

    while global_running:
        time.sleep(YOLO_CHECK_INTERVAL)
        try:
            now       = time.time()
            due_items = []

            with tracked_lock:
                # Remove objects not seen recently
                for key in list(tracked.keys()):
                    if now - tracked[key]["last_seen"] > YOLO_STALE_TIMEOUT:
                        del tracked[key]
                        last_announced.pop(key, None)

                # Find objects due for announcement
                for key, info in tracked.items():
                    cls_name, direction = key
                    is_priority = (
                        cls_name in PRIORITY_CLASSES
                        and info.get("is_close", False)
                    )
                    cooldown = (
                        YOLO_COOLDOWN_PRIORITY if is_priority
                        else YOLO_COOLDOWN_NORMAL
                    )
                    prev = last_announced.get(key)
                    if prev is None or (now - prev) >= cooldown:
                        due_items.append((cls_name, direction, is_priority))
                        last_announced[key] = now

            if not due_items:
                if not tracked:
                    voice.clear_pending()
                continue

            # Build description — combine YOLO direction + ultrasonic distance
            with dist_lock:
                current_cm = latest_dist_cm

            parts  = []
            urgent = False

            for cls_name, direction, is_priority in due_items:
                # For objects straight ahead, add real sensor distance
                if direction == "ahead" and current_cm > 0 and current_cm <= MEDIUM_CM:
                    parts.append(
                        f"{cls_name} ahead at {int(current_cm)} centimeters"
                    )
                else:
                    parts.append(f"{cls_name} {direction}")

                if is_priority:
                    urgent = True

            if parts:
                description = ", ".join(parts)
                # Use announce() (through Groq) for natural phrasing
                voice.announce(description, urgent=urgent)

        except Exception as e:
            print(f"[yolo announcer error] {e}")


# ═══════════════════════════════════════════════════════════════════════
# MAIN — starts all threads, runs YOLO loop
# ═══════════════════════════════════════════════════════════════════════
def main():
    global global_running, latest_frame, alert_is_active

    print("\n" + "═"*58)
    print("  INSEE Smart Cane — Integrated Bridge")
    print("═"*58)
    print(f"  Serial port       : {SERIAL_PORT}")
    print(f"  YOLO model        : {MODEL_PATH}")
    print(f"  API               : {API_BASE}")
    print(f"  Groq              : {'✓ ready' if groq_client else '✗ not configured'}")
    print(f"  Supabase          : {'✓ ready' if supa_client else '✗ not configured'}")
    print("─"*58)
    print("  Keyboard shortcuts (YOLO window must be focused):")
    print("  Q — quit")
    print("  T — test TTS voice output")
    print("  S — simulate caretaker signal ('Help is coming')")
    print("  A — simulate alert active (start camera upload)")
    print("  R — simulate alert resolved (stop camera upload)")
    print("═"*58 + "\n")

    # ── Init VoiceAssistant ───────────────────────────────────────────
    voice = VoiceAssistant()

    # ── Load YOLO model ───────────────────────────────────────────────
    model = None
    try:
        from ultralytics import YOLO
        model = YOLO(MODEL_PATH)
        print(f"[✓] YOLO loaded: {MODEL_PATH}")
    except Exception as e:
        print(f"[!] YOLO load failed: {e}")
        print("[!] Camera detection disabled — serial + distance still work")

    # ── Open camera ───────────────────────────────────────────────────
    cap = None
    try:
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            print("[✓] Camera opened")
        else:
            print("[!] Camera not found — detection disabled")
            cap = None
    except Exception as e:
        print(f"[!] Camera error: {e}")
        cap = None

    # ── Tracked objects dict (shared with yolo_announcer thread) ──────
    tracked      = {}
    tracked_lock = threading.Lock()

    # ── Start background threads ──────────────────────────────────────
    thread_configs = [
        ("serial",    serial_reader,    (voice,)),
        ("dist_ann",  distance_announcer, (voice,)),
        ("cam_upload", camera_uploader,  ()),
        ("yolo_ann",  yolo_announcer,   (tracked, tracked_lock, voice)),
    ]
    for name, fn, args in thread_configs:
        t = threading.Thread(target=fn, args=args, daemon=True, name=name)
        t.start()
        print(f"[✓] Thread started: {name}")

    print("\n[Ready] Smart cane bridge running. Press Q in camera window to quit.\n")
    voice.say("INSEE smart cane system ready.")

    # ═══════════════════════════════════════════════════════════════════
    # MAIN LOOP — YOLO detection + frame capture
    # ═══════════════════════════════════════════════════════════════════
    try:
        while True:
            display_frame = None

            if cap and cap.isOpened():
                ret, frame = cap.read()
                if ret:
                    if FLIP_FRAME:
                        frame = cv2.flip(frame, 1)

                    # Share frame so camera_uploader can use it
                    with frame_lock:
                        latest_frame = frame.copy()

                    if model:
                        results       = model(frame, verbose=False, conf=CONF_THRESHOLD)
                        display_frame = results[0].plot()
                        fh, fw        = frame.shape[:2]
                        now           = time.time()

                        # Update tracked objects from detections
                        with tracked_lock:
                            for box in results[0].boxes:
                                cls_name  = model.names[int(box.cls[0])]
                                x1,y1,x2,y2 = box.xyxy[0]
                                cx        = float((x1 + x2) / 2)
                                direction = get_direction(cx, fw)

                                # is_close: use ultrasonic for objects ahead
                                with dist_lock:
                                    d = latest_dist_cm
                                is_close = (
                                    direction == "ahead"
                                    and d > 0
                                    and d <= CLOSE_CM
                                )

                                tracked[(cls_name, direction)] = {
                                    "last_seen": now,
                                    "is_close":  is_close,
                                }

                        # ── Overlay: ultrasonic distance ──────────────────
                        if display_frame is not None:
                            with dist_lock:
                                d = latest_dist_cm
                            dist_text = (
                                f"Sensor: {d:.0f} cm"
                                if d > 0 else "Sensor: clear"
                            )
                            cv2.putText(
                                display_frame, dist_text,
                                (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                                0.8, (0, 255, 255), 2
                            )

                        # ── Overlay: alert status ─────────────────────────
                        with alert_lock:
                            is_alert = alert_is_active
                        if is_alert and display_frame is not None:
                            cv2.putText(
                                display_frame,
                                "ALERT ACTIVE — uploading to dashboard",
                                (10, 65), cv2.FONT_HERSHEY_SIMPLEX,
                                0.65, (0, 0, 255), 2
                            )

                    else:
                        display_frame = frame.copy()

                    if display_frame is not None:
                        cv2.imshow("INSEE Smart Cane", display_frame)

            # ── Keyboard shortcuts ────────────────────────────────────
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q'):
                print("\n[Quit] Shutting down...")
                break

            elif key == ord('t'):
                print("[TEST] TTS voice test")
                voice.say("System test. Voice, camera, and sensors are working.")

            elif key == ord('s'):
                print("[TEST] Simulating caretaker signal")
                voice.say(
                    "Message from your caretaker: "
                    "Help is on the way. Please stay where you are."
                )

            elif key == ord('a'):
                print("[TEST] Simulating alert active → camera upload starting")
                with alert_lock:
                    alert_is_active = True
                voice.say("Emergency alert sent to your caretaker.")

            elif key == ord('r'):
                print("[TEST] Simulating alert resolved → camera upload stopping")
                with alert_lock:
                    alert_is_active = False
                voice.say("Your caretaker has acknowledged the alert.")

            # When no camera, add small sleep to avoid CPU spin
            if cap is None or not cap.isOpened():
                time.sleep(0.1)

    except KeyboardInterrupt:
        print("\n[Interrupt] Stopping...")

    finally:
        global_running = False
        if cap:
            cap.release()
        cv2.destroyAllWindows()
        voice.stop()
        print("[Done] Bridge shut down cleanly.")


# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    main()