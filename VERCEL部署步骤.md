# 在 Vercel 上部署「糖友零食助手」

任选下面一种方式即可。**方式一** 不用装任何东西，用浏览器就能完成。

---

## 方式一：网页拖拽部署（推荐，零基础）

不需要安装 Node.js 或命令行，只需浏览器。

### 1. 注册 / 登录 Vercel

- 打开：**https://vercel.com**
- 点击 **Sign Up**，用 **GitHub**、**GitLab** 或 **邮箱** 注册并登录。

### 2. 导入项目

- 登录后点击 **Add New…** → **Project**（或直接 **Import Project**）。
- 两种做法任选其一：

#### 做法 A：用 GitHub（推荐，以后改代码可自动重新部署）

1. 若你还没有把 `snack-check-app` 放到 GitHub：
   - 打开 **https://github.com/new**，新建一个仓库，名称例如 `snack-check-app`。
   - 在电脑上打开终端（或 Git 工具），进入项目目录后执行：
     ```bash
     cd /Users/lee-home/Workspace/snack-check-app
     git init
     git add .
     git commit -m "糖友零食助手"
     git branch -M main
     git remote add origin https://github.com/你的用户名/snack-check-app.git
     git push -u origin main
     ```
   - 若提示要登录 GitHub，按提示用浏览器或 Token 完成。
2. 在 Vercel 里选 **Import Git Repository**，找到并选择 **snack-check-app** 这个仓库，点 **Import**。
3. **Root Directory**：若仓库里只有这个项目，留空即可；若仓库里还有别的文件夹，填 `snack-check-app`。
4. **Framework Preset**：选 **Other** 或 **Vite** 无所谓，Vercel 会按静态站部署。
5. 直接点 **Deploy**，等一两分钟。

#### 做法 B：不连 GitHub，用 Vercel CLI 一次性上传（需本机有 Node.js）

1. 在电脑上打开**终端**，进入项目目录：
   ```bash
   cd /Users/lee-home/Workspace/snack-check-app
   ```
2. 执行（首次会提示在浏览器里登录 Vercel）：
   ```bash
   npx vercel
   ```
3. 按提示操作：
   - **Set up and deploy?** 选 **Y**
   - **Which scope?** 选你的账号
   - **Link to existing project?** 选 **N**
   - **Project name?** 直接回车用默认，或填 `snack-check-app`
   - **In which directory is your code located?** 直接回车（当前目录）
4. 等待部署完成，终端会给出一个网址，例如：  
   `https://snack-check-app-xxx.vercel.app`

### 3. 得到你的应用网址

- **做法 A**：部署完成后在 Vercel 的 **Project → Domains** 里可以看到，形如：  
  `https://snack-check-app-xxx.vercel.app` 或你绑定的自定义域名。
- **做法 B**：终端里最后打印的 **Preview** 或 **Production** 链接即是。

用手机 **Safari** 打开这个网址 → **分享 → 添加到主屏幕**，即可在 iOS 上当 App 用。

---

## 方式二：仅用 Vercel 网页（不连 Git、不装 CLI）

若你**不想用 GitHub、也不想装 Node**，可以用 Vercel 的「通过网页上传压缩包」方式（若 Vercel 当前支持）：

1. 把 **snack-check-app** 整个文件夹打成 **zip**（不要包含上层无关文件夹）。
2. 打开 **https://vercel.com** → **Add New…** → **Project**，看是否有 **Upload** 或 **Deploy by uploading** 之类选项；若有，选择刚打的 zip 上传并部署。

若你的 Vercel 界面没有上传 zip 的选项，请用**方式一**（GitHub 或 CLI 二选一）。

---

## 部署后建议检查

1. 在浏览器打开你的 **https://xxx.vercel.app**，能正常打开页面。
2. 点「从相册选择」上传一张食物图，能识别并显示建议。
3. 用 iPhone **Safari** 打开同一网址，再「添加到主屏幕」，从主屏幕点进应用，再试一次拍照/选图，确认相机和识别都正常。

---

## 常见问题

**Q：部署后打开是空白？**  
A：检查 Vercel 的 **Root Directory** 是否指对了（若仓库根目录就是项目，留空；若项目在子文件夹，填 `snack-check-app`）。

**Q：CSS/JS 加载不到？**  
A：不要给 Vercel 加「所有路径都重写到 index.html」的规则，本项目是纯静态，直接部署当前目录即可（本仓库里的 `vercel.json` 已按此配置）。

**Q：想改域名？**  
A：在 Vercel 的 **Project → Settings → Domains** 里添加你自己的域名，按提示解析即可。

**Q：没有 Node.js，也不想用 GitHub？**  
A：可以先把项目上传到 **GitHub**（用网页上传文件也行），再在 Vercel 里 **Import** 该仓库并部署，无需在本机安装 Node。
