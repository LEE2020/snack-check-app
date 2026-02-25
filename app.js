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
  const cameraEl = document.getElementById("camera");
  const canvasEl = document.getElementById("canvas");

  let model = null;
  let stream = null;
  let cameraInBox = false;

  function setPreviewFromFile(file) {
    const url = URL.createObjectURL(file);
    previewImg.onload = function () { URL.revokeObjectURL(url); };
    previewImg.src = url;
    previewBox.classList.add("has-image");
    runRecognition(previewImg);
  }

  function showCameraInBox() {
    if (!cameraInBox && stream) {
      cameraEl.hidden = false;
      cameraEl.style.display = "block";
      cameraEl.style.width = "100%";
      cameraEl.style.height = "100%";
      cameraEl.style.objectFit = "cover";
      placeholder.style.display = "none";
      previewImg.style.display = "none";
      previewBox.appendChild(cameraEl);
      cameraInBox = true;
    }
  }

  function hideCameraFromBox() {
    if (cameraInBox && cameraEl.parentNode === previewBox) {
      previewBox.removeChild(cameraEl);
      cameraEl.hidden = true;
      cameraEl.style.display = "";
      placeholder.style.display = "";
      previewImg.style.display = "";
      cameraInBox = false;
    }
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
    const reasons = {
      ok: "对血糖相对友好，仍建议控制总量。",
      caution: "注意份量与搭配，监测血糖。",
      avoid: "升糖快或不利于控糖，请尽量避免。"
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
      showResult(null, null);
      resultReason.textContent = "模型未加载完成，请刷新页面重试。";
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

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }
    cameraEl.srcObject = null;
  }

  btnUpload.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.indexOf("image") === 0) setPreviewFromFile(file);
    this.value = "";
  });

  btnCamera.addEventListener("click", function () {
    if (stream) {
      const ctx = canvasEl.getContext("2d");
      canvasEl.width = cameraEl.videoWidth;
      canvasEl.height = cameraEl.videoHeight;
      ctx.drawImage(cameraEl, 0, 0);
      stopCamera();
      hideCameraFromBox();
      placeholder.style.display = "none";
      previewImg.style.display = "block";
      previewImg.src = canvasEl.toDataURL("image/jpeg", 0.9);
      previewBox.classList.add("has-image");
      runRecognition(previewImg);
      btnCamera.textContent = "拍照";
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("您的设备不支持拍照，请使用「从相册选择」上传图片。");
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(function (s) {
        stream = s;
        cameraEl.srcObject = s;
        cameraEl.play();
        placeholder.innerHTML = "<span class=\"icon\">📷</span><p>画面稳定后点击下方「拍照识别」</p>";
        btnCamera.textContent = "拍照识别";
        showCameraInBox();
      })
      .catch(function () {
        alert("无法使用相机，请使用「从相册选择」上传图片。");
      });
  });

  if (typeof mobilenet !== "undefined") {
    btnCamera.disabled = true;
    mobilenet.load().then(function (m) {
      model = m;
      btnCamera.disabled = false;
    }).catch(function (e) {
      console.error("MobileNet load failed", e);
      btnCamera.disabled = false;
      btnCamera.textContent = "拍照（需刷新后重试）";
    });
  } else {
    btnCamera.disabled = false;
  }
})();
