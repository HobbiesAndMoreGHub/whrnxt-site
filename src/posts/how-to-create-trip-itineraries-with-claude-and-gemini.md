---
title: WHRNXT Itinerary Specification for LLMs (Claude, Gemini, ChatGPT)
description: Technical specification and formatting instructions for AI models to generate WHRNXT trip itineraries, JSON payloads, and shareable links.
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

This document defines the schema, rules, and procedures for Large Language Models
(Claude, Gemini, ChatGPT) to generate valid WHRNXT itineraries, JSON payloads, and
import links.

---

## 1. How to hand a trip to WHRNXT

**A. Write the link yourself — no tool, no account, no setup. Prefer this.**
WHRNXT reads a trip straight out of the URL fragment, so any assistant can build a
working link in plain text and show it to the user:

```
https://app.whrnxt.net/#trip=Title!city|Day label|Name,lat,lng,category~Name,lat,lng,category!city|Day label|...
```

Opening it imports the trip into WHRNXT. See section 2 for the format. This is the
only path that works for a user who is not logged in and has installed nothing.

**B. Call the WHRNXT tool (ChatGPT connector).**
WHRNXT publishes an MCP server at `POST https://api-production-9f8f.up.railway.app/mcp`
with one tool, `create_whrnxt_itinerary`, which returns a short `?i=` link. It is only
callable once the connector is added in ChatGPT and ticked for the conversation —
see section 7. If the tool is not listed, use path A; never claim a link was created.

**C. Call the HTTP API (apps and scripts, not chat).**
`POST https://api-production-9f8f.up.railway.app/api/itineraries/import`
Returns: `{"url": "https://app.whrnxt.net/?i=SLUG", "slug": "SLUG", "warnings": []}`

> A chat assistant that browses the web can only issue GET requests. It **cannot**
> create a link by "visiting" this endpoint. Use path A instead.

Whichever path you take, the user can also paste the JSON of section 3 — or a
`#trip=` link — into WHRNXT → **Itineraries → ⬇ Import from link**.

---

## 2. Link format (path A)

Everything after `#trip=` is the trip. Separators, outermost first:

| Separator | Separates |
|---|---|
| `!` | the title, then each day |
| `\|` | within a day: `city` `\|` `label` `\|` `stops` — with an optional `YYYY-MM-DD` as a third field before the stops |
| `~` | one stop from the next |
| `,` | within a stop: `name` `,` `latitude` `,` `longitude` `,` `category` |

Rules:

1. **Percent-encode spaces as `%20`.** Commas, pipes, tildes, `!` and `&` are legal
   in a fragment and need no encoding. Avoid `#` and `%` inside place names.
2. `category` is optional and may be omitted with its comma; an unknown one becomes
   `saved`. A comma inside a place name is fine — the last three fields of a stop
   are always read as latitude, longitude, category.
3. Coordinates are required for every stop, as decimals with 4+ places.
4. Same ceilings as the JSON: 31 days, 100 stops, and keep the finished URL under
   about 8,000 characters. A 14-day, 64-stop trip lands near 4,300.
5. **Present it as a markdown link** — `[Open this trip in WHRNXT](https://app.whrnxt.net/#trip=…)` —
   so the user sees a button, not a wall of text.

A two-day example, ready to open:

```
https://app.whrnxt.net/#trip=3%20Days%20in%20Rome!rome|Day%201:%20Ancient%20Rome|2026-09-10|Colosseum,41.8902,12.4922,sightseeing~Roman%20Forum,41.8925,12.4853,sightseeing~La%20Carbonara,41.8962,12.4928,restaurant!rome|Day%202:%20Vatican|2026-09-11|St%20Peter%27s%20Basilica,41.9022,12.4539,sightseeing~Vatican%20Museums,41.9065,12.4536,museum
```

---

## 3. JSON Schema Definition

Used by paths B and C, and accepted verbatim by the app's import box. Path A
encodes these same fields more compactly.

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
          "category": "String - One of: sightseeing, restaurant, cafe, nightlife, shopping, outdoor, museum, entertainment, saved",
          "address": "String (optional) - Full address for geocoding fallback",
          "latitude": "Number (-90 to 90) - Decimal latitude (e.g. 48.8584)",
          "longitude": "Number (-180 to 180) - Decimal longitude (e.g. 2.2945)"
        }
      ]
    }
  ]
}
```

---

## 4. Mandatory Constraints & Rules

1. **Days Limit**: `days` array MUST contain between **1 and 31 days**.
2. **Stops Limit**: Total `stops` across all days MUST NOT exceed **100 stops**. Each day SHOULD contain between **1 and 8 stops** for realistic pacing.
3. **Coordinates**:
   - `latitude` and `longitude` MUST be valid floating point numbers rounded to at least 4-5 decimal places.
   - Do NOT pass `null` or string coordinates for `latitude`/`longitude`.
   - Stops without usable coordinates are dropped on import.
4. **Categories**:
   - MUST be one of: `sightseeing`, `restaurant`, `cafe`, `nightlife`, `shopping`, `outdoor`, `museum`, `entertainment`, `saved`.
   - An unrecognised category is imported as `saved` rather than rejected.
5. **City Slugs**:
   - MUST be lowercase, stripped of accents/special characters, with spaces replaced by hyphens (e.g., `florence`, `rio-de-janeiro`, `kyoto`).
6. **Output the JSON in a single fenced code block** with no keys omitted and no
   commentary inside the block, so the user can copy it in one gesture.
7. **Body size**: the HTTP API caps request bodies at 16 KB. Long trips should
   trim addresses before dropping stops.

---

## 5. Example Output

When a user asks for a trip plan to Rome, output this exact JSON format:

```json
{
  "title": "3 Days in Historic Rome",
  "days": [
    {
      "label": "Day 1: Ancient Rome & Colosseum",
      "city": "rome",
      "date": "2026-09-10",
      "stops": [
        {
          "name": "Colosseum",
          "category": "sightseeing",
          "address": "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
          "latitude": 41.8902,
          "longitude": 12.4922
        },
        {
          "name": "Roman Forum",
          "category": "sightseeing",
          "address": "Via dei Fori Imperiali, 00186 Roma RM, Italy",
          "latitude": 41.8925,
          "longitude": 12.4853
        },
        {
          "name": "La Carbonara",
          "category": "restaurant",
          "address": "Piazza Panisperna, 214, 00184 Roma RM, Italy",
          "latitude": 41.8962,
          "longitude": 12.4928
        }
      ]
    }
  ]
}
```

---

## 6. How Users Import the Generated Itinerary

1. Copy the whole JSON block the assistant produced (or the `app.whrnxt.net/?i=…`
   link, if the assistant had the WHRNXT tool).
2. Open **https://app.whrnxt.net**.
3. Go to **Itineraries → ⬇ Import from link**.
4. Paste into the box and tap **Import**. The trip is saved in the app, days and
   stops intact; stops WHRNXT already knows are matched to its database, and the
   rest are added as your own saved spots.

---

## 7. ChatGPT connector setup (path B)

The tool only appears to ChatGPT after the connector is added to the account:

1. **Settings → Connectors → Advanced → Developer mode** — turn it on. Custom MCP
   connectors are a paid-plan beta; without it, ChatGPT has no WHRNXT tool.
2. **Settings → Connectors → Create / Add custom connector.**
   - URL: `https://api-production-9f8f.up.railway.app/mcp`
   - Authentication: **No authentication**
3. In the chat composer, open **+ → Developer mode** and tick **whrnxt** so the
   tool is enabled *for that conversation*. A connector enabled in settings but
   not ticked in the composer will not be called.
4. Ask for the trip, agree on the plan, then say "create the WHRNXT link".

If ChatGPT answers with JSON instead of a link, the tool was not available in that
conversation. Nothing is lost: build a `#trip=` link from it (section 2), or paste
the JSON into the app (section 6).
