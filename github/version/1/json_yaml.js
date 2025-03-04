const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { parseArgs } = require('util');


console.log(process.env.BASE_URL)
const BASE_URL = process.env.BASE_URL;

const args = process.argv.slice(2);
const projectId = args[0];
const branchId = args[1];
const token = process.env.DIGIA_TOKEN;




// const projectId = "67a8f686acd58e18462ab068"
// const branchId = "67a8f686acd58e18462ab06a"
// const token = "?wubr>hlenr^e(`@7_%/qO>>A~EmGs12b4af7b31e305f84eb454b2946086c08012a8e45c49a63855fc7ca9a0976a0b"
// Validate projectId

if (!projectId) {
  console.error('Please provide a projectId.');
  process.exit(1);
}

function removeIds(obj, excludeProjectId = false) {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (item && typeof item === 'object') {
        return filterObj(item, excludeProjectId);
      }
      return item;
    });
  } else if (obj && typeof obj === 'object') {
    return filterObj(obj, excludeProjectId);
  }
  return obj;
}

function filterObj(item, excludeProjectId) {
  const keysToRemove = ['id', '_id', 'branchId', 'userId','createdAt','updatedAt'];
  if (!excludeProjectId) {
    keysToRemove.push('projectId');
  }
  
  return Object.fromEntries(
    Object.entries(item).filter(([key]) => !keysToRemove.includes(key))
  );
}


function deleteFolders(folders) {
  folders.forEach((folder) => {
    const dirPath = path.join(__dirname, '..', folder);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Deleted folder: ${dirPath}`);
    }
  });
}

function processAndSaveData(parentFolderName, folderName, data, fileName = 'default') {
  const dirPath = path.join(__dirname, '..', parentFolderName, folderName);
  fs.mkdirSync(dirPath, { recursive: true });


 if (parentFolderName !== "project") {
    data = removeIds(data);
  } else {
    data = removeIds(data, true); 
  }


  if (Array.isArray(data)) {
    data.forEach((item) => {
      const yamlData = yaml.dump(item,{ sortKeys: false });
      let currentFileName = fileName;
      
      if (item.name) currentFileName = item.name;
      if (item.displayName) currentFileName = item.displayName;
      if (item.functionName) currentFileName = item.functionName;
    
      if(folderName =="environment")
      {
        currentFileName= item.kind
      }

      const yamlFilePath = path.join(dirPath, `${currentFileName}.yaml`);
      fs.writeFileSync(yamlFilePath, yamlData);

    

      console.log(`Created: ${yamlFilePath}`);
    });
  } else {
    const yamlData = yaml.dump(data,{ sortKeys: false });

    if (parentFolderName === 'artbook' && data.TYPOGRAPHY) {
      folderName = 'font-tokens';
    }
    if (parentFolderName === 'artbook' && data.THEME) {
      folderName = 'color-tokens';
    }
    if (parentFolderName === 'artbook' && data.APP_SETTINGS) {
      folderName = 'app-settings';
    }
    if (parentFolderName === 'project' && data.appDetails?.displayName) {
      folderName = "project-details";
    }

    const yamlFilePath = path.join(dirPath, `${folderName}.yaml`);
    fs.writeFileSync(yamlFilePath, yamlData);
    console.log(`Created: ${yamlFilePath}`);
  }
}

async function fetchAllData() {
  deleteFolders(['datasources', 'components', 'artbook', 'functions', 'pages', 'project']);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/project/syncProjectDataForGithub`,
      { branchId },
      {
        headers: {
          projectId: projectId,
          "x-digia-github-token": token
        }
      }
    );

    if (!response.data || !response.data.data || !response.data.data.response) {
      console.error('Unexpected response format:', response.data);
      process.exit(1);
    }


    const { datasources, components, functions, pages, project, typoGraphy, themeData,appSettings, envs } = response.data.data.response;
    processAndSaveData('datasources', 'rest', datasources);
    processAndSaveData('datasources', 'environment', envs);
    processAndSaveData('components', '', components);
    processAndSaveData('functions', '', functions);
    processAndSaveData('pages', '', pages);
    processAndSaveData('project', '', project);
    processAndSaveData('artboook', 'font-tokens', typoGraphy);
    processAndSaveData('artbook', 'color-tokens', themeData);
    processAndSaveData('artbook', 'app-settings', appSettings);

    console.log(`Data for project ID ${projectId} has been fetched and saved.`);
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    process.exit(1); 
  }
}


fetchAllData(); 