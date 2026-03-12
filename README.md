# HW1 GridWorld 強化學習網格地圖

這是一個基於 Flask 開發的互動式 Web 應用程式，專案主要目標為將「網格世界 (GridWorld)」與**強化學習**中的兩個經典演算法：**策略評估 (Policy Evaluation)** 和 **值迭代 (Value Iteration)** 進行視覺化整合。

✨ **[線上永久試玩 Demo (GitHub Pages)](https://an7172799-ship-it.github.io/HW1-GridWorld/docs/)** ✨

## 🌟 核心功能

1. **自訂網格環境**
   - 支援動態生成 $n \times n$ 的網格地圖（$n$ 範圍 5 到 9）。
   - 使用者可以透過點擊 UI 直覺地設定**起點 (S)**、**終點 (E)**以及自訂數量的**障礙物**。

2. **Policy Evaluation (策略評估)**
   - 基於均勻的隨機策略 (Random Policy)，程式會執行 Bellman Expectation Equation 計算出每個狀態的期望回報值 (Value)。
   - 在前端網格直接展示各格的 V 值。

3. **Value Iteration (值迭代)**
   - 執行 Bellman Optimality Equation，反覆迭代直至收斂，找出目前網格配置的最佳策略。
   - 視覺化最優策略，並在格子上利用方向箭頭 (↑↓←→) 顯示最佳行走路徑，成功避開障礙物並導航至終點。

## 🛠️ 技術棧

- **後端**：Python, Flask
- **前端**：HTML5, Vanilla CSS (Glassmorphism), Vanilla JavaScript
- **演算法實作**：Pure Python `rl_algorithms.py`

## 🚀 如何執行

1. 確認系統已安裝 Python 環境。
2. 進入專案資料夾並啟動 Flask：
   ```bash
   python app.py
   ```
3. 打開瀏覽器訪問 `http://127.0.0.1:5000` 即可使用視覺化設定器。

## 📂 專案結構

- `app.py`: Flask 主程式，負責接收配置並呼叫 RL 演算法。
- `rl_algorithms.py`: 純 Python 實作的強化學習演算法核心模組。
- `templates/index.html`: 前端頁面模板。
- `static/`:
  - `style.css`: 基礎與網格樣式。
  - `rl_style.css`: 強化學習視覺化樣式。
  - `grid.js`: 前端狀態機、點擊邏輯及 API 請求。
