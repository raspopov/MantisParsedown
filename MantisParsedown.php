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
	public function register() {
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
	public function hooks() {
		return [
			'EVENT_REST_API_ROUTES' => 'routes',
			'EVENT_LAYOUT_BODY_END' => 'script',
			'EVENT_LAYOUT_RESOURCES' => 'stylesheet',
		];
	}

	/**
	 * Add the RESTful routes that are handled by this plugin.
	 *
	 * @param string $p_event_name The event name
	 * @param array  $p_event_args The event arguments
	 * @return void
	 */
	public function routes( $p_event_name, $p_event_args ) {
		$t_app = $p_event_args['app'];
		$t_plugin = $this;
		$t_app->group(
			plugin_route_group(),
			function() use ( $t_app, $t_plugin ) {
				$t_app->post( '', [$t_plugin, 'view'] );
			}
		);
	}

	/**
	 * Format text for view.
	 *
	 * @param \Slim\Http\Request  $p_request  The request.
	 * @param \Slim\Http\Response $p_response The response.
	 * @param array               $p_args     Arguments
	 * @return \Slim\Http\Response The augmented response.
	 */
	public function view( $p_request, $p_response, $p_args ) {
		$t_data = $p_request->getParsedBody();
		return $p_response->withStatus( HTTP_STATUS_SUCCESS )->write(
			string_display_links( isset( $t_data['value'] ) ? $t_data['value'] : '' ) );
	}

	/**
	 * A hook method to output style links.
	 * @return void
	 */
	public function stylesheet() {
		echo "\t", '<link rel="stylesheet" href="', plugin_file( 'MantisParsedown.css' ), '">', "\n";
	}

	/**
	 * A hook method to output script links.
	 * @return void
	 */
	public function script() {
		echo "\t", '<script src="', plugin_file( 'MantisParsedown.js' ), '"></script>', "\n";
	}
}
