const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify the required fs functions
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);


const parentFolder = '../table-data'; // Update this with the path to your parent folder

async function findAndLogJsonFiles(folderPath) {
    try {
      const outputFolder = 'table-data-cleaned';
      const subfolders = await readdir(folderPath, { withFileTypes: true });
  
      for (const [index, subfolder] of subfolders.entries()) {
        if (subfolder.isDirectory()) {
          const subfolderPath = path.join(folderPath, subfolder.name);
          const outputSubfolderPath = path.join(outputFolder, subfolder.name);
  
          // Creating output subfolder
          await mkdir(outputSubfolderPath, { recursive: true });
  
          const files = await readdir(subfolderPath, { withFileTypes: true });
  
          for (const file of files) {
            if (file.isFile() && path.extname(file.name) === '.json') {
              const filePath = path.join(subfolderPath, file.name);
              const fileContent = await readFile(filePath, 'utf8');
              const jsonData = JSON.parse(fileContent);
  
              let fileType;
              let cleanedData;

              if(jsonData[0][0] !== undefined) {
                // Determine the file type based on its content and apply cleaning logic
                console.log(subfolder.name)
                switch (true) {
                    case jsonData[0][0].hasOwnProperty('Log no.'):
                        fileType = 'overview';
                        cleanedData = cleanOverviewData(jsonData[0], index, subfolder);
                    break;
                    case jsonData[0][0].hasOwnProperty('cpolymer [v%]'):
                        fileType = 'bioInks';
                        cleanedData = addId(jsonData[0], index);
                    break;
                    case jsonData[0][0].hasOwnProperty('Hardware Parts'):
                        fileType = 'hardwareSetup';
                        cleanedData = cleanHardwareData(jsonData[0], index)
                        break;
                    case jsonData[0][0].hasOwnProperty('Link to .stl-file'):
                        fileType = 'printerSetup';
                        cleanedData = addId(jsonData[0], index);
                    break;
                    case jsonData[0][0].hasOwnProperty('Material parameters') || jsonData[0][0].hasOwnProperty('.JSON'):
                        fileType = 'materialSettings';
                        cleanedData = addId(jsonData[0], index);
                    break;
                    case jsonData[0][0].hasOwnProperty('Attempt No.'):
                        fileType = 'printingLog';
                        cleanedData = addId(jsonData[0], index);
                    break;
                    default:
                        console.log(`Unknown file type from ${file.name}. File disregarded.`);
                    continue;
                }
                // Save the cleaned data to the output subfolder
                const outputFilePath = path.join(outputSubfolderPath, `${fileType}.json`);
                await writeFile(outputFilePath, JSON.stringify(cleanedData, null, 2));
                console.log(`Processed and saved ${fileType} data from ${subfolder.name} to ${outputSubfolderPath}`);
              } else {
                console.log(`Unknown file type from ${file.name}. File disregarded.`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

findAndLogJsonFiles(parentFolder);

function cleanOverviewData(jsonData, index, subfolder) {
    // two known schemas
    let logNo;
    let outputJson = [{
        "id": index,
        "Log no.": "",
        "Title": "",
        "Operator": "",
        "Description": "",
        "folderName": subfolder.name
    }];
    if(Object.keys(jsonData[0])[0] === "2") {
        outputJson[0]["Title"]  = jsonData[0]["2"];
        outputJson[0]["Operator"]  = jsonData[1]["2"];
        outputJson[0]["Description"]  = jsonData[2]["2"];
    } else {
        logNo = Object.keys(jsonData[0])[1];
        outputJson[0]["Log no."]  = logNo;
        outputJson[0]["Title"]  = jsonData[0][logNo];
        outputJson[0]["Operator"]  = jsonData[1][logNo];
        outputJson[0]["Description"]  = jsonData[2][logNo];
    }
    return outputJson;
}

function cleanHardwareData(jsonData, index) {
    const transformedData = [];

    for (let i = 1; i <= 4; i++) {
      const transformedObj = { Position: i.toString() };

      jsonData.forEach(d => {
          const hardwarePart = d["Hardware Parts"];
          const positionValue = d["Position " + i];
          
          if (positionValue && positionValue !== "-") {
            transformedObj[hardwarePart] = positionValue;
          } else {
            transformedObj[hardwarePart] = "";
          }
          transformedObj["logId"] = index;
      });
      transformedData.push(transformedObj);
    }

    return transformedData;
}

function addId(jsonData, index) {
  const transformedData = jsonData
  for (const element of transformedData){
    element["logId"] = index;
  }
  return transformedData;
}