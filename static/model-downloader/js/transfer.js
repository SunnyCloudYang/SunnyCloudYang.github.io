// Transfer Page JavaScript
// Handles model preview and download functionality

// API Configuration
const API_BASE_URL = "https://gar-quality-solely.ngrok-free.app";
const getApiUrl = (endpoint) =>
  `${API_BASE_URL}/model-downloader/api${endpoint}`;

// i18n - Translations
const translations = {
  en: {
    title: "📦 Model Downloader",
    loadingModel: "Loading model...",
    loadingPreview: "Loading preview...",
    previewUnavailable: "Preview unavailable",
    modelId: "Model ID",
    prompt: "Prompt",
    style: "Style",
    aiModel: "AI Model",
    triangles: "Triangles",
    author: "Author",
    downloadGlb: "Download GLB Model",
    downloadHint: "Click to download the 3D model file",
    preparingDownload: "Preparing download...",
    startingDownload: "Starting download...",
    downloading: "Downloading...",
    downloadComplete: "Download complete!",
    downloadReady: "Download Ready!",
    saveGlbFile: "Save GLB File",
    copyDownloadLink: "Copy Download Link",
    linkCopied: "Link copied!",
    convertHint: "Need another format?",
    convertOnMeshy: "Convert on Meshy",
    expirationNotice: "⚠️ Link expires in 1 hour",
    downloadFailed: "Download Failed",
    tryAgain: "Try Again",
    missingParams: "Missing Parameters",
    missingParamsDesc:
      "This page requires model name and ID as URL parameters.",
    exampleUrl: "Example:",
    goToMainPage: "Go to Main Page",
    footerText: "Built by SunnyCloudYang",
    pvCountLabel: "Downloads:",
  },
  zh: {
    title: "📦 模型下载器",
    loadingModel: "加载模型中...",
    loadingPreview: "加载预览中...",
    previewUnavailable: "预览不可用",
    modelId: "模型 ID",
    prompt: "提示词",
    style: "风格",
    aiModel: "AI 模型",
    triangles: "三角面数",
    author: "作者",
    downloadGlb: "下载 GLB 模型",
    downloadHint: "点击下载 3D 模型文件",
    preparingDownload: "准备下载中...",
    startingDownload: "开始下载...",
    downloading: "下载中...",
    downloadComplete: "下载完成！",
    downloadReady: "下载就绪！",
    saveGlbFile: "保存 GLB 文件",
    copyDownloadLink: "复制下载链接",
    linkCopied: "链接已复制！",
    convertHint: "需要其他格式？",
    convertOnMeshy: "去 Meshy 转换",
    expirationNotice: "⚠️ 链接有效期为 1 小时",
    downloadFailed: "下载失败",
    tryAgain: "重试",
    missingParams: "参数缺失",
    missingParamsDesc: "此页面需要模型名称和 ID 作为 URL 参数。",
    exampleUrl: "示例：",
    goToMainPage: "返回主页",
    footerText: "由 SunnyCloudYang 构建",
    pvCountLabel: "下载次数：",
  },
};

// Current language
// Prefer saved preference; otherwise detect from browser
function getInitialLang() {
  const saved = localStorage.getItem("modelDL_lang");
  if (saved === "en" || saved === "zh") return saved;
  const browserLang = (
    navigator.language ||
    navigator.userLanguage ||
    ""
  ).toLowerCase();
  if (browserLang.startsWith("zh")) return "zh";
  return "en";
}
let currentLang = getInitialLang();

/**
 * Apply translations to all elements with data-i18n attribute
 */
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang = currentLang;

  // Update language toggle button
  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    langBtn.textContent = currentLang === "en" ? "中文" : "EN";
    langBtn.setAttribute(
      "aria-label",
      currentLang === "en" ? "Switch to Chinese" : "切换到英文",
    );
  }

  // Update footer
  const footerText = document.querySelector(".footer-text");
  if (footerText) {
    footerText.textContent = translations[currentLang].footerText;
  }
}

/**
 * Toggle language
 */
function toggleLanguage() {
  currentLang = currentLang === "en" ? "zh" : "en";
  localStorage.setItem("modelDL_lang", currentLang);
  applyTranslations();
}

// DOM Elements
const modelNameDisplay = document.getElementById("modelNameDisplay");
const previewLoader = document.getElementById("previewLoader");
const previewImage = document.getElementById("previewImage");
const previewError = document.getElementById("previewError");
const modelInfo = document.getElementById("modelInfo");
const downloadBtn = document.getElementById("downloadBtn");
const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressStatus = document.getElementById("progressStatus");
const progressDetails = document.getElementById("progressDetails");
const resultSection = document.getElementById("resultSection");
const resultDownloadLink = document.getElementById("resultDownloadLink");
const resultFilename = document.getElementById("resultFilename");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const errorSection = document.getElementById("errorSection");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");
const missingParamsCard = document.getElementById("missingParamsCard");
const downloadSection = document.getElementById("downloadSection");

// State
let modelId = null;
let modelName = null;
let isDownloading = false;

/**
 * Get URL parameters
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get("name"),
  };
}

/**
 * Extract UUID from name (name format: "{readable-slug}-{uuid}", UUID is the last segment)
 */
function extractUUID(name) {
  if (!name) return null;
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = decodeURIComponent(name).match(uuidRegex);
  return match ? match[0] : null;
}

/**
 * Get display name without UUID or version suffix (readable slug only)
 * e.g. "香蕉蛋糕店-v2-019d2a22-..." → "香蕉蛋糕店"
 */
function getDisplayName(name) {
  if (!name) return "";
  const decoded = decodeURIComponent(name);
  // Strip UUID
  const uuidRegex =
    /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let result = decoded.replace(uuidRegex, "");
  // Strip trailing version suffix like -v2, -v3
  result = result.replace(/-v\d+$/i, "");
  // Strip trailing dash
  result = result.replace(/-$/, "");
  return result;
}

/**
 * Validate UUID format
 */
function isValidUUID(str) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Show preview image
 */
async function loadPreview() {
  previewLoader.style.display = "flex";
  previewImage.style.display = "none";
  previewError.style.display = "none";

  try {
    const previewUrl = getApiUrl(`/model/${modelId}/preview`);

    // Create new image to preload
    const img = new Image();
    img.onload = () => {
      previewImage.src = previewUrl;
      previewImage.style.display = "block";
      previewLoader.style.display = "none";
    };
    img.onerror = () => {
      previewLoader.style.display = "none";
      previewError.style.display = "flex";
    };
    img.src = previewUrl;
  } catch (error) {
    console.error("Error loading preview:", error);
    previewLoader.style.display = "none";
    previewError.style.display = "flex";
  }
}

/**
 * Update progress status text with translation
 */
function updateProgressStatus(textKey, extraText = "") {
  const t = translations[currentLang];
  progressStatus.textContent = t[textKey] + extraText;
}

/**
 * Start model download
 */
async function startDownload() {
  if (isDownloading) return;

  isDownloading = true;

  // Update UI state
  downloadSection.style.display = "none";
  progressSection.style.display = "block";
  resultSection.style.display = "none";
  errorSection.style.display = "none";

  // Reset progress
  progressBar.style.width = "0%";
  updateProgressStatus("startingDownload");
  progressDetails.textContent = "";

  try {
    const response = await fetch(
      `https://gar-quality-solely.ngrok-free.app/model-downloader/downloads/${modelName}.glb`,
      {
        headers: {
          "ngrok-skip-browser-warning": "114514",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (total) {
        const percent = (loaded / total) * 100;
        progressBar.style.width = `${percent}%`;
        updateProgressStatus("downloading", ` ${Math.round(percent)}%`);
        progressDetails.textContent = `${formatBytes(loaded)} / ${formatBytes(total)}`;
      } else {
        updateProgressStatus("downloading", ` ${formatBytes(loaded)}`);
      }
    }

    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${modelName}.glb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);

    // Complete progress
    progressBar.style.width = "100%";
    updateProgressStatus("downloadComplete");
    progressDetails.textContent = total
      ? `${formatBytes(total)} / ${formatBytes(total)}`
      : formatBytes(loaded);

    setTimeout(() => {
      downloadSection.style.display = "block";
      progressSection.style.display = "none";
      isDownloading = false;
    }, 2000);
  } catch (error) {
    console.error("Download error:", error);
    showError(error.message);
    isDownloading = false;
  }
}

/**
 * Show error state
 */
function showError(message) {
  progressSection.style.display = "none";
  errorSection.style.display = "block";
  errorMessage.textContent = message;

  retryBtn.onclick = () => {
    errorSection.style.display = "none";
    downloadSection.style.display = "block";
  };
}

/**
 * Show missing parameters warning
 */
function showMissingParams() {
  document.querySelector(".preview-card").style.display = "none";
  document.querySelector(".download-card").style.display = "none";
  missingParamsCard.style.display = "block";
  modelNameDisplay.textContent = translations[currentLang].missingParams;
  document.title = `${translations[currentLang].missingParams} - ${translations[currentLang].title}`;
}

/**
 * Initialize the page
 */
function init() {
  const params = getUrlParams();

  // Apply translations on init
  applyTranslations();

  // Validate required parameters
  const extractedId = extractUUID(params.name);
  if (!params.name || !extractedId) {
    showMissingParams();
    return;
  }

  // Set state
  modelId = extractedId;
  modelName = params.name || "Unknown Model";

  // Update display (show readable slug only, not UUID)
  const displayName = getDisplayName(modelName);
  modelNameDisplay.textContent = displayName;
  document.title = `${displayName} - ${translations[currentLang].title}`;

  // Enable download button
  downloadBtn.disabled = false;
  downloadBtn.onclick = startDownload;

  // Copy link button handler
  if (copyLinkBtn) {
    copyLinkBtn.onclick = () => {
      const link = resultDownloadLink.href;
      navigator.clipboard.writeText(link).then(() => {
        const origText =
          copyLinkBtn.querySelector("span")?.textContent ||
          copyLinkBtn.childNodes[1]?.textContent;
        const btnText = copyLinkBtn.querySelector("[data-i18n]") || copyLinkBtn;
        const t = translations[currentLang];
        btnText.textContent = "✅ " + t.linkCopied;
        setTimeout(() => {
          btnText.textContent = "🔗 " + t.copyDownloadLink;
        }, 2000);
      });
    };
  }

  // Load preview and metadata
  loadPreview();

  console.log("Transfer page initialized for model:", modelId);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
