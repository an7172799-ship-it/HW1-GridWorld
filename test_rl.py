import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rl_algorithms import build_env, policy_evaluation, value_iteration

n = 6
start = (0, 0)
end = (5, 5)
obstacles = [(2, 2), (3, 3)]

env = build_env(n, start, end, obstacles)
states, actions, _ = env

print("--- Policy Evaluation ---")
policy = {s: {a: 0.25 for a in actions} for s in states}
V_pe = policy_evaluation(policy, env)
for r in range(n):
    row_str = []
    for c in range(n):
        if (r, c) in obstacles:
            row_str.append("  OBS  ")
        else:
            row_str.append(f"{V_pe.get((r,c), 0):7.2f}")
    print(" | ".join(row_str))

print("\n--- Value Iteration ---")
V_vi, optimal_policy = value_iteration(env)

# Value Matrix
print("Value Matrix:")
for r in range(n):
    row_str = []
    for c in range(n):
        if (r, c) in obstacles:
            row_str.append("  OBS  ")
        else:
            row_str.append(f"{V_vi.get((r,c), 0):7.2f}")
    print(" | ".join(row_str))

# Policy Matrix
print("\nPolicy Matrix:")
arrow_map = {'UP': '^', 'DOWN': 'v', 'LEFT': '<', 'RIGHT': '>', 'TERMINAL': '*'}
for r in range(n):
    row_str = []
    for c in range(n):
        if (r, c) in obstacles:
            row_str.append(" OBS ")
        else:
            action = optimal_policy.get((r, c), " ")
            row_str.append(f"  {arrow_map.get(action, ' ')}  ")
    print(" | ".join(row_str))

