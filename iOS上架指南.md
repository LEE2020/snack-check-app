# 糖友零食助手 - 在 iOS 上使用与上架 App Store 指南

---

## 方式一：在 iPhone 上当“应用”用（无需上架，零成本）

适合：先给身边人用、或自己当 App 用，**不需要提交 App Store**。

### 步骤

1. **把网站部署到公网**
   - 用 [Vercel](https://vercel.com) 或 [Netlify](https://www.netlify.com) 免费部署本文件夹（拖拽上传或连 GitHub）。
   - 得到网址，例如：`https://你的项目名.vercel.app`。

2. **在 iPhone 上打开**
   - 用 **Safari** 打开上面这个网址（不要用微信内置浏览器）。

3. **添加到主屏幕**
   - 点 Safari 底部 **分享** 按钮（方框带箭头）。
   - 选择 **「添加到主屏幕」**。
   - 名称可改为「糖友助手」，点右上角 **添加**。

4. **像 App 一样使用**
   - 主屏幕会出现图标，点开即全屏使用，可拍照、选图、识别。
   - 本应用已配置为 PWA，支持离线缓存，体验接近原生 App。

**注意**：拍照功能需要 **HTTPS**。用 Vercel/Netlify 的网址即为 HTTPS，相机可正常使用。

---

## 方式二：打包成真正的 iOS App 并上架 App Store

适合：希望应用出现在 App Store、用户通过搜索下载。

### 你需要准备

| 项目 | 说明 |
|------|------|
| **Mac 电脑** | 必须，用于安装 Xcode 并打包 |
| **Apple 开发者账号** | 付费 $99/年，[developer.apple.com](https://developer.apple.com) 注册 |
| **Xcode** | 在 Mac 的 App Store 里免费安装 |
| **Node.js** | 在 [nodejs.org](https://nodejs.org) 下载 LTS 版并安装 |

### 一、用 Capacitor 生成 iOS 工程

1. **安装 Node.js**（若未安装）  
   安装后打开「终端」。

2. **进入项目目录**
   ```bash
   cd 你的路径/snack-check-app
   ```

3. **安装 Capacitor**
   ```bash
   npm init -y
   npm install @capacitor/core @capacitor/ios @capacitor/cli
   ```

4. **添加 iOS 平台**
   ```bash
   npx cap add ios
   ```
   会生成 `ios/` 文件夹。

5. **同步网页到 iOS 项目**
   ```bash
   npx cap sync ios
   ```

6. **用 Xcode 打开**
   ```bash
   npx cap open ios
   ```
   会打开 Xcode，左侧是「糖友零食助手」的 iOS 工程。

### 二、在 Xcode 里配置并打包

1. **选择你的开发团队**
   - 左侧点最上面蓝色工程图标 → 中间 TARGETS 选 **App** → 上方 **Signing & Capabilities**。
   - 勾选 **Automatically manage signing**，Team 选你的 Apple ID（需已加入开发者计划）。

2. **相机权限说明（必须）**
   - 左侧展开 **App**，点 **Info**（或 Info.plist）。
   - 右键添加一行：**Privacy - Camera Usage Description**，值填：`用于拍摄零食照片进行识别`。
   - 若需要相册：**Privacy - Photo Library Usage Description**，值填：`用于选择零食照片进行识别`。

3. **连接真机运行**
   - 用数据线连 iPhone，顶部设备选你的手机，点 ▶ 运行。  
   首次需在 iPhone 上：设置 → 通用 → VPN 与设备管理 → 信任你的开发者。

4. **打包上架**
   - 菜单 **Product** → **Archive**。
   - 归档完成后在 Organizer 里点 **Distribute App** → 选 **App Store Connect** → 按提示上传。
   - 登录 [App Store Connect](https://appstoreconnect.apple.com)，在「我的 App」里新建应用、填说明与截图、提交审核。

### 三、上架必填内容简要

- **应用名称**：糖友零食助手  
- **副标题/描述**：拍照识别零食，查询糖尿病患者能否食用，仅供参考。  
- **关键词**：糖尿病、零食、饮食、拍照识别 等  
- **截图**：至少 1 张 iPhone 截图（在模拟器或真机运行后截屏）。  
- **隐私**：若只使用相机/相册，在 App Store Connect 里按提示声明「相机」「相册」用途即可。  
- **年龄分级**：选「4+」一般即可。

---

## 两种方式对比

| 对比项 | 方式一：PWA 添加到主屏幕 | 方式二：Capacitor 上架 App Store |
|--------|---------------------------|-----------------------------------|
| 成本 | 免费 | Apple 开发者 $99/年 + 需要 Mac |
| 难度 | 部署网址 + 添加到主屏幕 | 需会终端、Xcode 打包与提交 |
| 分发 | 发链接给用户，用户自己「添加到主屏幕」 | 用户从 App Store 搜索下载 |
| 体验 | 接近 App，支持拍照、离线 | 原生壳 + 网页，体验一致 |

**建议**：先按方式一部署并「添加到主屏幕」在 iPhone 上试用；确认好用、再考虑方式二上架 App Store。

---

## 常见问题

**Q：添加到主屏幕后，拍照打不开？**  
A：必须用 **HTTPS** 网址（如 Vercel/Netlify），且用 **Safari** 打开该网址再「添加到主屏幕」。微信内打开无法使用相机。

**Q：没有 Mac，能上架 App Store 吗？**  
A：不能。提交 iOS 应用必须用 Xcode，Xcode 仅支持 Mac。可只用方式一在 iPhone 上当 App 用。

**Q：Capacitor 报错找不到 webDir？**  
A：确保在 `snack-check-app` 目录下执行 `npx cap sync ios`，且 `capacitor.config.json` 里 `"webDir": "."` 指向当前目录。

**Q：审核被拒怎么办？**  
A：常见原因：说明里写清「仅供参考、不替代医生」；隐私说明里写清相机/相册用途；不要写「治疗」「诊断」等医疗承诺。按拒审理由修改后重新提交即可。
