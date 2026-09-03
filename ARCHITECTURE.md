# The Little Book of Us

The opening birthday cover is implemented at `/`. The remaining pages can be added as routes while keeping one shared story shell.

## Proposed structure

```text
src/
  App.jsx                 # router and shared page shell
  App.css                 # paper, typography, and motion styles
  index.css               # global reset and font imports
  data/story.js           # page copy, photos, songs, and memory metadata
  components/
    StoryShell.jsx        # top bar, chapter count, previous/next controls
    PageTurn.jsx          # Framer Motion page transitions
    LilyMark.jsx          # recurring lily illustration
    Teddy.jsx             # recurring teddy illustration
    AudioButton.jsx       # optional music control
  pages/
    01-intro/ ... 22-finale/  # one focused React page per chapter
  assets/
    photos/               # personal photos added later
    audio/                # optional birthday playlist
```

## Page map and interactions

1. **Intro** - Birthday greeting, lily, and teddy; opens page 2.
2. **The first hello** - A short memory; swipe or click to continue.
3. **Little things I notice** - Each item reveals a note.
4. **A lily garden** - Click flowers to reveal compliments.
5. **Teddy's pocket** - Click the pocket to find a tiny letter.
6. **Our timeline** - Scroll through important dates.
7. **The photo booth** - Tap cards to flip through shared photos.
8. **Reasons I smile** - Shuffle a stack of reasons.
9. **Soundtrack** - Play a song and read why it belongs here.
10. **This or that** - Choices unlock a hidden message.
11. **A tiny quiz** - Correct answers add stars.
12. **The constellation** - Connect dots to draw a heart.
13. **Open when happy** - A letter for the best kind of day.
14. **Open when tired** - A softer, calming letter with ambient motion.
15. **Wish list** - Future adventures become collectible stamps.
16. **Recipe for us** - Drag memory fragments into a recipe.
17. **The compliment machine** - A button generates a personal compliment.
18. **22 tiny wishes** - Each tap reveals another wish.
19. **Guestbook** - Friends leave notes in a local form.
20. **Birthday candles** - Click candles to make a wish.
21. **The almost-finale** - A collage of the journey so far.
22. **Finale** - Birthday letter, replay button, and keepsake download.

## Navigation model

`react-router-dom` will own `/`, `/chapter/2` through `/chapter/22`. `StoryShell` supplies the chapter counter and previous/next controls. Page-specific state stays inside each page; shared progress, opened chapters, and audio preference live in a small React context. Framer Motion animates page turns, Lenis handles long memory pages, and Lucide supplies interface icons. Three.js / React Three Fiber is reserved for the constellation page.

Personal photos, names, dates, and audio stay in `data/story.js` or the asset folders so the writing remains easy to personalize.
