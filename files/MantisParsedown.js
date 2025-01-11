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
			'fa fa-edit',
			'Editor',
			function() { edit( this.id ); }
		],
		[
			'preview',
			'fa fa-eye',
			'Preview',
			function() { preview( this.id ); }
		],
		// In reverse order due "float: right" style
		[
			's',
			'tool fa fa-minus',
			'Separator',
			function() { combine( this.id, '\n___\n' ); }
		],
		[
			'u',
			'tool fa fa-list-ul',
			'Unordered list',
			function() { combine( this.id, '- ', '\n', '\n' ); }
		],
		[
			'l',
			'tool fa fa-link',
			'Link',
			function() { combine( this.id, '[', '](url)', undefined, 2, 3 ); }
		],
		[
			'c',
			'tool fa fa-code',
			'Code',
			function() { combine( this.id, '`', '`' ); }
		],
		[
			'q',
			'tool fa fa-quote-left',
			'Quote',
			function() { combine( this.id, '\n> ', '\n\n' ); }
		],
		[
			'i',
			'tool fa fa-italic',
			'Italics',
			function() { combine( this.id, '_', '_' ); }
		],
		[
			'b',
			'tool fa fa-bold',
			'Bold',
			function() { combine( this.id, '**', '**' ); }
		],
		[
			'h',
			'tool fa fa-header',
			'Heading',
			function() { combine( this.id, '\n### ', '\n', '\n' ); }
		]
	];
	
	function tools(element,display) {
		for( const button of buttons ) {
			if( button[1].includes( 'tool' ) ) {
				document.getElementById( element + '_' + button[0] ).style.display = display;
			}
		}
	}

	function edit(id) {
		const element = id.substr( 0, id.lastIndexOf( '_' ) );
		document.getElementById( element + '_view' ).style.display = 'none';
		document.getElementById( element + '_' + buttons[0][0] ).classList.add( 'active' );
		document.getElementById( element + '_' + buttons[1][0] ).classList.remove( 'active' );
		tools( element, 'block' );
		document.getElementById( element ).style.display = 'block';
	}

	function preview(id) {
		const element = id.substr( 0, id.lastIndexOf( '_' ) );
		document.getElementById( element + '_' + buttons[0][0] ).classList.remove( 'active' );
		document.getElementById( element + '_' + buttons[1][0] ).classList.add( 'active' );
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

	function combine(id, before, after = '', split, sel_start, sel_length) {
		var textarea = document.getElementById( id.substr( 0, id.lastIndexOf( '_' ) ) );
		textarea.focus();
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const head = textarea.value.slice( 0, start );
		const middle = textarea.value.slice( start, end ).split( split );
		const tail = textarea.value.slice( end, textarea.value.length );

		// Remove extra space separator
		if( !head ) before = before.trimStart();
		if( !tail ) after = after.trimEnd();

		var inner = '';
		for( const part of middle ) {
			if( inner.length ) inner += split;
			inner += before + part + after;
		}
		textarea.value = head + inner + tail;

		if( sel_start === undefined && sel_length === undefined ) {
			// Keep selection
			textarea.selectionStart = start + before.length;
			textarea.selectionEnd = textarea.selectionStart + inner.length - before.length - after.length;
		} else {
			// New selection
			textarea.selectionStart = start + inner.length - after.length + sel_start;
			textarea.selectionEnd = textarea.selectionStart + sel_length;
		}
	}

	// Install snippet for next elements:
	for( const element of elements ) {
		const id = element + '_';
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
					bt.onclick = button[3];
				}
				edit( id );
			}
		}
	}
} )();
