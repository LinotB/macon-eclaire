// src/avatar/renderAvatar.js

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Pour des assets locaux dans /public, pas besoin de crossOrigin,
    // mais on le laisse sans risque.
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = (e) => {
      const err = new Error(`❌ Impossible de charger l'image: ${src}`);
      err.cause = e;
      reject(err);
    };

    // petit cache-buster en dev (évite "je vois toujours l'ancienne image")
    const bust = import.meta?.env?.DEV ? `?t=${Date.now()}` : "";
    img.src = src + bust;
  });
}

function drawTinted(ctx, img, x, y, w, h, color) {
  ctx.save();
  ctx.drawImage(img, x, y, w, h);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function gradeToApron(grade) {
  if (grade === "Compagnon") return "/avatarParts/clothes/apron_compagnon.png";
  if (grade === "Maître") return "/avatarParts/clothes/apron_maitre.png";
  return "/avatarParts/clothes/apron_apprenti.png";
}

// Optionnel: si tu veux mapper tes clés UI -> vrais fichiers
function hairKeyToFile(hairStyle) {
  // Si tes fichiers s'appellent exactement classic.png / wavy.png etc,
  // tu peux juste: return hairStyle;
  const map = {
    classic: "classic",
    wavy: "wavy",
    shaved: "shaved",
    white: "white",
    // compat si tu avais "short"
    short: "classic",
  };
  return map[hairStyle] || "classic";
}

export async function renderAvatarToDataURL(config, { size = 512 } = {}) {
  const {
    gender = "male",
    faceShape = "round",
    skinTone = "#F1C08E",
    hairStyle = "classic",
    hairColor = "#2B1B0F",
    beard = "none",
    mustache = "none",
    grade = "Apprenti",
    isOfficer = false,
  } = config || {};

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  // Build layers (on enlève les "none" pour éviter les 404)
  const layers = [
    { src: `/avatarParts/body/${gender}_base.png`, type: "normal" },
    { src: `/avatarParts/head/${gender}_head_${faceShape}.png`, type: "skin" },
    { src: `/avatarParts/hair/${hairKeyToFile(hairStyle)}.png`, type: "hair" },

    // barbe/moustache seulement si != none
    ...(beard !== "none"
      ? [{ src: `/avatarParts/facialHair/beard_${beard}.png`, type: "normal" }]
      : []),

    ...(mustache !== "none"
      ? [{ src: `/avatarParts/facialHair/mustache_${mustache}.png`, type: "normal" }]
      : []),

    { src: gradeToApron(grade), type: "normal" },

    // officer: si false, on NE CHARGE RIEN (pas de sash_none.png obligatoire)
    ...(isOfficer ? [{ src: "/avatarParts/officer/sash_officer.png", type: "normal" }] : []),

    // gants (si tu n'as pas ce fichier, commente cette ligne)
    { src: "/avatarParts/gloves/gloves.png", type: "normal" },
  ];

  // Charge tout (si un seul manque -> erreur explicite avec le chemin)
  const imgs = await Promise.all(layers.map((l) => loadImage(l.src)));

  ctx.clearRect(0, 0, size, size);

  // Render dans le même ordre que layers
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const img = imgs[i];

    if (layer.type === "skin") {
      drawTinted(ctx, img, 0, 0, size, size, skinTone);
    } else if (layer.type === "hair") {
      drawTinted(ctx, img, 0, 0, size, size, hairColor);
    } else {
      ctx.drawImage(img, 0, 0, size, size);
    }
  }

  return canvas.toDataURL("image/png");
}