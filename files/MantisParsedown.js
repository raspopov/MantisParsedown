/*!
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

( function() {
	'use strict';

	if( !window.XMLHttpRequest ) {
		return;
	}
	
	const elements = [ 'description', 'steps_to_reproduce', 'additional_info', 'additional_information', 'bugnote_text', 'project-description' ];

	const buttons = [
		[
			'edit',
			'',
			'Editor',
			'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
			function() { edit( this.id ); }
		],
		[
			'preview',
			'',
			'Preview',
			'<svg width="24" height="24" viewBox="0 -4 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M 0,2 C 0,2 0,0 2,0 h 12 c 0,0 2,0 2,2 v 6 c 0,0 0,2 -2,2 h -4 c 0,0.667 0.083,1.167 0.25,1.5 H 11 a 0.5,0.5 0 0 1 0,1 H 5 a 0.5,0.5 0 0 1 0,-1 H 5.75 C 5.917,11.167 6,10.667 6,10 H 2 C 2,10 0,10 0,8 Z M 1.398,1.145 A 0.758,0.758 0 0 0 1.144,1.447 1.46,1.46 0 0 0 1,2.01 V 8 c 0,0.325 0.078,0.502 0.145,0.602 0.07,0.105 0.17,0.188 0.302,0.254 A 1.464,1.464 0 0 0 1.985,8.999 L 2.01,9 H 14 c 0.325,0 0.502,-0.078 0.602,-0.145 A 0.758,0.758 0 0 0 14.856,8.553 1.464,1.464 0 0 0 14.999,8.015 L 15,7.99 V 2 C 15,1.675 14.922,1.498 14.855,1.398 A 0.757,0.757 0 0 0 14.553,1.144 1.46,1.46 0 0 0 13.99,1 H 2 C 1.675,1 1.498,1.078 1.398,1.145 Z" id="path1" /></svg>',
			function() { preview( this.id ); }
		],
		// In reverse order due "float: right" style
		[
			'l',
			'tool',
			'Link',
			'<svg width="24" height="24" viewBox="0 -1 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"/></svg>',
			function() { combine( this.id, '[', '](url)', 2, 3 ); }
		],
		[
			'c',
			'tool',
			'Code',
			'<svg width="24" height="24" viewBox="0 -2 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"/></svg>',
			function() { combine( this.id, '`', '`' ); }
		],
		[
			'q',
			'tool',
			'Quote',
			'<svg width="24" height="24" viewBox="0 -2 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M1.75 2.5h10.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Zm4 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5ZM2.5 7.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 1.5 0Z"/></svg>',
			function() { combine( this.id, '\n> ', '\n\n' ); }
		],
		[
			'i',
			'tool',
			'Italics',
			'<svg width="24" height="24" viewBox="0 -2 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M6 2.75A.75.75 0 0 1 6.75 2h6.5a.75.75 0 0 1 0 1.5h-2.505l-3.858 9H9.25a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.505l3.858-9H6.75A.75.75 0 0 1 6 2.75Z"/></svg>',
			function() { combine( this.id, '_', '_' ); }
		],
		[
			'b',
			'tool',
			'Bold',
			'<svg width="24" height="24" viewBox="0 -2 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 2h4.5a3.501 3.501 0 0 1 2.852 5.53A3.499 3.499 0 0 1 9.5 14H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm1 7v3h4.5a1.5 1.5 0 0 0 0-3Zm3.5-2a1.5 1.5 0 0 0 0-3H5v3Z"/></svg>',
			function() { combine( this.id, '**', '**' ); }
		],
		[
			'h',
			'tool',
			'Heading',
			'<svg width="24" height="24" viewBox="0 -2 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3.75 2a.75.75 0 0 1 .75.75V7h7V2.75a.75.75 0 0 1 1.5 0v10.5a.75.75 0 0 1-1.5 0V8.5h-7v4.75a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 3.75 2Z"/></svg>',
			function() { combine( this.id, '\n### ', '\n\n' ); }
		]
	];
	
	function tools(element,display) {
		for( var button of buttons ) {
			if( button[1] === 'tool' ) {
				document.getElementById( element + '_' + button[0] ).style.display = display;
			}
		}
	}

	function edit(id) {
		var element = id.substr( 0, id.lastIndexOf( '_' ) );
		document.getElementById( element + '_view' ).style.display = 'none';
		document.getElementById( element + '_' + buttons[0][0] ).className = 'parsedown-button active';
		document.getElementById( element + '_' + buttons[1][0] ).className = 'parsedown-button passive';
		tools( element, 'block' );
		document.getElementById( element ).style.display = 'block';
	}

	function preview(id) {
		var element = id.substr( 0, id.lastIndexOf( '_' ) );
		document.getElementById( element + '_' + buttons[0][0] ).className = 'parsedown-button passive';
		document.getElementById( element + '_' + buttons[1][0] ).className = 'parsedown-button active';
		tools( element, 'none' );

		var textarea = document.getElementById( element );
		var view = document.getElementById( element + '_view' );
		view.innerHTML = '';
		if( textarea.style.display !== 'none' ) {
			view.style.minHeight = textarea.clientHeight + 'px';
			textarea.style.display = 'none';
			view.style.display = 'block';
		}

		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if( xhr.readyState === XMLHttpRequest.DONE ) {
				view.innerHTML = xhr.responseText;
			}
		};
		xhr.onerror = function() {
			view.innerHTML = 'Connection Error';
		};
		xhr.open( 'POST', 'plugins/MantisParsedown/view.php', true );
		xhr.setRequestHeader( 'Cache-Control', 'no-cache' );
		xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
		var data = new FormData();
		data.append( 'key', element );
		data.append( 'value', textarea.value );
		xhr.send( data );
	}

	function combine(id, before, after, sel_start, sel_length) {
		var textarea = document.getElementById( id.substr( 0, id.lastIndexOf( '_' ) ) );
		textarea.focus();
		var start = textarea.selectionStart;
		var end = textarea.selectionEnd;
		var head = textarea.value.slice( 0, start );
		var middle = textarea.value.slice( start, end );
		var tail = textarea.value.slice( end, textarea.value.length );
		if( !head ) before = before.trimStart();
		if( !tail ) after = after.trimEnd();
		textarea.value = head + before + middle + after + tail;
		textarea.selectionStart = start + before.length;
		textarea.selectionEnd = end + before.length;
		if( sel_start !== undefined && sel_length !== undefined ) {
			textarea.selectionStart += middle.length + sel_start;
			textarea.selectionEnd = textarea.selectionStart + sel_length;
		}
	}

	// Install snippet for next elements:
	for( var element of elements ) {
		var id = element + '_';
		var textarea = document.getElementById( element );
		if( textarea && textarea.nodeName === 'TEXTAREA' ) {
			var view_id = id + 'view';
			var view = document.getElementById( view_id );
			if( !view ) {
				view = textarea.insertAdjacentElement( 'afterEnd', document.createElement( 'div' ) );
				view.id = view_id;
				view.className = 'form-control parsedown-view';
				var btns = textarea.insertAdjacentElement( 'beforeBegin', document.createElement( 'div' ) );
				btns.className = 'parsedown-bar';
				for( var button of buttons ) {
					var bt = btns.insertAdjacentElement( 'beforeEnd', document.createElement( 'button' ) );
					bt.id = id + button[0];
					bt.type = 'button';
					if( button[1] ) {
						bt.className = 'parsedown-button ' + button[1];
					}
					bt.title = button[2];
					bt.innerHTML = button[3];
					bt.onclick = button[4];
				}
				edit( id );
			}
		}
	}
} )();
