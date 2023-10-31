import json
import random

source_logs_path = '../sourceLogs.json'
with open(source_logs_path, 'r') as f:
    source_logs = json.load(f)

population_size = len(source_logs)

# 10% sample size
sample_size = round(population_size * 0.1)

# get random logs
log_samples = []
chosen_indices = set()
while len(log_samples) < sample_size:
    rand_index = random.randint(0, population_size - 1)
    if rand_index not in chosen_indices:
        chosen_indices.add(rand_index)
        log_samples.append(source_logs[rand_index])

print(log_samples)