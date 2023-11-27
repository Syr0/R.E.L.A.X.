import {App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';

interface RelaxPluginSettings {
	regexPairs: Array<{ isActive: boolean, key: string, regex: string, }>;
	ignoreLinks?: boolean;
	ignoreURLs?: boolean;
	defangURLs?: boolean;
}

const DEFAULT_SETTINGS: RelaxPluginSettings = {
	"regexPairs": [
		{
			"isActive": true,
			"key": "Domains",
			"regex": "([a-zA-Z0-9\\-\\.]+\\.(?:com|org|net|mil|edu|COM|ORG|NET|MIL|EDU))"
		},
		{
			"isActive": true,
			"key": "IP",
			"regex": "((?:(?:(?!1?2?7\\.0\\.0\\.1)(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)))"
		},
		{
			"isActive": true,
			"key": "eMail",
			"regex": "([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})"
		},
		{
			"isActive": true,
			"key": "GUID",
			"regex": "([A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12})"
		},
		{
			"isActive": true,
			"key": "SHA256",
			"regex": "([a-fA-F0-9]{64})"
		},
		{
			"isActive": true,
			"key": "JARM",
			"regex": "([a-fA-F0-9]{62})"
		},
		{
			"isActive": true,
			"key": "SHA1",
			"regex": "([a-fA-F0-9]{40})"
		},
		{
			"isActive": true,
			"key": "MD5",
			"regex": "([a-fA-F0-9]{32})"
		},
		{
			"isActive": true,
			"key": "Bitcoin",
			"regex": "([13]{1}[a-km-zA-HJ-NP-Z1-9]{26,33}|bc1[a-z0-9]{39,59})"
		},
		{
			"isActive": true,
			"key": "Date",
			"regex": "((?:0[1-9]|[12][0-9]|3[01])[\\\\\\/\\.-](?:0[1-9]|1[012])[\\\\\\/\\.-](?:19|20|)\\d\\d)"
		},
		{
			"isActive": true,
			"key": "Windows Usernames",
			"regex": "\\\\Users\\\\+(?!(?:Public|Administrator)\\\\)([^\\\\]+)\\\\"
		},
		{
			"isActive": true,
			"key": "Quotes-DE",
			"regex": "„([^\\\"]+){5,66}[\"|\"]"
		},
		{
			"isActive": false,
			"key": "Quotes-EN",
			"regex": "\"([^\\\"]+){5,15}[\"|\"]"
		},
		{
			"isActive": false,
			"key": "Log-File Entry",
			"regex": "\\d{2}:\\d{2}:\\d{2} (.+?)(?=\\s\\d{2}:\\d{2}:\\d{2}|$)"
		}
	],
	ignoreLinks: true,
	ignoreURLs: false,
	defangURLs: true
};

class Mutex {
	private _promise: Promise<void> | null = null;
	private _resolve: (() => void) | null = null;

	async lock() {
		if (this._promise) await this._promise;
		this._promise = new Promise((resolve) => {
			this._resolve = resolve;
		});
	}

	unlock() {
		if (this._resolve) {
			this._resolve();
			this._resolve = null;
			this._promise = null;
		}
	}

	async runExclusive<T>(callback: () => Promise<T>): Promise<T> {
		await this.lock();
		try {
			return await callback();
		} finally {
			this.unlock();
		}
	}
}

class RelaxSettingTab extends PluginSettingTab {
	plugin: RelaxPlugin;
	keyValueContainer: HTMLDivElement;

	constructor(app: App, plugin: RelaxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const {containerEl} = this;
		containerEl.empty();
		const keyValueContainer = containerEl.createEl("div");
		keyValueContainer.style.display = 'flex';
		keyValueContainer.style.flexDirection = 'column';

		function validateContent(content) {
			const regex = /\[\[(.+?)\]\]/g;
			return !regex.test(content);
		}

		function applyValidationStyle(textarea) {
			if (validateContent(textarea.value)) {
				const accentColor = getComputedStyle(document.documentElement)
					.getPropertyValue('--color-accent').trim();
				textarea.style.borderColor = accentColor
			} else {
				textarea.style.borderColor = "red";
			}
		}

		document.addEventListener('DOMContentLoaded', (event) => {
			const modalButton = document.querySelector("#openModalButton");

			modalButton.addEventListener('click', function () {
				const modal = document.querySelector(".modal");
				const textarea = modal.querySelector("textarea");

				applyValidationStyle(textarea);

				textarea.addEventListener('input', function () {
					applyValidationStyle(textarea);
				});
			});
		});

		const validateRegexInput = (input: HTMLInputElement) => {
			let errorMsg = '';
			try {
				let reg = new RegExp(input.value);
				let groupCount = (input.value.match(/\((?!\?)/g) || []).length;
				if (groupCount > 1) {
					input.style.border = '2px solid red';
					errorMsg = 'More than one group detected.';
				} else {
					input.style.border = '';
				}
			} catch (e) {
				input.style.border = '2px solid red';
				errorMsg = 'Invalid regex.';
			}

			const errorElement = input.nextSibling;
			if (errorElement && errorElement.classList.contains('regex-error')) {
				errorElement.textContent = errorMsg;
			} else {
				const span = document.createElement('span');
				span.className = 'regex-error';
				span.textContent = errorMsg;
				input.parentNode.insertBefore(span, input.nextSibling);
			}
		};
		const addKeyValue = (key?: string, value?: string, isActive: boolean = false) => {
			const row = keyValueContainer.createEl("div");
			row.style.display = 'flex';
			row.style.alignItems = 'center';

			const dragHandle = row.createEl("span", {className: "drag-handle", text: "☰"});
			const activeCheckbox = row.createEl("input", {className: "active-checkbox"});
			activeCheckbox.type = "checkbox";
			activeCheckbox.checked = isActive;
			row.appendChild(activeCheckbox);

			const keyInput = row.createEl("input", {className: "key-input", placeholder: "Description-Key", value: key ?? ''});
			const valueInput = row.createEl("input", {className: "value-input", placeholder: "Regexp", value: value ?? ''});
			keyInput.style.marginRight = '10px';
			valueInput.style.marginRight = '10px';

			row.createEl("button", {text: "Delete", className: `delete-button-${key ?? Date.now()}`})
				.addEventListener("click", () => {
					row.remove();
					updateRegexOrderFromDOM.call(this);
				});

			if (dragHandle) makeDraggable(row, dragHandle);
			valueInput.addEventListener('input', () => validateRegexInput(valueInput));
		};

		containerEl.createEl("button", {text: "Add Regexp"}).addEventListener("click", () => addKeyValue());

		for (const {isActive, key, regex} of this.plugin.settings.regexPairs) {
			addKeyValue(key, regex, isActive);
		}

		let startY = 0;
		let startTop = 0;
		let initialOffsetY = 0

		function updateRegexOrderFromDOM(pluginObj) {

			const regexPairs = [];
			keyValueContainer.querySelectorAll("div").forEach(row => {

				const activeCheckboxInput = row.querySelector('input[type="checkbox"]');
				const keyInput = row.querySelector('input[placeholder="Description-Key"]');
				const valueInput = row.querySelector('input[placeholder="Regexp"]');


				if (keyInput && valueInput && activeCheckboxInput) {
					const key = keyInput.value;
					const value = valueInput.value;
					const isActive = activeCheckboxInput.checked;
					regexPairs.push({isActive, key, regex: value});
				}
			});
			if (pluginObj.plugin && pluginObj.plugin.settings) {
				pluginObj.plugin.settings.regexPairs = regexPairs;
				pluginObj.plugin.saveSettings();
			} else {
				console.error("Plugin or settings not available");
			}

		}

		let dragElement = null;
		let currentIndex = null;
		let newIndex = null;


		function makeDraggable(element, dragHandle) {
			if (!dragHandle) {
				console.error("Drag handle not found!", element.innerHTML);
				return;
			}

			dragHandle.addEventListener('mousedown', function (e) {
				e.preventDefault();
				e.stopPropagation();

				const settingsContainerTop = document.querySelector(".vertical-tab-content-container").getBoundingClientRect().top;
				const elementRect = element.getBoundingClientRect();
				initialOffsetY = e.clientY - elementRect.top + settingsContainerTop;
				currentIndex = [...element.parentElement.children].indexOf(element);

				dragElement = element;
				dragElement.style.zIndex = '1000';
				dragElement.style.position = 'absolute';

				const newTop = e.clientY - initialOffsetY;
				dragElement.style.top = `${newTop}px`;

				document.addEventListener('mousemove', onDragMove);
				document.addEventListener('mouseup', onDragEnd);
			});
		}

		function onDragMove(e) {
			if (dragElement) {
				const newTop = e.clientY - initialOffsetY;
				dragElement.style.top = `${newTop}px`;

				newIndex = null;
				let closestDistance = Infinity;
				[...dragElement.parentElement.children].forEach((child, idx) => {
					if (child !== dragElement) {
						const rect = child.getBoundingClientRect();
						const distance = Math.abs(rect.top + rect.height / 2 - e.clientY);
						if (distance < closestDistance) {
							closestDistance = distance;
							newIndex = idx;
						}
					}
				});
			}
		}

		function onDragEnd() {
			if (dragElement) {
				dragElement.style.position = '';
				dragElement.style.top = '';
				dragElement.style.zIndex = '';

				if (newIndex !== null && currentIndex !== null && newIndex !== currentIndex) {
					const parent = dragElement.parentElement;
					if (newIndex >= parent.children.length) {
						parent.appendChild(dragElement);
					} else {
						parent.insertBefore(dragElement, parent.children[newIndex + (newIndex > currentIndex ? 1 : 0)]);
					}
				}

				dragElement = null;
				updateRegexOrderFromDOM.call(this);
				document.removeEventListener('mousemove', onDragMove);
				document.removeEventListener('mouseup', onDragEnd);
				reorderElements();
				currentIndex = null;
				newIndex = null;
			}
		}

		function reorderElements() {
			keyValueContainer.querySelectorAll("div").forEach((row) => {
				row.style.top = '';
			});
		}

		new Setting(containerEl)
			.setName('Ignore Links')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreLinks ?? true)
					.onChange(async value => {
						this.plugin.settings.ignoreLinks = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName('Ignore URLs')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreURLs ?? true)
					.onChange(async value => {
						this.plugin.settings.ignoreURLs = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName('Defang URLs')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.defangURLs ?? true)
					.onChange(async value => {
						this.plugin.settings.defangURLs = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName("Save")
			.addButton(button => {
				button.setButtonText("Save")
					.onClick(async () => {
						updateRegexOrderFromDOM(this)
						const closeButton = document.querySelector('.modal-close-button');
						if (closeButton) {
							closeButton.click();
						}
					});
			});
		new Setting(containerEl)
			.setName("Reset Defaults")
			.addButton(button => {
				button.setButtonText("Reset")
					.onClick(() => {
						const resetConfirm = confirm("Are you sure you want to reset to default settings?");
						if (resetConfirm) {
							this.resetToDefaults();

							if (this.plugin._settingTabReference) {
								this.plugin._settingTabReference.display();
							}
							new Notice('Settings have been reset to defaults.');
						}
					});
			});
	}

	async resetToDefaults() {
		this.plugin.settings = DEFAULT_SETTINGS;

		// Speichern der Standardwerte
		await this.plugin.saveSettings();

		new Notice('Settings have been reset to defaults.');
	}
}
	function containsValidLink(line: string, match: string): boolean {
		const linkRegex = /\[\[.*?\]\]/g;
		let result;
		while ((result = linkRegex.exec(line)) !== null) {
			if (result.index <= line.indexOf(match) && linkRegex.lastIndex >= line.indexOf(match) + match.length) {
				return true;
			}
		}
		return false;
	}

export default class RelaxPlugin extends Plugin {
	settings: RelaxPluginSettings;
	_settingTabReference: RelaxSettingTab;



async onload() {
		await this.loadSettings();

		this._settingTabReference = new RelaxSettingTab(this.app, this);

		this.addSettingTab(this._settingTabReference);
		this.addCommand({id: 'Relax-command', name: 'Relax', callback: () => this.addBrackets()});
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("R.E.L.A.X.")
						.setIcon("curly-braces")
						.onClick(async () => {
							this.addBrackets();
						});
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("R.E.L.A.X.")
						.setIcon("curly-braces")
						.onClick(async () => {
							this.addBrackets();
						});
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("Remove all brackets")
						.setIcon("curly-braces")
						.onClick(async () => {
							this.removeBrackets();
						});
				});
			})
		);
	}

	async resetToDefaults() {
		this.settings = DEFAULT_SETTINGS;
		await this.saveSettings();
		new Notice('Settings have been reset to defaults.');
	}

	async loadSettings() {
		try {
			const loadedSettings = await this.loadData();
			if (loadedSettings) {
				this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);
			} else {
				throw new Error("No settings loaded");
			}
		} catch (e) {
			await this.resetToDefaults();
		}
	}

	onunload() {
	}


	async saveSettings() {
		await this.saveData(this.settings);
		new Notice('Config saved!');
	}

	removeBracketsInSelection(content: string): string {
		return content.replace(/\[|\]/g, '');
	}

	async addBracketsForFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, (content) => this.updateSelection(content, this.settings));
	}

	async removeBracketsinFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, this.removeBracketsInSelection);
	}

	async processFileContent(noteFilePath: string, contentProcessor: (content: string) => string): Promise<void> {
		let noteFile;

		let fileContent = "";

		if (noteFilePath !== "") {
			noteFile = this.app.vault.getAbstractFileByPath(noteFilePath);
			if (!noteFile) {
				new Notice(`No file found at the given path: ${noteFilePath}`);
				return;
			}
			fileContent = await this.app.vault.read(noteFile as TFile);
		} else {
			const leaf = this.app.workspace.activeLeaf || this.app.workspace.getLeaf();
			noteFile = this.app.workspace.getActiveFile();

			if (!noteFile && leaf.view.focusedItem && !leaf.view.focusedItem.collapsible) {
				noteFile = leaf.view.focusedItem.file;
			}

			if (!noteFile) {
				new Notice('No file selected. Please select a markdown file from the editor or navigation bar.');
				return;
			}

			if (!(leaf.view instanceof MarkdownView)) {
				new Notice('Please open a markdown file or select a folder');
				return;
			}

			fileContent = await this.app.vault.read(noteFile as TFile);
		}

		const updatedContent = contentProcessor(fileContent);
		await this.app.vault.modify(noteFile as TFile, updatedContent);
	}

	updateSelection(content: string, settings: RelaxPluginSettings): string {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const excludedExtensions = /\.(exe|lnk|xls|md|sh|elf|bin|tmp|doc|odt|docx|pdf|yara|dll|txt)$/;
		const fangMap = {
			'[.]': '.',
			'[:]': ':'
		};
		if (settings.defangURLs) {
			content = content.replace(/\[\.\]|\[\:\]/g, char => fangMap[char]);
		}

		let updatedText = '';
		const lines = content.split("\n");

		lines.forEach((line, index) => {
			for (const {isActive, key, regex} of settings.regexPairs) {
				if (!isActive) {
					continue;
				}

				const compiledRegex = new RegExp(regex, 'g');
				line = line.replace(compiledRegex, (match, ...args) => {
					const groups = args.slice(0, -2).filter(g => g !== undefined);
					const capturedValue = groups[0];

					if (!capturedValue) return match;

					if (settings.ignoreLinks && containsValidLink(line, capturedValue)) {
						return match;
					}

					if (settings.ignoreURLs) {
						const urls = Array.from(line.matchAll(urlRegex), m => m[0]);
						let ignoreCurrentMatch = false;

						for (const url of urls) {
							if (!excludedExtensions.test(url) && url.includes(capturedValue)) {
								ignoreCurrentMatch = true;
								break;
							}
						}

						if (ignoreCurrentMatch) {
							return match;
						}
					}

					return match.replace(capturedValue, `[[${capturedValue}]]`);
				});
			}
			updatedText += line;

			if (index !== lines.length - 1) {
				updatedText += "\n";
			}
		});

		return updatedText;
	}

	async processMarkdownContent(action: "removeBrackets" | "addBrackets") {
		const activeLeaf = this.app.workspace.activeLeaf;

		if (!activeLeaf) {
			new Notice('Please open a markdown file or select a folder');
			return;
		}

		const view = activeLeaf.view;
		if (!view) {
			new Notice('Unknown item selected. Please select a markdown file or folder');
			return;
		}

		if (view instanceof MarkdownView) {
			const selection = view.editor.getSelection();

			if (selection && selection.trim().length !== 0) {
				let updatedSelection;
				if (action === 'removeBrackets') {
					updatedSelection = this.removeBracketsInSelection(selection);
					new Notice('Removed brackets from selection!');
				} else {
					updatedSelection = this.updateSelection(selection, this.settings);
					new Notice('Added brackets in selection!');
				}
				view.editor.replaceSelection(updatedSelection);
				new Notice(action === 'removeBrackets' ? 'Removed brackets from selection!' : 'Updated content in selection!');
			} else {
				if (action === 'removeBrackets') {
					await this.removeBracketsinFile();
					new Notice('Removed brackets from entire file!');
				} else {
					await this.addBracketsForFile();
					new Notice('Added brackets on entire file!');
				}
			}
		}
	}

	async removeBrackets() {
		await this.processMarkdownContent('removeBrackets');
	}

	async addBrackets() {
		const activeLeaf = this.app.workspace.activeLeaf;

		if (!activeLeaf) {
			new Notice('Please open a markdown file or select a folder');
			return;
		}

		const view = activeLeaf.view;
		if (!view) {
			new Notice('Unknown item selected. Please select a markdown file or folder');
			return;
		}

		if (view instanceof MarkdownView) {
			const editor = view.editor;
			const selection = editor.getSelection();

			if (selection && selection.trim().length !== 0) {
				const updatedSelection = this.updateSelection(selection, this.settings);
				editor.replaceSelection(updatedSelection);
				new Notice('Added brackets in selection!');
			} else {
				await this.addBracketsForFile();
				new Notice('Updated entire file!');
			}
		} else if (view.focusedItem && view.focusedItem.collapsible) {
			const folderPath = view.focusedItem.file.path;
			await this.addBracketsForFolder(folderPath);
		} else if (view.focusedItem && !view.focusedItem.collapsible) {
			const filePath = view.focusedItem.file.path;
			await this.addBracketsForFile(filePath);
		} else {
			new Notice('No markdown file or folder is currently selected. Please select one.');
		}
	}


	private progress = 0;
	private mutex = new Mutex();

	async addBracketsForFolder(folderPath: string) {
		const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
		const totalFiles = files.length;
		let processedFiles = 0;

		let processingNotice = new Notice(`Processing ${totalFiles} files...`, totalFiles * 1000);

		const taskQueue = files.map(file => () => this.addBracketsForFile(file.path).then(() => {
			processedFiles++;
			processingNotice.setMessage(`Processing file ${processedFiles} of ${totalFiles}`);
		}));

		const processQueue = async () => {
			if (taskQueue.length === 0) return;
			await taskQueue.shift()();
		};

		const maxConcurrentTasks = 200;
		const promises = Array(Math.min(maxConcurrentTasks, taskQueue.length)).fill(null).map(processQueue);

		await Promise.all(promises);

		processingNotice.hide();
		new Notice(`All ${totalFiles} files in the folder processed.`);
	}

}
