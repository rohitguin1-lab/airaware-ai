# AirAware AI — Urban Air Quality Assistant

A responsive GenAI MVP for the weekend challenge. It combines live hourly air-quality readings with family-oriented routines, indoor-air guidance and an optional OpenAI-powered assistant.

## Included
- Search a city and retrieve hourly European AQI, PM2.5, PM10 and NO₂.
- Family, adult, senior and respiratory-sensitivity profiles.
- Daily low-exposure routine generator based on the latest reading.
- Air quality Q&A with a safe built-in fallback.
- Optional OpenAI Responses API integration through a backend (API key stays server-side).
- Responsive mobile-friendly UI.

## Run locally
Requires Python 3.10+.

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload
```

Open http://127.0.0.1:8000

## Enable GenAI
Set your API key as an environment variable before starting the server. Do not put secrets in `app.js` or commit them.

```bash
# macOS/Linux
export OPENAI_API_KEY="your-key"
# Windows PowerShell
$env:OPENAI_API_KEY="your-key"
uvicorn server:app --reload
```

Optional: set `OPENAI_MODEL` to a model available to your API account. If no key is configured or the API is unavailable, the app uses its local guidance fallback.

## Data and limitations
- Live air-quality data: Open-Meteo Air Quality API and Geocoding API. No API key is required for this prototype.
- The dashboard uses **European AQI**, not India's CPCB National AQI. Label it clearly in demos and submissions; do not compare it directly with CPCB AQI.
- The nearest available model-grid reading is not a roadside sensor measurement. Readings may differ from official monitoring stations.
- Advice is educational and not a medical diagnosis. Follow local government advisories and clinician guidance.
- This MVP does not yet store user profiles or provide push alerts.

## Suggested deployment
Deploy the Python app to Render or another host that supports FastAPI. Build command: `pip install -r requirements.txt`; start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`. Add `OPENAI_API_KEY` as a protected environment variable in the hosting dashboard. Use the service URL as the submission deployment link.

## Challenge submission checklist
1. Add your name and project description to the challenge portal.
2. Deploy the app and test at least two cities.
3. Test the OpenAI assistant with and without the API key.
4. Include screenshots, architecture notes and known limitations.
5. Never claim this is CPCB AQI unless you replace the data source and calculation with CPCB-compatible data.
