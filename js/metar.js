// ======================================================
// METAR — VERSION PRO+
// Chargement sécurisé, logs propres, UI robuste.
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON, updateStatusPanel } from "./helpers.js";
import { 
    getRunwayFromWind, 
    RUNWAYS, 
    computeCrosswind, 
    drawRunway, 
    drawCorridor, 
    updateRunwayPanel 
} from "./runways.js";

// ------------------------------------------------------
// Logging PRO+
// ------------------------------------------------------
const IS_DEV = location.hostname.includes("localhost") || location.hostname.includes("127.0.0.1");
const log = (...a) => IS_DEV && console.log("[METAR]", ...a);
const logErr = (...a) => console.error("[METAR ERROR]", ...a);

// ------------------------------------------------------
// Chargement sécurisé
// ------------------------------------------------------
export async function safeLoadMetar() {
    try {
        await loadMetar();
        log("METAR chargé");
    } catch (err) {
        logErr("Erreur METAR :", err);
    }
}

// ------------------------------------------------------
// Chargement brut
// ------------------------------------------------------
export async function loadMetar() {
    const data = await fetchJSON(ENDPOINTS.metar);
    updateMetarUI(data);
    updateStatusPanel("METAR", data);
}

// ------------------------------------------------------
// Mise à jour UI + piste
// ------------------------------------------------------
export function updateMetarUI(data) {
    const el = document.getElementById("metar");
    if (!el) return;

    if (!data || !data.raw) {
        el.innerText = "METAR indisponible";
        drawRunway("UNKNOWN", window.runwayLayer);
        drawCorridor("UNKNOWN", window.corridorLayer);
        return;
    }

    el.innerText = data.raw;

    const windDir = data.wind_direction?.value;
    const windSpeed = data.wind_speed?.value;

    const runway = getRunwayFromWind(windDir);
    const { crosswind } = computeCrosswind(
        windDir, 
        windSpeed, 
        RUNWAYS[runway]?.heading
    );

    updateRunwayPanel(runway, windDir, windSpeed, crosswind);

    drawRunway(runway, window.runwayLayer);
    drawCorridor(runway, window.corridorLayer);
}
