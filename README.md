<p align="center">
  <img src="Logo.png" alt="R.E.L.A.X Logo">
  <h1 align="center">R.E.L.A.X. (Regular Expression Link Analysis Xpert)
  <br>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.5.6-blue"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-orange"></a>
  <a href="#"><img src="https://img.shields.io/badge/Support-Weekly-brightgreen"></a>
  <a href="#"><img src="https://img.shields.io/badge/KnownBugs-0-green"></a>
  <a href="#"><img src="https://img.shields.io/badge/Stable-green"></a>
  <a href="#"><img src="https://img.shields.io/badge/PlannedImprovements-1-pink"></a>
  <a href="#"><img src="https://img.shields.io/badge/ChatGPT-Approved-red"></a></h1>
	</p>


Enhance your Obsidian experience with R.E.L.A.X., a powerful regex plugin that leverages regular expressions for dynamic and intelligent note linking.

### USAGE:
- **Rightclick, click "R.E.L.A.X.". This will put all the Information found via predefined regex into brackets, linking your files.
- **Open Settings and set up your own custom Regular Expression. Note: Each RegEx should have exactly one catching group.


## Example: ##

**Regular Expression for Digits:**
- 12345
- 23456
- 54468

**Your Regex would be like this:**
- (\d{5)
- ([1-9]{5})
- ([1-9][1-9][1-9][1-9][1-9])

**Not allowed would be this:**
- (([1-9])([1-9])([1-9])([1-9])([1-9]))

Because it is unclear which group to link. To cause a group not to capture, write <span style="color:red">?:</span> at the beginning.
- **This would be the same (crap), but it would work:
- **((<span style="color:red">?:</span>[1-9])(<span style="color:red">?:</span>[1-9])(<span style="color:red">?:</span>[1-9])(<span style="color:red">?:</span>[1-9])(<span style="color:red">?:</span>[1-9]))

1. **Access Obsidian Settings:** Open your Obsidian application and click on the 'Settings' icon.
2. **Enable Community Plugins:** In the Settings, navigate to 'Community Plugins' and turn off 'Restricted Mode'.
3. **Browse and Install Plugins:** Click on 'Browse' and find the R.E.L.A.X. plugin.
4. **Install the Plugin:** Click 'Install' on the plugin’s page.
5. **Enable the Plugin:** Toggle it on in the 'Installed plugins' section.
6. **Configure the Plugin (Optional):** Set up the plugin in its settings panel.
7. **Start Using the Plugin:** Righclick>R.E.L.A.X. or use the command panel. All your Regex-findings will be turnted into links!

## Demo Video
<p align="center">
	[![Youtube R.E.L.A.X. Demonstration](http://img.youtube.com/vi/SoRKFwc-UJw/0.jpg)](http://www.youtube.com/watch?v=SoRKFwc-UJw "Video Title")
	
</p>
### Community & Support:

- **Forums & Discord:** Chill with fellow users on [Obsidian Forums](#) and [Discord](#).
- **Need Help?:** Holler on our [GitHub](#).

### License:

R.E.L.A.X. comes with an MIT License - free to use but at your own risk. Check [LICENSE](#) for more details.

### Contributions:

Got ideas? Sprinkle your magic in [CONTRIBUTING.md](#).

### Shoutouts:

Big thanks to the Obsidian crew and all the brilliant minds behind this project.

#### Support R.E.L.A.X.:

Enjoying R.E.L.A.X.? [Why not buy me a coffee then?](https://buymeacoffee.com/Syr1) so I can relax even more!
