# Audio Files for Quiz Engagement Enhancements

This directory contains audio files for the AWS re:Invent quiz application's engagement features, including background music and sound effects.

## Directory Structure

```
public/data/sfx/
├── README.md (this file)
├── background/     # Background music files
└── effects/        # Sound effect files
```

## Required Audio Files

### Background Music (`background/`)

Background music files should be placed in the `background/` subdirectory. These files play continuously during different quiz phases.

**Default Background Music Files:**
- `welcome-bg.mp3` - Plays on the Welcome Screen before quiz starts
- `quiz-bg.mp3` - Default background music for quiz questions (if not specified per-slide)
- `victory-bg.mp3` - Plays on the Summary Screen after quiz completion

**Custom Background Music:**
You can add custom background music files for specific slides or questions by:
1. Adding your audio file to the `background/` directory (e.g., `custom-music.mp3`)
2. Referencing the filename in the quiz data using the `backgroundMusic` property

**Example:**
```json
{
  "type": "quiz",
  "id": "q1",
  "question": "What is AWS Lambda?",
  "backgroundMusic": "custom-music.mp3",
  ...
}
```

### Sound Effects (`effects/`)

Sound effect files should be placed in the `effects/` subdirectory. These are short audio clips triggered by specific user interactions.

**Required Sound Effect Files:**
- `correct-answer.mp3` - Plays when user selects a correct answer
- `wrong-answer.mp3` - Plays when user selects an incorrect answer
- `emoji-fly.mp3` - Plays when emoji animation flies in
- `slide-transition.mp3` - Plays when navigating between slides

## Audio File Specifications

### Format
- **File Format:** MP3 (recommended for broad browser compatibility)
- **Alternative Formats:** OGG, WAV (also supported by Web Audio API)

### Background Music Specifications
- **Duration:** 30 seconds to 3 minutes (will loop automatically)
- **Bitrate:** 128-192 kbps (balance between quality and file size)
- **Sample Rate:** 44.1 kHz
- **Channels:** Stereo or Mono
- **Volume:** Normalized to -14 LUFS (prevents clipping, allows headroom for mixing)

### Sound Effect Specifications
- **Duration:** 0.5 to 3 seconds (short and punchy)
- **Bitrate:** 128 kbps
- **Sample Rate:** 44.1 kHz
- **Channels:** Stereo or Mono
- **Volume:** Normalized to -12 LUFS (slightly louder than background music for prominence)

## Audio System Features

### Background Music
- **Looping:** Background music loops continuously
- **Fade Transitions:** When changing tracks, the current track fades out over 1000ms and the new track fades in over 1000ms
- **Continuity:** If the same track is specified for consecutive slides, playback continues without interruption
- **Default Behavior:** If no `backgroundMusic` property is specified, the current track continues playing

### Sound Effects
- **Concurrent Playback:** Multiple sound effects can play simultaneously without clipping
- **No Overlap Issues:** Sound effects are managed using Web Audio API for optimal performance

### User Controls
- **Mute/Unmute:** Users can toggle audio on/off via the audio controls button
- **Persistence:** Mute preference is saved to localStorage and restored on page reload

## Missing Audio Files

The application is designed to handle missing audio files gracefully:
- If an audio file is not found, the application will log a warning to the console
- The quiz will continue functioning normally without audio
- No errors will be thrown that would interrupt the user experience

## Adding Audio Files

1. Obtain or create audio files that meet the specifications above
2. Place background music files in `public/data/sfx/background/`
3. Place sound effect files in `public/data/sfx/effects/`
4. Ensure filenames match exactly (case-sensitive)
5. For custom background music, reference the filename in your quiz data JSON

## Audio Configuration in Quiz Data

You can configure default audio settings in the quiz data JSON file:

```json
{
  "metadata": { ... },
  "slides": [ ... ],
  "audioConfig": {
    "welcomeMusic": "welcome-bg.mp3",
    "defaultQuizMusic": "quiz-bg.mp3",
    "victoryMusic": "victory-bg.mp3",
    "musicVolume": 0.7,
    "sfxVolume": 0.8
  }
}
```

**Audio Config Properties:**
- `welcomeMusic` - Background music for Welcome Screen (optional)
- `defaultQuizMusic` - Default background music for quiz slides (optional)
- `victoryMusic` - Background music for Summary Screen (optional)
- `musicVolume` - Volume level for background music, 0.0 to 1.0 (default: 0.7)
- `sfxVolume` - Volume level for sound effects, 0.0 to 1.0 (default: 0.8)

## Browser Compatibility

The audio system uses:
- **Web Audio API** for sound effects (Chrome 35+, Firefox 25+, Safari 14.1+, Edge 79+)
- **HTML5 Audio** for background music (universally supported)

All modern browsers are fully supported.

## Accessibility

- Audio is optional and can be muted by the user
- The quiz is fully functional without audio
- Visual feedback is always provided alongside audio feedback
- Audio controls are keyboard accessible and include ARIA labels

## Performance Notes

- Sound effects are preloaded and cached for optimal performance
- Background music streams as needed to minimize initial load time
- Audio playback uses hardware acceleration where available
- Maximum 3 concurrent sound effects to prevent performance degradation

## Troubleshooting

**Audio not playing:**
1. Check browser console for file loading errors
2. Verify audio files exist in the correct directories
3. Ensure filenames match exactly (case-sensitive)
4. Check that audio is not muted in the application
5. Verify browser supports Web Audio API

**Audio stuttering or glitching:**
1. Reduce audio file sizes (lower bitrate)
2. Ensure audio files are properly normalized
3. Check system resources (CPU/memory usage)

**Background music not transitioning smoothly:**
1. Verify fade duration is set appropriately (default: 1000ms)
2. Check that audio files don't have silence at the beginning/end
3. Ensure volume levels are normalized across all tracks

## License and Attribution

Ensure all audio files used in the application:
- Are properly licensed for use in your project
- Include appropriate attribution if required
- Comply with copyright and usage restrictions

---

For questions or issues related to the audio system, refer to the design document at `.kiro/specs/quiz-engagement-enhancements/design.md`.
