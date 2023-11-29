import os
import matplotlib.pyplot as plt

def count_json_files(directory):
    
    # Dictionary to hold the count of JSON files in each subfolder
    json_counts = {}

    # Walk through the directory
    for root, dirs, files in os.walk(directory):
        for subdirname in dirs:
            subdir_path = os.path.join(root, subdirname)
            json_files = [file for file in os.listdir(subdir_path) if file.endswith('.json')]
            json_counts[subdirname] = len(json_files)

    # Sort the counts by the number of JSON files
    sorted_counts = sorted(json_counts.items(), key=lambda item: item[1], reverse=True)
    
    # Resort the counts
    for i in range(7): 
        logCount = 0  
        for index, (subdir, count) in enumerate(sorted_counts, 1):
            if(count == i):
                logCount += 1
        output[i] = logCount
    print(output)        
        

# Replace '/path/to/your/directory' with the path to your directory containing subfolders
directory_path = 'table-data-cleaned'
output = [0,0,0,0,0,0,0]
count_json_files(directory_path)

# chart
indices = list(range(len(output)))
plt.bar(indices, output)
plt.xlabel('Number of tables per log')
plt.ylabel('Number of logs')
plt.title(f'Table distribution per log. N={sum(output)}')
plt.show()