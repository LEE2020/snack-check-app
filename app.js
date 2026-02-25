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
  const resultFood = document.getElementById("resultFood");
  const resultAdvice = document.getElementById("resultAdvice");
  const resultReason = document.getElementById("resultReason");
  const loading = document.getElementById("loading");

  let model = null;

  function setPreviewFromFile(file) {
    const url = URL.createObjectURL(file);
    previewImg.onload = function () { URL.revokeObjectURL(url); };
    previewImg.src = url;
    previewBox.classList.add("has-image");
    placeholder.style.display = "none";
    previewImg.style.display = "block";
    runRecognition(previewImg);
  }

  function showLoading(show) {
    loading.hidden = !show;
    if (show) resultSection.hidden = true;
  }

  function showResult(advice, className, probability) {
    resultSection.hidden = false;
    loading.hidden = true;

    const names = {
      ok: "可以适量吃",
      caution: "建议少吃或注意",
      avoid: "不建议吃"
    };

    resultCard.className = "result-card " + (advice ? advice.can_eat : "caution");
    resultBadge.textContent = advice ? names[advice.can_eat] : "建议注意";
    resultBadge.className = "result-badge " + (advice ? advice.can_eat : "caution");
    resultTitle.textContent = "识别结果";
    resultFood.textContent = advice ? advice.name_zh : (className || "未识别到常见食物");
    resultAdvice.textContent = advice ? (advice.can_eat === "ok" ? "可适量食用" : advice.can_eat === "caution" ? "建议少吃或注意份量" : "不建议食用") : "请查看配料表或咨询医生";
    resultReason.textContent = advice ? advice.reason : "未在数据库中匹配到该食物，请以产品配料表与医生建议为准。";
  }

  function runRecognition(img) {
    if (!model) {
      showLoading(false);
      showResult(null, null);
      resultReason.textContent = "模型加载中，请稍候再试或刷新页面。";
      return;
    }
    showLoading(true);
    model.classify(img, 5).then(function (predictions) {
      showLoading(false);
      let used = null;
      let bestName = "";
      let bestProb = 0;
      for (let i = 0; i < predictions.length; i++) {
        const p = predictions[i];
        const a = typeof getAdvice !== "undefined" ? getAdvice(p.className) : null;
        if (a) {
          used = a;
          bestName = p.className;
          bestProb = p.probability;
          break;
        }
        if (p.probability > bestProb) {
          bestProb = p.probability;
          bestName = p.className;
        }
      }
      if (!used && bestName) used = getAdvice(bestName);
      showResult(used, bestName, bestProb);
    }).catch(function (err) {
      showLoading(false);
      showResult(null, "识别失败");
      resultReason.textContent = "识别出错，请换一张清晰的食物照片重试。";
      console.error(err);
    });
  }

  // 拍照：唤起系统相机（移动端会直接打开相机）
  btnCamera.addEventListener("click", function () {
    fileInput.removeAttribute("capture");
    fileInput.setAttribute("capture", "environment");
    fileInput.click();
  });

  // 从相册选择：不设 capture，打开相册
  btnUpload.addEventListener("click", function () {
    fileInput.removeAttribute("capture");
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    var file = this.files[0];
    if (file && file.type.indexOf("image") === 0) setPreviewFromFile(file);
    this.value = "";
  });

  // 模型加载完成后，若已有图片则自动识别一次（用户可能在加载前就选了图）
  function onModelReady(m) {
    model = m;
    if (previewImg.src && previewImg.src.indexOf("blob:") !== -1) {
      runRecognition(previewImg);
    }
  }

  if (typeof mobilenet !== "undefined") {
    mobilenet.load().then(onModelReady).catch(function (e) {
      console.error("MobileNet load failed", e);
    });
  }
})();
