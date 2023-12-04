import {App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';

interface RelaxPluginSettings {
	regexPairs: Array<{ isActive: boolean, key: string, regex: string, }>;
	ignoreLinks?: boolean;
	ignoreURLs?: boolean;
	defangURLs?: boolean;
	ignoreCodeBlocks?: boolean;
}

const DEFAULT_SETTINGS: RelaxPluginSettings = {
	"regexPairs": [

		{
			"isActive": true,
			"key": "eMail",
			"regex": "([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})"
		},
		{
			"isActive": true,
			"key": "Domains",
			"regex": "([a-zA-Z0-9\\-\\.]+\\.(?:com|org|net|mil|edu|COM|ORG|NET|MIL|EDU))"
		},
		{
			"isActive": true,
			"key": "IP",
			"regex": "((?:(?:(?!1?2?7\\.0\\.0\\.1)(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)))\b"
		},
		{
			"isActive": true,
			"key": "GUID",
			"regex": "([A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12})"
		},
		{
			"isActive": true,
			"key": "SHA256",
			"regex": "\\b([a-fA-F0-9]{64})\\b"
		},
		{
			"isActive": true,
			"key": "JARM",
			"regex": "\\b([a-fA-F0-9]{62})\\b"
		},
		{
			"isActive": true,
			"key": "SHA1",
			"regex": "\\b([a-fA-F0-9]{40})\\b"
		},
		{
			"isActive": true,
			"key": "MD5",
			"regex": "\\b([a-fA-F0-9]{32})\\b"
		},
		{
			"isActive": true,
			"key": "Bitcoin",
			"regex": "\\b([13]{1}[a-km-zA-HJ-NP-Z1-9]{26,33}|bc1[a-z0-9]{39,59})\\b"
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
			"key": "Markdown ´",
			"regex": "(?:[´](((?:(?!<br>|\\r|\\n)[^´ ]){4,30}))[´])"
		},
		{
			"isActive": true,
			"key": "Markdown '",
			"regex": "(?:['](((?:(?!<br>|\\r|\\n)[^' ]){4,30}))['])"
		},
		{
			"isActive": true,
			"key": "Markdown ‘",
			"regex": "(?:[‘](((?:(?!<br>|\\r|\\n)[^‘ ]){4,30}))[‘])"
		},
		{
			"isActive": true,
			"key": "Markdown ’",
			"regex": "(?:[’](((?:(?!<br>|\\r|\\n)[^’ ]){4,30}))[’])"
		},
		{
			"isActive": true,
			"key": "Markdown \"",
			"regex": "(?:[\"„″”](((?:(?!<br>|\\r|\\n)[^\"″” ]){4,30}))[\"″”])"
		},
		{
			"isActive": true,
			"key": "Markdown _",
			"regex": "(?:[_](((?:(?!<br>|\\r|\\n)[^_ ]){4,30}))[_])"
		},
		{
			"isActive": true,
			"key": "Signal Frequencies",
			"regex": "(\\b[0-9]{1,4}(?:\\.\\d{1,4})?\\s?(Hz|kHz|MHz|GHz)\\b)"
		},
		{
			"isActive": true,
			"key": "BibTeX Entries",
			"regex": "@(article|book|inbook|conference|inproceedings){([^}]+)}"
		},
		{
			"isActive": true,
			"key": "GPS Coordinates",
			"regex": "\\b[+-]?[0-9]{1,2}\\.[0-9]+,\\s*[+-]?[0-9]{1,3}\\.[0-9]+\\b"
		},
		{
			"isActive": true,
			"key": "ISBN Numbers",
			"regex": "\\bISBN\\s?(?:-?13|-10)?:?\\s?[0-9-]{10,17}\\b"
		},
		{
			"isActive": true,
			"key": "Camera Settings",
			"regex": "\\bISO\\s?[0-9]+|f/[0-9.]+|1/[0-9]+\\s?sec\\b"
		},
		{
			"isActive": true,
			"key": "Historical Dates",
			"regex": "\\b(?:[0-9]{1,4} (AD|BC)|[0-9]{1,4}th century)\\b"
		},
		{
			"isActive": true,
			"key": "Processor Specs",
			"regex": "\\bIntel Core i[3579]-[0-9]{4}[HQGU]K?|AMD Ryzen [3579] [0-9]{4}X?\\b"
		},
		{
			"isActive": true,
			"key": "Images",
			"regex": "([\\w]+\\.(?:jpg|jpeg|png|gif|bmp|tiff))[\\b]"
		},
		{
			"isActive": true,
			"key": "Movies",
			"regex": "([\\w]+\\.(?:mp4|avi|mkv|mov|wmv))[\\b]"
		},
		{
			"isActive": true,
			"key": "Audio",
			"regex": "([\\w]+\\.(?:mp3|wav|aac|flac))[\\b]"
		},
		{
			"isActive": false,
			"key": "Harmless Files",
			"regex": "([\\w]+\\.(?:txt|asc|csv|log|md))[\\b]"
		},
		{
			"isActive": false,
			"key": "Base64 Strings",
			"regex": "([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?"
		},
		{
			"isActive": false,
			"key": "Script Language File",
			"regex": "([\\w]+\\.(?:py|js|java|cs|cpp|rb|go|php))[\\b]"
		},
		{
			"isActive": false,
			"key": "Chord Progressions",
			"regex": "\\b((?:C|Dm|Em|F|G|Am|Bdim)(?:\\s->\\s(?:C|Dm|Em|F|G|Am|Bdim))*)\\b"
		},
		{
			"isActive": false,
			"key": "Hex Colors",
			"regex": "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})"
		},
		{
			"isActive": false,
			"key": "Chemical Elements",
			"regex": "\\b(?:H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|K|Ca)\\b"
		},
		{
			"isActive": false,
			"key": "Social Media Hashtags",
			"regex": "#[A-Za-z0-9_]+"
		},
		{
			"isActive": false,
			"key": "Academic Citations",
			"regex": "\\b\\([A-Za-z]+,\\s[0-9]{4}\\)\\b"
		},
		{
			"isActive": false,
			"key": "Temperature Readings",
			"regex": "\\b-?[0-9]+\\s?(°C|°F|K)\\b"
		}
	],
	ignoreLinks: true,
	ignoreCodeBlocks: true,
	defangURLs: true,
	ignoreURLs: false
};

class RelaxSettingTab extends PluginSettingTab {
	plugin: RelaxPlugin;
	keyValueContainer: HTMLDivElement;
	saveButton: HTMLButtonElement;
	isHighlited = false;
	dragElement = null;
	currentIndex = null;
	newIndex = null;
	startY = 0;
	startTop = 0;
	initialOffsetY = 0;

	constructor(app: App, plugin: RelaxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.makeDraggable = this.makeDraggable.bind(this);

		this.updateRegexOrderFromDOM = () => {
			const regexPairs = [];
			this.keyValueContainer.querySelectorAll("div").forEach(row => {
				const activeCheckboxInput = row.querySelector("input[type='checkbox']");
				const keyInput = row.querySelector("input[placeholder='Description-Key']");
				const valueInput = row.querySelector("input[placeholder='Regexp']");
				if (keyInput && valueInput && activeCheckboxInput) {
					const key = keyInput.value;
					const value = valueInput.value;
					const isActive = activeCheckboxInput.checked;
					regexPairs.push({isActive, key, regex: value});
				}
			});
			if (this.plugin && this.plugin.settings) {
				this.plugin.settings.regexPairs = regexPairs;
				this.plugin.saveSettings();
			} else {
				console.error("Plugin or settings not available");
			}
		};

		this.saveChanges = () => {
			this.updateRegexOrderFromDOM();
			const closeButton = document.querySelector(".modal-close-button");
			if (closeButton) {
				closeButton.click();
			}
			this.setHighlighted(false);
		};
	}

	makeDraggable(element, dragHandle) {
		if (!dragHandle) {
			console.error("Drag handle not found!", element.innerHTML);
			return;
		}

		dragHandle.addEventListener("mousedown", (e) => {
			e.preventDefault();
			e.stopPropagation();

			const settingsContainerTop = document.querySelector(".vertical-tab-content-container").getBoundingClientRect().top;
			const elementRect = element.getBoundingClientRect();
			this.initialOffsetY = e.clientY - elementRect.top + settingsContainerTop;
			this.currentIndex = [...element.parentElement.children].indexOf(element);

			this.dragElement = element;
			this.dragElement.classList.add("dragging");

			const newTop = e.clientY - this.initialOffsetY;
			this.dragElement.style.top = `${newTop}px`;

			document.addEventListener("mousemove", this.onDragMove);
			document.addEventListener("mouseup", this.onDragEnd);
		});
	}

	onDragMove(e) {
		if (this.dragElement) {
			const newTop = e.clientY - this.initialOffsetY;
			this.dragElement.style.top = `${newTop}px`;

			this.newIndex = null;
			let closestDistance = Infinity;
			[...this.dragElement.parentElement.children].forEach((child, idx) => {
				if (child !== this.dragElement) {
					const rect = child.getBoundingClientRect();
					const distance = Math.abs(rect.top + rect.height / 2 - e.clientY);
					if (distance < closestDistance) {
						closestDistance = distance;
						this.newIndex = idx;
					}
				}
			});
		}
	}

	onDragEnd() {
		if (this.dragElement) {
			this.dragElement.classList.remove("dragging");

			if (this.newIndex !== null && this.currentIndex !== null && this.newIndex !== this.currentIndex) {
				const parent = this.dragElement.parentElement;
				if (this.newIndex >= parent.children.length) {
					parent.appendChild(this.dragElement);
				} else {
					parent.insertBefore(this.dragElement, parent.children[this.newIndex + (this.newIndex > this.currentIndex ? 1 : 0)]);
				}
			}

			this.dragElement = null;
			this.updateRegexOrderFromDOM();
			document.removeEventListener("mousemove", this.onDragMove);
			document.removeEventListener("mouseup", this.onDragEnd);
			this.reorderElements();
			this.currentIndex = null;
			this.newIndex = null;
		}
	}

	reorderElements() {
		this.keyValueContainer.querySelectorAll("div").forEach((row) => {
			row.classList.remove("custom-top");
		});
	}

	setHighlighted(highlight: boolean) {
		this.isHighlited = highlight;
		if (this.saveButton) {
			this.saveButton.disabled = !highlight;
			if (highlight) {
				this.saveButton.classList.add("is-highlight");
			} else {
				this.saveButton.classList.remove("is-highlight");
			}
		}
	}
	display() {
		const {containerEl} = this;
		containerEl.empty();
		this.keyValueContainer = containerEl.createEl("div");
		this.keyValueContainer.classList.add("flex-column");


		function validateContent(content) {
			const regex = /\[\[(.+?)\]\]/g;
			return !regex.test(content);
		}

		function applyValidationStyle(textarea) {
			if (validateContent(textarea.value)) {
				textarea.classList.toggle("valid-content", validateContent(textarea.value));
			} else {
				textarea.classList.toggle("invalid-content", !validateContent(textarea.value));
			}
		}

		document.addEventListener("DOMContentLoaded", (event) => {
			const modalButton = document.querySelector("#openModalButton");

			modalButton.addEventListener("click", function () {
				const modal = document.querySelector(".modal");
				const textarea = modal.querySelector("textarea");

				applyValidationStyle(textarea);

				textarea.addEventListener("input", function () {
					applyValidationStyle(textarea);
				});
			});
		});

		const validateRegexInput = (input: HTMLInputElement) => {
			let errorMsg = "";
			try {
				const reg = new RegExp(input.value);
				const groupCount = (input.value.match(/\((?!\?)/g) || []).length;
				if (groupCount > 1) {
					input.classList.add("invalid-border");
					errorMsg = "More than one group detected.";
				} else {
					input.classList.remove("invalid-border");
				}
			} catch (e) {
				input.classList.add("invalid-border");
				errorMsg = "Invalid regex.";
			}

			const errorElement = input.nextSibling;
			if (errorElement && errorElement.classList.contains("regex-error")) {
				errorElement.textContent = errorMsg;
			} else {
				const span = document.createElement("span");
				span.className = "regex-error";
				span.textContent = errorMsg;
				input.parentNode.insertBefore(span, input.nextSibling);
			}
		};
		const addKeyValue = (key?: string, value?: string, isActive = false) => {
			const row = this.keyValueContainer.createEl("div");
			row.classList.add("flex-row");

			const dragHandle = row.createEl("span", {className: "drag-handle", text: "☰"});
			const activeCheckbox = row.createEl("input", {className: "active-checkbox"});
			activeCheckbox.type = "checkbox";
			activeCheckbox.checked = isActive;
			row.appendChild(activeCheckbox);

			const keyInput = row.createEl("input", {className: "key-input", placeholder: "Description-Key", value: key ?? ""});
			keyInput.classList.add("key-input-flex");

			const valueInput = row.createEl("input", {className: "value-input", placeholder: "Regexp", value: value ?? ""});
			valueInput.classList.add("value-input-flex");

			row.createEl("button", {text: "Delete", className: `delete-button-${key ?? Date.now()}`})
				.addEventListener("click", () => {
					row.remove();
					this.updateRegexOrderFromDOM();
				});

			if (dragHandle) this.makeDraggable(row, dragHandle);
			valueInput.addEventListener("input", () => validateRegexInput(valueInput));
		};

		containerEl.createEl("button", {text: "Add Regexp"}).addEventListener("click", () => addKeyValue());

		for (const {isActive, key, regex} of this.plugin.settings.regexPairs) {
			addKeyValue(key, regex, isActive);
		}



		new Setting(containerEl)
			.setName("Ignore links")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreLinks ?? true)
					.onChange(async value => {
						this.plugin.settings.ignoreLinks = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Do not modify Links, preventing to handle the same data over and over again.")
				;
			});
		new Setting(containerEl)
			.setName("Ignore URLs")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreURLs ?? true)
					.onChange(async value => {
						this.plugin.settings.ignoreURLs = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Do not modify URLs, so they do keep working.")
				;
			});
		new Setting(containerEl)
			.setName("Defang URLs")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.defangURLs ?? true)
					.onChange(async value => {
						this.plugin.settings.defangURLs = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("https[:]// -> https://")
				;
			});
		new Setting(containerEl)
			.setName("Ignore code blocks")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreCodeBlocks ?? false)
					.onChange(async value => {
						this.plugin.settings.ignoreCodeBlocks = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Ignore content within code blocks when linking regexes.");
			});

		new Setting(containerEl)
			.setName("Save")
			.addButton(button => {
				button.setButtonText("Save")
					.onClick(() => {
						this.saveChanges();
					});
				this.saveButton = button.buttonEl;
			});

		const updateHighlightedState = () => this.setHighlighted(true);
		this.keyValueContainer.addEventListener("input", updateHighlightedState);
		this.keyValueContainer.addEventListener("change", updateHighlightedState);


		new Setting(containerEl)
			.setName("Reset defaults")
			.addButton(button => {
				button.setButtonText("Reset")
					.onClick(() => {
						const resetConfirm = confirm("Are you sure you want to reset to default settings?");
						if (resetConfirm) {
							this.resetToDefaults();

							if (this.plugin._settingTabReference) {
								this.plugin._settingTabReference.display();
							}
						}
					});
			});
		const updateHighlitedState = () => this.setHighlighted(true);
		this.keyValueContainer.addEventListener("input", updateHighlitedState);
		this.keyValueContainer.addEventListener("change", updateHighlitedState);
	}
	resetToDefaults() {
		this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
		this.plugin.saveSettings().then(() => {
			new Notice("Settings have been reset to defaults.");
			this.display();
		});
	}
}

export default class RelaxPlugin extends Plugin {
	settings: RelaxPluginSettings;
	_settingTabReference: RelaxSettingTab;

async onload() {
		await this.loadSettings();

		this._settingTabReference = new RelaxSettingTab(this.app, this);

		this.addSettingTab(this._settingTabReference);
		this.addCommand({id: "relax", name: "R.E.L.A.X.", callback: () => this.addBrackets()});
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
		this.registerEvent(this.app.workspace.on("settings:opened", () => {
		if (this._settingTabReference) {
			this._settingTabReference.setHighlighted(false);
		}
	}));
	}

	async resetToDefaults() {
		this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
		await this.saveSettings();
		new Notice("Settings have been reset to defaults.");
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
		new Notice("Config saved!");
	}

	removeBracketsInSelection(content: string): string {
		return content.replace(/([^!])\[\[([^\]]+)\]\]/g, "$1$2");
	}

	async addBracketsForFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, (content) => this.updateSelection(content, this.settings));
	}

	async removeBracketsinFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, this.removeBracketsInSelection);
	}

	async processFileContent(noteFilePath: string, contentProcessor: (content: string) => string, noteFile?: TFile): Promise<void> {
		if (!noteFile && noteFilePath !== "") {
			noteFile = this.app.vault.getAbstractFileByPath(noteFilePath) as TFile;
			if (!noteFile) {
				new Notice(`No file found at the given path: ${noteFilePath}`);
				return;
			}
		} else if (!noteFile) {
			const leaf = this.app.workspace.activeLeaf || this.app.workspace.getLeaf();
			noteFile = leaf.view instanceof MarkdownView ? leaf.view.file : null;

			if (!noteFile) {
				new Notice('No file selected. Please select a markdown file from the editor or navigation bar.');
				return;
			}
		}

		if (!(noteFile instanceof TFile)) {
			new Notice('Selected item is not a valid text file.');
			return;
		}

		let fileContent = await this.app.vault.read(noteFile);
		const updatedContent = contentProcessor(fileContent);
		await this.app.vault.modify(noteFile, updatedContent);
	}


	updateSelection(content: string, settings: RelaxPluginSettings): string {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const excludedExtensions = /\.(exe|lnk|xls|md|sh|elf|bin|tmp|doc|odt|docx|pdf|yara|dll|txt)$/;
		const fangMap = {
			"[.]": ".",
			"[:]": ":"
		};
		if (settings.defangURLs) {
			content = content.replace(/\[\.\]|\[\:\]/g, char => fangMap[char]);
		}

		let updatedText = "";
		const lines = content.split("\n");
		let inCodeBlock = false;

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

		lines.forEach((line, index) => {
			if (settings.ignoreCodeBlocks && line.trim().startsWith("```")) {
				inCodeBlock = !inCodeBlock;
				updatedText += line + "\n";
				return;
			}

			if (inCodeBlock) {
				updatedText += line + "\n";
				return;
			}

			for (const {isActive, key, regex} of settings.regexPairs) {
				if (!isActive) {
					continue;
				}
				const compiledRegex = new RegExp(regex, "g");
				line = line.replace(compiledRegex, (match, ...args) => {
					const groups = args.slice(0, -2).filter(g => g !== undefined);
					const capturedValue = groups[0];

					if (!capturedValue) return match;


				const modifiedRegex = `\\?(${regex})`;
				const compiledRegex = new RegExp(modifiedRegex, "g");

				line = line.replace(compiledRegex, (match, capturedValue, ...args) => {

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

					const prefixBackslash = match.startsWith("\\");
					if (prefixBackslash) {
						return '\\' + ` [[${capturedValue}]]`;
					} else {
						return `[[${capturedValue}]]`;
					}

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
			new Notice("Please open a markdown file or select a folder");
			return;
		}

		const view = activeLeaf.view;
		if (!view) {
			new Notice("Unknown item selected. Please select a markdown file or folder");
			return;
		}

		if (view instanceof MarkdownView) {
			const selection = view.editor.getSelection();

			if (selection && selection.trim().length !== 0) {
				let updatedSelection;
				if (action === "removeBrackets") {
					updatedSelection = this.removeBracketsInSelection(selection);
					new Notice("Removed brackets from selection!");
				} else {
					updatedSelection = this.updateSelection(selection, this.settings);
					new Notice("Added brackets in selection!");
				}
				view.editor.replaceSelection(updatedSelection);
				new Notice(action === "removeBrackets" ? "Removed brackets from selection!" : "Updated content in selection!");
			} else {
				if (action === "removeBrackets") {
					await this.removeBracketsinFile();
					new Notice("Removed brackets from entire file!");
				} else {
					await this.addBracketsForFile();
					new Notice("Added brackets on entire file!");
				}
			}
		}
	}

	async removeBrackets() {
		await this.processMarkdownContent("removeBrackets");
	}

	async addBrackets() {
		const activeLeaf = this.app.workspace.activeLeaf;

		if (!activeLeaf) {
			new Notice("Please open a markdown file or select a folder");
			return;
		}

		const view = activeLeaf.view;
		if (!view) {
			new Notice("Unknown item selected. Please select a markdown file or folder");
			return;
		}

		if (view instanceof MarkdownView) {
			const editor = view.editor;
			const selection = editor.getSelection();

			if (selection && selection.trim().length !== 0) {
				const updatedSelection = this.updateSelection(selection, this.settings);
				editor.replaceSelection(updatedSelection);
				new Notice("Added brackets in selection!");
			} else {
				await this.addBracketsForFile();
				new Notice("Updated entire file!");
			}
		} else if (view.focusedItem && view.focusedItem.collapsible) {
			const folderPath = view.focusedItem.file.path;
			await this.addBracketsForFolder(folderPath);
		} else if (view.focusedItem && !view.focusedItem.collapsible) {
			const filePath = view.focusedItem.file.path;
			await this.addBracketsForFile(filePath);
		} else {
			new Notice("No markdown file or folder is currently selected. Please select one.");
		}
	}

	async addBracketsForFolder(folderPath: string) {
		const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
		const totalFiles = files.length;
		let processedFiles = 0;

		const processingNotice = new Notice(`Processing ${totalFiles} files...`, totalFiles * 1000);

		const maxConcurrentTasks = 20;
		const taskQueue = [];

		const processFile = async (file) => {
			await this.addBracketsForFile(file.path);
			processedFiles++;
			processingNotice.setMessage(`Processing file ${processedFiles} of ${totalFiles}`);
			if (taskQueue.length > 0) {
				const nextTask = taskQueue.shift();
				await nextTask();
			}
		};

		const enqueueTask = (file) => {
			if (taskQueue.length < maxConcurrentTasks) {
				taskQueue.push(() => processFile(file));
			} else {
				processFile(file);
			}
		};

		files.forEach(file => enqueueTask(file));

		while (taskQueue.length > 0) {
			const nextTask = taskQueue.shift();
			await nextTask();
		}

		processingNotice.hide();
		new Notice(`All ${totalFiles} files in the folder processed.`);
	}

}
