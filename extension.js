const axios = require('axios');
const vscode = require('vscode');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const disposable = vscode.commands.registerCommand('gen-com.generateCommit', async function () {
		// vscode.window.showInformationMessage('Hello World from gen-com!');
		try {
			const workspaceFolder = vscode.workspace.workspaceFolders;

			console.log('Workspace Folder:', workspaceFolder);
			if (!workspaceFolder || workspaceFolder.length === 0) {
				vscode.window.showErrorMessage('No workspace folder found');
				return;
			}

			const workspacePath = workspaceFolder[0].uri.fsPath;
			const normalizedWorkspacePath = path.normalize(workspacePath);

			process.chdir(normalizedWorkspacePath);
			const git = simpleGit(normalizedWorkspacePath);

			const diff = await git.diff()
			const commitMessage = await queryModel(diff);

			// Display the generated commit message
			vscode.window.showInformationMessage('Generated Commit Message:\n' + commitMessage);

			// Copy the commit message to the clipboard
			await vscode.env.clipboard.writeText(commitMessage);
			vscode.window.showInformationMessage('Commit message copied to clipboard!');
		} catch (error) {
			vscode.window.showErrorMessage('Error getting diff: ' + error.message);
		}
	});

	context.subscriptions.push(disposable);
}

const queryModel = async (diff) => {
	try {
		const response = await axios.post('http://localhost:3030/api/generate', {
			diff: diff,
		})

		return response.data;
	} catch (error) {
			console.error('Error generating commit message:', error);
      return 'Error generating commit message';

	}
}
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
