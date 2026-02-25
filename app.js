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
      showLoading(false);
      showAnalysisResult({
        badge: "caution",
        summary: "识别引擎未加载",
        details: "请刷新页面后重试。",
        snippet: ""
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
          snippet: ""
        });
        console.error(err);
      });
  }

  btnCamera.addEventListener("click", function () {
    fileInput.removeAttribute("capture");
    fileInput.setAttribute("capture", "environment");
    fileInput.click();
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
