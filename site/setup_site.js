const fs = require("fs");
const path = require("path");

const PAGES_FOLDER = "./pages";

fs.rmSync(PAGES_FOLDER, { recursive: true, force: true });
fs.mkdirSync(PAGES_FOLDER);

fs.cpSync("../contents", PAGES_FOLDER, { recursive: true });
fs.cpSync("./src/index.md", path.join(PAGES_FOLDER, "index.md"));

function setupPageTree(folderPath) {
  const folderContent = getDirsOfFolder(folderPath);

  const metaContent = {};

  for (const entry of folderContent) {
    const subFolderPath = path.join(folderPath, entry);
    const subFolderContent = fs.readdirSync(subFolderPath);
    if (subFolderContent.length == 1 && path.extname(subFolderContent[0]) === ".md") {
      shrugFolder(folderPath, subFolderPath, subFolderContent);
    } else {
      extractTitleToMeta(subFolderPath, entry, metaContent);
      setupPageTree(subFolderPath);
    }
  }

  if (Object.keys(metaContent).length !== 0)
    fs.writeFileSync(path.join(folderPath, "_meta.json"), JSON.stringify(metaContent, null, 2));
}

function getDirsOfFolder(folderPath) {
  return fs.readdirSync(folderPath).filter((f) => fs.lstatSync(path.join(folderPath, f)).isDirectory());
}

function shrugFolder(folderPath, subFolderPath, subFolderContent) {
  fs.renameSync(path.join(subFolderPath, subFolderContent[0]), path.join(folderPath, subFolderContent[0]));
  fs.rmdirSync(subFolderPath);
}

function extractTitleToMeta(subFolderPath, entry, metaContent) {
  const mainFile = path.join(subFolderPath, `${entry}.md`);
  if (fs.existsSync(mainFile)) {
    const fileContents = fs.readFileSync(mainFile, "utf-8");
    let title = /^# (.*)\r?\n/g.exec(fileContents)[1];
    if (title) {
      metaContent[entry] = title;
    } else {
      console.log("no title");
    }
  } else {
    console.log("%s doesn't exist", mainFile);
  }
}

function copyAssets() {
  fs.rmSync('./public', {recursive: true, force: true});
  fs.mkdirSync('./public/docs/img', {recursive: true});
  fs.mkdirSync('./public/docs/diagrams', {recursive: true});

  fs.cpSync('../docs/img', './public/docs/img', {recursive: true});
  fs.cpSync('../docs/diagrams', './public/docs/diagrams', {recursive: true});

  fs.cpSync('./src/_app.jsx', './pages/_app.jsx');
  fs.cpSync('./src/styles.css', './pages/styles.css');
}


setupPageTree(PAGES_FOLDER);
copyAssets();
