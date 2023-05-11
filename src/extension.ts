import * as vscode from 'vscode';

import { runWaCode } from './run'
import { fmtWaCode } from './fmt'

export function activate(context: vscode.ExtensionContext) {
	console.log("wa extensio actived!");

	context.subscriptions.push(vscode.commands.registerCommand('wa.runWaCode', runWaCode));
	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(fmtWaCode));

	context.subscriptions.push(
		vscode.commands.registerCommand("wa.helloWorld", () => {
			vscode.window.showInformationMessage('Wa: Hello World!');
		})
	);
}

export function deactivate() { }
