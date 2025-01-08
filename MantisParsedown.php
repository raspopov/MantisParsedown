<?php
/**
 * MantisParsedown - A MantisBT plugin for a native markup preview of the input fields.
 *
 * MantisParsedown is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MantisParsedown is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MantisParsedown.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2024-2025 Nikolay Raspopov <raspopov@cherubicsoft.com>
 */

class MantisParsedownPlugin extends MantisPlugin {

	/**
	 * A method that populates the plugin information and minimum requirements.
	 * @return void
	 */
	function register() {
		$this->name = plugin_lang_get( 'title' );
		$this->description = plugin_lang_get( 'description' );

		$this->version = '1.0.0';
		$this->requires = [
			'MantisCore' => '2.0'
		];

		$this->author = 'Nikolay Raspopov';
		$this->contact = 'raspopov@cherubicsoft.com';
		$this->url = 'https://github.com/raspopov/MantisParsedown';
	}

	/**
	 * Register event hooks for plugin.
	 * @return array
	 */
	function hooks() {
		return [
			'EVENT_LAYOUT_BODY_END' => 'script',
			'EVENT_LAYOUT_RESOURCES' => 'stylesheet',
		];
	}

	/**
	 * A hook method to output style links.
	 * @return void
	 */
	function stylesheet() {
		echo "\t", '<link rel="stylesheet" href="', plugin_file( 'MantisParsedown.css' ), '">', "\n";
	}

	/**
	 * A hook method to output script links.
	 * @return void
	 */
	function script() {
		echo "\t", '<script src="', plugin_file( 'MantisParsedown.js' ), '"></script>', "\n";
	}
}
