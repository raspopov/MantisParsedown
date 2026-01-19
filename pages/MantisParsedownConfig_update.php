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

form_security_validate( 'plugin_MantisParsedownConfig_update' );

access_ensure_global_level( config_get( 'manage_plugin_threshold' ) );

// Retrieve user input
$t_elements = array_filter( preg_split( '/[\s,]+/', gpc_get_string( 'elements' ) ), function( $p_key ) { return strlen( $p_key ); } );
if( $t_elements ) {
	plugin_config_set( 'elements', $t_elements );
} else {
	plugin_config_delete( 'elements' );
}

form_security_purge( 'plugin_MantisParsedownConfig_update' );

print_header_redirect( plugin_page( 'MantisParsedownConfig', true ) );
