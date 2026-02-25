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
  const resultDetails = document.getElementById("resultDetails");
  const resultSnippet = document.getElementById("resultSnippet");
  const loading = document.getElementById("loading");
  const loadingText = document.getElementById("loadingText");
  const cameraVideo = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");

  var cameraStream = null;

  function setPreviewFromFile(file) {
    const url = URL.createObjectURL(file);
    previewImg.onload = function () { URL.revokeObjectURL(url); };
    previewImg.src = url;
    previewBox.classList.add("has-image");
    placeholder.style.display = "none";
    previewImg.style.display = "block";
    runOCRAndAnalyze(previewImg);
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
    resultTitle.textContent = "分析结果";

    if (resultSugarLevel) resultSugarLevel.textContent = result.sugarLevel || "";
    if (resultPortion) {
      resultPortion.textContent = result.portionAdvice || "";
      resultPortion.classList.toggle("forbid", !!result.portionForbid);
    }
    resultAdvice.textContent = result.summary || "";
    resultReason.textContent = result.details || "";
    if (resultDetails && resultSnippet) {
      resultDetails.open = false;
      resultSnippet.textContent = result.snippet ? result.snippet.slice(0, 800) : "";
      resultDetails.style.display = result.snippet ? "block" : "none";
    }
  }

  function runOCRAndAnalyze(img) {
    if (typeof Tesseract === "undefined") {
      showLoading(true, "识别引擎加载中，请稍候…");
      waitForTesseract(function () {
        showLoading(false);
        runOCRAndAnalyze(img);
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

    Tesseract.recognize(img, "chi_sim+eng", {
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
        showAnalysisResult({
          badge: "caution",
          summary: "识别失败",
          details: "请换一张清晰的、包含配料表或营养成分表的照片重试。",
          sugarLevel: "",
          portionAdvice: "",
          snippet: ""
        });
        console.error(err);
      });
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
      previewImg.src = cameraCanvas.toDataURL("image/jpeg", 0.9);
      previewImg.style.display = "block";
      btnCamera.textContent = "拍照";
      runOCRAndAnalyze(previewImg);
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
