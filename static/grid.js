/**
 * grid.js – Client-side logic for the GridWorld configurator
 *
 * State machine:
 *   idle  →  [Generate Grid]  →  set_start  →  (click)  →  set_end  →  (click)  →  set_obstacles
 *
 * Obstacle cap: n - 2
 */

const State = Object.freeze({
  IDLE:          'idle',
  SET_START:     'set_start',
  SET_END:       'set_end',
  SET_OBSTACLES: 'set_obstacles',
  DONE:          'done'
});

let currentState    = State.IDLE;
let currentN        = 5;
let startCell       = null;   // {row, col, el}
let endCell         = null;
let obstacles       = [];     // [{row, col, el}]
let maxObstacles    = 3;

// ─── DOM refs ──────────────────────────────────────────────────
const gridEl        = document.getElementById('grid');
const gridContainer = document.getElementById('grid-container');
const placeholder   = document.getElementById('placeholder');
const modeBar       = document.getElementById('mode-bar');
const modeText      = document.getElementById('mode-text');
const statusStart   = document.getElementById('status-start');
const statusEnd     = document.getElementById('status-end');
const statusObs     = document.getElementById('status-obs');
const statusMode    = document.getElementById('status-mode');
const modeItemEl    = document.getElementById('mode-item');
const saveBtn       = document.getElementById('btn-save');
const savedCard     = document.getElementById('saved-card');
const savedInfo     = document.getElementById('saved-info');

// ─── Size buttons ───────────────────────────────────────────────
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentN = parseInt(btn.dataset.n, 10);
  });
});

// ─── Generate grid ──────────────────────────────────────────────
document.getElementById('btn-generate').addEventListener('click', () => {
  buildGrid(currentN);
});

// ─── Reset button ───────────────────────────────────────────────
document.getElementById('btn-reset').addEventListener('click', () => {
  resetAll();
});

// ─── Save button ────────────────────────────────────────────────
saveBtn.addEventListener('click', saveConfig);

// ─────────────────────────────────────────────────────────────────
function buildGrid(n) {
  // Reset state
  startCell  = null;
  endCell    = null;
  obstacles  = [];
  maxObstacles = n - 2;

  currentState = State.SET_START;

  // Build DOM grid
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = `repeat(${n}, 1fr)`;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.id = `cell-${r}-${c}`;
      cell.addEventListener('click', onCellClick);
      gridEl.appendChild(cell);
    }
  }

  // Adjust cell size for larger grids
  const cellSize = n <= 6 ? 52 : n === 7 ? 48 : n === 8 ? 44 : 40;
  document.querySelectorAll('.cell').forEach(c => {
    c.style.width  = cellSize + 'px';
    c.style.height = cellSize + 'px';
  });

  // Show grid, hide placeholder
  placeholder.style.display = 'none';
  gridEl.style.display      = 'grid';
  modeBar.style.display     = 'flex';
  saveBtn.disabled           = true;
  savedCard.classList.remove('visible');
  document.getElementById('rl-actions-section').style.display = 'none';

  updateUI();
  showToast(`已生成 ${n}×${n} 網格，請點擊設定起點`, 'info');
}

// ─────────────────────────────────────────────────────────────────
function onCellClick(e) {
  const cell = e.currentTarget;
  const row  = parseInt(cell.dataset.row, 10);
  const col  = parseInt(cell.dataset.col, 10);

  // Don't allow re-clicking already-assigned cells
  if (cell.classList.contains('obstacle')) return;
  if (cell.classList.contains('start') && currentState !== State.SET_START) return;
  if (cell.classList.contains('end')   && currentState !== State.SET_END)   return;

  switch (currentState) {
    case State.SET_START:
      assignStart(cell, row, col);
      break;
    case State.SET_END:
      if (cell.classList.contains('start')) return; // cannot pick start as end
      assignEnd(cell, row, col);
      break;
    case State.SET_OBSTACLES:
      if (cell.classList.contains('start') || cell.classList.contains('end')) return;
      if (obstacles.length >= maxObstacles) {
        showToast(`最多只能設定 ${maxObstacles} 個障礙物`, 'error');
        return;
      }
      assignObstacle(cell, row, col);
      break;
    default:
      break;
  }
}

function assignStart(cell, row, col) {
  // Clear previous start
  if (startCell) {
    startCell.el.classList.remove('start');
    startCell.el.querySelector('.cell-label')?.remove();
  }
  startCell = { row, col, el: cell };
  cell.classList.add('start');
  addLabel(cell, 'S');
  currentState = State.SET_END;
  updateUI();
  showToast('起點已設定！請點擊設定終點', 'info');
}

function assignEnd(cell, row, col) {
  if (endCell) {
    endCell.el.classList.remove('end');
    endCell.el.querySelector('.cell-label')?.remove();
  }
  endCell = { row, col, el: cell };
  cell.classList.add('end');
  addLabel(cell, 'E');
  currentState = State.SET_OBSTACLES;
  updateUI();
  if (maxObstacles > 0) {
    showToast(`終點已設定！可設定最多 ${maxObstacles} 個障礙物`, 'info');
  } else {
    currentState = State.DONE;
    saveBtn.disabled = false;
    showToast('設定完成！點擊「儲存設定」', 'success');
  }
}

function assignObstacle(cell, row, col) {
  obstacles.push({ row, col, el: cell });
  cell.classList.add('obstacle');
  // Remove hover pointer from obstacle
  updateUI();

  if (obstacles.length >= maxObstacles) {
    currentState = State.DONE;
    saveBtn.disabled = false;
    showToast(`已設定 ${maxObstacles} 個障礙物，設定完成！`, 'success');
  } else {
    showToast(`障礙物 ${obstacles.length}/${maxObstacles} 已設定`, 'info');
  }
}

// ─────────────────────────────────────────────────────────────────
function addLabel(cell, text) {
  // Remove old label if exists
  cell.querySelector('.cell-label')?.remove();
  const lbl = document.createElement('span');
  lbl.className = 'cell-label';
  lbl.textContent = text;
  cell.appendChild(lbl);
}

// ─────────────────────────────────────────────────────────────────
function updateUI() {
  // Status items
  statusStart.textContent = startCell
    ? `(${startCell.row}, ${startCell.col})`
    : '—';
  statusEnd.textContent = endCell
    ? `(${endCell.row}, ${endCell.col})`
    : '—';
  statusObs.textContent = currentState === State.IDLE
    ? '—'
    : `${obstacles.length} / ${maxObstacles}`;

  // Mode text
  const modeMap = {
    [State.IDLE]:          '等待生成網格',
    [State.SET_START]:     '點擊設定 起點 (綠色)',
    [State.SET_END]:       '點擊設定 終點 (紅色)',
    [State.SET_OBSTACLES]: `點擊設定 障礙物 (灰色) — ${obstacles.length}/${maxObstacles}`,
    [State.DONE]:          '設定完成，可儲存'
  };
  modeText.textContent = modeMap[currentState] || '';
  statusMode.textContent = modeText.textContent;

  // Highlight mode status item
  modeItemEl.classList.toggle('active', currentState !== State.IDLE && currentState !== State.DONE);

  // Save button enabled when both start & end set
  if (startCell && endCell) {
    saveBtn.disabled = false;
  }
}

// ─────────────────────────────────────────────────────────────────
async function saveConfig() {
  if (!startCell || !endCell) {
    showToast('請先設定起點和終點', 'error');
    return;
  }

  const payload = {
    n:         currentN,
    start:     [startCell.row, startCell.col],
    end:       [endCell.row, endCell.col],
    obstacles: obstacles.map(o => [o.row, o.col])
  };

  try {
    const res  = await fetch('/set_grid', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      savedCard.classList.add('visible');
      savedInfo.innerHTML = `
        <strong>網格大小：</strong>${currentN} × ${currentN}<br>
        <strong>起點：</strong>(${startCell.row}, ${startCell.col})<br>
        <strong>終點：</strong>(${endCell.row}, ${endCell.col})<br>
        <strong>障礙物：</strong>${obstacles.length > 0 ? obstacles.map(o => `(${o.row},${o.col})`).join(' ') : '無'}
      `;
      showToast('設定已成功儲存！現在可以執行強化學習。', 'success');
      document.getElementById('rl-actions-section').style.display = 'block';
    } else {
      showToast('儲存失敗：' + data.error, 'error');
    }
  } catch (err) {
    showToast('網路錯誤，請確認 Flask 伺服器已啟動', 'error');
  }
}

// ─────────────────────────────────────────────────────────────────
function resetAll() {
  startCell    = null;
  endCell      = null;
  obstacles    = [];
  currentState = State.IDLE;

  gridEl.innerHTML  = '';
  gridEl.style.display = 'none';
  placeholder.style.display = 'flex';
  modeBar.style.display     = 'none';
  saveBtn.disabled           = true;
  savedCard.classList.remove('visible');
  document.getElementById('rl-actions-section').style.display = 'none';

  updateUI();
  showToast('已重置，請重新選擇網格大小', 'info');
}

// ─── Toast helper ───────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type}`;
  // Force reflow
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ─── RL Execution ───────────────────────────────────────────────
async function runRL(algorithm) {
  clearRLResults();
  const loadingMsg = algorithm === 'policy_evaluation' ? '正在評估策略...' : '正在執行值迭代...';
  showToast(loadingMsg, 'info');
  
  try {
    const res = await fetch('/run_rl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm })
    });
    const data = await res.json();
    
    if (data.success) {
      if (algorithm === 'policy_evaluation') {
        renderRLResults(data.V, null); // 只有數值
      } else if (algorithm === 'value_iteration') {
        renderRLResults(null, data.policy); // 只有策略箭頭
      }
      showToast('強化學習執行完成！', 'success');
    } else {
      showToast('執行失敗：' + data.error, 'error');
    }
  } catch (err) {
    showToast('網路錯誤，請確認 Flask 伺服器已啟動', 'error');
  }
}

function clearRLResults() {
  document.querySelectorAll('.cell-value, .cell-policy').forEach(el => el.remove());
}

function renderRLResults(V, policy) {
  // Arrow mapping for policy
  const arrowMap = { 'UP': '↑', 'DOWN': '↓', 'LEFT': '←', 'RIGHT': '→', 'TERMINAL': '⭐' };
  
  for (let r = 0; r < currentN; r++) {
    for (let c = 0; c < currentN; c++) {
      const cellId = `cell-${r}-${c}`;
      const cell = document.getElementById(cellId);
      if (!cell || cell.classList.contains('obstacle')) continue;
      
      const key = `${r},${c}`;
      
      // Render Value
      if (V && V[key] !== undefined) {
        const valSpan = document.createElement('span');
        valSpan.className = 'cell-value';
        valSpan.textContent = V[key];
        cell.appendChild(valSpan);
      }
      
      // Render Policy if available
      if (policy && policy[key]) {
        const polSpan = document.createElement('span');
        polSpan.className = 'cell-policy';
        polSpan.textContent = arrowMap[policy[key]] || '';
        cell.appendChild(polSpan);
      }
    }
  }
}

document.getElementById('btn-policy-eval').addEventListener('click', () => runRL('policy_evaluation'));
document.getElementById('btn-value-iter').addEventListener('click', () => runRL('value_iteration'));

// ─── Init ───────────────────────────────────────────────────────
updateUI();
