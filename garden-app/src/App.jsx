import React, { useState, useEffect } from "react";

const LAT = 51.6538;
const LON = -0.1936;
const LAWN_START = new Date("2026-06-15");
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const WMO = {
  0:{l:"Clear sky",i:"☀️"},1:{l:"Mainly clear",i:"🌤"},2:{l:"Partly cloudy",i:"⛅"},
  3:{l:"Overcast",i:"☁️"},45:{l:"Foggy",i:"🌫"},48:{l:"Icy fog",i:"🌫"},
  51:{l:"Light drizzle",i:"🌦"},53:{l:"Drizzle",i:"🌦"},55:{l:"Heavy drizzle",i:"🌧"},
  61:{l:"Light rain",i:"🌧"},63:{l:"Rain",i:"🌧"},65:{l:"Heavy rain",i:"⛈"},
  80:{l:"Showers",i:"🌦"},81:{l:"Showers",i:"🌧"},82:{l:"Heavy showers",i:"⛈"},
  95:{l:"Thunderstorm",i:"⛈"},
};
const wmo = (code) => WMO[code] || {l:"Variable",i:"🌤"};

function getLawnPhase() {
  const days = Math.floor((new Date() - LAWN_START) / 86400000);
  if (days < 0) return 0;
  if (days <= 2) return 1;
  if (days <= 13) return 2;
  if (days <= 20) return 3;
  if (days <= 27) return 4;
  if (days <= 41) return 5;
  return 6;
}

const PHASE_META = {
  1:{name:"Apply Aftercut 4-in-1",week:"Days 1–3 · 15–17 Jun"},
  2:{name:"Wait & Watch",week:"Days 4–14 · 18–28 Jun"},
  3:{name:"Scarify & Aerate",week:"Week 3 · 29 Jun–5 Jul"},
  4:{name:"Seed & Establish",week:"Week 4 · 6–12 Jul"},
  5:{name:"Nurture New Growth",week:"Weeks 5–6 · 13–26 Jul"},
  6:{name:"Consolidate & Review",week:"Weeks 7–8 · 27 Jul–9 Aug"},
};

const PHASE_TASKS = {
  1:["Apply Aftercut 4-in-1 to entire lawn — use a spreader for even coverage","Do NOT water after applying — product must absorb through leaf surface","Do NOT mow for 7 days","Mark bad buttercup patches with a cane so you can spot-check later","Order/collect corded scarifier"],
  2:["Watch moss turn black within 5–7 days (black = dead = good)","Check buttercup patches yellowing by day 10–14","Do NOT mow during this phase","Buy: shade-tolerant lawn seed, topsoil/repair mix, pre-seed fertiliser, garden sprinkler","Water lawn only if >5 dry days at 25°C+ — plain water, no feed yet"],
  3:["Mow first — set blade 1 notch lower than usual","Scarify north–south, then east–west (two full passes)","Rake out ALL debris — the lawn will look devastated. This is correct.","Aerate with garden fork across the whole lawn — 10cm deep, every 10cm","Fill fox holes with topsoil + lawn seed mix, level flat","Apply pre-seed fertiliser across the whole lawn and rake in"],
  4:["Overseed entire lawn at recommended rate — not just bare patches","Rake seed in lightly so it contacts soil — don't just scatter on surface","Water immediately after seeding — aim for consistently moist top 2cm","Water twice daily if temp >25°C — new seed must NEVER fully dry out","Keep children and pets off the lawn for 4 weeks minimum","Spot-spray surviving buttercup with selective liquid weedkiller"],
  5:["Continue watering daily if no rain — roots are still very shallow","Do NOT mow until new grass reaches 5–6cm tall","First mow: highest blade setting, remove no more than 1/3 of height","Apply nitrogen lawn feed after first mow (NOT weed & feed — too harsh for seedlings)","Mark any remaining weed patches with canes"],
  6:["Mow every 5–7 days at normal height (4–5cm)","Spot-treat surviving weeds with selective weedkiller","Overseed any remaining bare patches that didn't take","Apply final lawn feed of the season","Plan Phase 2: September aeration + overseeding for perfection"],
};

const PLANTS = [
  {id:"lawn",name:"Lawn",emoji:"🌿",loc:"Back garden",type:"lawn",potted:false},
  {id:"thuja",name:"Thuja Cones",emoji:"🌲",loc:"Back garden — pots (newly planted)",type:"conifer_new",potted:true,feedProduct:"Miracle-Gro All Purpose liquid",feedFreq:"Monthly",feedMonths:[5,6,7,8,9],note:"First season — high water need all summer. Roots not yet established."},
  {id:"cupro",name:"Cuprocyparis",emoji:"🌳",loc:"Front door — pots, exposed/windy",type:"conifer_new_exposed",potted:true,feedProduct:"Miracle-Gro All Purpose liquid",feedFreq:"Monthly",feedMonths:[5,6,7,8,9],note:"Newly planted in exposed position. Wind accelerates drying — check more frequently than sheltered pots."},
  {id:"wisteria",name:"Wisteria",emoji:"🪻",loc:"Back garden — pots",type:"wisteria",potted:true,feedProduct:"Tomorite (high potash)",feedFreq:"Weekly until August",feedMonths:[4,5,6,7,8],note:"Prune July: cut new shoots to 5 leaves. Prune February: cut to 2–3 buds."},
  {id:"olive",name:"Olive Tree",emoji:"🫒",loc:"Pot — John Innes No.3",type:"mediterranean",potted:true,feedProduct:"Balanced liquid feed (Phostrogen)",feedFreq:"Monthly Apr–Sep",feedMonths:[4,5,6,7,8,9],note:"Drought tolerant. Overwatering is the greater risk. Allow compost to almost dry between waterings."},
  {id:"lemon",name:"Lemon Tree",emoji:"🍋",loc:"Pot — citrus",type:"citrus",potted:true,feedProduct:"Westland Citrus Feed or Miracle-Gro Citrus",feedFreq:"Every 2 weeks Mar–Sep",feedMonths:[3,4,5,6,7,8,9],note:"Keep consistently moist but never waterlogged. Yellow leaves = over or underwatering. Bring in below 5°C."},
  {id:"kumquat",name:"Kumquat",emoji:"🍊",loc:"Pot — citrus",type:"citrus",potted:true,feedProduct:"Westland Citrus Feed or Miracle-Gro Citrus",feedFreq:"Every 2 weeks Mar–Sep",feedMonths:[3,4,5,6,7,8,9],note:"Same care as lemon. More compact but identical watering and feeding requirements."},
  {id:"hydrangea",name:"Hydrangeas",emoji:"💐",loc:"Pots or borders",type:"hydrangea",potted:true,feedProduct:"Miracle-Gro Flowering Plant Food or Tomorite",feedFreq:"Monthly May–Aug",feedMonths:[4,5,6,7,8],note:"High water need — wilts visibly within hours in heat. Don't let dry out in summer."},
  {id:"strawberries",name:"Strawberries",emoji:"🍓",loc:"Trough — courtyard",type:"fruiting",potted:true,feedProduct:"Tomorite (high potash)",feedFreq:"Weekly once fruiting",feedMonths:[5,6,7,8],note:"Water at the base only — wetting fruit and leaves encourages mould. Toscana & Orange Spice in trough."},
  {id:"tomatoes",name:"Sungold Tomatoes",emoji:"🍅",loc:"Trough — courtyard",type:"tomato",potted:true,feedProduct:"Tomorite (high potash)",feedFreq:"Weekly from first flower",feedMonths:[5,6,7,8,9],note:"Consistent moisture is critical — irregular watering causes blossom end rot and split fruit. Check for suckers every 4–5 days."},
  {id:"bougainvillea",name:"Bougainvillea",emoji:"🌸",loc:"Courtyard — pot",type:"bougainvillea",potted:true,feedProduct:"Tomorite or specialist high-potash",feedFreq:"Every 2–3 weeks",feedMonths:[5,6,7,8,9],note:"Only water when top 3cm is completely dry. Mediterranean — prefers drought to wet roots. No dish under pot."},
];

function plantRec(plant, w, phase) {
  if (!w) return {a:"CHECK",c:"#7B5E3A",r:"Waiting for weather data…",t:""};
  const {recentRain,todayMax,todayRainProb,tomorrowRainProb,dryDays,todayRain} = w;
  const hot = todayMax >= 25, vhot = todayMax >= 30;
  const rained = recentRain >= 5, heavyRain = recentRain >= 15;
  const rainingNow = todayRainProb >= 60 || todayRain >= 2;
  const rainTomorrow = tomorrowRainProb >= 65;

  switch(plant.type) {
    case "lawn": {
      if (phase === 1) return {a:"SKIP",c:"#e05a00",r:"Aftercut absorbing — no watering for 48hrs after application",t:""};
      if (phase === 3) {
        if (rained && recentRain < 20) return {a:"GOOD DAY",c:"#5B8A1E",r:`${recentRain}mm recent rain — soil moist. Ideal scarifying conditions.`,t:"Any time"};
        if (dryDays >= 3) return {a:"WATER TONIGHT",c:"#D4860A",r:"Soil too dry to scarify — water lightly tonight, scarify tomorrow morning",t:"Tonight"};
        return {a:"CHECK",c:"#7B5E3A",r:"Soil should be moist but not muddy before scarifying",t:""};
      }
      if (phase === 4 || phase === 5) {
        if (rainingNow) return {a:"SKIP",c:"#2D5016",r:"Raining today — seed getting natural moisture. Check it isn't pooling.",t:""};
        if (heavyRain) return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm rain — check top 2cm is moist, don't add more yet`,t:""};
        if (vhot && !rained) return {a:"WATER TWICE",c:"#c0392b",r:`${todayMax}°C — new seed critical: water morning AND evening without fail`,t:"7am + 7pm"};
        if (hot && !rained) return {a:"WATER",c:"#D4860A",r:`${todayMax}°C and no recent rain — water this evening`,t:"Evening"};
        if (!rained) return {a:"WATER",c:"#4A90A4",r:"No recent rain — water to keep top 2cm consistently moist",t:"Morning"};
        return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm recent rain — check 2cm depth before adding more`,t:""};
      }
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — lawn well watered naturally`,t:""};
      if (vhot && dryDays >= 7) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days at ${todayMax}°C — water deeply to prevent dormancy`,t:"Evening"};
      return {a:"SKIP",c:"#2D5016",r:"Established lawn — UK rainfall usually sufficient. Skip unless prolonged drought.",t:""};
    }
    case "conifer_new": {
      if (heavyRain || rainingNow) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient for now`,t:""};
      if (vhot || (hot && dryDays >= 1)) return {a:"WATER",c:"#c0392b",r:`${todayMax}°C — newly planted. Water thoroughly every evening in heat.`,t:"Evening"};
      if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip today`,t:""};
      if (dryDays >= 2) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days — water until drains from base`,t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:"Finger test 2cm deep — water if dry. First season: err on side of more.",t:""};
    }
    case "conifer_new_exposed": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot || hot) return {a:"WATER",c:"#c0392b",r:`${todayMax}°C + exposed position — check every evening. Wind dries faster than sheltered pots.`,t:"Evening"};
      if (rained && dryDays < 2) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip`,t:""};
      if (dryDays >= 1) return {a:"CHECK",c:"#D4860A",r:"Exposed to wind — dries faster than rear garden pots. Check daily.",t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:"Check daily — wind exposure means faster drying than other pots",t:""};
    }
    case "wisteria": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — pot likely saturated`,t:""};
      if (rained && !vhot) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot || dryDays >= 3) return {a:"WATER",c:"#4A90A4",r:`${dryDays >= 3 ? dryDays+" dry days" : todayMax+"°C"} — water wisteria pots thoroughly`,t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:"Water when top 3cm feels dry. Weekly Tomorite is more important than extra water.",t:""};
    }
    case "mediterranean": {
      if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — olive doesn't need more. Let it drain fully.`,t:""};
      if (vhot && dryDays >= 4) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days at ${todayMax}°C — water olive now. Allow compost to almost dry before next watering.`,t:"Morning"};
      if (dryDays >= 6) return {a:"WATER",c:"#4A90A4",r:`${dryDays} consecutive dry days — time to water olive`,t:"Morning"};
      return {a:"SKIP",c:"#2D5016",r:"Drought tolerant — only water after 4–5 dry days or extreme heat (30°C+)",t:""};
    }
    case "citrus": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip. Citrus hates waterlogging.`,t:""};
      if (rained && !vhot) return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm rain — check compost is moist not wet before adding more`,t:""};
      if (vhot || dryDays >= 3) return {a:"WATER",c:"#4A90A4",r:`${vhot ? todayMax+"°C" : dryDays+" dry days"} — citrus needs consistent moisture. Water until it drains from base.`,t:"Morning"};
      return {a:"WATER",c:"#4A90A4",r:"Citrus likes consistent moisture — every 2–3 days in summer",t:"Morning"};
    }
    case "hydrangea": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot) return {a:"WATER",c:"#c0392b",r:`${todayMax}°C — hydrangeas wilt fast. Water morning AND check again evening.`,t:"Morning + evening"};
      if (hot || dryDays >= 2) return {a:"WATER",c:"#4A90A4",r:`${hot ? todayMax+"°C" : dryDays+" dry days"} — hydrangeas have high water needs in warm weather`,t:"Morning"};
      if (!rained) return {a:"WATER",c:"#4A90A4",r:"No recent rain — hydrangeas need regular moisture",t:"Morning"};
      return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient for today`,t:""};
    }
    case "fruiting": {
      if (heavyRain) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip. Water at base only when needed.`,t:""};
      if (rained && !hot) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — sufficient`,t:""};
      if (vhot || dryDays >= 2) return {a:"WATER",c:"#4A90A4",r:`${vhot ? todayMax+"°C" : dryDays+" dry days"} — water at the base only (not on fruit or leaves)`,t:"Morning"};
      return {a:"WATER",c:"#4A90A4",r:"Strawberries in trough need regular moisture — water at base",t:"Morning"};
    }
    case "tomato": {
      if (heavyRain) return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm rain — check soil. Consistent moisture needed, not flooding`,t:""};
      if (vhot && dryDays >= 1) return {a:"WATER DAILY",c:"#c0392b",r:`${todayMax}°C — daily watering essential. Inconsistency = blossom end rot and split fruit.`,t:"Morning"};
      if (hot || dryDays >= 2) return {a:"WATER",c:"#D4860A",r:`${hot ? todayMax+"°C" : dryDays+" dry days"} — tomatoes prefer consistent daily moisture`,t:"Morning"};
      if (!rained) return {a:"WATER",c:"#4A90A4",r:"No recent rain — water tomatoes. Check for suckers while there.",t:"Morning"};
      return {a:"CHECK",c:"#7B5E3A",r:`${recentRain}mm rain — check compost 3cm deep before watering`,t:""};
    }
    case "bougainvillea": {
      if (rainingNow || heavyRain) return {a:"SKIP ⚠️",c:"#c0392b",r:`Heavy/current rain — check drainage hole is clear. Overwatering kills bougainvillea.`,t:""};
      if (rained) return {a:"SKIP",c:"#2D5016",r:`${recentRain}mm rain — skip. Bougainvillea prefers dry conditions between waterings.`,t:""};
      if (dryDays >= 6) return {a:"WATER",c:"#4A90A4",r:`${dryDays} dry days — compost should be fully dry now. Water thoroughly then leave alone.`,t:"Morning"};
      if (dryDays >= 4) return {a:"CHECK",c:"#7B5E3A",r:`${dryDays} dry days — check if top 3cm is completely dry. Only water if it is.`,t:"Morning"};
      return {a:"SKIP",c:"#2D5016",r:"Only water when top 3cm is completely dry — always err on side of less",t:""};
    }
    default: return {a:"CHECK",c:"#7B5E3A",r:"Check soil moisture before watering",t:""};
  }
}

function getTodayActions(w, phase) {
  if (!w) return [{p:"LOW",i:"⏳",t:"Loading weather data…"}];
  const {todayMax,recentRain,tomorrowRainProb,dryDays,todayRainProb,todayRain} = w;
  const hot = todayMax >= 25, vhot = todayMax >= 30;
  const rained = recentRain >= 5;
  const rainTomorrow = tomorrowRainProb >= 65;
  const rainingNow = todayRainProb >= 60 || todayRain >= 2;
  const month = new Date().getMonth() + 1;
  const actions = [];

  if (phase === 1) {
    if (!rainingNow && recentRain < 2 && todayRainProb < 50) {
      actions.push({p:"HIGH",i:"🌿",t:"Apply Aftercut 4-in-1 today — dry conditions are ideal. Don't water after application."});
    } else {
      actions.push({p:"WAIT",i:"⏳",t:`Rain expected or recent (${recentRain}mm) — wait for dry conditions. Aftercut needs 24hrs dry to absorb properly.`});
    }
  }
  if (phase === 2 && rainTomorrow) actions.push({p:"NOTE",i:"🌧",t:`Rain likely tomorrow (${tomorrowRainProb}%) — good for the lawn. Weedkiller has had time to work.`});
  if (phase === 3) {
    if (rained && recentRain < 20) actions.push({p:"HIGH",i:"⚡",t:`Ideal scarifying day — soil moist from ${recentRain}mm recent rain. Get the scarifier out now.`});
    else if (dryDays >= 3) actions.push({p:"MEDIUM",i:"💧",t:`Soil too dry to scarify (${dryDays} dry days). Water lightly tonight, scarify tomorrow morning.`});
  }
  if (phase === 4 || phase === 5) {
    if (vhot && !rained) actions.push({p:"CRITICAL",i:"🚨",t:`${todayMax}°C and dry — new seed emergency. Water at 7am AND 7pm today without fail.`});
    else if (hot && !rained) actions.push({p:"HIGH",i:"💧",t:`${todayMax}°C — water new lawn seed this evening. Top 2cm must stay consistently moist.`});
  }
  if (vhot) actions.push({p:"HIGH",i:"🍅",t:`${todayMax}°C — water tomatoes this morning and check for new suckers.`});
  else if (!rained) actions.push({p:"MEDIUM",i:"🍅",t:"Water tomatoes and strawberries this morning — no recent rain."});
  if (recentRain >= 10) actions.push({p:"HIGH",i:"🌸",t:`Heavy recent rain (${recentRain}mm) — check bougainvillea drainage immediately.`});
  if (vhot) actions.push({p:"HIGH",i:"💐",t:`${todayMax}°C — water hydrangeas first thing. They wilt within hours in heat.`});
  if (hot) actions.push({p:"MEDIUM",i:"🌳",t:`${todayMax}°C — check Cuprocyparis pots at front door. Exposed position dries faster.`});
  if (month === 7) actions.push({p:"MEDIUM",i:"✂️",t:"July pruning window — cut wisteria new shoots back to 5 leaves from the main framework."});
  if (new Date().getDay() === 1 && !rainingNow) actions.push({p:"MEDIUM",i:"🧪",t:"Monday = Tomorite day. Feed tomatoes, strawberries and wisteria."});
  if (rainTomorrow && !rainingNow) actions.push({p:"LOW",i:"🌧",t:`Rain likely tomorrow (${tomorrowRainProb}%) — ease off watering today.`});
  if (actions.length === 0) actions.push({p:"LOW",i:"✅",t:"No urgent actions. Quick visual check on all pots and enjoy the garden."});

  const order = {CRITICAL:0,HIGH:1,MEDIUM:2,NOTE:3,WAIT:4,LOW:5};
  return actions.sort((a,b)=>order[a.p]-order[b.p]).slice(0,5);
}

const PC = {CRITICAL:"#c0392b",HIGH:"#D4860A",MEDIUM:"#5B8A1E",NOTE:"#4A90A4",WAIT:"#7B5E3A",LOW:"#3a5a1e"};

// localStorage helpers — simple wrappers so reads/writes never throw
const ls = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch {} },
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e?.message || "Unknown error" }; }
  render() {
    if (this.state.error) return (
      <div style={{minHeight:"100vh",background:"#0e1c07",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",padding:24}}>
        <div style={{background:"#1a0a0a",border:"1px solid #c0392b",borderRadius:12,padding:20,maxWidth:400,color:"#e8ead4"}}>
          <div style={{color:"#c0392b",fontWeight:700,marginBottom:8}}>Something went wrong</div>
          <div style={{fontSize:13,color:"#a88",marginBottom:16}}>{this.state.error}</div>
          <button onClick={()=>this.setState({error:null})} style={{background:"#2d5016",border:"none",color:"#8db85a",borderRadius:6,padding:"8px 16px",cursor:"pointer",fontSize:13}}>
            Retry
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  return <ErrorBoundary><GardenAdvisor /></ErrorBoundary>;
}

function GardenAdvisor() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [tab, setTab] = useState("today");
  const [watered, setWatered] = useState({});
  const [fedLog, setFedLog] = useState({});
  const [expandedPlant, setExpandedPlant] = useState(null);

  const today = new Date();
  const phase = getLawnPhase();

  // Load persisted data on mount
  useEffect(() => {
    // Watered — only today's
    const w = ls.get("gard-watered");
    if (w) {
      try {
        const p = JSON.parse(w);
        if (p.date === today.toDateString()) setWatered(p.plants || {});
      } catch {}
    }

    // Feed log — persists across days
    const f = ls.get("gard-fed");
    if (f) {
      try { setFedLog(JSON.parse(f)); } catch {}
    }

    // Weather
    (async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&past_days=2&forecast_days=7&timezone=Europe%2FLondon`;
        const res = await fetch(url);
        const d = await res.json();
        const daily = d.daily;
        const recentRain = (daily.precipitation_sum[0]||0) + (daily.precipitation_sum[1]||0);
        let dryDays = 0;
        for (let i = daily.precipitation_sum.length - 1; i >= 0; i--) {
          if ((daily.precipitation_sum[i]||0) < 1) dryDays++;
          else break;
        }
        setWeather({
          recentRain: Math.round(recentRain*10)/10,
          todayRain: Math.round((daily.precipitation_sum[2]||0)*10)/10,
          todayMax: Math.round(daily.temperature_2m_max[2]),
          todayMin: Math.round(daily.temperature_2m_min[2]),
          todayCode: daily.weathercode[2],
          todayRainProb: daily.precipitation_probability_max[2]||0,
          tomorrowMax: Math.round(daily.temperature_2m_max[3]),
          tomorrowRainProb: daily.precipitation_probability_max[3]||0,
          dryDays,
          forecast: daily.time.slice(2,7).map((date,i) => ({
            date, day: DAYS_SHORT[new Date(date).getDay()],
            max: Math.round(daily.temperature_2m_max[i+2]),
            rain: Math.round((daily.precipitation_sum[i+2]||0)*10)/10,
            prob: daily.precipitation_probability_max[i+2]||0,
            code: daily.weathercode[i+2],
          })),
        });
      } catch {
        setWeatherError(true);
        setWeather({recentRain:0,todayRain:0,todayMax:22,todayMin:14,todayCode:1,todayRainProb:20,tomorrowMax:23,tomorrowRainProb:30,dryDays:2,forecast:[]});
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  const toggleWatered = (id) => {
    const next = {...watered, [id]: !watered[id]};
    setWatered(next);
    ls.set("gard-watered", JSON.stringify({date: today.toDateString(), plants: next}));
  };

  const markFed = (id) => {
    const next = {...fedLog, [id]: today.toISOString()};
    setFedLog(next);
    ls.set("gard-fed", JSON.stringify(next));
  };

  const daysSinceFed = (id) => {
    if (!fedLog[id]) return null;
    return Math.floor((today - new Date(fedLog[id])) / 86400000);
  };

  const bg = "#0e1c07", card = "#152008", border = "#1e3610", accent = "#5B8A1E";

  if (loading || !weather) return (
    <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div style={{color:accent,fontSize:16}}>Fetching Barnet weather…</div>
    </div>
  );

  const todayWMO = wmo(weather.todayCode);
  const todayActions = getTodayActions(weather, phase);

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"system-ui,sans-serif",color:"#e8ead4"}}>

      <div style={{background:"linear-gradient(135deg,#1a3a09,#2d5016)",borderBottom:`3px solid ${accent}`,padding:"14px 16px 10px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"#8db85a",textTransform:"uppercase",marginBottom:3}}>Barnet · North London · Live</div>
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
              {weatherError && <div style={{fontSize:10,color:"#D4860A"}}>⚠ Estimated</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {[
              {l:"Recent rain",v:`${weather.recentRain}mm (48h)`},
              {l:"Rain today",v:`${weather.todayRainProb}%`},
              {l:"Dry days",v:`${weather.dryDays}d streak`},
              {l:"Tomorrow",v:`${weather.tomorrowMax}°C · ${weather.tomorrowRainProb}% rain`},
            ].map((s,i)=>(
              <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:6,padding:"4px 10px"}}>
                <div style={{fontSize:10,color:"#6a9a3a",textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.l}</div>
                <div style={{fontSize:12,fontWeight:600,color:"#c8e6a0"}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {weather.forecast?.length > 0 && (
        <div style={{background:"#0f1f08",borderBottom:`1px solid ${border}`}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",overflowX:"auto",padding:"8px 16px",gap:6}}>
            {weather.forecast.map((f,i)=>(
              <div key={i} style={{flex:"0 0 auto",textAlign:"center",padding:"6px 10px",background:i===0?card:"#0a1505",borderRadius:8,border:`1px solid ${i===0?accent:border}`,minWidth:56}}>
                <div style={{fontSize:10,fontWeight:700,color:i===0?"#d4f0a0":"#5a8a2a",marginBottom:2}}>{i===0?"Today":f.day}</div>
                <div style={{fontSize:16}}>{wmo(f.code).i}</div>
                <div style={{fontSize:13,fontWeight:600,color:"#c8e6a0"}}>{f.max}°</div>
                {f.rain>0&&<div style={{fontSize:10,color:"#4A90A4"}}>{f.rain}mm</div>}
                {f.prob>30&&<div style={{fontSize:10,color:"#4A90A4"}}>{f.prob}%</div>}
              </div>
            ))}
          </div>
        </div>
      )}

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

        {tab==="today" && <>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:1}}>Lawn restoration</div>
              <div style={{fontSize:14,fontWeight:700,color:"#c8e6a0"}}>Phase {phase}: {PHASE_META[phase]?.name}</div>
              <div style={{fontSize:11,color:"#5a8a2a"}}>{PHASE_META[phase]?.week}</div>
            </div>
            <button onClick={()=>setTab("lawn")} style={{background:"#2d5016",border:`1px solid ${accent}`,color:"#8db85a",borderRadius:6,padding:"5px 10px",fontSize:12,cursor:"pointer"}}>
              View →
            </button>
          </div>

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

          <div style={{fontSize:11,color:accent,textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:10}}>Today's watering at a glance</div>
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
                    {done&&<span style={{fontSize:13,color:accent}}>✓</span>}
                  </div>
                  <div style={{display:"inline-flex",background:`${rec.c}20`,border:`1px solid ${rec.c}77`,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:700,color:rec.c}}>
                    {rec.a}
                  </div>
                  {rec.t&&<div style={{fontSize:10,color:"#6a9a3a",display:"block",marginTop:2}}>⏰ {rec.t}</div>}
                </div>
              );
            })}
          </div>
        </>}

        {tab==="plants" && <>
          <div style={{fontSize:11,color:accent,textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:12}}>
            Detailed plant advice — {today.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
          </div>
          {PLANTS.map(plant=>{
            const rec = plantRec(plant,weather,phase);
            const done = watered[plant.id];
            const dsf = daysSinceFed(plant.id);
            const month = today.getMonth()+1;
            const feedActive = plant.feedMonths?.includes(month);
            const isOpen = expandedPlant===plant.id;
            return (
              <div key={plant.id} style={{background:card,border:`2px solid ${done?"#1e3a0e":rec.c}55`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                <div onClick={()=>setExpandedPlant(isOpen?null:plant.id)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
                {isOpen && (
                  <div style={{padding:"0 14px 14px",borderTop:`1px solid ${border}`}}>
                    <div style={{padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                      <div style={{fontSize:13,color:"#a8c880",lineHeight:1.55,marginBottom:rec.t?6:0}}>{rec.r}</div>
                      {rec.t&&<div style={{fontSize:12,color:"#6a9a3a"}}>⏰ Best time: <strong style={{color:"#8db85a"}}>{rec.t}</strong></div>}
                    </div>
                    {plant.feedProduct && (
                      <div style={{padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                        <div style={{fontSize:11,color:"#D4860A",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>🧪 Feed</div>
                        <div style={{fontSize:13,color:"#c8b070",marginBottom:3}}>{plant.feedProduct}</div>
                        <div style={{fontSize:12,color:"#8a7040"}}>Frequency: {plant.feedFreq}</div>
                        {!feedActive && <div style={{fontSize:12,color:"#3a5020",marginTop:3}}>Not in feeding season currently</div>}
                        {feedActive && dsf !== null && (
                          <div style={{fontSize:12,color:dsf>14?"#c0392b":"#6a9a3a",marginTop:3}}>
                            Last fed: {dsf===0?"today":`${dsf} days ago`}{dsf>14?" — overdue":""}
                          </div>
                        )}
                        {feedActive && dsf === null && (
                          <div style={{fontSize:12,color:"#D4860A",marginTop:3}}>No feed logged yet this season</div>
                        )}
                      </div>
                    )}
                    {plant.note && (
                      <div style={{padding:"8px 0",borderBottom:`1px solid ${border}`,fontSize:12,color:"#6a8040",fontStyle:"italic",lineHeight:1.5}}>
                        {plant.note}
                      </div>
                    )}
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

        {tab==="lawn" && <>
          <div style={{fontSize:11,color:accent,textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:12}}>
            8-Week Restoration Programme
          </div>
          {Object.entries(PHASE_META).map(([id,meta])=>{
            const pid = parseInt(id);
            const isCurrent = pid===phase;
            const isPast = pid<phase;
            const tasks = PHASE_TASKS[pid]||[];
            return (
              <div key={id} style={{
                background:isCurrent?"#1a3a09":"#0f1f08",
                border:`2px solid ${isCurrent?accent:isPast?"#1e2e10":"#182008"}`,
                borderRadius:12,padding:"12px 14px",marginBottom:8,
                opacity:isPast?0.55:1,
              }}>
                <div style={{marginBottom:isCurrent?10:0}}>
                  <div style={{fontSize:10,color:isPast?"#2d4a15":isCurrent?accent:"#3a5a1e",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>
                    {isPast?"✓ Complete":isCurrent?"● Current":""} {meta.week}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:isCurrent?"#d4f0a0":"#7aaa5a"}}>
                    Phase {id}: {meta.name}
                  </div>
                </div>
                {isCurrent && tasks.map((task,i)=>(
                  <div key={i} style={{fontSize:12,color:"#8ac870",padding:"4px 0",display:"flex",gap:8,lineHeight:1.45,borderBottom:i<tasks.length-1?`1px solid ${border}`:undefined}}>
                    <span style={{color:"#3a6020",flexShrink:0,marginTop:1}}>→</span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            );
          })}
          <div style={{background:"#160a00",border:"2px solid #D4860A55",borderRadius:12,padding:"14px",marginTop:16}}>
            <div style={{fontSize:11,color:"#D4860A",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:10}}>Honest expectations</div>
            {[
              {l:"By mid-August",v:"Significantly denser, greener, mostly weed-free. Fox holes levelled. Bare patches filled."},
              {l:"Not by mid-August",v:"Perfection. Some buttercup may need a second treatment. Thin areas need autumn overseeding."},
              {l:"September–October",v:"Phase 2: one more aeration + overseed + feed cycle will finish the job properly."},
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
