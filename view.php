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

require_once dirname( __DIR__, 2 ) . DIRECTORY_SEPARATOR . 'core.php';
require_api( 'authentication_api.php' );
require_api( 'string_api.php' );

auth_ensure_user_authenticated();

echo string_display_links( gpc_get( 'value', '' ) );
