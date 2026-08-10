---
title: How to turn Claude and Gemini AI chats into WHRNXT trip itineraries
description: Learn how to prompt Claude and Gemini to build customized travel plans and import them directly into WHRNXT with a single link.
kicker: Guide
date: 2026-08-10
topics:
  - AI
  - Claude
  - Gemini
  - Trip planning
---

Planning a trip with AI models like **Claude** or **Gemini** is fast, flexible, and fun — but reading through a long wall of text while walking around a city isn't. 

WHRNXT lets you bridge the gap: ask Claude or Gemini to generate a day-by-day plan, and import it straight into WHRNXT for offline maps, ordered walking routes, and shareable links.

---

## Why use Claude or Gemini for trip planning?

AI assistants excel at synthesizing recommendations based on your specific interests:
- **Tailored themes**: "Give me a 3-day itinerary focused on architecture and coffee in Tokyo."
- **Pacing constraints**: "Build a child-friendly day in London with maximum 3 stops."
- **Budget & dietary preferences**: "Plan 4 days in Rome featuring vegetarian neighborhood spots."

When you ask Claude or Gemini to structure the response for WHRNXT, you can turn that conversation into an interactive, offline-ready mobile itinerary in seconds.

---

## Step-by-Step: Prompting Claude or Gemini

### 1. Copy the Prompt
Copy and paste this prompt into Claude (claude.ai) or Gemini (gemini.google.com):

```text
Please create a day-by-day travel itinerary for [CITY NAME] for [NUMBER OF DAYS] days.
Format the output as a valid WHRNXT itinerary JSON object with the following structure:

{
  "title": "[Trip Title]",
  "days": [
    {
      "label": "Day 1: [Theme/Area]",
      "city": "[city-slug-e.g.-paris]",
      "date": "YYYY-MM-DD",
      "stops": [
        {
          "name": "[Spot Name]",
          "category": "sightseeing",
          "address": "[Full Address]",
          "latitude": 48.8584,
          "longitude": 2.2945
        }
      ]
    }
  ]
}

Categories can be: sightseeing, restaurant, cafe, nightlife, shopping, outdoor, museum, entertainment. Include valid latitude and longitude for each stop.
```

### 2. Copy the AI Response
The AI will generate the full itinerary structure for you. Copy the JSON snippet or the shared link output.

### 3. Import into WHRNXT
1. Open [WHRNXT](https://app.whrnxt.net) on your phone or browser.
2. Go to **Itineraries** → **⬇ Import from link**.
3. Paste the text/link and tap **Import**.

WHRNXT will automatically load all your spots, map out the walking routes, and let you re-order or optimize with one tap!

---

## Tips for Best Results

- **Specify exact locations**: Ask the AI to include exact street names or landmarks so geocoding and map coordinates are precise.
- **Set a home base**: Mention your hotel or cruise port so WHRNXT can calculate realistic travel times to your first stop.
- **Mix categories**: Ask for a mix of `sightseeing`, `cafe`, and `restaurant` stops for balanced days.
- **Offline access**: Once imported into WHRNXT, your entire itinerary is saved on your device — no Wi-Fi or data required while exploring.

---

[Open WHRNXT App]({{ site.appUrl }}) and import your first AI-generated itinerary today!
