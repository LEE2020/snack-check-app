/**
 * 结合糖尿病患者摄入标准，分析图中配料/营养成分，给出含糖量等级与食用量提醒
 * 参考：WHO/中国居民膳食指南，糖友单次加餐糖建议约 ≤5～10g，每日添加糖 <25g 更宜
 * 含糖量：无糖≤0.5 | 低糖≤5 | 中糖5～15 | 高糖>15 (g/100g)
 */
(function (global) {
  // 糖尿病患者常用阈值（克/100克）
  var SUGAR_NONE = 0.5;   // 无糖：≤0.5
  var SUGAR_LOW = 5;      // 低糖：≤5
  var SUGAR_MID = 15;     // 中糖：5～15
  // >15 为高糖
  var CARB_LOW = 15;
  var CARB_HIGH = 30;
  // 单次建议糖摄入上限（克），用于推算“建议不超过XX克”
  var SUGAR_PER_SERVE_MAX = 5;

  var SUGAR_INGREDIENTS = [
    "白砂糖", "蔗糖", "果葡糖浆", "麦芽糖", "葡萄糖", "蜂蜜", "玉米糖浆",
    "糖浆", "冰糖", "红糖", "焦糖", "乳糖", "果糖", "添加糖", "阿斯巴甜", "安赛蜜", "三氯蔗糖"
  ];
  var LOW_SUGAR_MARKS = ["无糖", "0糖", "零糖", "低糖", "不含蔗糖", "未添加糖"];

  function extractPer100(text) {
    var normalized = text.replace(/\s+/g, " ").replace(/／/g, "/");
    var sugarPer100 = null;
    var carbPer100 = null;
    var m = normalized.match(/糖\s*[：:]?\s*(\d+\.?\d*)\s*[gG克]?/);
    if (m) sugarPer100 = parseFloat(m[1]);
    var m2 = normalized.match(/碳水[化合物]*\s*[：:]?\s*(\d+\.?\d*)\s*[gG克]?/);
    if (m2) carbPer100 = parseFloat(m2[1]);
    return { sugarPer100: sugarPer100, carbPer100: carbPer100 };
  }

  function hasLowSugarClaim(text) {
    if (!text) return false;
    var t = text.replace(/\s/g, "");
    for (var i = 0; i < LOW_SUGAR_MARKS.length; i++) {
      if (t.indexOf(LOW_SUGAR_MARKS[i]) !== -1) return true;
    }
    return false;
  }

  function countSugarIngredients(text) {
    if (!text) return { count: 0, early: false };
    var t = text.replace(/\s/g, "");
    var first50 = t.slice(0, 50);
    var count = 0, early = false;
    for (var i = 0; i < SUGAR_INGREDIENTS.length; i++) {
      if (t.indexOf(SUGAR_INGREDIENTS[i]) !== -1) {
        count++;
        if (first50.indexOf(SUGAR_INGREDIENTS[i]) !== -1) early = true;
      }
    }
    return { count: count, early: early };
  }

  /**
   * 含糖量等级与描述（结合糖尿病患者摄入标准）
   */
  function getSugarLevel(sugar, lowClaim) {
    if (lowClaim || (sugar != null && sugar <= SUGAR_NONE))
      return { level: "无糖", text: "含糖量：无糖或可忽略", value: sugar };
    if (sugar == null) return { level: "未知", text: "未识别到糖含量数据", value: null };
    if (sugar <= SUGAR_LOW)
      return { level: "低糖", text: "含糖量：低糖（" + sugar + " g/100g，适合糖友适量选择）", value: sugar };
    if (sugar <= SUGAR_MID)
      return { level: "中糖", text: "含糖量：中糖（" + sugar + " g/100g，需控制食用量）", value: sugar };
    return { level: "高糖", text: "含糖量：高糖（" + sugar + " g/100g，糖友不宜多食）", value: sugar };
  }

  /**
   * 食用量提醒：单次建议克数 或 “不宜食用/不能吃”
   * 标准：单次糖摄入尽量 ≤5g，据此反推建议克数；高糖或配料表差则直接提醒不食用
   */
  function getPortionAdvice(sugar, carb, sugarIng, badge, sugarLevel) {
    // 明确不宜食用 / 不能吃
    if (badge === "avoid") {
      if (sugar != null && sugar >= 25)
        return { text: "糖友不宜食用（含糖过高），建议不吃。", forbid: true };
      if (sugar != null && sugar >= 20)
        return { text: "糖友建议不食用；若偶尔极少量解馋，需严格监测血糖。", forbid: true };
      if (sugarIng.early && sugarIng.count >= 2)
        return { text: "配料表添加糖较多且靠前，建议不食用。", forbid: true };
      return { text: "建议不食用或极少量，并监测血糖。", forbid: true };
    }

    // 可适量 / 注意份量
    if (sugarLevel === "无糖" || (sugar != null && sugar <= SUGAR_NONE))
      return { text: "可适量食用，注意总碳水化合物与总热量，建议作为加餐时控制总量。", forbid: false };

    if (sugar != null && sugar > 0 && sugar <= SUGAR_LOW) {
      var safeG = Math.floor((SUGAR_PER_SERVE_MAX / sugar) * 100);
      if (safeG > 100) safeG = 100;
      return { text: "可适量食用，单次建议不超过约 " + safeG + " 克（约含糖 " + SUGAR_PER_SERVE_MAX + " g 以内）。", forbid: false };
    }

    if (sugar != null && sugar > SUGAR_LOW && sugar <= SUGAR_MID) {
      var safeG2 = Math.floor((SUGAR_PER_SERVE_MAX / sugar) * 100);
      if (safeG2 < 20) safeG2 = 20;
      return { text: "建议少吃，单次不超过约 " + safeG2 + " 克，并监测血糖。", forbid: false };
    }

    if (carb != null && sugar == null) {
      if (carb <= CARB_LOW)
        return { text: "碳水较低，可适量食用，建议控制总份量。", forbid: false };
      if (carb <= CARB_HIGH)
        return { text: "建议控制食用量，单次少量并注意监测血糖。", forbid: false };
    }

    return { text: "请根据自身血糖控制情况控制食用量，并监测血糖。", forbid: false };
  }

  function analyzeForDiabetic(ocrText) {
    var snippet = (ocrText || "").slice(0, 500).trim();
    if (!ocrText || ocrText.trim().length < 2) {
      return {
        badge: "caution",
        sugarLevel: "",
        portionAdvice: "",
        summary: "未识别到有效文字",
        details: "请拍摄包含「营养成分表」或「配料表」的包装背面/侧面，确保文字清晰、光线充足。",
        snippet: ""
      };
    }

    var per100 = extractPer100(ocrText);
    var sugar = per100.sugarPer100;
    var carb = per100.carbPer100;
    var lowClaim = hasLowSugarClaim(ocrText);
    var sugarIng = countSugarIngredients(ocrText);

    var scores = [];
    var details = [];

    if (lowClaim) {
      scores.push(-2);
      details.push("检测到「无糖/低糖」标注，对糖友较友好。");
    }

    if (sugar != null) {
      if (sugar <= SUGAR_NONE) {
        scores.push(-1);
        details.push("糖 " + sugar + " g/100g，属无糖。");
      } else if (sugar <= SUGAR_LOW) {
        scores.push(-1);
        details.push("糖 " + sugar + " g/100g，属低糖。");
      } else if (sugar <= SUGAR_MID) {
        scores.push(1);
        details.push("糖 " + sugar + " g/100g，属中糖，需控制量。");
      } else {
        scores.push(2);
        details.push("糖 " + sugar + " g/100g，属高糖，糖友不宜多食。");
      }
    }

    if (carb != null) {
      if (carb <= CARB_LOW) details.push("碳水化合物 " + carb + " g/100g，较低。");
      else if (carb <= CARB_HIGH) {
        scores.push(1);
        details.push("碳水化合物 " + carb + " g/100g，建议控制量。");
      } else {
        scores.push(2);
        details.push("碳水化合物 " + carb + " g/100g，较高，需控制。");
      }
    }

    if (sugarIng.count > 0) {
      if (sugarIng.early) {
        scores.push(2);
        details.push("配料表添加糖多且靠前。");
      } else {
        scores.push(1);
        details.push("配料表含添加糖，需注意。");
      }
    }

    if (scores.length === 0) {
      return {
        badge: "caution",
        sugarLevel: "未解析到糖或碳水数据",
        portionAdvice: "请对准营养成分表重拍。",
        summary: "未解析到营养成分或配料表数据",
        details: "图中可能无「营养成分表」或「配料表」，或文字不清晰。请对准包装上的成分表重拍。",
        snippet: snippet
      };
    }

    var total = 0;
    for (var j = 0; j < scores.length; j++) total += scores[j];
    var badge = "caution";
    if (total <= -2) badge = "ok";
    else if (total >= 3) badge = "avoid";

    var sugarLevelInfo = getSugarLevel(sugar, lowClaim);
    var portionInfo = getPortionAdvice(sugar, carb, sugarIng, badge, sugarLevelInfo.level);

    var summary = badge === "ok" ? "根据糖尿病患者摄入标准，本品对糖友相对友好，可适量食用。" :
      badge === "avoid" ? "根据糖尿病患者摄入标准，本品含糖/碳水或添加糖较多，糖友不宜食用或建议不吃。" :
      "根据糖尿病患者摄入标准，建议控制食用量并注意监测血糖。";

    return {
      badge: badge,
      sugarLevel: sugarLevelInfo.text,
      portionAdvice: portionInfo.text,
      portionForbid: portionInfo.forbid,
      summary: summary,
      details: details.join(" "),
      snippet: snippet
    };
  }

  global.analyzeForDiabetic = analyzeForDiabetic;
})(typeof window !== "undefined" ? window : this);
