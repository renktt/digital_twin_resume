# Voice Chat Debug Guide

## Issue Fixed: Continuous Listening Without Processing

### Problem
- System would continue listening indefinitely
- Speech wasn't being transcribed
- No processing triggered after speaking

### Root Causes Identified
1. **Silence threshold too high** - Background noise prevented detection
2. **No speech verification** - System tried to process before any speech
3. **Audio chunks not collected** - MediaRecorder timing issues
4. **No manual override** - Users couldn't force processing

---

## Fixes Applied

### 1. Adjusted Detection Settings
```typescript
silenceThreshold: 20  // Lowered from 25 (more sensitive)
silenceDuration: 1500 // Increased to 1.5s (more reliable)
soundThreshold: 30    // Clear speech detection
```

### 2. Added Speech Detection Tracking
- `hasDetectedSpeechRef` - Only processes after detecting actual speech
- Prevents false triggers on initial silence
- Requires volume > threshold + 10 for speech confirmation

### 3. Improved Logging
Console now shows:
- `🎧 Volume monitoring started` - Initial setup
- `🎙️ Sound detected! Volume: X` - When speech begins
- `⏳ Silence progress: X/Y checks` - Counting silence
- `🔇 Silence confirmed!` - When processing triggers
- `🔊 Sound resumed` - If speech continues

### 4. Added Manual Controls
**"Process Now" Button** - Forces immediate processing if auto-detection fails

### 5. Visual Feedback
- Green "🎙️ Speaking detected!" when voice is heard
- Status text shows "Speech detected - pause to process"
- Real-time volume bar shows audio input level

---

## Testing Instructions

### 1. Check Console Output
Open browser DevTools (F12) → Console tab

**Expected Flow:**
```
🎧 Volume monitoring started - Silence threshold: 20, Duration: 1500ms
🎙️ Sound detected! Volume: 45.3 (threshold: 30)
⏳ Silence progress: 5/15 checks, current volume: 12.4
⏳ Silence progress: 10/15 checks, current volume: 8.2
🔇 Silence confirmed! Checks: 15/15, Max volume was: 67.8, Audio chunks: 12
✅ Valid audio detected, processing now...
🛑 Recording stopped
```

### 2. Visual Indicators
Watch for these on screen:
- **Green pulsing circle** - Listening active
- **Volume bar fills** - Audio input detected
- **"🎙️ Speaking detected!"** - Your voice is heard
- **Status changes** - Listening → Processing → Speaking → Listening

### 3. Testing Steps

**Test A: Normal Voice Flow**
1. Click "Start Voice Chat"
2. Wait for "Listening..." status
3. **Speak your question clearly**
4. Watch for "🎙️ Speaking detected!" to appear
5. **Stop speaking and wait 1.5 seconds**
6. Should auto-process and show "Processing..."

**Test B: Manual Override**
1. If auto-detection doesn't work after speaking
2. Click the **"Process Now"** button (appears while listening)
3. Forces immediate processing of your audio

**Test C: Text Input Fallback**
1. If voice isn't working, use the text box
2. Type your question
3. Click "Send" button
4. Works identically to voice input

### 4. Troubleshooting

**Issue: "No speech detected yet"**
- Means: Volume too low or no sound detected
- Fix: Speak louder or check microphone permissions
- Manual: Click "Process Now" button

**Issue: "Audio too small (need >3KB)"**
- Means: Not enough audio collected
- Fix: Speak longer sentences (3-5 seconds)
- Check: MediaRecorder is working (console should show chunks)

**Issue: Stuck in "Listening..." forever**
- Means: Silence detection not triggering
- Fix 1: Click "Process Now" button
- Fix 2: Stop and restart voice chat
- Fix 3: Use text input as alternative

**Issue: Volume bar shows 0**
- Means: Microphone not working
- Fix: Check browser permissions
- Check: Microphone is selected in system settings
- Try: Refresh page and allow mic access

---

## Debug Checklist

When voice chat isn't working, check these in order:

- [ ] **Browser Console** - Any error messages?
- [ ] **Microphone Permission** - Green lock icon in address bar?
- [ ] **Volume Bar** - Does it move when you speak?
- [ ] **Speech Detection** - Does "🎙️ Speaking detected!" appear?
- [ ] **Audio Size** - Console shows "Audio blob size: X bytes" > 3000?
- [ ] **Silence Counter** - Console shows "⏳ Silence progress"?
- [ ] **Manual Button** - Does "Process Now" work?

---

## Common Scenarios

### Scenario 1: Quiet Environment (Low Volume)
**Symptoms:** Volume bar barely moves
**Solution:** 
- Lower silence threshold to 15
- Or speak closer to microphone
- Or use "Process Now" button

### Scenario 2: Noisy Environment
**Symptoms:** False silence detections, cuts off speech
**Solution:**
- Increase silence threshold to 25-30
- Increase silence duration to 2000ms
- Use settings gear icon to adjust

### Scenario 3: Fast Speakers
**Symptoms:** Processes mid-sentence
**Solution:**
- Increase silence duration to 2000-2500ms
- Adjust in settings panel

### Scenario 4: Slow/Pause Speakers
**Symptoms:** Processes before finishing question
**Solution:**
- Click "Process Now" when done speaking
- Or reduce silence duration to 1000ms

---

## Settings Customization

Click the ⚙️ Settings button to adjust:

- **Silence Threshold** (0-100)
  - Lower = more sensitive
  - Default: 20
  - Recommended: 15-25

- **Silence Duration** (ms)
  - How long to wait before processing
  - Default: 1500
  - Recommended: 1000-2000

- **TTS Rate** (0.1-2.0)
  - Speech speed
  - Default: 0.9
  - Recommended: 0.8-1.2

---

## Performance Tips

1. **Use headphones** - Prevents TTS feedback into microphone
2. **Quiet background** - Reduces false detections
3. **Clear speech** - Helps both STT and silence detection
4. **Pause clearly** - Makes silence detection reliable
5. **Watch indicators** - Visual feedback shows system state

---

## Advanced: Console Commands

Open DevTools Console and paste these to debug:

```javascript
// Check if microphone is active
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('✅ Mic working:', stream.getAudioTracks()[0]))
  .catch(err => console.error('❌ Mic error:', err));

// Check MediaRecorder support
console.log('MediaRecorder:', typeof MediaRecorder !== 'undefined' ? '✅ Supported' : '❌ Not supported');

// Check Web Speech API
console.log('SpeechSynthesis:', typeof speechSynthesis !== 'undefined' ? '✅ Supported' : '❌ Not supported');
```

---

## File Changes Summary

**Modified Files:**
1. `components/VoiceChatDigitalTwin.tsx`
   - Added speech detection tracking
   - Added manual "Process Now" button
   - Improved visual feedback
   - Better error handling

2. `lib/audioRecorder.ts`
   - Enhanced silence detection algorithm
   - Added comprehensive logging
   - Better volume monitoring
   - Sound-first detection

**Key Improvements:**
- Silence detection now requires speech first
- Manual override button for reliability
- Real-time visual feedback
- Extensive console logging for debugging
- Better threshold defaults (20/1500ms)

---

## Quick Reference

### States
- 🟢 **Idle** - Ready to start
- 🟢 **Listening** - Recording audio (green pulsing)
- 🟡 **Processing** - Transcribing & generating response
- 🔵 **Speaking** - Playing TTS response

### Key Thresholds
- **Min Audio Size:** 3000 bytes
- **Speech Threshold:** 30 (silence + 10)
- **Silence Threshold:** 20
- **Silence Duration:** 1500ms
- **Max Listen Time:** 15 seconds

### Console Symbols
- 🎧 Audio setup
- 🎙️ Speech detected
- 🔇 Silence confirmed
- ⏳ Waiting for silence
- 🔊 Sound resumed
- ✅ Success
- ⚠️ Warning
- ❌ Error
