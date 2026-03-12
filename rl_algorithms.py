import math

def build_env(n, start, end, obstacles):
    """
    Constructs the GridWorld environment.
    
    Args:
        n: Grid size (n x n)
        start: tuple (row, col)
        end: tuple (row, col)
        obstacles: list of tuples (row, col)
        
    Returns:
        states: List of all valid unblocked states (tuples).
        actions: List of possible actions.
        get_transitions: Function (state, action) -> list of (probability, next_state, reward, is_terminal)
    """
    states = []
    obstacles_set = set(tuple(o) for o in obstacles)
    
    for r in range(n):
        for c in range(n):
            if (r, c) not in obstacles_set:
                states.append((r, c))
                
    end_state = tuple(end)
    actions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    
    # Movement deltas
    deltas = {
        'UP': (-1, 0),
        'DOWN': (1, 0),
        'LEFT': (0, -1),
        'RIGHT': (0, 1)
    }
    
    def get_transitions(state, action):
        """
        Returns a list of possible transitions from taking `action` in `state`.
        Each transition is a tuple: (prob, next_state, reward, is_terminal)
        """
        if state == end_state:
            # Terminal state has no transitions (or transitions to itself with 0 reward)
            return [(1.0, state, 0.0, True)]
            
        r, c = state
        dr, dc = deltas[action]
        next_r, next_c = r + dr, c + dc
        next_state = (next_r, next_c)
        
        # Check boundaries and obstacles
        if (next_r < 0 or next_r >= n or 
            next_c < 0 or next_c >= n or 
            next_state in obstacles_set):
            # Hit a wall or obstacle: stay in current state
            next_state = state
            
        reward = -1.0
        is_terminal = (next_state == end_state)
        
        # Deterministic environment (probability = 1.0)
        return [(1.0, next_state, reward, is_terminal)]
        
    return states, actions, get_transitions

def policy_evaluation(policy, env, gamma=0.9, theta=1e-6):
    """
    Evaluates a given policy to find the state-value function V(s).
    
    Args:
        policy: dict mapping state -> dict mapping action -> probability
        env: environment details (states, actions, get_transitions)
        gamma: Discount factor
        theta: Convergence threshold
        
    Returns:
        V: dict mapping state -> value
    """
    states, actions, get_transitions = env
    
    # Initialize V(s) = 0 for all states
    V = {s: 0.0 for s in states}
    
    while True:
        delta = 0
        for s in states:
            v = V[s]
            new_v = 0
            
            # Sum over all actions
            for a in actions:
                prob_a = policy.get(s, {}).get(a, 0.0)
                if prob_a == 0:
                    continue
                    
                # Sum over all next states
                for prob_trans, next_s, reward, is_term in get_transitions(s, a):
                    new_v += prob_a * prob_trans * (reward + gamma * V[next_s])
                    
            V[s] = new_v
            delta = max(delta, abs(v - new_v))
            
        if delta < theta:
            break
            
    return V

def value_iteration(env, gamma=0.9, theta=1e-6):
    """
    Finds the optimal state-value function V*(s) and optimal policy pi*(s).
    
    Args:
        env: environment details (states, actions, get_transitions)
        gamma: Discount factor
        theta: Convergence threshold
        
    Returns:
        V: dict mapping state -> optimal value
        policy: dict mapping state -> best action (as a string)
    """
    states, actions, get_transitions = env
    
    # Initialize V(s) = 0
    V = {s: 0.0 for s in states}
    
    while True:
        delta = 0
        for s in states:
            # Terminal state value is fixed 0
            transitions = get_transitions(s, 'UP')
            if len(transitions) == 1 and transitions[0][3] and transitions[0][1] == s:
                continue # Skip terminal state evaluation since V(end) = 0
                
            v = V[s]
            max_v = -float('inf')
            
            for a in actions:
                action_value = 0
                for prob_trans, next_s, reward, is_term in get_transitions(s, a):
                    action_value += prob_trans * (reward + gamma * V[next_s])
                max_v = max(max_v, action_value)
                
            V[s] = max_v
            delta = max(delta, abs(v - max_v))
            
        if delta < theta:
            break
            
    # Extract optimal policy
    policy = {}
    for s in states:
        transitions = get_transitions(s, 'UP')
        if len(transitions) == 1 and transitions[0][3] and transitions[0][1] == s:
            policy[s] = 'TERMINAL'
            continue
            
        best_a = None
        max_v = -float('inf')
        
        for a in actions:
            action_value = 0
            for prob_trans, next_s, reward, is_term in get_transitions(s, a):
                action_value += prob_trans * (reward + gamma * V[next_s])
                
            # Use rounding to handle floating point precision issues when finding optimal
            if round(action_value, 5) > round(max_v, 5):
                max_v = action_value
                best_a = a
                
        policy[s] = best_a
        
    return V, policy
