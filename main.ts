import {App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';

interface RegexGroup {
	isActive: boolean;
	groupName: string;
	regexes: Array<{ isActive: boolean, key: string, regex: string }>;
	isCollapsed?: boolean;
}


interface RelaxPluginSettings {
	regexGroups: Array<RegexGroup>;
	regexPairs: Array<{ isActive: boolean, key: string, regex: string }>;
	ignoreLinks?: boolean;
	ignoreURLs?: boolean;
	defangURLs?: boolean;
	ignoreCodeBlocks?: boolean;
}

const DEFAULT_SETTINGS: RelaxPluginSettings = {
	regexPairs: [],
	regexGroups: [
		{
			isActive: true,
			groupName: "Email and Domains",
			regexes: [
				{
					"isActive": true,
					"key": "eMail",
					"regex": "([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})"
				},
				{
					"isActive": true,
					"key": "Domains",
					"regex": "\\b([a-zA-Z0-9\\-\\.]+\\.(?:com|org|net|mil|edu|COM|ORG|NET|MIL|EDU))"
				},
				{
					"isActive": true,
					"key": "IP",
					"regex": "\\b((?:(?:(?!1?2?7\\.0\\.0\\.1)(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)))\\b"
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
					"key": "Markdown ‘’",
					"regex": "(?:[‘](((?:(?!<br>|\\r|\\n)[^’ ]){4,30}))[’])"
				},
				{
					"isActive": true,
					"key": "Windows Forensics",
					"regex": "([\\w]+.(?:bat|ps1|dll|exe|reg))[\\b]"
				},
				{
					"isActive": true,
					"key": "Linux Forensics",
					"regex": "([\\w]+\\.(?:sh|so|conf|tar.gz))[\\b]"
				},
				{
					"isActive": true,
					"key": "Mac Forensics",
					"regex": "([\\w]+\\.(?:app|pkg|dmg))[\\b]"
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
	isHighlighted = false;
	dragElement = null;
	currentIndex = null;
	newIndex = null;
	startY = 0;
	startTop = 0;
	initialOffsetY = 0;
	private settingsInitialized = false;


	constructor(app: App, plugin: RelaxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.makeDraggable = this.makeDraggable.bind(this);

		this.updateRegexOrderFromDOM = () => {
			const regexGroups = [];
			this.keyValueContainer.querySelectorAll(".regex-group-container").forEach(groupContainer => {
				const groupNameElement = groupContainer.querySelector(".regex-group-name");
				const activeCheckboxInput = groupContainer.querySelector("input[type='checkbox']");
				const groupName = groupNameElement ? groupNameElement.textContent : "";
				const isActive = activeCheckboxInput ? activeCheckboxInput.checked : false;

				const regexes = Array.from(groupContainer.querySelectorAll(".regex-group-content .flex-row")).map(row => {
					const keyInput = row.querySelector("input[placeholder='Description-Key']");
					const valueInput = row.querySelector("input[placeholder='Regexp']");
					const regexActiveCheckbox = row.querySelector("input[type='checkbox']");
					return {
						isActive: regexActiveCheckbox ? regexActiveCheckbox.checked : false,
						key: keyInput ? keyInput.value : "",
						regex: valueInput ? valueInput.value : ""
					};
				});

				const isCollapsed = groupContainer.querySelector('.regex-group-content').style.display === "none";
				regexGroups.push({isActive, groupName, regexes, isCollapsed});
			});

			if (this.plugin && this.plugin.settings) {
				this.plugin.settings.regexGroups = regexGroups;
				this.plugin.saveSettings();
			} else {
				console.error("Plugin or settings not available");
			}
			const regexPairs = Array.from(this.keyValueContainer.querySelectorAll(".standalone-regex-row")).map(row => {
				const keyInput = row.querySelector("input[placeholder='Description-Key']");
				const valueInput = row.querySelector("input[placeholder='Regexp']");
				const regexActiveCheckbox = row.querySelector("input[type='checkbox']");
				return {
					isActive: regexActiveCheckbox ? regexActiveCheckbox.checked : false,
					key: keyInput ? keyInput.value : "",
					regex: valueInput ? valueInput.value : ""
				};
			});

			this.plugin.settings.regexPairs = regexPairs;
			this.plugin.saveSettings();
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

			this.dragElement = element;
			this.dragElement.classList.add("dragging");

			this.placeholder = document.createElement('div');
			this.placeholder.className = 'placeholder';
			this.placeholder.style.position = 'relative';
			this.placeholder.style.height = `${element.offsetHeight}px`;
			this.placeholder.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
			element.parentNode.insertBefore(this.placeholder, element);

			this.dragElement.style.visibility = 'hidden';
			this.dragElement.style.border = 'none';

			const clone = this.dragElement.cloneNode(true);
			clone.style.position = 'absolute';
			clone.style.top = '0';
			clone.style.left = '0';
			clone.style.width = '100%';
			clone.style.height = '100%';
			clone.style.visibility = 'visible';
			clone.style.pointerEvents = 'none';
			clone.style.zIndex = '999';
			this.placeholder.appendChild(clone);

			const frame = document.createElement('div');
			frame.style.position = 'absolute';
			frame.style.top = '0';
			frame.style.left = '0';
			frame.style.width = '100%';
			frame.style.height = '100%';
			frame.style.border = '2px dashed var(--interactive-accent)';
			frame.style.boxSizing = 'border-box';
			frame.style.zIndex = '1000';
			this.placeholder.appendChild(frame);

			document.addEventListener("mousemove", this.onDragMove);
			document.addEventListener("mouseup", this.onDragEnd);
		});
	}
	onDragMove(e) {
		if (!this.dragElement) return;

		const parent = this.dragElement.parentElement;
		const scrollTop = parent.scrollTop;
		const mouseY = e.clientY + scrollTop;

		let closest = null;
		let closestDistance = Infinity;

		[...parent.children].forEach((child) => {
			if (child !== this.dragElement && child !== this.placeholder) {
				const rect = child.getBoundingClientRect();
				const childMidpoint = rect.top + scrollTop + rect.height / 2;
				const distance = Math.abs(mouseY - childMidpoint);

				if (distance < closestDistance) {
					closest = child;
					closestDistance = distance;
				}
			}
		});

		if (closest) {
			const rect = closest.getBoundingClientRect();
			const childMidpoint = rect.top + scrollTop + rect.height / 2;
			if (mouseY < childMidpoint) {
				parent.insertBefore(this.placeholder, closest);
			} else {
				parent.insertBefore(this.placeholder, closest.nextSibling);
			}
		}
	}


	calculateNewIndex(mouseY) {
		let newIndex = null;
		let closestDistance = Infinity;

		const parent = this.dragElement.parentElement;
		if (parent) {
			[...parent.children].forEach((child, idx) => {
				if (child !== this.dragElement) {
					const rect = child.getBoundingClientRect();
					const distance = Math.abs(rect.top + rect.height / 2 - mouseY);
					if (distance < closestDistance) {
						closestDistance = distance;
						newIndex = idx;
					}
				}
			});
		}
		return newIndex;
	}
	onDragEnd() {
		if (this.dragElement) {
			if (this.placeholder && this.placeholder.parentNode) {
				this.placeholder.parentNode.insertBefore(this.dragElement, this.placeholder);
				this.dragElement.style.visibility = 'visible';
				this.placeholder.remove();
			}
			this.dragElement.classList.remove("dragging");
			this.dragElement = null;
		}

		if (this.placeholder) {
			this.placeholder.remove();
			this.placeholder = null;
		}

		document.removeEventListener("mousemove", this.onDragMove);
		document.removeEventListener("mouseup", this.onDragEnd);
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
		const { containerEl } = this;
		containerEl.empty();
		this.keyValueContainer = containerEl.createEl("div");
		this.keyValueContainer.classList.add("flex-column");

		this.createSettingsUI(containerEl);

		const validateContent = (content) => {
			const regex = /\[\[(.+?)\]\]/g;
			return !regex.test(content);
		};

		const applyValidationStyle = (textarea) => {
			if (validateContent(textarea.value)) {
				textarea.classList.toggle("valid-content", validateContent(textarea.value));
			} else {
				textarea.classList.toggle("invalid-content", !validateContent(textarea.value));
			}
		};

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

			let draggedElement = null;
			let placeholder = null;

			const createPlaceholder = () => {
				const div = document.createElement('div');
				div.style.height = '2px';
				div.style.background = 'blue';
				div.style.margin = '5px 0';
				return div;
			};

			document.querySelectorAll('.draggable').forEach(elem => {
				elem.addEventListener('mousedown', function(e) {
					draggedElement = this;
					placeholder = createPlaceholder();
					draggedElement.parentNode.insertBefore(placeholder, draggedElement.nextSibling);
					draggedElement.style.opacity = '0.5';
					e.preventDefault();
				});

				document.addEventListener('mousemove', (e) => {
					if (!draggedElement) return;

					const rect = placeholder.getBoundingClientRect();
					const parent = placeholder.parentNode;
					parent.childNodes.forEach((child) => {
						if (child !== draggedElement && child !== placeholder) {
							const childRect = child.getBoundingClientRect();
							if (e.clientY > childRect.top && e.clientY < childRect.bottom) {
								if (e.clientY < (childRect.top + childRect.bottom) / 2) {
									parent.insertBefore(placeholder, child);
								} else {
									parent.insertBefore(placeholder, child.nextSibling);
								}
							}
						}
					});
				});

				document.addEventListener('mouseup', () => {
					if (draggedElement) {
						draggedElement.style.opacity = '1';
						placeholder.parentNode.insertBefore(draggedElement, placeholder);
						placeholder.parentNode.removeChild(placeholder);
						draggedElement = null;
						placeholder = null;
					}
				});
			});
		});

		const validateRegexInput = (input) => {
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

		const addRegexToGroup = (groupContent, regex) => {
			const row = groupContent.createEl("div", {cls: 'flex-row'});
			const dragHandle = row.createEl("span", {className: "drag-handle", text: "☰"});
			const activeCheckbox = row.createEl("input", {type: "checkbox", className: "active-checkbox"});
			activeCheckbox.checked = regex.isActive;

			const keyInput = row.createEl("input", {
				type: "text",
				className: "key-input-flex",
				value: regex.key,
				placeholder: "Description-Key"
			});
			const valueInput = row.createEl("input", {
				type: "text",
				className: "value-input-flex",
				value: regex.regex,
				placeholder: "Regexp"
			});

			row.createEl("button", {text: "Delete", className: "delete-button"})
				.addEventListener("click", () => {
					row.remove();
					this.updateRegexOrderFromDOM();
				});

			if (dragHandle) this.makeDraggable(row, dragHandle);
			valueInput.addEventListener("input", () => {
				validateRegexInput(valueInput);
				this.setHighlighted(true);
			});
		}
		const addGroupUI = (group, index) => {
			const groupContainer = this.keyValueContainer.createEl("div", {cls: 'regex-group-container group-container'});
			groupContainer.style.border = group.isActive ? "1px solid var(--interactive-accent)" : "1px solid #ccc";
			groupContainer.style.padding = "10px";
			groupContainer.style.marginBottom = "10px";

			const groupHeader = groupContainer.createEl("div", {cls: 'regex-group-header'});

			const dragHandle = groupHeader.createEl("span", {className: "drag-handle", text: "☰"});
			const collapseIcon = groupHeader.createEl("span", {cls: 'collapse-icon'});
			const groupActiveCheckbox = groupHeader.createEl("input", {type: 'checkbox'});
			groupActiveCheckbox.checked = group.isActive;
			groupContainer.insertBefore(groupHeader, groupContainer.firstChild);


			groupActiveCheckbox.addEventListener("change", () => {
				group.isActive = groupActiveCheckbox.checked;
				groupContainer.style.border = group.isActive ? "1px solid var(--interactive-accent)" : "1px solid #ccc";
				this.setHighlighted(true);
			});

			const groupContent = groupContainer.createEl("div", {cls: 'regex-group-content'});
			groupContent.style.display = group.isCollapsed ? "none" : "block";
			collapseIcon.textContent = group.isCollapsed ? '►' : '▼';

			collapseIcon.addEventListener("click", () => {
				group.isCollapsed = !group.isCollapsed;
				groupContent.style.display = group.isCollapsed ? "none" : "block";
				collapseIcon.textContent = group.isCollapsed ? '►' : '▼';
				this.setHighlighted(true);
			});
			const groupNameEl = groupHeader.createEl("span", {cls: 'regex-group-name', text: group.groupName});
			groupNameEl.setAttribute("contenteditable", "true");
			groupNameEl.addEventListener("blur", (event) => {
				const newName = groupNameEl.textContent.trim();
				if (newName.length > 0 && newName !== group.groupName) {
					group.groupName = newName;
					this.updateRegexOrderFromDOM();
					new Notice("Group name updated.");
				} else {
					groupNameEl.textContent = group.groupName;
				}
			});

			const deleteGroupButton = groupHeader.createEl("button", {text: "Delete Group", className: "delete-group-button"});
			deleteGroupButton.style.float = "right";
			deleteGroupButton.addEventListener("click", () => {
				this.plugin.settings.regexGroups.splice(index, 1);
				this.plugin.saveSettings();
				this.display();
			});

			if (dragHandle) this.makeDraggable(groupContainer, dragHandle);
			group.regexes.forEach(regex => addRegexToGroup(groupContent, regex));
		};


		const buttonsContainer = containerEl.createDiv();
		buttonsContainer.style.display = "flex";
		buttonsContainer.style.justifyContent = "space-between";
		buttonsContainer.style.marginBottom = "10px";

		const addGroupButton = buttonsContainer.createEl("button", { text: "Add Group" });
		addGroupButton.addEventListener("click", () => {
			this.plugin.settings.regexGroups.push({
				isActive: true,
				groupName: "New Group",
				regexes: []
			});
			this.display();
		});

		const addRegexPairButton = buttonsContainer.createEl("button", { text: "Add Regexp" });
		addRegexPairButton.addEventListener("click", () => this.addStandaloneRegexUI({ isActive: false, key: '', regex: '' }));

		this.plugin.settings.regexGroups.forEach((group, index) => addGroupUI(group, index));

		if (this.plugin.settings.regexPairs && Array.isArray(this.plugin.settings.regexPairs)) {
			this.plugin.settings.regexPairs.forEach(pair => this.addStandaloneRegexUI(pair));
		}
	}

	createSettingsUI(containerEl) {
		// Ignore Links Toggle
		new Setting(containerEl)
			.setName("Ignore links")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreLinks ?? true)
					.onChange(async value => {
						this.plugin.settings.ignoreLinks = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Do not modify Links, preventing to handle the same data over and over again.");
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
					.setTooltip("Do not modify URLs, so they do keep working.");
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
					.setTooltip("Convert https[:]// -> https://");
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
	}


	resetToDefaults() {
		this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

		this.plugin.saveSettings().then(() => {
			new Notice("Settings have been reset to defaults.");
			this.display();
		});
	}

	private addStandaloneRegexUI(pair) {
		const row = this.keyValueContainer.createEl("div", { cls: 'flex-row standalone-regex-row' });

		const dragHandle = row.createEl("span", { className: "drag-handle", text: "☰" });

		const activeCheckbox = row.createEl("input", { type: "checkbox", className: "active-checkbox" });
		activeCheckbox.checked = pair.isActive;

		const keyInput = row.createEl("input", {
			type: "text",
			className: "key-input-flex",
			value: pair.key,
			placeholder: "Description-Key"
		});

		const valueInput = row.createEl("input", {
			type: "text",
			className: "value-input-flex",
			value: pair.regex,
			placeholder: "Regexp"
		});

		const deleteButton = row.createEl("button", { text: "Delete", className: "delete-button" });
		deleteButton.addEventListener("click", () => {
			row.remove();
			this.updateRegexOrderFromDOM();
		});

		const inputsContainer = row.createDiv({ cls: 'inputs-container' });
		inputsContainer.append(keyInput, valueInput, deleteButton);
		inputsContainer.style.flexGrow = "1";
		inputsContainer.style.display = "flex";
		inputsContainer.style.justifyContent = "space-between";
		inputsContainer.style.alignItems = "center";

		if (dragHandle) this.makeDraggable(row, dragHandle);
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

			let modifiedLine = line;

			settings.regexGroups.forEach(group => {
				if (!group.isActive) return;

				group.regexes.forEach(({isActive, regex}) => {
					if (!isActive) return;

					const compiledRegex = new RegExp(regex, "g");
					modifiedLine = modifiedLine.replace(compiledRegex, (match, ...args) => {
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

						const offset = args[args.length - 2];
						const precedingChar = offset > 0 ? line[offset - 1] : null;
						const spaceIfBackslash = precedingChar === '\\' ? ' ' : '';

						return `${spaceIfBackslash}[[${match}]]`;
					});
				});
			});

			updatedText += modifiedLine + "\n";
		});

		return updatedText.trim();
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
