# GridWorld 強化學習專案 - 完整對話與開發紀錄

此文件詳細記錄了 User 與 Assistant (AI) 之間從零開始建構、整合與優化 GridWorld 強化學習 (Policy Evaluation 及 Value Iteration) Web 應用程式的完整對話過與思考決策。

---

## 📅 Session 1: 基礎網格地圖開發 (Grid Map Web Application)

### 🧑‍💻 User Prompt 1
> 網格地圖開發
> 目標：開發一個大小為 nxn 的網格地圖，允許用戶指定維度 'n'（範圍從 5 到9），使用 Flask 網頁應用程式。
> 功能要求：
> 1. 用戶可以透過滑鼠點擊指定起始單元格（點擊後顯示為綠色）和結束單元格（點擊後顯示為紅色）。
> 2. 用戶可以設定 n-2 個障礙物，透過滑鼠點擊將這些單元格變為灰色。

### 🧠 Assistant 決策與實作 (Thought Process)
- **架構設計**：使用 Python Flask 作為後端接收設定，前端使用 HTML/CSS/JavaScript 進行 DOM 互動與狀態管理。
- **介面設計**：為了給使用者優良的視覺體驗，採用了深色主題 (Dark Theme) 搭配玻璃擬態 (Glassmorphism) 的現代化設計。
- **狀態機邏輯**：在 `grid.js` 中實作嚴謹的狀態轉換機制：`選擇大小 -> 生成網格 -> 設定起點 -> 設定終點 -> 設定障礙物 -> 完成並儲存`，同時加入通知系統 (Toast) 引導使用者。

### 🤖 Assistant 回應
（已建立基礎 Flask 專案結構 `app.py`、`index.html`、`style.css`、`grid.js`。使用者可透過操作介面順利地依序點擊設定綠色起點、紅色終點與灰色障礙物，並設定了限制只能放置 `n-2` 個障礙物。）

---

## 📅 Session 2: 強化學習核心演算法實作 (Grid RL Application)

### 🧑‍💻 User Prompt 2
> 參考資料夾內的 "C:\HW1 GridWorld\simple_rl_cheatsheet.pdf" 中的定義與公式，並新增兩項不同策略的程式碼：
> 
> 方法一：Policy Evaluation（策略評估）
> - 假設一個固定的「隨機策略」π(s)，在每個非終止狀態，四個動作（上、下、左、右）的機率都一樣。
> - 使用 Bellman expectation equation 做迭代更新：
>   V_{k+1}(s) = Σ_a π(a|s) Σ_{s'} P(s'|s,a) [ R(s,a,s') + γ V_k(s') ]
> - 寫一個函式 policy_evaluation(policy, env, gamma, theta)：
>   - gamma 是折扣因子（例如 0.9）
>   - theta 是收斂條件（例如 1e-6）
>   - 從 V(s)=0 開始迭代，直到所有狀態的變化量都小於 theta
>   - 回傳每個狀態的 V(s)
> 
> 方法二：Value Iteration（值迭代）
> - 使用 Bellman optimality equation 做迭代更新：
>   V_{k+1}(s) = max_a Σ_{s'} P(s'|s,a) [ R(s,a,s') + γ V_k(s') ]
> - 寫一個函式 value_iteration(env, gamma, theta)：
>   - 從 V(s)=0（或隨機值）開始
>   - 每次對每個狀態 s 計算所有動作 a 的期望回報，取最大的那個當作新的 V(s)
>   - 迭代直到 max_s |V_{k+1}(s) - V_k(s)| < theta
>   - 收斂後，用下式為每個狀態選最佳動作：
>     π*(s) = argmax_a Σ_{s'} P(s'|s,a) [ R(s,a,s') + γ V(s') ]
>   - 回傳最終的 V(s) 和最優策略 π*(s)

### 🧠 Assistant 決策與實作 (Thought Process)
- **環境模型建構**：獨立出 `rl_algorithms.py`。設計環境為 Deterministic (機率 1.0)，每走一步 `Reward = -1` (促使尋找最短路徑)，撞牆或障礙物則停留在原地，到達終點則遊戲結束 `Reward = 0`。
- **後端端點**：在 Flask 中新增 `/run_rl` POST 路由，根據傳入的 `algorithm` 參數呼叫對應的數學運算。
- **前端視覺化**：在 `grid.js` 增加按鈕觸發事件，並將後端回傳的數值 `V` 與策略 `Policy` 渲染到地圖畫面上 (`rl_style.css` 控制顯示為絕對定位在格子中上浮現的數值或方向箭頭)。

### 🤖 Assistant 回應
（我已經成功整合了 Policy Evaluation 和 Value Iteration。並在網格上方覆蓋顯示計算出來的價值數字與最佳箭頭路徑。更透過寫測試腳本 (`test_rl.py`) 驗證了 Bellman 更新程序的數值精準無誤。）

---

## 📅 Session 3: UI/UX 改善與視覺分離

### 🧑‍💻 User Prompt 3
> 如果選擇Value Iteration的話會把Policy Evaluation的結果一起呈現出來，這兩個是分開的。

### 🧠 Assistant 決策與實作 (Thought Process)
- **問題分析**：之前為了方便除錯，Value Iteration 會同時疊加顯示期望回報數值與方向箭頭，導致畫面凌亂。
- **修正辦法**：修改 JS 中的 `runRL()` 與 `renderRLResults()`，透過判斷式切開：Policy Evaluation 只單純傳入並渲染網格的 `V` (數值)；Value Iteration 則只傳入並渲染 `policy` (方向箭頭)。

### 🤖 Assistant 回應
（已將兩者視覺完全分離。現在這兩顆按鈕按下去會呈現截然不同、簡潔清楚的視覺效果。）

---

### 🧑‍💻 User Prompt 4
> 如果我選擇5x5的網格後不選清除按鈕，直接選擇8x8後，按下強化學習按鈕會出現上一筆的紀錄，這方面的流程要再做處理，尤其是重置有點太下面了，要不要直接放在儲存旁邊? 請多思考UX/UI部分

### 🧠 Assistant 決策與實作 (Thought Process)
- **邏輯漏洞修正**：當使用者切換網格尺寸或生成新網格時，必須強制清空畫面上的 DOM 以及觸發隱藏「強化學習面板」，否則會將舊有的 RL 計算結果套壓在新產生的矩陣上。
- **UX 流暢度改善**：原來的「重置」按鈕在左方表單底部，不夠直觀。決定採用 *Action Bar* 設計模式，將「重新開始 (Reset)」與「儲存設定 (Save)」這兩個互斥/確認的關鍵操作放置於網格的正下方，形成連貫的視線動態（Top-to-Bottom flow）。

### 🤖 Assistant 回應
（成功修正了舊資料殘留的問題。並優化了 Action Bar 配置，移除了舊重置按鈕，改為位於「儲存設定」旁邊並添加微小紅色警告意味的「重新開始」按鈕，使用者體驗大幅提升。）

---

## 📅 Session 4: 線上 Demo 建置 (GitHub Pages / Vercel)

### 🧑‍💻 User Prompt 5
> 幫我上傳到git https://github.com/an7172799-ship-it/HW1-GridWorld.git ，然後簡單寫一下README.md(這個專案再做什麼)

### 🧠 Assistant 決策與實作 (Thought Process)
- **基礎工程**：撰寫 `README.md` 詳細解說專案架構與操作方法，並配置 `.gitignore`。
- **Git/GitHub 操作**：在系統端利用 Winget 幫助使用者安裝了原先缺失的 `Git` 軟體核心。最後協助使用者透過終端指令完成對專案的 `git init`, `commit` 及 `push` 授權動作。

### 🤖 Assistant 回應
（檔案已經上傳至您的 GitHub 儲存庫，專案基礎文件（README）皆已一併生成推送完成。）

---

### 🧑‍💻 User Prompt 6
> 你可以做一個Demo 演示站點然後一併更新到md裡面嗎

### 🧠 Assistant 決策與實作 (Thought Process)
- **技術障礙突破**：由於 Flask 是一個 Python 後端服務，無法直接運行於如 GitHub Pages 這樣的靜態免費代管平台上。
- **架構重構 (純前端化)**：為了給予使用者一個永久存活在網頁端的靜態 Demo，我在專案目錄新增了 `docs/` 資料夾，並手動**將近兩百行原為 Python 寫的強化學習算法 (Bellman Equation) 徹底翻譯成了前端的 JavaScript (Native JS)**。
- 這樣只要有人造訪網頁，其瀏覽器引擎就會充當本地伺服器，直接在載入時即時算出 Policy Evaluation 與 Value Iteration！

### 🤖 Assistant 回應
（我幫您建立了完全不需要依賴 Python 後端的 `docs` 資料夾，並成功協助您啟用了 GitHub Pages 功能。）

---

## 📅 Session 5: Vercel 佈署與介面翻新 (Light Theme + Path Highlight)

### 🧑‍💻 User Prompt 7
> 現在要多新增一個部分是 使用價值迭代算法推導最佳政策價值迭代算法：
> 1.實現價值迭代算法來計算最佳政策。使用該算法推導每個格子的最佳行動。
> 2.顯示推導出的最佳政策，通過顯示每個狀態（格子）對應的行動來展示最佳政策。這些行動應該取代之前顯示的隨機行動。
> 3.在執行價值迭代後，更新格子以顯示每個狀態的價值函數 V(s)。每個格子應顯示對應的值，表示在最佳政策下該狀態的期望回報。
> (以及附上了一張帶有綠底連續高光最佳路徑的 GridWorld 圖片作為參考)

### 🧠 Assistant 決策與實作 (Thought Process)
- **需求改變**：User 希望在 Value Iteration (價值迭代) 時，能夠**同時顯示**期望回報 (Value) 和最佳政策方向箭頭 (Policy)，這顛覆了前面我們將它們切開的設定。
- **路徑尋跡算法**：為了還原 User 圖片中的「綠色高光路徑」，我加上了一個 Path-Highlight 演算法：從起點開始，沿著 `policy` 指示的方向，一步一步追溯並打上特定的 CSS `optimal-path` 屬性，直到抵達終點。
- **重新排版**：調整 CSS，將數值放到格子的偏上方，方向箭頭放大放到偏下方，讓兩者能完美並存而不會因重疊導致閱讀困難。這不僅更新在本機端 `static/grid.js`，我也手動同步更新了給線上 Demo 用的 `docs/grid.js`。

### 🤖 Assistant 回應
（已升級了視覺表現！現在「值迭代」會同時展示包含數值與箭頭，並如您所願地自動幫最佳的逃脫行走路徑亮起「綠色高光」，清晰展現算法推演的過程。）

---

### 🧑‍💻 User Prompt 8
> 可以把整體的ui設計換一下嗎 底色希望是白色 比較順眼 
> 這調整一下顏色這裡太白了啦很刺眼 (後續回饋)

### 🧠 Assistant 決策與實作 (Thought Process)
- **主題翻新 (Light Mode)**：將所有的 CSS Context (Variables) 從深色夜間模式改為現代化的極簡亮色模式。
- **對比度微調**：將死白的背景調整成低飽和的藍灰色 (`#f8fafc`)。將過於亮白的格欄調為微灰 (`#f1f5f9`)，並加深格線與滑鼠懸浮效果。字詞顏色調回深色。成功去除螢幕強光可能帶來的疲勞，使畫面柔和順眼。

### 🤖 Assistant 回應
（為您套用了優雅護眼的淺白色極簡主題。並更新了靜態網頁所受到的瀏覽器快取 (Cache) 限制問題，讓線上版能夠無縫即時換裝。）

---

### 🧑‍💻 User Prompt 9
> 我要弄到Vercel (Hosting 雲端部署平台) 阿你可以幫我做完嗎
> 現在的demo site網址換成 https://hw-1-grid-world.vercel.app/ 記得更新一下.md檔案

### 🧠 Assistant 決策與實作 (Thought Process)
- **Vercel 自動化配置**：為避免繁瑣的設定，我直接替專案添加了 `vercel.json` 並設定 `outputDirectory: "docs"`，讓 Vercel 抓取專案時能精準知道要發布的是靜態的純前端 Demo 版本。
- **更新 README**：將正式部署的精美永久網址替換掉了舊版的 GitHub Pages 連結，所有變動同步推送至雲端倉儲。

### 🤖 Assistant 回應
（恭喜！專案所有的代碼與完美的淺色主題皆已全盤就緒。永久的極速 Vercel 部署已經綁定您的 GitHub 更新完畢，並且 `README.md` 也全面同步完成！）
