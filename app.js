const $ = id => document.getElementById(id);
let air = null, currentCity = "Hyderabad", currentCountry = "India";
$("today").textContent = new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short"}).format(new Date());

function category(aqi){
  if(aqi<=20)return ["Good","GOOD","Air quality is good. Enjoy normal activities, while staying aware of personal sensitivities."];
  if(aqi<=40)return ["Fair","FAIR","Air quality is acceptable for most people. Sensitive individuals may prefer lighter outdoor activity."];
  if(aqi<=60)return ["Moderate","MODERATE","Consider reducing prolonged or strenuous outdoor activity if you are sensitive to air pollution."];
  if(aqi<=80)return ["Poor","POOR","Reduce prolonged outdoor exertion. Move exercise indoors and keep indoor particle sources low."];
  if(aqi<=100)return ["Very poor","VERY POOR","Avoid strenuous outdoor activity, especially for children and sensitive groups. Follow local advisories."];
  return ["Extremely poor","EXTREME","Minimise outdoor exposure and follow local public-health guidance. Seek medical advice for concerning symptoms."];
}
async function getJSON(url){const r=await fetch(url);if(!r.ok)throw new Error("Could not retrieve air-quality data.");return r.json()}
async function loadAir(city){
  $("updated").textContent="Finding location…";
  const geo=await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if(!geo.results?.length)throw new Error("City not found. Try a nearby larger city.");
  const place=geo.results[0];currentCity=place.name;currentCountry=place.country||"";
  const data=await getJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}&longitude=${place.longitude}&hourly=pm10,pm2_5,nitrogen_dioxide,european_aqi&timezone=auto&forecast_days=1`);
  const times=data.hourly.time, now=new Date();let idx=0,best=Infinity;
  times.forEach((t,i)=>{const diff=Math.abs(new Date(t)-now);if(diff<best){best=diff;idx=i}});
  air={aqi:data.hourly.european_aqi[idx],pm25:data.hourly.pm2_5[idx],pm10:data.hourly.pm10[idx],no2:data.hourly.nitrogen_dioxide[idx],time:times[idx],lat:place.latitude,lon:place.longitude};
  renderAir();$("updated").textContent="Reading for "+new Date(air.time).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+" · local time";
}
function renderAir(){
  const a=Math.round(air.aqi??0),c=category(a);
  $("aqi").textContent=Number.isFinite(a)?a:"—";$("aqiStatus").textContent=c[0];$("statusPill").textContent=c[1];
  $("locationName").textContent=currentCity+(currentCountry?", "+currentCountry:"");
  $("pm25").textContent=fmt(air.pm25);$("pm10").textContent=fmt(air.pm10);$("no2").textContent=fmt(air.no2);
  $("meterFill").style.width=Math.min(100,a/100*100)+"%";$("aqiAdvice").textContent=c[2];
}
function fmt(v){return v==null?"—":Number(v).toFixed(1)}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600)}
$("searchBtn").addEventListener("click",async()=>{try{await loadAir($("cityInput").value.trim()||"Hyderabad")}catch(e){toast(e.message);$("updated").textContent="Unable to update"}});
$("cityInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("searchBtn").click()});

function makePlan(){
  if(!air){toast("Please load an air-quality reading first.");return}
  const a=air.aqi,profile=$("profile").value,priority=$("priority").value;
  let items=[];
  if(a<=40)items.push("Outdoor time is generally reasonable for most people; check conditions again before longer activity.");
  else if(a<=60)items.push("Keep outdoor activity moderate and take breaks; sensitive family members should use their own comfort as a guide.");
  else items.push("Move running and strenuous play indoors. Keep necessary trips shorter and avoid busy roads where possible.");
  if(profile==="family")items.push("For children, choose indoor active play when air is poor; avoid outdoor sports near traffic.");
  if(profile==="senior")items.push("Plan errands for a lower-pollution period if available and avoid strenuous exertion outdoors.");
  if(profile==="sensitive")items.push("Keep prescribed medicines and your clinician's action plan accessible; follow medical advice if symptoms occur.");
  if(priority==="school and commute")items.push("Choose routes away from idling vehicles where practical; keep children away from roadside queues.");
  if(priority==="exercise")items.push("Swap outdoor cardio for indoor movement or stretching when readings are poor.");
  if(priority==="work and errands")items.push("Combine errands into one trip and avoid peak traffic corridors where possible.");
  items.push("At home: damp-dust and wet-mop, avoid incense/candles and tobacco smoke, and use a correctly sized HEPA purifier if available.");
  items.push("Ventilate when outdoor air is cleaner; do not assume a fixed time of day is always best.");
  $("planOutput").innerHTML="<strong>Your suggested routine</strong><ul>"+items.map(x=>"<li>"+escapeHTML(x)+"</li>").join("")+"</ul><small>Based on European AQI "+Math.round(a)+" and your selected household profile.</small>";
}
$("planBtn").addEventListener("click",makePlan);
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function addBubble(text,who){const d=document.createElement("div");d.className=who+"-bubble";d.textContent=text;$("chatMessages").appendChild(d);$("chatMessages").scrollTop=$("chatMessages").scrollHeight}
function localAnswer(q){
  const a=air?.aqi??null,cat=a===null?"not currently loaded":category(a)[0].toLowerCase(),s=q.toLowerCase();
  if(s.includes("child")||s.includes("play"))return `The current reading in ${currentCity} is ${a===null?"not available":`European AQI ${Math.round(a)} (${cat})`}. If air is poor or very poor, move strenuous play indoors. If air is good or fair, most children can usually follow normal activity, but consider symptoms and local advisories.`;
  if(s.includes("ventilat")||s.includes("window"))return "Ventilate when outdoor air is cleaner, rather than relying on a fixed clock time. Check local readings first; keep windows closed during nearby smoke, heavy traffic or a pollution spike. A portable HEPA purifier can help reduce particles indoors.";
  if(s.includes("mask"))return "For necessary outdoor exposure during particle pollution, a well-fitting certified respirator such as an N95/FFP2 can reduce inhaled particles. Fit matters. Masks do not protect equally against every gas, and children should use only age-appropriate products with suitable fit.";
  if(s.includes("purif")||s.includes("filter"))return "Look for a true HEPA filter and a clean-air delivery rate (CADR) appropriate for the room size. Run it consistently, keep doors/windows managed, and replace filters according to the manufacturer's instructions. Avoid devices that intentionally generate ozone.";
  return `For ${currentCity}, the latest loaded European AQI is ${a===null?"not available":`${Math.round(a)} (${cat})`}. Reduce indoor pollution sources (smoke, incense and candles), damp-dust, and ventilate when outdoor air is cleaner. Tell me whether you're asking about children, commuting, exercise or indoor air and I can make the advice more specific.`;
}
async function askAI(question){
  try{
    const r=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,city:currentCity,air,profile:$("profile").value})});
    if(r.ok){const j=await r.json();if(j.answer)return j.answer}
  }catch(e){}
  return localAnswer(question);
}
async function sendQuestion(q){
  if(!q.trim())return;addBubble(q,"user");$("chatInput").value="";
  const pending=document.createElement("div");pending.className="bot-bubble";pending.textContent="Thinking…";$("chatMessages").appendChild(pending);
  const answer=await askAI(q);pending.textContent=answer;
}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();sendQuestion($("chatInput").value)});
document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>sendQuestion(b.textContent)));
loadAir("Hyderabad").catch(e=>{$("updated").textContent="Live data unavailable";toast(e.message)});
