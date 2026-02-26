(function () {
  const previewBox = document.getElementById("previewBox");
  const previewImg = document.getElementById("previewImg");
  const placeholder = document.getElementById("placeholder");
  const btnCamera = document.getElementById("btnCamera");
  const btnUpload = document.getElementById("btnUpload");
  const fileInput = document.getElementById("fileInput");
  const resultSection = document.getElementById("resultSection");
  const resultCard = document.getElementById("resultCard");
  const resultBadge = document.getElementById("resultBadge");
  const resultTitle = document.getElementById("resultTitle");
  const resultSugarLevel = document.getElementById("resultSugarLevel");
  const resultPortion = document.getElementById("resultPortion");
  const resultAdvice = document.getElementById("resultAdvice");
  const resultReason = document.getElementById("resultReason");
  const resultSnippet = document.getElementById("resultSnippet");
  const resultIngredientsBlock = document.getElementById("resultIngredientsBlock");
  const loading = document.getElementById("loading");
  const loadingText = document.getElementById("loadingText");
  const cameraVideo = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");

  var cameraStream = null;

  function setPreviewFromFile(file) {
    const url = URL.createObjectURL(file);
    previewBox.classList.add("has-image");
    placeholder.style.display = "none";
    previewImg.style.display = "block";
    previewImg.onload = function () {
      URL.revokeObjectURL(url);
      runOCRAndAnalyzeWithImage(previewImg);
    };
    previewImg.onerror = function () {
      URL.revokeObjectURL(url);
      showLoading(false);
      showAnalysisResult({ badge: "caution", summary: "图片加载失败", details: "请重新选择图片。", sugarLevel: "", portionAdvice: "", snippet: "" });
    };
    previewImg.src = url;
  }

  function showLoading(show, message) {
    loading.hidden = !show;
    if (loadingText) loadingText.textContent = message || "正在识别图中文字...";
    if (show) resultSection.hidden = true;
  }

  function showAnalysisResult(result) {
    resultSection.hidden = false;
    loading.hidden = true;

    const names = { ok: "可以适量吃", caution: "建议少吃或注意", avoid: "不宜食用／不能吃" };

    resultCard.className = "result-card " + (result.badge || "caution");
    resultBadge.textContent = names[result.badge] || "建议注意";
    resultBadge.className = "result-badge " + (result.badge || "caution");

    if (resultIngredientsBlock && resultSnippet) {
      var text = (result.snippet || "").trim();
      resultSnippet.textContent = text || "（未识别到文字，请确保拍摄到配料表或营养成分表）";
      resultIngredientsBlock.style.display = text ? "block" : "block";
    }

    if (resultSugarLevel) resultSugarLevel.textContent = result.sugarLevel || "";
    if (resultPortion) {
      resultPortion.textContent = result.portionAdvice || "";
      resultPortion.classList.toggle("forbid", !!result.portionForbid);
    }
    resultAdvice.textContent = result.summary || "";
    resultReason.textContent = result.details || "";
  }

  var MAX_OCR_SIZE = 1200;

  function getImageForOCR(img, callback) {
    var w = img.naturalWidth || img.width || 0;
    var h = img.naturalHeight || img.height || 0;
    if (!w || !h) {
      callback(img);
      return;
    }
    if (w <= MAX_OCR_SIZE && h <= MAX_OCR_SIZE) {
      callback(img);
      return;
    }
    var scale = Math.min(MAX_OCR_SIZE / w, MAX_OCR_SIZE / h, 1);
    var c = document.createElement("canvas");
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    var ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, c.width, c.height);
    callback(c);
  }

  function runOCRAndAnalyzeWithImage(imgOrCanvas) {
    if (typeof Tesseract === "undefined") {
      showLoading(true, "识别引擎加载中，请稍候…");
      waitForTesseract(function () {
        showLoading(false);
        runOCRAndAnalyzeWithImage(imgOrCanvas);
      }, 15, function () {
        showLoading(false);
        showAnalysisResult({
          badge: "caution",
          summary: "识别引擎加载超时",
          details: "请检查网络后刷新页面，或稍候再重新选择图片。",
          sugarLevel: "",
          portionAdvice: "",
          snippet: ""
        });
      });
      return;
    }

    showLoading(true, "正在识别图中文字...");

    getImageForOCR(imgOrCanvas, function (source) {
      Tesseract.recognize(source, "chi_sim+eng", {
        logger: function (m) {
          if (m.status === "recognizing text" && loadingText) loadingText.textContent = "正在分析文字...";
        }
      })
        .then(function (out) {
          var text = (out && out.data && out.data.text) ? out.data.text.trim() : "";
          var result = typeof analyzeForDiabetic === "function" ? analyzeForDiabetic(text) : {
            badge: "caution",
            summary: "无法分析",
            details: "请确保图片中有清晰的配料表或营养成分表。",
            snippet: text.slice(0, 500)
          };
          showLoading(false);
          showAnalysisResult(result);
        })
        .catch(function (err) {
          showLoading(false);
          var errMsg = (err && err.message) ? err.message : String(err);
          console.error("OCR error:", errMsg);
          showAnalysisResult({
            badge: "caution",
            summary: "识别失败",
            details: "图片已清晰仍失败时，请尝试重新拍照或从相册选择后重试。若多次失败，请检查网络或稍后再试。",
            sugarLevel: "",
            portionAdvice: "",
            snippet: ""
          });
        });
    });
  }

  function runOCRAndAnalyze(img) {
    runOCRAndAnalyzeWithImage(img);
  }

  function waitForTesseract(onReady, maxAttempts, onTimeout) {
    var attempts = 0;
    var t = setInterval(function () {
      attempts++;
      if (typeof Tesseract !== "undefined") {
        clearInterval(t);
        onReady();
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(t);
        if (onTimeout) onTimeout();
      }
    }, 500);
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(function (t) { t.stop(); });
      cameraStream = null;
    }
    if (cameraVideo && cameraVideo.srcObject) cameraVideo.srcObject = null;
  }

  function showCameraPreview() {
    if (!cameraVideo || !cameraStream) return;
    placeholder.style.display = "none";
    previewImg.style.display = "none";
    previewBox.classList.add("has-image");
    if (!previewBox.contains(cameraVideo)) {
      cameraVideo.style.display = "block";
      cameraVideo.style.width = "100%";
      cameraVideo.style.height = "100%";
      cameraVideo.style.objectFit = "cover";
      cameraVideo.style.position = "absolute";
      cameraVideo.style.top = "0";
      cameraVideo.style.left = "0";
      previewBox.appendChild(cameraVideo);
    }
    cameraVideo.style.display = "block";
    btnCamera.textContent = "拍照识别";
  }

  function hideCameraPreview() {
    if (cameraVideo && cameraVideo.parentNode === previewBox) {
      previewBox.removeChild(cameraVideo);
      cameraVideo.style.display = "none";
    }
    placeholder.style.display = "";
    previewImg.style.display = "";
  }

  btnCamera.addEventListener("click", function () {
    if (cameraStream) {
      if (!cameraVideo.readyState || cameraVideo.readyState < 2) return;
      cameraCanvas.width = cameraVideo.videoWidth;
      cameraCanvas.height = cameraVideo.videoHeight;
      var ctx = cameraCanvas.getContext("2d");
      ctx.drawImage(cameraVideo, 0, 0);
      stopCamera();
      hideCameraPreview();
      previewImg.style.display = "block";
      btnCamera.textContent = "拍照";
      showLoading(true, "正在识别图中文字...");
      previewImg.onload = function () {
        runOCRAndAnalyzeWithImage(previewImg);
      };
      previewImg.onerror = function () {
        showLoading(false);
        showAnalysisResult({ badge: "caution", summary: "图片加载失败", details: "请重新拍照。", sugarLevel: "", portionAdvice: "", snippet: "" });
      };
      previewImg.src = cameraCanvas.toDataURL("image/jpeg", 0.9);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      fileInput.removeAttribute("capture");
      fileInput.setAttribute("capture", "environment");
      fileInput.click();
      return;
    }

    var constraints = { video: { facingMode: "environment" }, audio: false };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        cameraStream = stream;
        cameraVideo.srcObject = stream;
        cameraVideo.play();
        showCameraPreview();
      })
      .catch(function () {
        fileInput.removeAttribute("capture");
        fileInput.setAttribute("capture", "environment");
        fileInput.click();
      });
  });

  btnUpload.addEventListener("click", function () {
    fileInput.removeAttribute("capture");
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    var file = this.files[0];
    if (file && file.type.indexOf("image") === 0) setPreviewFromFile(file);
    this.value = "";
  });
})();
