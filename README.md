# Mantis Parsedown

**MantisParsedown** - A MantisBT plugin for a native markup preview of the input fields.

Edit Mode:

![Mantis Parsedown Edit Screenshot](https://raw.githubusercontent.com/raspopov/MantisParsedown/master/MantisParsedown.png)

Preview Mode:

![Mantis Parsedown Preview Screenshot](https://raw.githubusercontent.com/raspopov/MantisParsedown/master/MantisParsedownPreview.png)

## Presentation

The plugin adds a button bar above each input field that supports MantisBT [Parsedown markup](https://parsedown.org/). The buttons allow you to toggle between edit and preview modes, as well as perform quick text formatting. When previewing, the user's text is sent directly to MantisBT and any installed custom markup plugins, which perform the actual text formatting. The plugin does not perform any text processing itself. Undo (Ctrl+Z) is supported. The Ctrl+B, Ctrl+I and Ctrl+H hotkeys are used to make the entered text bold, italic and headline, respectively.

## System Requirements

- MantisBT 2
- jQuery (bundled with MantisBT)
- Font Awesome (bundled with MantisBT)

## Installation

- Download and extract the plugin files to your computer.
- Copy the MantisParsedown catalogue into the MantisBT plugin directory.
- In MantisBT, go to the Manage -> Manage Plugins page. You will see a list of installed and currently not installed plugins.
- Click the Install button next to "Mantis Parsedown" to install a plugin.

## Configuration

- None

## Similar plugins

- [MarkDownEditor](https://github.com/ejyothi/MantisBT-MarkDownEditor) by eJyothi Services
