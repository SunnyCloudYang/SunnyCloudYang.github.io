// API Configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINT = `${API_BASE_URL}/model-downloader/api/fetch-model`;
const API_STREAM_ENDPOINT = `${API_BASE_URL}/model-downloader/api/fetch-model-stream`;

// DOM Elements
const form = document.getElementById("fetchForm");
const urlInput = document.getElementById("modelUrl");
const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const spinner = submitBtn.querySelector(".spinner");
const statusContainer = document.getElementById("statusContainer");
const statusMessage = document.getElementById("statusMessage");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressDetails = document.getElementById("progressDetails");
const resultContainer = document.getElementById("resultContainer");
const downloadLink = document.getElementById("downloadLink");
const resultFilename = document.getElementById("resultFilename");
const copyLinkBtn = document.getElementById("copyLinkBtn");

// State
let isLoading = false;
let eventSource = null;
let currentModelId = null;
let currentModelName = null;

/**
 * Extract model ID (UUID) from URL
 */
function extractModelId(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];

    // UUID pattern
    const uuidRegex =
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const match = lastPart.match(uuidRegex);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract model name from URL
 */
function extractModelName(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    let lastPart = pathParts[pathParts.length - 1] || "";

    // Remove UUID suffix
    lastPart = lastPart.replace(
      /-?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ""
    );

    // Clean up trailing dashes
    lastPart = lastPart.replace(/-+$/, "");

    return lastPart || "model";
  } catch (e) {
    return "model";
  }
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    const supportedHosts = ["meshy.ai", "hyper3d.ai", "tripo3d.ai"];
    return supportedHosts.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch (_) {
    return false;
  }
}

/**
 * Show status message
 */
function showStatus(message, type = "loading") {
  statusContainer.style.display = "block";
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  resultContainer.style.display = "none";
}

/**
 * Hide status message
 */
function hideStatus() {
  statusContainer.style.display = "none";
}

/**
 * Show progress bar
 */
function showProgress(progress, message, details = "") {
  progressContainer.style.display = "block";
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress);
  progressText.textContent = `${progress}%`;

  if (message) {
    statusMessage.textContent = message;
  }

  if (details) {
    progressDetails.textContent = details;
    progressDetails.style.display = "block";
  } else {
    progressDetails.style.display = "none";
  }
}

/**
 * Hide progress bar
 */
function hideProgress() {
  progressContainer.style.display = "none";
  progressBar.style.width = "0%";
  progressText.textContent = "0%";
  progressDetails.style.display = "none";
}

/**
 * Show result
 */
function showResult(
  downloadUrl,
  filename,
  size,
  modelName = null,
  cached = false
) {
  hideStatus();
  hideProgress();
  resultContainer.style.display = "block";
  const normalizedDownloadUrl = downloadUrl.startsWith("/")
    ? downloadUrl.slice(1)
    : downloadUrl;
  const fullDownloadUrl = `${window.location.origin}/model-downloader/${normalizedDownloadUrl}`;
  downloadLink.href = fullDownloadUrl;

  // Update result card title based on cached status
  const resultTitle = resultContainer.querySelector(".result-card h3");
  if (resultTitle) {
    resultTitle.textContent = cached
      ? "⚡ Found in Cache!"
      : "✅ Download Ready!";
  }

  let fileInfo = `File: ${filename} (${formatBytes(size)})`;
  if (modelName) {
    fileInfo = `Model: ${modelName}\n${fileInfo}`;
  }
  if (cached) {
    fileInfo += "\n(Using cached file - no download needed)";
  }
  resultFilename.textContent = fileInfo;

  // Set up copy link button - copy transfer page URL
  copyLinkBtn.onclick = () => {
    // Build transfer page URL with model name and ID
    const transferUrl = currentModelId
      ? `${
          window.location.origin
        }/model-downloader/transfer?name=${encodeURIComponent(
          modelName || currentModelName || "model"
        )}&id=${currentModelId}`
      : fullDownloadUrl;

    navigator.clipboard
      .writeText(transferUrl)
      .then(() => {
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = "Copied!";
        setTimeout(() => {
          copyLinkBtn.textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        alert("Failed to copy link.");
      });
  };
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
 * Set loading state
 */
function setLoading(loading) {
  isLoading = loading;
  submitBtn.disabled = loading;
  urlInput.disabled = loading;

  if (loading) {
    btnText.textContent = "Processing...";
    spinner.style.display = "inline-block";
  } else {
    btnText.textContent = "Download Model";
    spinner.style.display = "none";
  }
}

/**
 * Get stage display info
 */
function getStageInfo(stage) {
  const stages = {
    validating: { icon: "🔍", label: "Validating URL" },
    checking: { icon: "📂", label: "Checking Cache" },
    cached: { icon: "⚡", label: "Using Cached File" },
    extracting: { icon: "📋", label: "Extracting Model ID" },
    metadata: { icon: "📊", label: "Fetching Metadata" },
    found: { icon: "✅", label: "Model Found" },
    downloading: { icon: "📥", label: "Downloading" },
    saving: { icon: "💾", label: "Saving File" },
    complete: { icon: "🎉", label: "Complete" },
    browser: { icon: "🌐", label: "Launching Browser" },
    navigating: { icon: "🔄", label: "Navigating" },
    loading: { icon: "⏳", label: "Loading Page" },
    waiting: { icon: "👀", label: "Waiting for Model" },
    fallback: { icon: "🔄", label: "Switching Method" },
  };
  return stages[stage] || { icon: "⏳", label: stage };
}

/**
 * Handle form submission with streaming
 */
async function handleSubmit(event) {
  event.preventDefault();

  // Get URL value
  const url = urlInput.value.trim();

  // Validate URL
  if (!url) {
    showStatus("Please enter a URL", "error");
    return;
  }

  if (!isValidUrl(url)) {
    showStatus(
      "Invalid URL. Please enter a valid URL from a supported website.",
      "error"
    );
    return;
  }

  // Extract and store model ID and name from the URL
  currentModelId = extractModelId(url);
  currentModelName = extractModelName(url);

  // Set loading state
  setLoading(true);
  showStatus("Connecting to server...", "loading");
  showProgress(0, "Initializing...");

  try {
    // Use fetch to make POST request that returns SSE stream
    const response = await fetch(API_STREAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      // It's a JSON error response
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error");
    }

    // Read the SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("Stream finished");
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events from buffer
      const events = buffer.split("\n\n");
      buffer = events.pop(); // Keep incomplete event in buffer

      for (const eventText of events) {
        if (!eventText.trim()) continue;

        const lines = eventText.split("\n");
        let eventType = "message";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7);
          } else if (line.startsWith("data: ")) {
            eventData = line.slice(6);
          }
        }

        if (eventData) {
          try {
            const data = JSON.parse(eventData);
            handleSSEEvent(eventType, data);
          } catch (e) {
            console.error("Failed to parse SSE data:", e, eventData);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching model:", error);
    showStatus(`Error: ${error.message}`, "error");
    hideProgress();
  } finally {
    setLoading(false);
  }
}

/**
 * Handle SSE events
 */
function handleSSEEvent(eventType, data) {
  console.log("SSE Event:", eventType, data);

  switch (eventType) {
    case "connected":
      showStatus("Connected to server", "loading");
      showProgress(0, "Starting...");
      break;

    case "progress":
      const stageInfo = getStageInfo(data.stage);
      const statusText = `${stageInfo.icon} ${data.message}`;

      let details = "";
      if (data.bytesDownloaded !== undefined && data.bytesTotal !== undefined) {
        details = `${formatBytes(data.bytesDownloaded)} / ${formatBytes(
          data.bytesTotal
        )} (${data.downloadPercent || 0}%)`;
      } else if (data.modelName) {
        details = `Model: ${data.modelName}`;
      }

      showStatus(statusText, "loading");
      showProgress(data.progress || 0, null, details);
      break;

    case "complete":
      if (data.success) {
        showResult(
          data.downloadUrl,
          data.filename,
          data.size,
          data.modelName,
          data.cached
        );
        urlInput.value = "";
      } else {
        showStatus(`Error: ${data.error || "Unknown error"}`, "error");
        hideProgress();
      }
      break;

    case "error":
      showStatus(`Error: ${data.error || "Unknown error"}`, "error");
      hideProgress();
      break;

    default:
      console.log("Unknown event type:", eventType);
  }
}

/**
 * Initialize app
 */
function init() {
  // Add form submit listener
  form.addEventListener("submit", handleSubmit);

  // Add input validation on blur
  urlInput.addEventListener("blur", () => {
    const url = urlInput.value.trim();
    if (url && !isValidUrl(url)) {
      urlInput.style.borderColor = "var(--error-color)";
    } else {
      urlInput.style.borderColor = "";
    }
  });

  // Reset border color on input
  urlInput.addEventListener("input", () => {
    urlInput.style.borderColor = "";
  });

  console.log("3D Model Downloader initialized");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
