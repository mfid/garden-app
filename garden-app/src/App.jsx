import React, { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const LAT = 51.6538;
const LON = -0.1936;
const SEED_DATE = new Date("2026-06-28"); // actual sowing date
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const WMO = {
  0:{l:"Clear sky",i:"☀️"},1:{l:"Mainly clear",i:"🌤"},2:{l:"Partly cloudy",i:"⛅"},
  3:{l:"Overcast",i:"☁️"},45:{l:"Foggy",i:"🌫"},48:{l:"Icy fog",i:"🌫"},
  51:{l:"Light drizzle",i:"🌦"},53:{l:"Drizzle",i:"🌦"},55:{l:"Heavy drizzle",i:"🌧"},
  61:{l:"Light rain",i:"🌧"},63:{l:"Rain",i:"🌧"},65:{l:"Heavy rain",i:"⛈"},
  80:{l:"Showers",i:"🌦"},81:{l:"Showers",i:"🌧"},82:{l:"Heavy showers",i:"⛈"},
  95:{l:"Thunderstorm",i:"⛈"},
};
const wmo = c => WMO[c] || {l:"Variable",i:"🌤"};

// ─── Phase logic (seed sown 28 Jun 2026) ──────────────────────────────────────
// Day 0 = 28 Jun (seed in ground)
// Phase 1: Germination      Days 0–13   28 Jun – 11 Jul
// Phase 2: Early Growth     Days 14–20  12–18 Jul
// Phase 3: First Mow        Days 21–27  19–25 Jul
// Phase 4: Establish        Days 28–41  26 Jul – 8 Aug
// Phase 5: Consolidate      Days 42–69  9 Aug – 5 Sep
// Phase 6: Phase 2 Prep     Days 70+    6 Sep onwards

function getSeedDay(today = new Date()) {
  return Math.floor((today - SEED_DATE) / 86400000);
}

function getLawnPhase(today = new Date()) {
  const d = getSeedDay(today);
  if (d < 0)  return 0;
  if (d <= 13) return 1;
  if (d <= 20) return 2;
  if (d <= 27) return 3;
  if (d <= 41) return 4;
  if (d <= 69) return 5;
  return 6;
}

const PHASE_META = {
  1:{name:"Germination",dates:"28 Jun – 11 Jul",color:"#27ae60"},
  2:{name:"Early Growth",dates:"12–18 Jul",color:"#2ecc71"},
  3:{name:"First Mow",dates:"19–25 Jul",color:"#f39c12"},
  4:{name:"Establish",dates:"26 Jul – 8 Aug",color:"#e67e22"},
  5:{name:"Consolidate",dates:"9 Aug – 5 Sep",color:"#8e44ad"},
  6:{name:"Phase 2 Prep",dates:"Sep onwards",color:"#2980b9"},
};

const PHASE_TASKS = {
  1:[
    "Water 7am AND 7pm every day — no exceptions unless 5mm+ genuine rainfall",
    "Remove fleece by 7 Jul at the latest (before heat may return ~9 Jul)",
    "Check under fleece daily from 5 Jul — remove immediately when green shoots visible",
    "Keep all family, children and pets completely off the lawn for 4 weeks",
    "Do NOT mow until new grass reaches 5–6cm tall",
    "Spot-treat surviving weeds with Weedol liquid on established areas only (not new seed areas)",
  ],
  2:[
    "Reduce to once daily watering as roots deepen (skip if 5mm+ rain falls)",
    "Check for first visible green germination — expect fuzz across surface by now",
    "Still DO NOT mow — wait for 5–6cm height throughout",
    "Spot treat clover and buttercup survivors with Weedol on old grass areas",
    "Wisteria July pruning: cut all new whippy shoots back to 5 leaves",
  ],
  3:[
    "First mow when new grass reaches 5–6cm: blade on HIGHEST setting, remove max 1/3 height",
    "Sharpen mower blade before first cut — blunt blades rip seedlings",
    "After first mow: apply Green Fingers Organic Green Up lawn feed",
    "Reduce watering to every 2 days as roots are now deeper",
    "Spot treat any surviving weeds — safe on established new grass now",
  ],
  4:[
    "Mow every 5–7 days at 4–5cm height — lawn is now established",
    "Water only if 5+ consecutive dry days in heat",
    "Final Weedol treatment on any isolated surviving weeds",
    "Apply final summer lawn feed",
    "Plan September Phase 2: aeration + overseeding thin patches",
  ],
  5:[
    "Mow weekly at 4–5cm",
    "Reduce watering — established lawn largely self-sufficient in UK summer",
    "Book September aeration slot — hollow tine again, same process",
    "Overseed any remaining thin or bare patches in September",
  ],
  6:[
    "September: Hollow tine aerate the whole lawn again",
    "Overseed thin patches with BS Childs Play",
    "Apply autumn lawn feed (high potassium — NOT nitrogen)",
    "This Phase 2 is what takes the lawn from very good to immaculate",
  ],
};

// ─── Plant definitions ────────────────────────────────────────────────────────
const PLANTS = [
  {id:"lawn",name:"Lawn",emoji:"🌿",loc:"Back garden — seeded 28 Jun",type:"lawn",potted:false},
  {id:"thuja",name:"Thuja Cones",emoji:"🌲",loc:"Back garden — pots (newly planted)",type:"conifer_new",potted:true,feedProduct:"Miracle-Gro All Purpose liquid",feedFreq:"Monthly",feedMonths:[5,6,7,8,9],note:"First season — high water need all summer. Roots not yet established."},
  {id:"cupro",name:"Cuprocyparis",emoji:"🌳",loc:"Front door — pots, exposed/windy",type:"conifer_new_exposed",potted:true,feedProduct:"Miracle-Gro All Purpose liquid",feedFreq:"Monthly",feedMonths:[5,6,7,8,9],note:"Newly planted in exposed position. Wind accelerates drying — check more frequently than sheltered pots."},
  {id:"wisteria",name:"Wisteria",emoji:"🪻",loc:"Back garden — pots",type:"wisteria",potted:true,feedProduct:"Tomorite (high potash)",feedFreq:"Weekly until August",feedMonths:[4,5,6,7,8],note:"Prune July: cut new shoots to 5 leaves. Prune February: cut to 2–3 buds."},
  {id:"olive",name:"Olive Tree",emoji:"🫒",loc:"Pot — John Innes No.3",type:"mediterranean",potted:true,feedProduct:"Balanced liquid feed (Phostrogen)",feedFreq:"Monthly Apr–Sep",feedMonths:[4,5,6,7,8,9],note:"Drought tolerant. Overwatering is the greater risk. Allow compost to almost dry between waterings."},
  {id:"lemon",name:"Lemon Tree",emoji:"🍋",loc:"Pot — citrus",type:"citrus",potted:true,feedProduct:"Westland Citrus Feed or Miracle-Gro Citrus",feedFreq:"Every 2 weeks Mar–Sep",feedMonths:[3,4,5,6,7,8,9],note:"Keep consistently moist but never waterlogged. Yellow leaves = over or underwatering. Bring in below 5°C."},
  {id:"kumquat",name:"Kumquat",emoji:"🍊",loc:"Pot — citrus",type:"citrus",potted:true,feedProduct:"Westland Citrus Feed or Miracle-Gro Citrus",feedFreq:"Every 2 weeks Mar–Sep",feedMonths:[3,4,5,6,7,8,9],note:"Same care as lemon. More compact but identical watering and feeding requirements."},
  {id:"hydrangea",name:"Hydrangeas",emoji:"💐",loc:"Pots or borders",type:"hydrangea",potted:true,feedProduct:"Miracle-Gro Flowering Plant Food or Tomorite",feedFreq:"Monthly May–Aug",feedMonths:[4,5,6,7,8],note:"High water need — wilts visibly within hours in heat. Don't let dry out in summer."},
  {id:"strawberries",name:"Strawberries",emoji:"🍓",loc:"Trough — courtyard",type:"fruiting",potted:true,feedProduct:"Tomorite (high potash)",feedFreq:"Weekly once fruiting",feedMonths:[5,6,7,8],note:"Water at the base only — wetting fruit and leaves encourages mould. Toscana & Orange Spice in trough."},
  {id:"tomatoes",name:"Sungold Tomatoes",emoji:"🍅",loc:"Trough — courtyard",type:"tomato",potted:true,feedProduct:"Tomorite (high potash)",feedFreq:"Weekly from first flower",feedMonths:[5,6,7,8,9],note:"Consistent moisture critical — irregular watering causes blossom end rot and split fruit. Check for suckers every 4–5 days."},
  {id:"bougainvillea",name:"Bougainvillea",emoji:"🌸",loc:"Courtyard — pot",type:"bougainvillea",potted:true,feedProduct:"Tomorite or specialist high-potash",feedFreq:"Every 2–3 weeks",feedMonths:[5,6,7,8,9],note:"Only water when top 3cm is completely dry. Mediterranean — prefers drought to wet roots. No dish under pot."},
];

// ─── Plant watering recommendations ──────────────────────────────────────────
function plantRec(plant, w, phase) {
  if (!w) return {a:"LOADING",c:"#555",r:"Fetching weather…",t:""};
  const {recentRain,todayMax,todayRainProb,tomorrowRainProb,dryDays,todayRain} = w;
  const hot = todayMax >= 25, vhot = todayMax >= 30;
  const rained = recentRain >= 5, heavyRain = recentRain >= 15;
  const rainingNow = todayRainProb >= 60 || todayRain >= 3;
  const rainExpected = todayRainProb >= 60; // useful for evening skip decisions
  const rainTomorrow = tomorrowRainProb >= 65;

  switch (plant.type) {

    case "lawn": {
      // Phase 1: Germination — twice daily watering regime
      if (phase === 1) {
        if (rainingNow && todayRain >= 5) return {a:"SKIP BOTH",c:"#2D5016",r:`${todayRain}mm today — seed is naturally watered. Check for pooling or wash-off.`,t:""};
        if (heavyRain) return {a:"SKIP AM ✓",c:"#2D5016",r:`${recentRain}mm rain recently — skip morning water. Check soil at noon; water evening if dry.`,t:"Check noon"};
        if (vhot && !rained) return {a:"WATER TWICE 🚨",c:"#c0392b",r:`${todayMax}°C and dry — seed will die without morning AND evening water. Non-negotiable.`,t:"7am + 7pm"};
        if (hot && !rained && !rainExpected) return {a:"WATER TWICE",c:"#D4860A",r:`${todayMax}°C — water morning and evening to maintain top 2cm moisture`,t:"7am + 7pm"};
        if (rainExpected && !rained) return {a:"MORNING ONLY",c:"#4A90A4",r:`Rain likely today (${todayRainProb}%) — water at 7am. Skip evening if rain has fallen by then.`,t:"7am only"};
        if (rained && hot) return {a:"WATER TWICE",c:"#D4860A",r:`${recentRain}mm rain + ${todayMax}°C — morning rain may not be enough. Water evening to be safe.`,t:"7am + 7pm"};
        return {a:"WATER TWICE",c:"#4A90A4",r:"Germination phase — maintain consistent moisture. Water 7am and 7pm.",t:"7am + 7pm"};
      }
      // Phase 2: Early growth
      if (phase === 2) {
        if (rainingNow || heavyRain) return {a:"SKIP",c:"#2D5016",r:`${Math.max(todayRain,recentRain)}mm rain — sufficient. Roots are deepening.`,t:""};
        if (vhot && !rained) return {a:"WATER TWICE",c:"#c0392b",r:`${todayMax}°C — still young seedlings. Water morning and evening in this heat.`,t:"7am + 7pm"};
        if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient for today`,t:""};
        return {a:"WATER",c:"#4A90A4",r:"Water once daily — roots deepening but still shallow",t:"Morning"};
      }
      // Phase 3: First mow — roots now deeper
      if (phase === 3) {
        if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — well watered`,t:""};
        if (vhot && dryDays >= 3) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days at ${todayMax}°C — water to prevent stress`,t:"Evening"};
        if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm recent rain — skip today`,t:""};
        return {a:"EVERY 2 DAYS",c:"#4A90A4",r:"Water every 2 days or when top 3cm feels dry",t:"Morning"};
      }
      // Phase 4+: Established
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — naturally watered`,t:""};
      if (vhot && dryDays >= 7) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days at ${todayMax}°C — water deeply to prevent dormancy`,t:"Evening"};
      return {a:"SKIP",c:"#2D5016",r:"Established lawn — UK rainfall usually sufficient unless prolonged drought",t:""};
    }

    case "conifer_new": {
      if (heavyRain || rainingNow) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot || (hot && dryDays >= 1)) return {a:"WATER",c:"#c0392b",r:`${todayMax}°C — newly planted, water every evening in heat`,t:"Evening"};
      if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip today`,t:""};
      if (dryDays >= 2) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days — water until drains from base`,t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:"Finger test 2cm deep — water if dry. First season: err on side of more.",t:""};
    }

    case "conifer_new_exposed": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot || hot) return {a:"WATER",c:"#c0392b",r:`${todayMax}°C + exposed position — wind + heat dries pots fast. Check every evening.`,t:"Evening"};
      if (rained && dryDays < 2) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip`,t:""};
      if (dryDays >= 1) return {a:"CHECK",c:"#D4860A",r:"Front door pots: exposed to wind, check daily",t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:"Check daily — wind exposure means faster drying",t:""};
    }

    case "wisteria": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — pot likely saturated`,t:""};
      if (rained && !vhot) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot || dryDays >= 3) return {a:"WATER",c:"#4A90A4",r:`${dryDays >= 3 ? dryDays+" dry days" : todayMax+"°C"} — water wisteria pots thoroughly`,t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:"Water when top 3cm feels dry. Weekly Tomorite more important than extra watering.",t:""};
    }

    case "mediterranean": {
      if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — let it drain fully before adding more`,t:""};
      if (vhot && dryDays >= 4) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days at ${todayMax}°C — water olive now`,t:"Morning"};
      if (dryDays >= 6) return {a:"WATER",c:"#4A90A4",r:`${dryDays} consecutive dry days — time to water olive`,t:"Morning"};
      return {a:"SKIP",c:"#2D5016",r:"Drought tolerant — only water after 4–5+ dry days or extreme heat",t:""};
    }

    case "citrus": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip. Citrus hates waterlogging.`,t:""};
      if (rained && !vhot) return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm rain — check compost is moist not wet before adding more`,t:""};
      if (vhot || dryDays >= 3) return {a:"WATER",c:"#4A90A4",r:`${vhot ? todayMax+"°C" : dryDays+" dry days"} — water until drains from base`,t:"Morning"};
      return {a:"WATER",c:"#4A90A4",r:"Citrus needs consistent moisture — every 2–3 days in summer",t:"Morning"};
    }

    case "hydrangea": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot) return {a:"WATER",c:"#c0392b",r:`${todayMax}°C — hydrangeas wilt fast. Water morning AND check again evening.`,t:"Morning + evening"};
      if (hot || dryDays >= 2) return {a:"WATER",c:"#4A90A4",r:`${hot ? todayMax+"°C" : dryDays+" dry days"} — high water needs in warm weather`,t:"Morning"};
      if (!rained) return {a:"WATER",c:"#4A90A4",r:"No recent rain — hydrangeas need regular moisture",t:"Morning"};
      return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient for today`,t:""};
    }

    case "fruiting": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip. Water at base only when needed.`,t:""};
      if (rained && !hot) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot || dryDays >= 2) return {a:"WATER",c:"#4A90A4",r:`${vhot ? todayMax+"°C" : dryDays+" dry days"} — water at base only (not on fruit or leaves)`,t:"Morning"};
      return {a:"WATER",c:"#4A90A4",r:"Strawberries in trough need regular moisture — water at base",t:"Morning"};
    }

    case "tomato": {
      if (heavyRain) return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm rain — check soil. Consistent moisture needed, not flooding`,t:""};
      if (vhot && dryDays >= 1) return {a:"WATER DAILY",c:"#c0392b",r:`${todayMax}°C — daily watering essential. Inconsistency = blossom end rot.`,t:"Morning"};
      if (hot || dryDays >= 2) return {a:"WATER",c:"#D4860A",r:`${hot ? todayMax+"°C" : dryDays+" dry days"} — tomatoes need consistent daily moisture`,t:"Morning"};
      if (!rained) return {a:"WATER",c:"#4A90A4",r:"No recent rain — water tomatoes. Check for suckers while there.",t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm rain — check compost 3cm deep before watering`,t:""};
    }

    case "bougainvillea": {
      if (rainingNow || heavyRain) return {a:"SKIP ⚠️",c:"#c0392b",r:`Heavy/current rain — check drainage hole is clear. Overwatering kills bougainvillea.`,t:""};
      if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip. Prefers dry conditions between waterings.`,t:""};
      if (dryDays >= 6) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days — compost should be fully dry. Water thoroughly then leave alone.`,t:"Morning"};
      if (dryDays >= 4) return {a:"CHECK",c:"#7B5E3A",r:`${dryDays} dry days — check if top 3cm is completely dry. Water only if it is.`,t:"Morning"};
      return {a:"SKIP",c:"#2D5016",r:"Only water when top 3cm is completely dry — always err on side of less",t:""};
    }

    default: return {a:"CHECK",c:"#7B5E3A",r:"Check soil moisture before watering",t:""};
  }
}

// ─── Today's actions engine ───────────────────────────────────────────────────
function getTodayActions(w, phase, today) {
  if (!w) return [{p:"LOW",i:"⏳",t:"Loading weather data for Barnet EN4…"}];
  const {todayMax,recentRain,tomorrowRainProb,dryDays,todayRainProb,todayRain} = w;
  const hot = todayMax >= 25, vhot = todayMax >= 30;
  const rained = recentRain >= 5;
  const rainingNow = todayRainProb >= 60 || todayRain >= 3;
  const rainExpected = todayRainProb >= 60;
  const rainTomorrow = tomorrowRainProb >= 65;
  const month = today.getMonth() + 1;
  const seedDay = getSeedDay(today);
  const actions = [];

  // ── Phase 1: Germination ──
  if (phase === 1) {
    // Morning water
    if (rainingNow && todayRain >= 5) {
      actions.push({p:"NOTE",i:"🌧",t:`${todayRain}mm rain today — skip morning watering. Check lawn isn't pooling. Monitor for evening session.`});
    } else if (rained && !hot) {
      actions.push({p:"MEDIUM",i:"💧",t:`${recentRain}mm recent rain + mild temps — morning watering can be light. Check soil feels moist 2cm down.`});
    } else if (vhot) {
      actions.push({p:"CRITICAL",i:"🚨",t:`${todayMax}°C — seed emergency. Water at 7am AND 7pm without fail. Missing either session risks killing germinating seed.`});
    } else {
      actions.push({p:"HIGH",i:"💧",t:`7am: Water the full lawn — 20 mins per section minimum. Keep top 2cm consistently moist throughout germination.`});
    }

    // Evening water
    if (!rainingNow && !(todayRain >= 5)) {
      if (rainExpected) {
        actions.push({p:"MEDIUM",i:"🌧",t:`Rain likely today (${todayRainProb}%) — check at 7pm. If it has rained 3mm+ skip evening session. Otherwise water as normal.`});
      } else if (vhot) {
        actions.push({p:"CRITICAL",i:"🌙",t:`7pm: Evening water non-negotiable at ${todayMax}°C. New seedlings will desiccate overnight without it.`});
      } else {
        actions.push({p:"HIGH",i:"🌙",t:"7pm: Evening water — full lawn, 20 mins per section. This is your most important daily task for the next 2 weeks."});
      }
    }

    // Fleece reminders
    if (seedDay >= 7 && seedDay <= 9) {
      actions.push({p:"HIGH",i:"🌱",t:"Day "+(seedDay+1)+": Check under the fleece for first germination (pale green fuzz). Remove fleece immediately if shoots are visible."});
    }
    if (seedDay >= 9) {
      actions.push({p:"CRITICAL",i:"⚠️",t:"Remove fleece TODAY if not already done — 2nd heat peak possible around 9 Jul. Seedlings under fleece in 38°C will overheat."});
    }
    // Foot traffic reminder
    actions.push({p:"LOW",i:"🚷",t:"Lawn off-limits — no foot traffic, no children, no pets. One crossing can rip out a row of emerging seedlings."});
  }

  // ── Phase 2: Early growth ──
  if (phase === 2) {
    if (!rained && !rainingNow) actions.push({p:"HIGH",i:"💧",t:"Water once today — roots are deepening but still shallow. Morning is ideal."});
    if (rained) actions.push({p:"LOW",i:"✅",t:`${recentRain}mm rain — lawn watered naturally today. Check soil tomorrow.`});
    actions.push({p:"MEDIUM",i:"🌿",t:"Check lawn height daily — first mow when new grass reaches 5–6cm tall throughout. Don't rush this."});
    if (month === 7) actions.push({p:"MEDIUM",i:"✂️",t:"July: Prune wisteria — cut all new whippy shoots to 5 leaves from the main framework."});
  }

  // ── Phase 3: First mow ──
  if (phase === 3) {
    actions.push({p:"HIGH",i:"✂️",t:"First mow this week: blade on highest setting, remove max 1/3 of height. Sharpen blade before cutting — blunt blades rip seedlings."});
    actions.push({p:"MEDIUM",i:"🌱",t:"After first mow: apply Green Fingers Organic Green Up lawn feed across the entire lawn."});
  }

  // ── All phases: rain tomorrow ──
  if (rainTomorrow && !rainingNow) {
    actions.push({p:"LOW",i:"🌧",t:`Rain likely tomorrow (${tomorrowRainProb}%) — ease off watering pots today. Let tomorrow's rain do the work.`});
  }

  // ── All phases: plant-specific ──
  if (vhot) {
    actions.push({p:"HIGH",i:"🍅",t:`${todayMax}°C — water tomatoes this morning and check for new suckers growing in leaf axils.`});
    actions.push({p:"HIGH",i:"💐",t:`${todayMax}°C — water hydrangeas first thing. They wilt within hours and look terrible.`});
  } else if (!rained) {
    actions.push({p:"MEDIUM",i:"🍅",t:"Water tomatoes and strawberries this morning — no recent rain."});
  }
  if (recentRain >= 10) {
    actions.push({p:"HIGH",i:"🌸",t:`Heavy recent rain (${recentRain}mm) — check bougainvillea drainage immediately. Clear drainage hole if water sitting.`});
  }
  if (hot) {
    actions.push({p:"MEDIUM",i:"🌳",t:`${todayMax}°C — check Cuprocyparis pots at front door. Exposed position dries faster than rear garden.`});
  }
  if (today.getDay() === 1 && !rainingNow) {
    actions.push({p:"MEDIUM",i:"🧪",t:"Monday = Tomorite day. Feed tomatoes, strawberries and wisteria with high potash liquid."});
  }

  if (actions.length === 0) actions.push({p:"LOW",i:"✅",t:"No urgent actions today. Quick visual check on all pots, remove any tomato suckers."});

  const order = {CRITICAL:0,HIGH:1,MEDIUM:2,NOTE:3,WAIT:4,LOW:5};
  return actions.sort((a,b)=>order[a.p]-order[b.p]).slice(0,5);
}

// ─── Priority colours ─────────────────────────────────────────────────────────
const PC = {CRITICAL:"#c0392b",HIGH:"#D4860A",MEDIUM:"#5B8A1E",NOTE:"#4A90A4",WAIT:"#7B5E3A",LOW:"#3a5a1e"};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const ls = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem(k,v); } catch {} },
};

// ─── Error boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = {err:null}; }
  static getDerivedStateFromError(e) { return {err:e?.message||"Unknown error"}; }
  render() {
    if (this.state.err) return (
      <div style={{minHeight:"100vh",background:"#0e1c07",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",padding:24}}>
        <div style={{background:"#1a0a0a",border:"1px solid #c0392b",borderRadius:12,padding:20,maxWidth:400,color:"#e8ead4"}}>
          <div style={{color:"#c0392b",fontWeight:700,marginBottom:8}}>Something went wrong</div>
          <div style={{fontSize:13,color:"#a88",marginBottom:16}}>{this.state.err}</div>
          <button onClick={()=>this.setState({err:null})} style={{background:"#2d5016",border:"none",color:"#8db85a",borderRadius:6,padding:"8px 16px",cursor:"pointer",fontSize:13}}>Retry</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

export default function App() { return <ErrorBoundary><GardenAdvisor /></ErrorBoundary>; }

// ─── Main component ───────────────────────────────────────────────────────────
function GardenAdvisor() {
  const [weather, setWeather]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [wxErr, setWxErr]         = useState(false);
  const [tab, setTab]             = useState("today");
  const [watered, setWatered]     = useState({});
  const [fedLog, setFedLog]       = useState({});
  const [expanded, setExpanded]   = useState(null);

  const today = new Date();
  const phase = getLawnPhase(today);
  const seedDay = getSeedDay(today);

  // ── Load persisted state ──
  useEffect(() => {
    const w = ls.get("gard-watered-v2");
    if (w) { try { const p=JSON.parse(w); if(p.date===today.toDateString()) setWatered(p.plants||{}); } catch {} }
    const f = ls.get("gard-fed-v2");
    if (f) { try { setFedLog(JSON.parse(f)); } catch {} }

    (async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&past_days=2&forecast_days=7&timezone=Europe%2FLondon`;
        const d = await (await fetch(url)).json();
        const dp = d.daily;

        // Fix: only count dryDays from PAST data (indices 0–2), not future forecast
        let dryDays = 0;
        for (let i = 2; i >= 0; i--) {
          if ((dp.precipitation_sum[i]||0) < 1) dryDays++;
          else break;
        }

        const recentRain = (dp.precipitation_sum[0]||0) + (dp.precipitation_sum[1]||0);

        setWeather({
          recentRain:    Math.round(recentRain*10)/10,
          todayRain:     Math.round((dp.precipitation_sum[2]||0)*10)/10,
          todayMax:      Math.round(dp.temperature_2m_max[2]),
          todayMin:      Math.round(dp.temperature_2m_min[2]),
          todayCode:     dp.weathercode[2],
          todayRainProb: dp.precipitation_probability_max[2]||0,
          tomorrowMax:   Math.round(dp.temperature_2m_max[3]),
          tomorrowRainProb: dp.precipitation_probability_max[3]||0,
          dryDays,
          forecast: dp.time.slice(2,7).map((date,i)=>({
            date, day: DAYS_SHORT[new Date(date).getDay()],
            max:  Math.round(dp.temperature_2m_max[i+2]),
            rain: Math.round((dp.precipitation_sum[i+2]||0)*10)/10,
            prob: dp.precipitation_probability_max[i+2]||0,
            code: dp.weathercode[i+2],
          })),
        });
      } catch {
        setWxErr(true);
        setWeather({recentRain:0,todayRain:0,todayMax:22,todayMin:14,todayCode:1,todayRainProb:20,tomorrowMax:23,tomorrowRainProb:30,dryDays:2,forecast:[]});
      } finally { setLoading(false); }
    })();
  }, []); // eslint-disable-line

  const toggleWatered = id => {
    const next = {...watered,[id]:!watered[id]};
    setWatered(next);
    ls.set("gard-watered-v2", JSON.stringify({date:today.toDateString(),plants:next}));
  };

  const markFed = id => {
    const next = {...fedLog,[id]:today.toISOString()};
    setFedLog(next);
    ls.set("gard-fed-v2", JSON.stringify(next));
  };

  const daysSinceFed = id => fedLog[id] ? Math.floor((today-new Date(fedLog[id]))/86400000) : null;

  const bg="#0e1c07", card="#152008", border="#1e3610", accent="#5B8A1E";

  if (loading) return (
    <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div style={{color:accent,fontSize:16}}>Fetching Barnet EN4 weather…</div>
    </div>
  );

  const todayWMO = wmo(weather.todayCode);
  const todayActions = getTodayActions(weather, phase, today);
  const phaseInfo = PHASE_META[phase] || PHASE_META[1];

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"system-ui,sans-serif",color:"#e8ead4"}}>

      {/* ── Header ── */}
      <div style={{background:"linear-gradient(135deg,#1a3a09,#2d5016)",borderBottom:`3px solid ${accent}`,padding:"14px 16px 10px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"#8db85a",textTransform:"uppercase",marginBottom:3}}>
            Barnet EN4 · Live weather · Seed day {seedDay >= 0 ? seedDay+1 : "–"}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h1 style={{fontSize:21,fontWeight:700,color:"#d4f0a0",margin:0}}>Garden Advisor</h1>
              <div style={{fontSize:12,color:"#9dc96a",marginTop:2}}>
                {today.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:26}}>{todayWMO.i}</div>
              <div style={{fontSize:20,fontWeight:700,color:"#d4f0a0",lineHeight:1}}>{weather.todayMax}°C</div>
              <div style={{fontSize:11,color:"#8db85a"}}>{todayWMO.l}</div>
              {wxErr && <div style={{fontSize:10,color:"#D4860A"}}>⚠ Estimated</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {[
              {l:"Rain (48h)",v:`${weather.recentRain}mm`},
              {l:"Today",v:`${weather.todayRainProb}% rain`},
              {l:"Dry days",v:`${weather.dryDays}d`},
              {l:"Tomorrow",v:`${weather.tomorrowMax}°C · ${weather.tomorrowRainProb}%`},
            ].map((s,i)=>(
              <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:6,padding:"4px 10px"}}>
                <div style={{fontSize:10,color:"#6a9a3a",textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.l}</div>
                <div style={{fontSize:12,fontWeight:600,color:"#c8e6a0"}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5-day forecast strip ── */}
      {weather.forecast?.length > 0 && (
        <div style={{background:"#0f1f08",borderBottom:`1px solid ${border}`}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",overflowX:"auto",padding:"8px 16px",gap:6}}>
            {weather.forecast.map((f,i)=>(
              <div key={i} style={{flex:"0 0 auto",textAlign:"center",padding:"6px 10px",background:i===0?card:"#0a1505",borderRadius:8,border:`1px solid ${i===0?accent:border}`,minWidth:56}}>
                <div style={{fontSize:10,fontWeight:700,color:i===0?"#d4f0a0":"#5a8a2a",marginBottom:2}}>{i===0?"Today":f.day}</div>
                <div style={{fontSize:16}}>{wmo(f.code).i}</div>
                <div style={{fontSize:13,fontWeight:600,color:"#c8e6a0"}}>{f.max}°</div>
                {f.rain>0 && <div style={{fontSize:10,color:"#4A90A4"}}>{f.rain}mm</div>}
                {f.prob>30 && <div style={{fontSize:10,color:"#4A90A4"}}>{f.prob}%</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{background:card,borderBottom:`2px solid ${border}`,position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex"}}>
          {[{id:"today",l:"⚡ Today"},{id:"plants",l:"🌱 Plants"},{id:"lawn",l:"🌿 Lawn Plan"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"11px 4px",border:"none",background:"transparent",
              color:tab===t.id?"#d4f0a0":"#5a8a2a",fontWeight:tab===t.id?700:400,
              fontSize:13,cursor:"pointer",borderBottom:`3px solid ${tab===t.id?accent:"transparent"}`,
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"14px 14px 40px"}}>

        {/* ══ TODAY TAB ══ */}
        {tab==="today" && <>

          {/* Phase pill */}
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:phaseInfo.color,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:1}}>
                Lawn — Phase {phase} · Day {seedDay+1} of restoration
              </div>
              <div style={{fontSize:14,fontWeight:700,color:"#c8e6a0"}}>{phaseInfo.name}</div>
              <div style={{fontSize:11,color:"#5a8a2a"}}>{phaseInfo.dates}</div>
            </div>
            <button onClick={()=>setTab("lawn")} style={{background:"#2d5016",border:`1px solid ${accent}`,color:"#8db85a",borderRadius:6,padding:"5px 10px",fontSize:12,cursor:"pointer"}}>
              View →
            </button>
          </div>

          {/* What to do today */}
          <div style={{background:"#160a00",border:"2px solid #D4860A",borderRadius:12,padding:"12px 14px",marginBottom:18}}>
            <div style={{fontSize:11,color:"#D4860A",textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:10}}>⚡ What to do today</div>
            {todayActions.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 10px",background:"#0d0700",borderRadius:8,marginBottom:5,border:`1px solid ${PC[a.p]}30`}}>
                <span style={{fontSize:18,flexShrink:0,lineHeight:1.3}}>{a.i}</span>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:PC[a.p],textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>{a.p}</div>
                  <div style={{fontSize:13,color:"#c8b070",lineHeight:1.5}}>{a.t}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Watering grid */}
          <div style={{fontSize:11,color:accent,textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:10}}>
            Today's watering at a glance
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {PLANTS.map(plant=>{
              const rec = plantRec(plant,weather,phase);
              const done = watered[plant.id];
              return (
                <div key={plant.id} onClick={()=>setTab("plants")} style={{
                  background:done?"#0a1505":card,
                  border:`1px solid ${done?"#2d5016":rec.c}44`,
                  borderRadius:10,padding:"10px 11px",cursor:"pointer",
                  opacity:done?0.55:1,transition:"opacity 0.2s",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#c8e6a0"}}>
                      <span style={{marginRight:4}}>{plant.emoji}</span>{plant.name}
                    </div>
                    {done && <span style={{fontSize:13,color:accent}}>✓</span>}
                  </div>
                  <div style={{display:"inline-flex",background:`${rec.c}20`,border:`1px solid ${rec.c}77`,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:700,color:rec.c}}>
                    {rec.a}
                  </div>
                  {rec.t && <div style={{fontSize:10,color:"#6a9a3a",display:"block",marginTop:2}}>⏰ {rec.t}</div>}
                </div>
              );
            })}
          </div>
        </>}

        {/* ══ PLANTS TAB ══ */}
        {tab==="plants" && <>
          <div style={{fontSize:11,color:accent,textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:12}}>
            Detailed plant advice — {today.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
          </div>
          {PLANTS.map(plant=>{
            const rec = plantRec(plant,weather,phase);
            const done = watered[plant.id];
            const dsf = daysSinceFed(plant.id);
            const feedActive = plant.feedMonths?.includes(today.getMonth()+1);
            const isOpen = expanded===plant.id;
            return (
              <div key={plant.id} style={{background:card,border:`2px solid ${done?"#1e3a0e":rec.c}55`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                {/* Collapsed header */}
                <div onClick={()=>setExpanded(isOpen?null:plant.id)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:15}}>{plant.emoji}</span>
                    <span style={{fontSize:14,fontWeight:700,color:"#d4f0a0",marginLeft:6}}>{plant.name}</span>
                    <div style={{fontSize:11,color:"#5a8a2a",marginTop:1}}>{plant.loc}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{background:`${rec.c}22`,border:`1px solid ${rec.c}`,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:rec.c}}>{rec.a}</div>
                    <span style={{color:"#3a6020",fontSize:13}}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>
                {/* Expanded detail */}
                {isOpen && (
                  <div style={{padding:"0 14px 14px",borderTop:`1px solid ${border}`}}>
                    {/* Water reason */}
                    <div style={{padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                      <div style={{fontSize:13,color:"#a8c880",lineHeight:1.55,marginBottom:rec.t?6:0}}>{rec.r}</div>
                      {rec.t && <div style={{fontSize:12,color:"#6a9a3a"}}>⏰ Best time: <strong style={{color:"#8db85a"}}>{rec.t}</strong></div>}
                    </div>
                    {/* Feed */}
                    {plant.feedProduct && (
                      <div style={{padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                        <div style={{fontSize:11,color:"#D4860A",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>🧪 Feed</div>
                        <div style={{fontSize:13,color:"#c8b070",marginBottom:3}}>{plant.feedProduct}</div>
                        <div style={{fontSize:12,color:"#8a7040"}}>Frequency: {plant.feedFreq}</div>
                        {!feedActive && <div style={{fontSize:12,color:"#3a5020",marginTop:3}}>Not in active feeding season</div>}
                        {feedActive && dsf !== null && (
                          <div style={{fontSize:12,color:dsf>14?"#c0392b":"#6a9a3a",marginTop:3}}>
                            Last fed: {dsf===0?"today":`${dsf} days ago`}{dsf>14?" — overdue":""}
                          </div>
                        )}
                        {feedActive && dsf===null && <div style={{fontSize:12,color:"#D4860A",marginTop:3}}>No feed logged yet</div>}
                      </div>
                    )}
                    {/* Notes */}
                    {plant.note && (
                      <div style={{padding:"8px 0",borderBottom:`1px solid ${border}`,fontSize:12,color:"#6a8040",fontStyle:"italic",lineHeight:1.5}}>
                        {plant.note}
                      </div>
                    )}
                    {/* Action buttons */}
                    <div style={{display:"flex",gap:8,paddingTop:10}}>
                      <button onClick={()=>toggleWatered(plant.id)} style={{
                        flex:1,padding:"8px",borderRadius:8,
                        border:`1px solid ${done?accent:"#2a4010"}`,
                        background:done?"#2d5016":"#0f1f08",
                        color:done?"#8ddb5a":"#5a8a2a",
                        fontSize:12,fontWeight:600,cursor:"pointer",
                      }}>
                        {done?"✓ Watered today":"Mark as watered"}
                      </button>
                      {plant.feedProduct && feedActive && (
                        <button onClick={()=>markFed(plant.id)} style={{
                          flex:1,padding:"8px",borderRadius:8,
                          border:"1px solid #D4860A44",background:"#120e00",
                          color:"#D4860A",fontSize:12,fontWeight:600,cursor:"pointer",
                        }}>
                          Log feed
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>}

        {/* ══ LAWN PLAN TAB ══ */}
        {tab==="lawn" && <>
          <div style={{fontSize:11,color:accent,textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:12}}>
            Restoration Programme · Seed sown 28 Jun 2026 · Day {seedDay+1}
          </div>

          {Object.entries(PHASE_META).map(([id,meta])=>{
            const pid = parseInt(id);
            const isCurrent = pid===phase;
            const isPast = pid<phase;
            const tasks = PHASE_TASKS[pid]||[];
            return (
              <div key={id} style={{
                background:isCurrent?"#1a3a09":"#0f1f08",
                border:`2px solid ${isCurrent?meta.color:isPast?"#1e2e10":"#182008"}`,
                borderRadius:12,padding:"12px 14px",marginBottom:8,
                opacity:isPast?0.55:1,
              }}>
                <div style={{marginBottom:isCurrent?10:0}}>
                  <div style={{fontSize:10,color:isPast?"#2d4a15":isCurrent?meta.color:"#3a5a1e",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>
                    {isPast?"✓ Complete":isCurrent?"● Current":""} {meta.dates}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:isCurrent?"#d4f0a0":"#7aaa5a"}}>
                    Phase {id}: {meta.name}
                  </div>
                </div>
                {isCurrent && tasks.map((task,i)=>(
                  <div key={i} style={{fontSize:12,color:"#8ac870",padding:"5px 0",display:"flex",gap:8,lineHeight:1.45,borderBottom:i<tasks.length-1?`1px solid ${border}`:undefined}}>
                    <span style={{color:"#3a6020",flexShrink:0,marginTop:1}}>→</span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Honest expectations */}
          <div style={{background:"#160a00",border:"2px solid #D4860A55",borderRadius:12,padding:"14px",marginTop:16}}>
            <div style={{fontSize:11,color:"#D4860A",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:10}}>
              Honest expectations
            </div>
            {[
              {l:"By mid-August",v:"Significantly denser, greener, mostly weed-free. Fox holes levelled. Bare patches filled. Regular mowing rhythm established."},
              {l:"Not by mid-August",v:"Perfection. Clover and deep buttercup may need a second treatment. Some thin patches under trees may need autumn overseeding."},
              {l:"September–October",v:"Phase 2: hollow tine aeration + overseeding + autumn feed. This is what takes it from very good to immaculate."},
            ].map((e,i)=>(
              <div key={i} style={{background:"#0d0700",borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:700,color:"#FFB347",marginBottom:2}}>{e.l}</div>
                <div style={{fontSize:12,color:"#c8b070",lineHeight:1.45}}>{e.v}</div>
              </div>
            ))}
          </div>
        </>}

      </div>
    </div>
  );
}
