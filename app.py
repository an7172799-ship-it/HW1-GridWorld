from flask import Flask, render_template, request, jsonify, session
import os
from rl_algorithms import build_env, policy_evaluation, value_iteration

app = Flask(__name__)
app.secret_key = os.urandom(24)

# In-memory store (simple, suitable for single-user demo)
grid_config = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set_grid', methods=['POST'])
def set_grid():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data received'}), 400

    n = data.get('n')
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])

    # Validate
    if not isinstance(n, int) or not (5 <= n <= 9):
        return jsonify({'success': False, 'error': 'n must be between 5 and 9'}), 400
    if start is None:
        return jsonify({'success': False, 'error': 'Start cell not set'}), 400
    if end is None:
        return jsonify({'success': False, 'error': 'End cell not set'}), 400
    if len(obstacles) > n - 2:
        return jsonify({'success': False, 'error': f'Too many obstacles (max {n-2})'}), 400

    grid_config.update({
        'n': n,
        'start': start,
        'end': end,
        'obstacles': obstacles
    })

    return jsonify({
        'success': True,
        'message': f'Grid {n}x{n} saved: start={start}, end={end}, obstacles={obstacles}'
    })

@app.route('/run_rl', methods=['POST'])
def run_rl():
    data = request.get_json()
    if not data or 'algorithm' not in data:
        return jsonify({'success': False, 'error': 'No algorithm specified'}), 400

    algorithm = data['algorithm']
    
    if not grid_config:
        return jsonify({'success': False, 'error': 'Grid not configured yet. Save a grid first.'}), 400
        
    n = grid_config['n']
    start = tuple(grid_config['start'])
    end = tuple(grid_config['end'])
    obstacles = [tuple(o) for o in grid_config['obstacles']]
    
    env = build_env(n, start, end, obstacles)
    states, actions, _ = env
    
    if algorithm == 'policy_evaluation':
        # Create a uniform random policy
        policy = {}
        for s in states:
            policy[s] = {a: 0.25 for a in actions}
            
        V = policy_evaluation(policy, env)
        
        # Convert dictionary tuple keys to string format for JSON parsing in JS
        V_formatted = {f"{r},{c}": round(v, 2) for (r, c), v in V.items()}
        
        return jsonify({
            'success': True,
            'algorithm': algorithm,
            'V': V_formatted
        })
        
    elif algorithm == 'value_iteration':
        V, optimal_policy = value_iteration(env)
        
        V_formatted = {f"{r},{c}": round(v, 2) for (r, c), v in V.items()}
        policy_formatted = {f"{r},{c}": optimal_policy.get((r,c), None) for r, c in states}
        
        return jsonify({
            'success': True,
            'algorithm': algorithm,
            'V': V_formatted,
            'policy': policy_formatted
        })
        
    else:
        return jsonify({'success': False, 'error': 'Unknown algorithm'}), 400

@app.route('/get_grid', methods=['GET'])
def get_grid():
    return jsonify(grid_config)

if __name__ == '__main__':
    app.run(debug=True)
