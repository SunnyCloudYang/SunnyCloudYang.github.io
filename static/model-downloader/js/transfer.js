// Transfer Page JavaScript
// Handles model preview and download functionality

// API Configuration
const API_BASE_URL = 'https://gar-quality-solely.ngrok-free.app';
const getApiUrl = (endpoint) =>
  `${API_BASE_URL}/model-downloader/api${endpoint}`;

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
    id: params.get("id"),
  };
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
  progressStatus.textContent = "Starting download...";
  progressDetails.textContent = "";

  try {
    const response = await fetch(`https://gar-quality-solely.ngrok-free.app/model-downloader/downloads/${modelName}.glb`, {
      headers: {
        "ngrok-skip-browser-warning": "114514"
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
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
        progressStatus.textContent = `Downloading... ${Math.round(percent)}%`;
        progressDetails.textContent = `${formatBytes(loaded)} / ${formatBytes(total)}`;
      } else {
        progressStatus.textContent = `Downloading... ${formatBytes(loaded)}`;
      }
    }

    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${modelName}.glb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);

    // Complete progress
    progressBar.style.width = "100%";
    progressStatus.textContent = "Download complete!";
    progressDetails.textContent = total ? `${formatBytes(total)} / ${formatBytes(total)}` : formatBytes(loaded);

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
  modelNameDisplay.textContent = "Missing Parameters";
}

/**
 * Initialize the page
 */
function init() {
  const params = getUrlParams();

  // Validate required parameters
  if (!params.id || !isValidUUID(params.id)) {
    showMissingParams();
    return;
  }

  // Set state
  modelId = params.id;
  modelName = params.name || "Unknown Model";

  // Update display
  modelNameDisplay.textContent = decodeURIComponent(modelName);
  document.title = `${decodeURIComponent(modelName)} - Model Transfer`;

  // Enable download button
  downloadBtn.disabled = false;
  downloadBtn.onclick = startDownload;

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
