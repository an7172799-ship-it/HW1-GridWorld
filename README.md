<h1 align="center">
  🤖 HW1 GridWorld: Reinforcement Learning Visualizer
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

> 這是一個專為展示「隨機網格世界 (GridWorld)」與 **強化學習 (Reinforcement Learning)** 中兩大經典演算法：**策略評估 (Policy Evaluation)** 和 **值迭代 (Value Iteration)** 所設計的互動式 Web 視覺化應用程式。專案具備現代化的 Light Theme UI、無縫的互動體驗以及強大的客戶端/伺服器端雙擎演算法架構。

---

## 🔗 線上 Live Demo

我們將整套數學演算邏輯徹底移植至純前端 (Native JS)，使其能夠 100% 脫離 Python 後端運行，並完美部署於 Vercel 雲端平台上：

✨ **[點我立即體驗線上試玩 Demo (Vercel 部署)](https://hw-1-grid-world.vercel.app/)** ✨

---

## 🌟 核心特色與功能 (Key Features)

### 📐 1. 高度自由的網格環境建構器 (Interactive Grid Builder)
- **動態維度**：支援一鍵生成 $N \times N$ 大小的網格矩陣（支援 $n=5$ 到 $n=9$）。
- **直覺式拖點**：使用者能透過滑鼠點擊，輕鬆配置起點 (Start)、終點 (End/Terminal State) 以及至多 $n-2$ 個路障 (Obstacles)。
- **極簡現代設計**：採用重新校準的防眩光淺色主題 (Light Theme)，配備細緻的 Hover 動畫與玻璃擬態 (Glassmorphism) 控制面板。

### 📊 2. 策略評估 (Policy Evaluation)
- 模擬並評估一個在四個方向 (上、下、左、右) 移動機率均等 ($25\%$) 的**均勻隨機狀態 (Random Policy)**。
- 透過反覆迭代 **Bellman Expectation Equation (貝爾曼期望方程式)** 直至數值收斂 ($\theta < 10^{-6}$)。
- **視覺化**：每一格會即時顯示該狀態下的**期望回報值 $V(s)$**。

### 🎯 3. 值迭代與最佳路徑 (Value Iteration & Optimal Path)
- 使用 **Bellman Optimality Equation (貝爾曼最優方程式)** 進行無限期程的反覆運算，強制找出網格中的全局最優策略 (Optimal Policy)。
- **視覺化雙軌呈現**：不僅顯示收斂後的最高價值 $V^*(s)$，同時呈現四方指向箭頭 $\pi^*(s)$ 標示最佳行動方向。
- **🟢 綠光導航追蹤 (Path Highlight)**：內建追跡演算法，當運算完成後，系統會自動從起點順著最佳 Policy 箭頭，一路鋪設一條發光的綠色安全路徑直達終點，完美避開所有障礙物。

---

## 🧠 強化學習數學與環境設定 (RL Environment Specifications)

本作的環境物理法則建立如下：
- **動態轉移 (Transition)**：環境為 $100\%$ 決定性 (Deterministic, $P=1.0$)。遇到邊界或是設定的障礙物時，行動不變並停留在原來的格子。
- **獎勵機制 (Rewards)**：為了鼓勵智能體 (Agent) 找出「最短路徑」，每走一步的 Reward 皆為 `-1`。
- **終端狀態 (Terminal State)**：也就是抵達紅色「終點」格子。此格的價值強制收斂為 `0`，且遊戲回合結束。
- **折扣因子 (Gamma $\gamma$)**：為確保長遠收益，設定為 `0.9`。

---

## 🛠️ 技術架構 (Architecture & Dual-Engine)

本專案具有獨特的「雙引擎架構」：
1. **Local Flask Backend (本機開發版)**：在專案根目錄，我們使用 `app.py` 串接純 Python 原生手刻的 `rl_algorithms.py` 進行科學運算，並透過 API 傳予前端渲染。
2. **Serverless Static Frontend (雲端部署版)**：為了讓所有人都能在 GitHub Pages 或 Vercel 無痛開啟，我們額外在 `docs/` 目錄中，將所有複雜的 Bellman 迴圈 100% 翻譯為原生的 `grid.js`。即使沒有 Python 環境也可流暢執行！

---

## 🚀 本地端安裝與執行 (Local Installation)

如果您希望在您的電腦上執行 Python Flask 版本並檢視原始演算程式碼：

1. **確認環境**：確保電腦已安裝 Python 3.x 以及 git。
2. **安裝所需套件**：
   ```bash
   pip install flask
   ```
3. **啟動本機伺服器**：
   在命令提示字元或終端機進入專案資料夾，並執行：
   ```bash
   python app.py
   ```
4. **開啟瀏覽器**：
   進入 `http://127.0.0.1:5000` 即可開始實驗您的網格世界。

---

## 📂 專案檔案結構 (Project Structure)

```text
HW1-GridWorld/
├── app.py                     # Flask 主後端路由程式，負責接收狀態並回傳 RL JSON 結果
├── rl_algorithms.py           # 核心強化學習演算法庫 (純 Python 實作 Bellman Equation)
├── raw_conversation_history.md# 最完整的「開發者與 AI」無刪減 1 對 1 原始對話開發紀錄
├── vercel.json                # Vercel 部署自動配置檔
├── README.md                  # 專案詳細說明文檔
├── templates/
│   └── index.html             # Flask 渲染用的前端基底模板
├── static/                    # (本機模式)
│   ├── style.css              # 主畫面排版、極簡淺色主題變數與 CSS 動畫
│   ├── rl_style.css           # 負責 V(s) 數值、箭頭、與最佳綠色路徑高亮的樣式表
│   └── grid.js                # 後端依賴版腳本，負責封裝網格資料向 localhost 發起 Fetch 請求
└── docs/                      # (雲端部署模式)
    ├── index.html             # 加上 ?v=2 破除快取機制的獨立靜態網頁
    ├── style.css              # (同步自 static)
    ├── rl_style.css           # (同步自 static)
    └── grid.js                # 🚀 搭載 100% 純 JS 版 RL 引擎，免伺服器直接在瀏覽器強算回報
```
