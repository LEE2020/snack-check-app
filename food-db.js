/**
 * 食物/零食 -> 糖尿病患者食用建议
 * 键：英文类别名（与 MobileNet/ImageNet 输出一致，小写）
 * 值：{ name_zh, can_eat: 'ok'|'caution'|'avoid', reason }
 */
const FOOD_DIABETES_DB = {
  "cheeseburger": { name_zh: "芝士汉堡", can_eat: "caution", reason: "精制碳水与脂肪较多，建议少量食用并搭配蔬菜，注意当餐总碳水。" },
  "hot dog": { name_zh: "热狗", can_eat: "caution", reason: "加工肉与面包升糖较快，建议偶尔少量，注意配料表钠与糖。" },
  "hotdog": { name_zh: "热狗", can_eat: "caution", reason: "加工肉与面包升糖较快，建议偶尔少量，注意配料表钠与糖。" },
  "burrito": { name_zh: "墨西哥卷饼", can_eat: "caution", reason: "面皮与馅料碳水较高，建议控制分量，优先选全麦与蔬菜多款。" },
  "bagel": { name_zh: "贝果", can_eat: "caution", reason: "精制面粉制品，升糖较快，建议少量或选全麦，搭配蛋白质食用。" },
  "pretzel": { name_zh: "椒盐脆饼", can_eat: "caution", reason: "精制碳水，钠可能偏高，建议偶尔少量。" },
  "french loaf": { name_zh: "法棍", can_eat: "caution", reason: "精制小麦，升糖明显，建议控制片数与搭配。" },
  "dough": { name_zh: "面团/面食", can_eat: "caution", reason: "多为精制碳水，建议控制量，选全麦或粗粮更佳。" },
  "pizza": { name_zh: "披萨", can_eat: "caution", reason: "饼皮与酱料含糖和精制碳水，建议少量、薄底、多蔬菜。" },
  "meat loaf": { name_zh: "肉饼/肉糕", can_eat: "caution", reason: "部分含淀粉与糖，建议看配料表，控制份量。" },
  "carbonara": { name_zh: "奶油培根意面", can_eat: "caution", reason: "意面与奶油热量与碳水较高，建议控制份量。" },
  "chocolate sauce": { name_zh: "巧克力酱", can_eat: "avoid", reason: "含糖量高，升糖快，不建议糖尿病患者常吃。" },
  "ice cream": { name_zh: "冰淇淋", can_eat: "avoid", reason: "高糖高脂，升糖快，建议用无糖或少量解馋并监测血糖。" },
  "icecream": { name_zh: "冰淇淋", can_eat: "avoid", reason: "高糖高脂，升糖快，建议用无糖或少量解馋并监测血糖。" },
  "trifle": { name_zh: "甜点", can_eat: "avoid", reason: "多为高糖甜点，不建议多食。" },
  "mashed potato": { name_zh: "土豆泥", can_eat: "caution", reason: "淀粉高、升糖较快，建议当主食替代部分米饭并控制量。" },
  "espresso": { name_zh: "意式浓缩咖啡", can_eat: "ok", reason: "无糖黑咖啡对血糖影响小，注意不要加糖和奶油。" },
  "cup": { name_zh: "杯装饮料", can_eat: "caution", reason: "需看具体内容：无糖茶/黑咖啡可，含糖饮料需避免。" },
  "coffee": { name_zh: "咖啡", can_eat: "ok", reason: "无糖黑咖啡可适量饮用；加糖、奶精或糖浆需控制。" },
  "wine bottle": { name_zh: "葡萄酒", can_eat: "caution", reason: "酒精与糖分需注意，建议遵医嘱，限量且随餐监测血糖。" },
  "beer bottle": { name_zh: "啤酒", can_eat: "caution", reason: "含碳水与酒精，需限量并在医生指导下饮用。" },
  "beer": { name_zh: "啤酒", can_eat: "caution", reason: "含碳水与酒精，需限量并在医生指导下饮用。" },
  "soup": { name_zh: "汤", can_eat: "caution", reason: "视配料而定：清汤、蔬菜汤较宜；浓汤、勾芡或含糖汤需注意。" },
  "guacamole": { name_zh: "牛油果酱", can_eat: "ok", reason: "健康脂肪与纤维，对血糖较友好，注意搭配的玉米片等碳水。" },
  "bell pepper": { name_zh: "甜椒", can_eat: "ok", reason: "蔬菜，低升糖，可适量食用。" },
  "cucumber": { name_zh: "黄瓜", can_eat: "ok", reason: "低卡低糖，适合作为加餐或配菜。" },
  "strawberry": { name_zh: "草莓", can_eat: "ok", reason: "低GI水果，可适量食用，注意总摄入量。" },
  "orange": { name_zh: "橙子", can_eat: "ok", reason: "适量食用可，建议一次半个到一个，随餐或加餐。" },
  "lemon": { name_zh: "柠檬", can_eat: "ok", reason: "低糖，泡水或调味均可。" },
  "banana": { name_zh: "香蕉", can_eat: "caution", reason: "碳水与糖分较高，建议少量（如半根）并监测血糖。" },
  "pineapple": { name_zh: "菠萝", can_eat: "caution", reason: "含糖较高，建议少量并与其他食物搭配。" },
  "fig": { name_zh: "无花果", can_eat: "caution", reason: "含糖量不低，建议少量。" },
  "pomegranate": { name_zh: "石榴", can_eat: "caution", reason: "适量食用可，不宜一次过多。" },
  "candy": { name_zh: "糖果", can_eat: "avoid", reason: "高糖，升糖快，不建议食用。" },
  "donut": { name_zh: "甜甜圈", can_eat: "avoid", reason: "高糖高油精制碳水，不建议食用。" },
  "cake": { name_zh: "蛋糕", can_eat: "avoid", reason: "高糖高精制碳水，建议避免或极少量。" },
  "pie": { name_zh: "派/馅饼", can_eat: "caution", reason: "视馅料与皮而定，多为高碳水，建议少量。" },
  "cookie": { name_zh: "曲奇", can_eat: "avoid", reason: "高糖高脂，不建议常吃。" },
  "chocolate": { name_zh: "巧克力", can_eat: "caution", reason: "高糖高脂，可选高可可、低糖黑巧并控制量。" },
  "soda": { name_zh: "碳酸饮料", can_eat: "avoid", reason: "含糖高，升糖快，建议选无糖款或白水。" },
  "juice": { name_zh: "果汁", can_eat: "caution", reason: "易升糖且饱腹感差，建议少喝，优先吃完整水果。" },
  "milk": { name_zh: "牛奶", can_eat: "ok", reason: "无糖牛奶可适量饮用，注意乳糖；可选低脂或燕麦奶等。" },
  "yogurt": { name_zh: "酸奶", can_eat: "caution", reason: "选无糖、无添加糖款较宜，注意配料表。" },
  "bread": { name_zh: "面包", can_eat: "caution", reason: "精制面包升糖快，建议全麦、控制量。" },
  "croissant": { name_zh: "可颂", can_eat: "avoid", reason: "高油高精制碳水，不建议常吃。" },
  "waffle": { name_zh: "华夫饼", can_eat: "caution", reason: "精制碳水与糖，建议少量。" },
  "potato": { name_zh: "土豆", can_eat: "caution", reason: "淀粉高，建议当主食替代部分米饭并控制量。" },
  "corn": { name_zh: "玉米", can_eat: "caution", reason: "算作主食，控制量即可。" },
  "apple": { name_zh: "苹果", can_eat: "ok", reason: "适量食用可，一次一个中小型为宜。" },
  "grape": { name_zh: "葡萄", can_eat: "caution", reason: "含糖较高，建议少量（几颗）并监测。" },
  "watermelon": { name_zh: "西瓜", can_eat: "caution", reason: "GI 较高，建议少量并避免空腹大量吃。" },
  "nuts": { name_zh: "坚果", can_eat: "ok", reason: "适量坚果对血糖较友好，注意总量与盐分。" },
  "peanut": { name_zh: "花生", can_eat: "ok", reason: "适量食用可，注意不要裹糖或盐过多。" },
};

/** 根据英文类别查建议，支持模糊匹配（含关键词） */
function getAdvice(className) {
  if (!className || typeof className !== "string") return null;
  const key = className.toLowerCase().trim();
  if (FOOD_DIABETES_DB[key]) return FOOD_DIABETES_DB[key];
  for (const [k, v] of Object.entries(FOOD_DIABETES_DB)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}
