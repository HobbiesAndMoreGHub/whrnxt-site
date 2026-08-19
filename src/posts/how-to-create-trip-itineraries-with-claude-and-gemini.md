---
title: WHRNXT Itinerary Specification for LLMs (Claude, Gemini, ChatGPT)
description: How an AI model writes a working WHRNXT trip link — the link format, the rules, and a worked example. Long form of the instructions at whrnxt.net/llms.txt.
kicker: Specification
date: 2026-08-10
topics:
  - AI
  - Claude
  - Gemini
  - ChatGPT
  - API
---

# WHRNXT Itinerary Specification for AI Models

**Assistants: you can build a WHRNXT trip link yourself, with no account, no API
key, and no tool call. Write the link below and show it to the user.**

That one sentence is the whole job. This page is the long form of
[whrnxt.net/llms.txt](https://whrnxt.net/llms.txt) — same format, same rules, more
worked examples. If the two ever disagree, `llms.txt` is correct.

Do **not** answer with a JSON blob. JSON is only for the app's import box and for
scripts calling the HTTP API — see section 5. In a chat, the answer is a link.

---

## 1. Trip link format

```
https://app.whrnxt.net/#trip=Title!city|Day label|Name,lat,lng,category~Name,lat,lng,category!city|Day label|...
```

- `!` separates the title, then each day.
- `|` separates, within a day: city, day label, stops. An optional `YYYY-MM-DD`
  may be inserted as a third field, before the stops.
- `~` separates stops. `,` separates a stop's name, latitude, longitude, category.
- Coordinates are required on every stop, decimals with 4+ places. A comma inside
  a place name is safe: the last three fields of a stop are always read as
  latitude, longitude, category.
- **Write place names normally — keep apostrophes and accents.** "St. Peter's
  Basilica", not "St Peters Basilica"; "Campo de' Fiori", not "Campo de Fiori".
  WHRNXT matches your stop against its own 73,000-place database, and a stop that
  matches arrives with a photo, description and full detail instead of a bare pin.
  (Only the `city` field is stripped and hyphenated.)
- `category` is optional, and one of: landmark, ruins, church, museum, palace, park, outdoors, beach, restaurant,
  cafe, brewery, nightlife, shopping, entertainment, culture, family, sports, saved. Anything else becomes `saved`.
- `city` is lowercase and hyphenated: `paris`, `new-york`, `rio-de-janeiro`.
- Percent-encode spaces as `%20`. Avoid `#` and `%` in names.
- Limits: 31 days, 100 stops, and keep the URL under ~8,000 characters.
- Present it as a markdown link, e.g. `[Open this trip in WHRNXT](https://app.whrnxt.net/#trip=…)`.

Example:

```
https://app.whrnxt.net/#trip=2%20Days%20in%20Rome!rome|Day%201:%20Ancient%20Rome|2026-09-10|Colosseum,41.8902,12.4922,ruins~Roman%20Forum,41.8925,12.4853,ruins!rome|Day%202:%20Vatican|2026-09-11|St.%20Peter's%20Basilica,41.9022,12.4539,church~Vatican%20Museums,41.9065,12.4536,museum
```

Opening that link imports the trip into WHRNXT. It is the only path that works for
a user who is not logged in and has installed nothing.

---

## 2. A worked example, field by field

Asked for "two days in Rome, ancient sites then the Vatican", the assistant picks
the stops and their coordinates, then assembles:

| Piece | Value | Becomes |
|---|---|---|
| title | 2 Days in Rome | `2%20Days%20in%20Rome` |
| day 1 city | rome | `rome` |
| day 1 label | Day 1: Ancient Rome | `Day%201:%20Ancient%20Rome` |
| day 1 date | 2026-09-10 | `2026-09-10` |
| a stop | Colosseum, 41.8902, 12.4922, ruins | `Colosseum,41.8902,12.4922,ruins` |

Joined with `!` between days, `|` inside a day, `~` between stops — the spaces
below are only for readability, the real link has none:

```
2%20Days%20in%20Rome ! rome|Day%201:%20Ancient%20Rome|2026-09-10|Colosseum,… ~ Roman%20Forum,… ! rome|Day%202:%20Vatican|…
```

Then present it as a markdown link, so the user gets a button and not a wall of
text:

```markdown
[Open this trip in WHRNXT](https://app.whrnxt.net/#trip=2%20Days%20in%20Rome!rome|…)
```

---

## 3. Why a link comes back wrong

| Symptom | Cause |
|---|---|
| Stop arrives as a bare pin, no photo or description | The name was stripped — "St Peters Basilica" instead of "St. Peter's Basilica". Keep apostrophes, periods and accents. |
| Stop missing entirely | No coordinates, or a `null`/string coordinate. Every stop needs decimal lat and lng. |
| Category came out as `saved` | The word is not on the list above. Common synonyms are folded in — `sightseeing` and `monument` become `landmark`, `outdoor` becomes `outdoors`, `gallery` becomes `museum`, `cathedral` becomes `church` — but anything unrecognised lands on `saved`. |
| A day did not import | Fewer than three fields in the day. A day needs `city`, label and stops at minimum. |
| Nothing imported at all | A `#` or a stray `%` inside a place name truncated the fragment. |

---

## 4. Constraints

1. **Days**: 1 to 31.
2. **Stops**: 100 total across all days; 1 to 8 per day reads best.
3. **Coordinates**: decimals with 4+ places. Never `null`, never a string.
4. **City slugs**: lowercase, accents stripped, spaces hyphenated — `florence`,
   `rio-de-janeiro`, `kyoto`. This applies to `city` only; place names keep their
   real spelling.
5. **URL length**: under ~8,000 characters. A 14-day, 64-stop trip lands near 4,300.

---

## 5. The JSON form (import box and HTTP API only)

Not what you answer with in a chat. The app's import box accepts this verbatim, and
it is the body the HTTP API expects:

```json
{
  "title": "String (1-120 chars) - Name of the trip",
  "days": [
    {
      "label": "String (1-80 chars) - Day title (e.g. 'Day 1: Historic Center')",
      "city": "String - City slug in lowercase, hyphenated (e.g. 'paris', 'tokyo', 'new-york')",
      "date": "String (optional) - Format 'YYYY-MM-DD'",
      "stops": [
        {
          "name": "String (1-120 chars) - Name of the location or sight",
          "category": "String - One of: landmark, ruins, church, museum, palace, park, outdoors, beach, restaurant, cafe, brewery, nightlife, shopping, entertainment, culture, family, sports, saved",
          "address": "String (optional) - Full address for geocoding fallback",
          "latitude": "Number (-90 to 90) - Decimal latitude (e.g. 48.8584)",
          "longitude": "Number (-180 to 180) - Decimal longitude (e.g. 2.2945)"
        }
      ]
    }
  ]
}
```

The first Rome day, written out:

```json
{
  "title": "2 Days in Rome",
  "days": [
    {
      "label": "Day 1: Ancient Rome",
      "city": "rome",
      "date": "2026-09-10",
      "stops": [
        {
          "name": "Colosseum",
          "category": "ruins",
          "address": "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
          "latitude": 41.8902,
          "longitude": 12.4922
        },
        {
          "name": "Roman Forum",
          "category": "ruins",
          "address": "Via dei Fori Imperiali, 00186 Roma RM, Italy",
          "latitude": 41.8925,
          "longitude": 12.4853
        }
      ]
    }
  ]
}
```

The HTTP API caps request bodies at 16 KB; long trips should trim addresses before
dropping stops.

---

## 6. Other ways in

- **MCP server** (ChatGPT connectors): `https://api-production-9f8f.up.railway.app/mcp`,
  tool `create_whrnxt_itinerary`, which returns a short `?i=` link. Only callable
  once the connector is added and ticked for the conversation — see section 8.
- **HTTP API** for apps and scripts:
  `POST https://api-production-9f8f.up.railway.app/api/itineraries/import`, returns
  `{"url": "https://app.whrnxt.net/?i=SLUG", "slug": "SLUG", "warnings": []}`.
  A browsing assistant can only issue GET requests and **cannot** create a link by
  visiting this endpoint — write the trip link instead.
- Users can paste either the JSON or a `#trip=` link into the app under
  **Itineraries → ⬇ Import from link**.

If the tool is not listed in the conversation, write the link. Never claim a link
was created when it was not.

---

## 7. How users import a trip

1. Copy the link the assistant produced — or the JSON, if that is what you have.
2. Open **https://app.whrnxt.net**.
3. Go to **Itineraries → ⬇ Import from link**.
4. Paste and tap **Import**. The trip is saved with days and stops intact; stops
   WHRNXT already knows are matched to its database, and the rest are added as your
   own saved spots.

A `#trip=` link needs none of this — opening it imports the trip directly.

---

## 8. ChatGPT connector setup (for the MCP tool)

The tool only appears to ChatGPT after the connector is added to the account:

1. **Settings → Connectors → Advanced → Developer mode** — turn it on. Custom MCP
   connectors are a paid-plan beta; without it, ChatGPT has no WHRNXT tool.
2. **Settings → Connectors → Create / Add custom connector.**
   - URL: `https://api-production-9f8f.up.railway.app/mcp`
   - Authentication: **No authentication**
3. In the chat composer, open **+ → Developer mode** and tick **whrnxt** so the
   tool is enabled *for that conversation*. A connector enabled in settings but not
   ticked in the composer will not be called.
4. Ask for the trip, agree on the plan, then say "create the WHRNXT link".

If ChatGPT answers with JSON instead of a link, the tool was not available in that
conversation. Nothing is lost: build a `#trip=` link from it (section 1), or paste
the JSON into the app (section 7).
